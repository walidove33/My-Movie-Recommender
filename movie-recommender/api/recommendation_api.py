













from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import pickle
import sys
from pathlib import Path
import runpy
import logging
import requests

data_dir = Path(__file__).parent.parent / "data"

def run_export_script():
    """Run data export and return both DataFrames"""
    script_path = data_dir / "export_data.py"
    ratings_df = pd.DataFrame()
    watched_df = pd.DataFrame()
    
    if script_path.exists():
        try:
            runpy.run_path(str(script_path), run_name="__main__")
            
            ratings_path = data_dir / "ratings.csv"
            watched_path = data_dir / "watched_movies.csv"
            
            if ratings_path.exists():
                ratings_df = pd.read_csv(ratings_path)
            if watched_path.exists():
                watched_df = pd.read_csv(watched_path)
                
        except Exception as e:
            print(f"Export error: {str(e)}")
    else:
        print(f"[warning] Export script not found at {script_path}")
    
    return ratings_df, watched_df

ratings_df, watched_df = run_export_script()


if not watched_df.empty:
    watched_df = watched_df.rename(columns={
        "user_id": "userId",
        "movie_id": "movieId",
        "watched_date": "timestamp"
    })


def compute_rating_stats():
    stats = (
        ratings_df.groupby("movieId")["rating"]
        .agg(num_ratings="count", avg_rating="mean")
        .reset_index()
    )
    stats["avg_rating"] = stats["avg_rating"].round(1)
    return stats

rating_stats = compute_rating_stats()

watched_df = pd.read_csv(data_dir / "watched_movies.csv")


rating_stats = compute_rating_stats() if not ratings_df.empty else pd.DataFrame()

sys.path.append(str(Path(__file__).parent.parent / "model"))


from model.data_processing import load_and_clean_data, TMDB_API_KEY
from model.recommendation_engine import RecommendationEngine

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:8090","http://localhost:4200"]}})

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

engine = None

def initialize_api():
    global engine
    movies_data = load_and_clean_data()
    if ratings_df.empty or movies_data.empty:
        raise ValueError("Movies or ratings data is empty!")
    engine = RecommendationEngine(movies_data, ratings_df)
    model_path = Path(__file__).parent.parent / "model" / "reco_model.pkl"
    engine.load_models(str(model_path))
    logger.info("API initialization completed successfully")

@app.route('/api/health')
def health_check():
    return jsonify({"status": "healthy", "model_loaded": engine is not None})

@app.route('/api/recommendations/top-rated', methods=['GET'])
def get_top_rated():
    min_ratings = request.args.get('min_ratings', default=100, type=int)
    df = engine.get_top_rated_movies(min_ratings)
    df = df.merge(rating_stats, on="movieId", how="left").fillna({"avg_rating":0,"num_ratings":0})

    return jsonify(df.to_dict(orient='records'))

@app.route('/api/recommendations/hybrid/<int:user_id>', methods=['GET'])
def get_hybrid_recommendations(user_id):
    top_n = request.args.get('top_n', default=10, type=int)
    df = engine.get_hybrid_recommendations(user_id, top_n)
    df = df.merge(rating_stats, on="movieId", how="left").fillna({"avg_rating":0,"num_ratings":0})
    df['genres'] = df['genres'].apply(lambda x: x if isinstance(x,list) else [])
    return jsonify(df.to_dict(orient='records'))

@app.route('/api/recommendations/collaborative/<int:user_id>', methods=['GET'])
def get_collaborative_recommendations(user_id):
    top_n = request.args.get('top_n', default=30, type=int)
    df = engine.get_collaborative_recommendations(user_id, top_n)
    df = df.merge(rating_stats, on="movieId", how="left").fillna({"avg_rating":0,"num_ratings":0})
    return jsonify(df.to_dict(orient='records'))

@app.route('/api/movies/<int:movie_id>', methods=['GET'])
def get_movie_details(movie_id):
    movie = engine.movies_data[engine.movies_data.movieId==movie_id]
    if movie.empty:
        return jsonify({"error": f"Movie {movie_id} not found"}), 404
    movie = movie.merge(rating_stats, on="movieId", how="left").fillna({"avg_rating":0,"num_ratings":0})
    recs = engine.get_content_recommendations(movie_id)
    recs = recs.merge(rating_stats, on="movieId", how="left").fillna({"avg_rating":0,"num_ratings":0})
    return jsonify({
        "movie": movie.iloc[0].to_dict(),
        "recommendations": recs.to_dict(orient='records')
    })

@app.route('/api/movies', methods=['GET'])
def get_all_movies():
    page = request.args.get('page', default=1, type=int)
    per_page = request.args.get('per_page', default=100, type=int)
    start, end = (page-1)*per_page, page*per_page
    chunk = engine.movies_data.iloc[start:end]
    chunk = chunk.merge(rating_stats, on="movieId", how="left").fillna({"avg_rating":0,"num_ratings":0})
    return jsonify({
        "page": page,
        "per_page": per_page,
        "total_movies": len(engine.movies_data),
        "results": chunk.to_dict(orient='records')
    })


@app.route('/api/recommendations/watched/<int:user_id>', methods=['GET'])
def get_watched_recommendations(user_id):
    top_n = request.args.get('top_n', default=10, type=int)
    
    if watched_df.empty:
        return jsonify({"error": "Watched movies data not available"}), 500
        
    print(f"User {user_id} watched movies:", watched_df[watched_df.userId == user_id])
    
    recs = engine.get_watched_based_recommendations(user_id, watched_df, top_n)
    
    print("Raw recommendations:", recs[['movieId', 'score']].head())
    
    if not rating_stats.empty:
        recs = recs.merge(rating_stats, on="movieId", how="left") \
                .fillna({"avg_rating": 0, "num_ratings": 0})
    
    recs['genres'] = recs['genres'].apply(lambda x: x if isinstance(x, list) else [])
    return jsonify(recs.to_dict(orient='records'))



if __name__ == '__main__':
    initialize_api()
    app.run(host='0.0.0.0', port=5000, threaded=True)







