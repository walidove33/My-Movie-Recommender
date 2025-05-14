import psycopg2
import pandas as pd

# Database configuration
DB_CONFIG = {
    "dbname": "Mymovie",
    "user": "postgres",
    "password": "Wben2003",
    "host": "localhost",
    "port": 5432
}

output_csv_path = "watched_movies.csv"

def export_to_csv():
    try:
        # Connect to PostgreSQL
        conn = psycopg2.connect(**DB_CONFIG)

        # Query the table into a pandas DataFrame
        query = "SELECT * FROM watched_movies;"
        df = pd.read_sql(query, conn)

        # Export to CSV
        df.to_csv(output_csv_path, index=False)
        print(f"✅ Data exported successfully to {output_csv_path}")

    except Exception as e:
        print("❌ Error:", e)
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    export_to_csv()
