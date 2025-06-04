import os
from dotenv import load_dotenv
from openai import OpenAI
import requests
# Charger les variables d'environnement
load_dotenv()
class OpenRouterAPI:
    def __init__(self):
        self.api_key = os.getenv("OPENROUTER_API_KEY")
        self.model = os.getenv("OPENROUTER_MODEL")
        self.site_url = os.getenv("SITE_URL")
        self.site_name = os.getenv("SITE_NAME")
        
        # Initialiser le client OpenAI avec OpenRouter
        self.client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=self.api_key,
            default_headers={
                "HTTP-Referer": self.site_url,
                "X-Title": self.site_name,
                "Authorization": f"Bearer {self.api_key}"
            }
        )
    
    def get_response(self, prompt):
        """
        Envoie une requête à l'API OpenRouter et retourne la réponse
        
        Args:
            prompt (str): Le message de l'utilisateur avec contexte
            
        Returns:
            str: La réponse du modèle
        """
        try:
            # Appel à l'API OpenRouter
            completion = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )
            
            # Extraire la réponse
            response = completion.choices[0].message.content
            return response
        except Exception as e:
            print(f"Erreur lors de l'appel à l'API OpenRouter: {e}")
            return f"Désolé, une erreur est survenue lors de la communication avec l'API: {str(e)}"
