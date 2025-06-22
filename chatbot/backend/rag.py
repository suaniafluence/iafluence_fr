import os
from dotenv import load_dotenv
from pathlib import Path
from langchain_community.embeddings import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_community.document_loaders import TextLoader

# Charger les variables d'environnement
load_dotenv()

class RAGProcessor:
    def __init__(self):
        # Utilisation d'une approche simplifiée pour les embeddings
        # Nous utiliserons une méthode de recherche par mots-clés au lieu des embeddings OpenAI
        # pour éviter les problèmes d'API
        self.documents = []
        self.initialize_documents()
    
    def initialize_documents(self):
        """Initialise les documents pour la recherche par mots-clés"""
        try:
            # Charger le document IAfluence
            data_path = Path(__file__).resolve().parent.parent / "data" / "iafluence_data.txt"
            loader = TextLoader(str(data_path))
            documents = loader.load()
            
            # Diviser le texte en chunks
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000,
                chunk_overlap=200
            )
            self.documents = text_splitter.split_documents(documents)
            print("Documents chargés avec succès pour le RAG.")
        except Exception as e:
            print(f"Erreur lors du chargement des documents: {e}")
    
    def get_relevant_context(self, query, k=3):
        """Récupère le contexte pertinent pour une requête donnée en utilisant une recherche par mots-clés"""
        if not self.documents:
            return "IAfluence est une société spécialisée dans l'intégration de l'intelligence artificielle pour les PME d'Auvergne-Rhône-Alpes, avec un focus sur la sécurité et la confidentialité des données."
        
        try:
            # Convertir la requête en mots-clés (simplification)
            keywords = query.lower().split()
            
            # Calculer un score simple pour chaque document basé sur la fréquence des mots-clés
            scored_docs = []
            for doc in self.documents:
                content = doc.page_content.lower()
                score = sum(1 for keyword in keywords if keyword in content)
                scored_docs.append((doc, score))
            
            # Trier les documents par score décroissant
            scored_docs.sort(key=lambda x: x[1], reverse=True)
            
            # Prendre les k meilleurs documents
            best_docs = [doc for doc, score in scored_docs[:k] if score > 0]
            
            # Si aucun document pertinent n'est trouvé, renvoyer les k premiers documents
            if not best_docs and self.documents:
                best_docs = self.documents[:k]
            
            # Concaténer le contenu des documents
            context = "\n\n".join([doc.page_content for doc in best_docs])
            return context
        except Exception as e:
            print(f"Erreur lors de la recherche de contexte: {e}")
            return "IAfluence est une société spécialisée dans l'intégration de l'intelligence artificielle pour les PME d'Auvergne-Rhône-Alpes, avec un focus sur la sécurité et la confidentialité des données."
