import mysql.connector

try:
    conn = mysql.connector.connect(
        host="127.0.0.1",
        user="root",
        password="", # From settings.py
        database="sample_db",
        port=3306
    )
    cursor = conn.cursor()
    cursor.execute("SET GLOBAL max_allowed_packet=52428800")
    print("Successfully increased max_allowed_packet to 50MB!")
    conn.commit()
    cursor.close()
    conn.close()
except Exception as e:
    print("Error:", e)
