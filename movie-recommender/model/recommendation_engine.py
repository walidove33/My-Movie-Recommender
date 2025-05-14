import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pickle

from sklearn.preprocessing import normalize



class RecommendationEngine:


    


    def _build_user_profile(self, user_id):
        user_ratings = self.ratings_df[self.ratings_df.userId == user_id]
        id_to_idx = {
            mid: idx
            for idx, mid in enumerate(self.movies_data.movieId)
        }

        profile = None
        weights = []
        for _, row in user_ratings.iterrows():
            mid, rating = row.movieId, row.rating
            idx = id_to_idx.get(mid)
            if idx is None: continue
            vec = self.tfidf_title[idx]
            weighted = vec.multiply(rating) 
            profile = weighted if profile is None else profile + weighted
            weights.append(rating)

        if profile is None:
            return None
        return normalize(profile)

    def get_hybrid_recommendations(self, user_id, top_n=10):
        collab = self.get_collaborative_recommendations(user_id, top_n=top_n*2)
        rated_ids = set(self.ratings_df[self.ratings_df.userId == user_id].movieId)
        collab = collab[~collab.movieId.isin(rated_ids)]

        profile = self._build_user_profile(user_id)
        if profile is not None:
            all_sims = cosine_similarity(profile, self.tfidf_title).flatten()
            cont = (
                pd.DataFrame({
                    'movieId': self.movies_data.movieId,
                    'content_score': all_sims
                })
                .query("movieId not in @rated_ids")
                .nlargest(top_n*2, 'content_score')
            )
        else:
            cont = pd.DataFrame(columns=['movieId','content_score'])

        merged = (
            pd.merge(collab[['movieId','collab_score']],
                    cont, on='movieId', how='outer')
            .fillna(0)
        )
        merged['hybrid_score'] = 0.5*merged.collab_score + 0.5*merged.content_score

        top = (
            merged.nlargest(top_n, 'hybrid_score')
                .merge(self.movies_data, on='movieId', how='left')
        )
        return top








    def __init__(self, movies_data, ratings_df):
        self.movies_data = movies_data
        self.ratings_df = ratings_df
        self.vectorizer_title = None
        self.vectorizer_genres = None
        self.tfidf_title = None
        self.tfidf_genres = None

    def initialize_models(self):
        self.vectorizer_title = TfidfVectorizer(ngram_range=(1, 2))
        self.tfidf_title = self.vectorizer_title.fit_transform(self.movies_data['title'])
        
        self.movies_data['genres_text'] = self.movies_data['genres'].apply(lambda x: ' '.join(x))
        self.vectorizer_genres = TfidfVectorizer(ngram_range=(1, 2))
        self.tfidf_genres = self.vectorizer_genres.fit_transform(self.movies_data['genres_text'])
        self.movie_id_to_idx = {mid: idx for idx, mid in enumerate(self.movies_data.movieId)}

    def save_models(self, path="reco_model.pkl"):
        with open(path, "wb") as f:
            pickle.dump({
                "vectorizer_title": self.vectorizer_title,
                "tfidf_title": self.tfidf_title,
                "vectorizer_genres": self.vectorizer_genres,
                "tfidf_genres": self.tfidf_genres
            }, f)



    def load_models(self, path="model/reco_model.pkl"):
        with open(path, "rb") as f:
            models = pickle.load(f)
            self.vectorizer_title = models["vectorizer_title"]
            self.tfidf_title = models["tfidf_title"]
            self.vectorizer_genres = models["vectorizer_genres"]
            self.tfidf_genres = models["tfidf_genres"]

    def search_by_title(self, title_query, top_n=10):
        tfidf_query = self.vectorizer_title.transform([title_query])
        similarities = cosine_similarity(tfidf_query, self.tfidf_title).flatten()
        top_indices = similarities.argsort()[::-1][:top_n]

        results = self.movies_data.iloc[top_indices].copy()
        results['similarity'] = similarities[top_indices]
        return results


    





    def get_collaborative_recommendations(self, target_user_id, top_n=20):
        user_item_matrix = (
            self.ratings_df
                .pivot(index='userId', columns='movieId', values='rating')
                .fillna(0)
        )

        user_sim_matrix = cosine_similarity(user_item_matrix)
        user_sim_df = pd.DataFrame(
            user_sim_matrix,
            index=user_item_matrix.index,
            columns=user_item_matrix.index
        )

        similar_users = (
            user_sim_df[target_user_id]
                .drop(target_user_id)
                .sort_values(ascending=False)
        )
        top_similar_users = similar_users.head(10)

        rated_movies = set(
            self.ratings_df[self.ratings_df['userId'] == target_user_id]['movieId']
        )

        recommendation_scores = {}
        for similar_user, similarity in top_similar_users.items():
            user_ratings = self.ratings_df[self.ratings_df['userId'] == similar_user]
            for _, row in user_ratings.iterrows():
                movie_id = row['movieId']
                rating   = row['rating']
                if movie_id in rated_movies:
                    continue
                recommendation_scores[movie_id] = (
                    recommendation_scores.get(movie_id, 0)
                    + similarity * rating
                )

        recs = (
            pd.DataFrame(
                list(recommendation_scores.items()),
                columns=['movieId', 'collab_score']
            )
            .loc[lambda df: ~df['movieId'].isin(rated_movies)]
            .merge(self.movies_data, on='movieId', how='left')
            .sort_values('collab_score', ascending=False)
            .head(top_n)
        )

        return recs





    




    def get_content_recommendations(self, movie_id, top_n=20):
        movie_idx = self.movies_data[self.movies_data['movieId'] == movie_id].index[0]
    
        title_sim = cosine_similarity(
            self.tfidf_title[movie_idx], 
            self.tfidf_title
        ).flatten()
    
        genre_sim = cosine_similarity(
            self.tfidf_genres[movie_idx], 
            self.tfidf_genres
        ).flatten()
    
        combined_sim = 0.6 * title_sim + 0.4 * genre_sim
    
        similar_indices = combined_sim.argsort()[::-1][1:top_n+1]
        return self.movies_data.iloc[similar_indices]
    




    def get_top_rated_movies(self, min_ratings=100):
        rating_counts = self.ratings_df.groupby('movieId')['rating'] \
        .agg(votes=('count'), rating=('mean')) \
        .reset_index()
    
        filtered = rating_counts[rating_counts['votes'] >= min_ratings]
    
        top_rated = filtered.merge(
            self.movies_data,
            on='movieId',
            how='left'
        )
    
        return top_rated.sort_values('rating', ascending=False)
    

    
    
    def get_watched_based_recommendations(self, user_id, watched_df, top_n=20):
    # Initialize default response
        default_df = self.movies_data.copy()
        default_df['score'] = 0.0
        
        try:
            # 1. Validate inputs
            if not hasattr(self, 'movie_id_to_idx'):
                self.movie_id_to_idx = {mid: idx for idx, mid in enumerate(self.movies_data.movieId)}
            
            if watched_df.empty or 'movieId' not in watched_df.columns:
                return default_df.head(0)

            # 2. Get watched movie indices
            watched_ids = watched_df[watched_df['userId'] == user_id]['movieId'].unique()
            if len(watched_ids) == 0:
                return default_df.head(0)
            
            watched_indices = [self.movie_id_to_idx.get(mid) for mid in watched_ids]
            watched_indices = [idx for idx in watched_indices if idx is not None]
            if not watched_indices:
                return default_df.head(0)

            # 3. Calculate combined vector
            sum_vector = self.tfidf_title[watched_indices].sum(axis=0)
            count = len(watched_indices)
            
            # Convert to dense array safely
            if hasattr(sum_vector, "toarray"):
                combined_vector = (sum_vector / count).toarray()
            else:
                combined_vector = np.asarray(sum_vector) / count
            
            combined_vector = combined_vector.reshape(1, -1)

            # 4. Compute similarities
            similarity_scores = cosine_similarity(
                combined_vector,
                self.tfidf_title
            ).flatten()

            # 5. Filter and sort
            valid_mask = ~self.movies_data.movieId.isin(watched_ids)
            scores = similarity_scores[valid_mask]
            movie_ids = self.movies_data.movieId[valid_mask].values

            if len(scores) == 0:
                return default_df.head(0)

            top_indices = np.argpartition(scores, -top_n)[-top_n:]
            sorted_indices = top_indices[np.argsort(scores[top_indices])[::-1]]

            # 6. Build results
            recs = self.movies_data.iloc[sorted_indices].copy()
            recs['score'] = scores[sorted_indices]
    
            return recs[['movieId', 'title', 'genres', 'score', 'poster_path']].head(top_n)

        except Exception as e:
            print(f"Recommendation error: {str(e)}")
            return default_df.head(0)