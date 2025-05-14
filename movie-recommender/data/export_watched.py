import pandas as pd
import os
import psycopg2
from psycopg2.extras import RealDictCursor

DB_CONFIG = {
    "dbname": "Mymovie",
    "user": "postgres",
    "password": "Wben2003",
    "host": "localhost",
    "port": 5432
}

CSV_PATH = os.path.join(os.path.dirname(__file__), "watched_movies.csv")

def export_watched_movies_to_csv():
    """Fetch entire watched_movies table and overwrite local CSV."""
    
    conn = psycopg2.connect(**DB_CONFIG)
    try:
        # Query watched_movies table with epoch timestamps
        query = """
            SELECT
                user_id AS "userId",
                movie_id AS "movieId",
                FLOOR(EXTRACT(EPOCH FROM watched_date))::bigint AS "timestamp"
            FROM watched_movies
            ORDER BY watched_date ASC;
        """
        df = pd.read_sql(query, conn)
    finally:
        conn.close()

    # Write to CSV (overwrite)
    df.to_csv(CSV_PATH, index=False)
    print(f"[export_watched] Exported {len(df)} rows to {CSV_PATH}")

if __name__ == "__main__":
    export_watched_movies_to_csv()