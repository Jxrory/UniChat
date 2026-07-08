"""Migration: drop inbox_id from contacts table.

Run: uv run python deploy/migrate_drop_contact_inbox_id.py
"""
import sqlite3
import sys

DB_PATH = "/opt/unichat/unichat.db"


def main() -> None:
    conn = sqlite3.connect(DB_PATH)
    c = conn.execute("PRAGMA table_info(contacts)")
    columns = {row[1] for row in c.fetchall()}
    if "inbox_id" not in columns:
        print("inbox_id already removed from contacts, nothing to do.")
        return

    conn.execute("ALTER TABLE contacts DROP COLUMN inbox_id")
    conn.commit()
    conn.close()
    print("Dropped inbox_id from contacts table.")


if __name__ == "__main__":
    main()
