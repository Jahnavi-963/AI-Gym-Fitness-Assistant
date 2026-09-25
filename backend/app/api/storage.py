from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from ..services.storage import save_file, get_storage_status
from .auth import get_current_user


router = APIRouter(
    prefix="/storage",
    tags=["Storage"]
)


ALLOWED_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".mp4",
    ".mov",
    ".avi",
    ".pdf"
}


MAX_FILE_SIZE = 20 * 1024 * 1024


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="File name is required."
        )

    extension = Path(
        file.filename
    ).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported file type. "
                "Allowed: JPG, JPEG, PNG, WEBP, "
                "MP4, MOV, AVI and PDF."
            )
        )

    file_bytes = await file.read()

    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="File size must be less than 20 MB."
        )

    folder = f"user_{current_user.id}"

    result = save_file(
        file_bytes=file_bytes,
        original_filename=file.filename,
        folder=folder
    )

    if not result.get("success"):
        raise HTTPException(
            status_code=500,
            detail=result.get(
                "message",
                "File upload failed."
            )
        )

    return {
        "message": "File uploaded successfully",
        "user_id": current_user.id,
        "original_filename": file.filename,
        "stored_filename": result["filename"],
        "provider": result["provider"],
        "path": result["path"]
    }


@router.get("/status")
def storage_status(
    current_user: User = Depends(get_current_user)
):

    return get_storage_status()