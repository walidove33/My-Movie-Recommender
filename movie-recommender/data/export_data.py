# import pandas as pd
# import os
# import psycopg2
# from psycopg2.extras import RealDictCursor

# DB_CONFIG = {
#     "dbname": "Mymovie",
#     "user": "postgres",
#     "password": "Wben2003",
#     "host": "localhost",
#     "port": 5432
# }

# def export_all_data():
#     """Export both ratings and watched movies data"""
#     conn = psycopg2.connect(**DB_CONFIG)
#     try:
#         # Export ratings
#         ratings_df = pd.read_sql("""
#             SELECT
#                 user_id AS "userId",
#                 movie_id AS "movieId",
#                 rating::float,
#                 FLOOR(EXTRACT(EPOCH FROM "timestamp"))::bigint AS "timestamp"
#             FROM ratings
#             ORDER BY "timestamp" ASC;
#         """, conn)
        
#         ratings_df.to_csv(os.path.join(os.path.dirname(__file__), "ratings.csv"), index=False)
#         print(f"Exported {len(ratings_df)} ratings")

#         # Export watched movies
#         watched_df = pd.read_sql("""
#             SELECT
#                 user_id AS "userId",
#                 movie_id AS "movieId",
#                 FLOOR(EXTRACT(EPOCH FROM watched_date))::bigint AS "timestamp"
#             FROM watched_movies
#             ORDER BY watched_date ASC;
#         """, conn)
        
#         watched_df.to_csv(os.path.join(os.path.dirname(__file__), "watched_movies.csv"), index=False)
#         print(f"Exported {len(watched_df)} watched entries")

#     finally:
#         conn.close()

# if __name__ == "__main__":
#     export_all_data()


import pandas as pd
import os
from sqlalchemy import create_engine

# Database configuration
DB_CONFIG = {
    "dbname": "Mymovie",
    "user": "postgres",
    "password": "Wben2003",
    "host": "localhost",
    "port": 5432
}

# SQLAlchemy URI format
DATABASE_URI = (
    f"postgresql+psycopg2://{DB_CONFIG['user']}:{DB_CONFIG['password']}@"
    f"{DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['dbname']}"
)

def export_all_data():
    """Export both ratings and watched movies data using SQLAlchemy"""
    engine = create_engine(DATABASE_URI)

    # Export ratings
    ratings_query = """
        SELECT
            user_id AS "userId",
            movie_id AS "movieId",
            rating::float,
            FLOOR(EXTRACT(EPOCH FROM "timestamp"))::bigint AS "timestamp"
        FROM ratings
        ORDER BY "timestamp" ASC;
    """
    ratings_df = pd.read_sql(ratings_query, engine)
    ratings_df.to_csv(os.path.join(os.path.dirname(__file__), "ratings.csv"), index=False)
    print(f"✅ Exported {len(ratings_df)} ratings")

    # Export watched movies
    watched_query = """
        SELECT
            user_id AS "userId",
            movie_id AS "movieId",
            FLOOR(EXTRACT(EPOCH FROM watched_date))::bigint AS "timestamp"
        FROM watched_movies
        ORDER BY watched_date ASC;
    """
    watched_df = pd.read_sql(watched_query, engine)
    watched_df.to_csv(os.path.join(os.path.dirname(__file__), "watched_movies.csv"), index=False)
    print(f"✅ Exported {len(watched_df)} watched entries")

if __name__ == "__main__":
    export_all_data()
