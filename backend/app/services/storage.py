import os
import uuid
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()


# --------------------------------------------------
# Storage Configuration
# --------------------------------------------------

STORAGE_PROVIDER = os.getenv(
    "STORAGE_PROVIDER",
    "local"
).lower()

LOCAL_STORAGE_DIR = Path(
    os.getenv(
        "LOCAL_STORAGE_DIR",
        "storage"
    )
)

AWS_S3_BUCKET = os.getenv(
    "AWS_S3_BUCKET",
    ""
)

AWS_REGION = os.getenv(
    "AWS_REGION",
    "ap-south-1"
)

STORAGE_FALLBACK_TO_LOCAL = os.getenv(
    "STORAGE_FALLBACK_TO_LOCAL",
    "true"
).lower() == "true"


# Create local storage directory
LOCAL_STORAGE_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# --------------------------------------------------
# Local Storage
# --------------------------------------------------

def save_local_file(
    file_bytes: bytes,
    original_filename: str,
    folder: str = "uploads"
) -> str:

    extension = Path(
        original_filename
    ).suffix.lower()

    unique_name = (
        f"{uuid.uuid4().hex}{extension}"
    )

    folder_path = (
        LOCAL_STORAGE_DIR / folder
    )

    folder_path.mkdir(
        parents=True,
        exist_ok=True
    )

    file_path = (
        folder_path / unique_name
    )

    with open(
        file_path,
        "wb"
    ) as file:
        file.write(file_bytes)

    return str(file_path)


# --------------------------------------------------
# AWS S3 Storage
# --------------------------------------------------

def save_s3_file(
    file_bytes: bytes,
    original_filename: str,
    folder: str = "uploads"
) -> dict:

    try:

        import boto3

        if not AWS_S3_BUCKET:
            return {
                "success": False,
                "provider": "s3",
                "message": (
                    "AWS_S3_BUCKET is not configured."
                )
            }

        extension = Path(
            original_filename
        ).suffix.lower()

        unique_name = (
            f"{uuid.uuid4().hex}{extension}"
        )

        object_key = (
            f"{folder}/{unique_name}"
        )

        s3_client = boto3.client(
            "s3",
            region_name=AWS_REGION
        )

        content_type = (
            "application/octet-stream"
        )

        extension_content_types = {
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".png": "image/png",
            ".webp": "image/webp",
            ".mp4": "video/mp4",
            ".mov": "video/quicktime",
            ".avi": "video/x-msvideo",
            ".pdf": "application/pdf"
        }

        content_type = (
            extension_content_types.get(
                extension,
                content_type
            )
        )

        s3_client.put_object(
            Bucket=AWS_S3_BUCKET,
            Key=object_key,
            Body=file_bytes,
            ContentType=content_type
        )

        return {
            "success": True,
            "provider": "s3",
            "path": (
                f"s3://{AWS_S3_BUCKET}/{object_key}"
            ),
            "filename": unique_name
        }

    except Exception as error:

        return {
            "success": False,
            "provider": "s3",
            "message": str(error)
        }


# --------------------------------------------------
# Unified Storage Service
# --------------------------------------------------

def save_file(
    file_bytes: bytes,
    original_filename: str,
    folder: str = "uploads"
) -> dict:

    """
    Unified storage interface.

    Supported providers:

    - local
    - s3

    Local storage is the default development
    provider.

    AWS S3 can be enabled through environment
    variables.

    If S3 is unavailable and
    STORAGE_FALLBACK_TO_LOCAL=true,
    the file is stored locally.
    """

    # --------------------------------------------------
    # Local Storage
    # --------------------------------------------------

    if STORAGE_PROVIDER == "local":

        path = save_local_file(
            file_bytes=file_bytes,
            original_filename=original_filename,
            folder=folder
        )

        return {
            "success": True,
            "provider": "local",
            "path": path,
            "filename": Path(path).name
        }

    # --------------------------------------------------
    # AWS S3
    # --------------------------------------------------

    if STORAGE_PROVIDER == "s3":

        result = save_s3_file(
            file_bytes=file_bytes,
            original_filename=original_filename,
            folder=folder
        )

        if result.get("success"):
            return result

        # Development fallback
        if STORAGE_FALLBACK_TO_LOCAL:

            path = save_local_file(
                file_bytes=file_bytes,
                original_filename=original_filename,
                folder=folder
            )

            return {
                "success": True,
                "provider": "local",
                "path": path,
                "filename": Path(path).name,
                "fallback": True,
                "fallback_reason": result.get(
                    "message",
                    "S3 upload failed."
                )
            }

        return result

    # --------------------------------------------------
    # Firebase
    # --------------------------------------------------

    if STORAGE_PROVIDER == "firebase":

        return {
            "success": False,
            "provider": "firebase",
            "message": (
                "Firebase Storage is not configured. "
                "Use AWS S3 or local storage."
            )
        }

    # --------------------------------------------------
    # Unsupported Provider
    # --------------------------------------------------

    return {
        "success": False,
        "provider": STORAGE_PROVIDER,
        "message": (
            "Unsupported storage provider."
        )
    }


# --------------------------------------------------
# Storage Status
# --------------------------------------------------

def get_storage_status() -> dict:

    s3_configured = bool(
        AWS_S3_BUCKET
    )

    return {
        "provider": STORAGE_PROVIDER,
        "local_storage_available": (
            LOCAL_STORAGE_DIR.exists()
        ),
        "aws_s3": {
            "integration_ready": True,
            "configured": s3_configured,
            "bucket_configured": s3_configured
        },
        "firebase": {
            "integration_ready": False,
            "configured": False
        },
        "local_fallback_enabled": (
            STORAGE_FALLBACK_TO_LOCAL
        )
    }