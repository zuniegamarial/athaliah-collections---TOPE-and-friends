
import sqlite3
from werkzeug.security import check_password_hash

conn = sqlite3.connect("database.db")
conn.row_factory = sqlite3.Row

user = conn.execute(
    "SELECT * FROM users WHERE username = ?",
    ("admin",)
).fetchone()

if user:
    if check_password_hash(user["password_hash"], "admin123"):
        print("PASSWORD IS CORRECT.")
    else:
        print("PASSWORD IS INCORRECT.")
else:
    print("ADMIN ACCOUNT NOT FOUND.")

conn.close()
