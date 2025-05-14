


# data_processing.py
import pandas as pd
import re
import os
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / "data"
TMDB_API_KEY = os.getenv("TMDB_API_KEY", "5c98496341763fd19721ae7b3afc2a5c")


def load_and_clean_data():
    """
    Load movies_full_clean.csv and links.csv, merge, clean titles and genres.
    """
    movies_df = pd.read_csv(DATA_DIR / "movies_full_clean.csv")
    links_df = pd.read_csv(DATA_DIR / "links.csv")

    # Merge TMDB and IMDB IDs
    movies_data = movies_df.merge(
        links_df[['movieId', 'tmdbId', 'imdbId']],
        on='movieId', how='left'
    )

    # Ensure integer movieId
    movies_data['movieId'] = movies_data['movieId'].astype(int)

    # Clean title: remove non-alphanumeric chars
    movies_data['title'] = (
        movies_data['title']
        .astype(str)
        .apply(lambda x: re.sub(r"[^a-zA-Z0-9 ]+", '', x))
    )

    # Split genres into list and drop '(no genres listed)'
    movies_data['genres'] = (
        movies_data['genres']
        .str.split('|')
        .apply(lambda lst: [g for g in lst if g != '(no genres listed)'])
    )

    # Coerce IDs
    movies_data['tmdbId'] = pd.to_numeric(movies_data['tmdbId'], errors='coerce').astype('Int64')
    movies_data['imdbId'] = movies_data['imdbId'].apply(lambda x: f"tt{x:07d}" if pd.notna(x) else None)

    return movies_data
