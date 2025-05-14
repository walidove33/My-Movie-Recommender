#!/usr/bin/env python
# coding: utf-8

# In[ ]:


# import pandas as pd
# import numpy as np
# import matplotlib.pyplot as plt
# import seaborn as sns
# from IPython.display import display
# from pathlib import Path


import sys
from pathlib import Path
import pandas as pd

import time  



# In[2]:
sys.path.append(str(Path.cwd().parent))

from data_processing import load_and_clean_data
from recommendation_engine import RecommendationEngine


# In[3]:

movies_data = load_and_clean_data()  # This file already contains all the necessary columns.

ratings_df = pd.read_csv('../data/ratings.csv')
watched_df  = pd.read_csv('../data/watched_movies.csv')# watched history

# In[4]:

engine = RecommendationEngine(movies_data, ratings_df)
engine.initialize_models()


# In[5]:
engine.save_models("../model/reco_model.pkl")
engine.load_models("../model/reco_model.pkl")


# In[6]:

test_movie_id = movies_data.iloc[0]['movieId']
print(f"Content-based recommendations for movieId {test_movie_id}:")
content_recs = engine.get_content_recommendations(test_movie_id)
print(content_recs[['title', 'genres']].head())

# In[7]:
print("\nCollaborative recommendations for user 1:")
collab_recs = engine.get_collaborative_recommendations(1)
print(collab_recs[['title', 'genres']].head())


# In[9]:
print("\n=== Watched-Based Recommendations Test ===")
if not watched_df.empty:
    test_user = watched_df.iloc[0]['userId']
    print(f"Testing with user {test_user} who has {len(watched_df[watched_df.userId == test_user])} watched movies")
    
    try:
        start_time = time.perf_counter()
        recommendations = engine.get_watched_based_recommendations(
            user_id=test_user,
            watched_df=watched_df,
            top_n=10
        )
        elapsed = time.perf_counter() - start_time

        if not recommendations.empty:
            print(f"\nGenerated {len(recommendations)} recommendations in {elapsed:.3f}s")
            print("Top recommendations:")
            print(recommendations[['title', 'genres', 'score']].head(10))
        else:
            print("\nNo recommendations generated (but no errors)")
            
    except Exception as e:
        print(f"\nTest failed: {str(e)}")
else:
    print("No watched movies data available for testing")
# %%
model_path = "../model/reco_model.pkl"
engine.save_models(model_path)
print(f"\nModel has been saved to {model_path}")
# %%
