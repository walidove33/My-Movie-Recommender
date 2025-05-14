import pandas as pd
import os
import sys

import psycopg2


from psycopg2.extras import RealDictCursor


DB_CONFIG = {
    "dbname":   "Mymovie",    
    "user":     "postgres",   
    "password": "Wben2003",    
    "host":     "localhost",        
    "port":     5432
}

CSV_PATH = os.path.join(os.path.dirname(__file__), "ratings.csv")



def export_full_ratings_to_csv():
    """Fetch entire ratings table and overwrite local CSV."""

    conn = psycopg2.connect(**DB_CONFIG)
    try:
        # Query full table with epoch timestamps
        query = """
            SELECT
                user_id   AS "userId",
                movie_id  AS "movieId",
                rating::float            AS "rating",
                FLOOR(EXTRACT(EPOCH FROM "timestamp"))::bigint AS "timestamp"
            FROM ratings
            ORDER BY "timestamp" ASC;
        """
        df = pd.read_sql(query, conn)
    finally:
        conn.close()

    # Write to CSV (overwrite)
    df.to_csv(CSV_PATH, index=False)
    print(f"[export_ratings] Exported {len(df)} rows to {CSV_PATH}")

if __name__ == "__main__":
    export_full_ratings_to_csv()
