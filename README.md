# MyMovie Recommender

## 📝 Résumé (Français)
Ce projet porte sur la conception d’une application web de recommandation de films basée sur l’intelligence artificielle.  
La problématique principale réside dans le besoin croissant des utilisateurs d’obtenir des recommandations précises en fonction de leurs évaluations (ratings) et préférences. L’objectif est donc de proposer une expérience personnalisée permettant à chaque utilisateur d’accéder rapidement à des contenus susceptibles de lui plaire.

Pour répondre à cette problématique, deux systèmes de filtrage ont été intégrés :
1. **Filtrage collaboratif** – Exploite les similitudes entre utilisateurs (notes, historique) pour suggérer des films.  
2. **Filtrage basé sur le contenu** – Analyse les métadonnées des films (genre, synopsis, acteurs) avec TF‑IDF et embeddings.

**Architecture technique**  
- **Backend** : Spring Boot  
- **Moteur IA** : Python (TF‑IDF, cosinus, hybrid)  
- **Base de données** : PostgreSQL  
- **Authentification** : JWT  

Les résultats démontrent une nette amélioration de la pertinence des recommandations, grâce à la complémentarité des méthodes.

---

## 📝 Summary (English)
This project focuses on building a movie recommendation web application powered by artificial intelligence.  
The main challenge is providing accurate recommendations based on user ratings and preferences. The goal is to deliver a personalized experience where each user receives suggestions aligned with their interests.

Two filtering systems are combined:  
1. **Collaborative filtering** – Leverages user similarity (ratings, watch history).  
2. **Content-based filtering** – Analyzes movie metadata (genre, synopsis, cast) using TF‑IDF and embeddings.

**Tech stack**  
- **Backend** : Spring Boot  
- **Recommendation engine** : Python  
- **Database** : PostgreSQL  
- **Security** : JWT  

Results show significant improvement in recommendation quality thanks to the hybrid approach.

---

## 🚀 How to run

1. **Clone**:  
   ```bash
   git clone https://github.com/walidove33/My-Movie-Recommender.git
   cd My-Movie-Recommender
