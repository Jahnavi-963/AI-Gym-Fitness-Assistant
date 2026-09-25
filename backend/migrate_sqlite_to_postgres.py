import sqlite3

from sqlalchemy import MetaData, create_engine, insert, text
from dotenv import load_dotenv
import os


# Load PostgreSQL settings from .env
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL not found in .env")


SQLITE_DB = "gym_fitness.db"


# ---------------------------------------------------------
# Connect to both databases
# ---------------------------------------------------------

sqlite_conn = sqlite3.connect(SQLITE_DB)
sqlite_conn.row_factory = sqlite3.Row

postgres_engine = create_engine(DATABASE_URL)


# ---------------------------------------------------------
# Check PostgreSQL is empty before migration
# ---------------------------------------------------------

with postgres_engine.connect() as pg_check:
    result = pg_check.execute(
        text("SELECT COUNT(*) FROM users")
    ).scalar()

    print(f"PostgreSQL users before migration: {result}")

    if result != 0:
        raise RuntimeError(
            "PostgreSQL users table is not empty. "
            "Migration stopped to prevent duplicate data."
        )


# ---------------------------------------------------------
# Get SQLite tables
# ---------------------------------------------------------

sqlite_tables = sqlite_conn.execute(
    """
    SELECT name
    FROM sqlite_master
    WHERE type = 'table'
      AND name NOT LIKE 'sqlite_%'
    ORDER BY name
    """
).fetchall()

table_names = [row["name"] for row in sqlite_tables]

print("\nSQLite tables found:")
for table_name in table_names:
    print(f"  - {table_name}")


# ---------------------------------------------------------
# Reflect PostgreSQL tables
# ---------------------------------------------------------

postgres_metadata = MetaData()
postgres_metadata.reflect(bind=postgres_engine)


# ---------------------------------------------------------
# Migrate table by table
# ---------------------------------------------------------

total_rows = 0

with postgres_engine.begin() as pg_conn:

    for table_name in table_names:

        if table_name not in postgres_metadata.tables:
            print(
                f"\nSKIPPED: {table_name} "
                "(table does not exist in PostgreSQL)"
            )
            continue

        sqlite_rows = sqlite_conn.execute(
            f'SELECT * FROM "{table_name}"'
        ).fetchall()

        if not sqlite_rows:
            print(f"\n{table_name}: 0 rows - skipped")
            continue

        pg_table = postgres_metadata.tables[table_name]

        pg_columns = {
            column.name
            for column in pg_table.columns
        }

        migrated_rows = []

        for sqlite_row in sqlite_rows:

            row_data = dict(sqlite_row)

            # Keep only columns that exist in PostgreSQL
            clean_row = {
                key: value
                for key, value in row_data.items()
                if key in pg_columns
            }

            migrated_rows.append(clean_row)

        if migrated_rows:
            pg_conn.execute(
                insert(pg_table),
                migrated_rows
            )

        total_rows += len(migrated_rows)

        print(
            f"\n{table_name}: "
            f"{len(migrated_rows)} rows migrated"
        )


# ---------------------------------------------------------
# Reset PostgreSQL ID sequences
# ---------------------------------------------------------

print("\nUpdating PostgreSQL ID sequences...")

with postgres_engine.begin() as pg_conn:

    for table_name in table_names:

        if table_name not in postgres_metadata.tables:
            continue

        pg_table = postgres_metadata.tables[table_name]

        if "id" not in pg_table.columns:
            continue

        try:
            sequence_result = pg_conn.execute(
                text(
                    "SELECT pg_get_serial_sequence(:table_name, 'id')"
                ),
                {
                    "table_name": table_name
                }
            ).scalar()

            if not sequence_result:
                continue

            max_id = pg_conn.execute(
                text(
                    f'SELECT MAX(id) FROM "{table_name}"'
                )
            ).scalar()

            if max_id is not None:
                pg_conn.execute(
                    text(
                        "SELECT setval("
                        ":sequence_name, "
                        ":max_id, "
                        "true)"
                    ),
                    {
                        "sequence_name": sequence_result,
                        "max_id": max_id
                    }
                )

        except Exception:
            # Some tables may not have a PostgreSQL sequence.
            pass


# ---------------------------------------------------------
# Close SQLite
# ---------------------------------------------------------

sqlite_conn.close()


# ---------------------------------------------------------
# Final verification
# ---------------------------------------------------------

print("\n" + "=" * 50)
print("MIGRATION COMPLETED")
print("=" * 50)

print(f"Total rows migrated: {total_rows}")

verification_tables = [
    "users",
    "workout_sessions",
    "workout_plans",
    "workout_plan_exercises",
    "challenges",
    "user_challenges",
    "nutrition_logs",
]

with postgres_engine.connect() as pg_conn:

    print("\nPostgreSQL verification:")

    for table_name in verification_tables:

        count = pg_conn.execute(
            text(
                f'SELECT COUNT(*) FROM "{table_name}"'
            )
        ).scalar()

        print(f"{table_name}: {count}")

print("\nSQLite database was NOT modified.")
print("Migration finished successfully.")