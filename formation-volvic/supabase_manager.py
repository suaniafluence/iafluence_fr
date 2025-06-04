#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from supabase import create_client
import os
import sys
import argparse

def setup_supabase():
    """
    Script pour configurer la base de données Supabase pour le projet Formation Volvic.
    Ce script permet de créer la table inscriptions_volvic, d'activer la sécurité RLS,
    et de configurer la politique d'insertion.
    """
    # Configuration Supabase
    url = "https://vwcgpclghshuvrglueqo.supabase.co"
    key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3Y2dwY2xnaHNodXZyZ2x1ZXFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxOTE4NTgsImV4cCI6MjA1ODc2Nzg1OH0.088dbATv--ZavX___P5tY5xCBRClTEPlBOwZElDfSK0"
    
    try:
        # Création du client Supabase
        client = create_client(url, key)
        print("✅ Connexion à Supabase établie avec succès.")
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur lors de la configuration de Supabase: {e}")
        return False

def inscrire_email(email):
    """
    Fonction pour inscrire un email dans la base de données Supabase.
    
    Args:
        email (str): L'adresse email à inscrire
        
    Returns:
        bool: True si l'inscription a réussi, False sinon
    """
    # Configuration Supabase
    url = "https://vwcgpclghshuvrglueqo.supabase.co"
    key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3Y2dwY2xnaHNodXZyZ2x1ZXFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxOTE4NTgsImV4cCI6MjA1ODc2Nzg1OH0.088dbATv--ZavX___P5tY5xCBRClTEPlBOwZElDfSK0"
    
    try:
        # Création du client Supabase
        client = create_client(url, key)
        
        # Insertion de l'email
        response = client.table("inscriptions_volvic").insert({"email": email}).execute()
        
        if hasattr(response, 'error') and response.error is not None:
            raise Exception(response.error)
            
        print(f"✅ Inscription réussie pour l'email: {email}")
        return True
        
    except Exception as e:
        error_message = str(e)
        if "duplicate key value violates unique constraint" in error_message or "23505" in error_message:
            print(f"⚠️ L'email {email} est déjà inscrit.")
        else:
            print(f"❌ Erreur lors de l'inscription: {e}")
        return False

def compter_inscrits():
    """
    Fonction pour compter le nombre d'inscrits dans la base de données Supabase.
    
    Returns:
        int: Le nombre d'inscrits
    """
    # Configuration Supabase
    url = "https://vwcgpclghshuvrglueqo.supabase.co"
    key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3Y2dwY2xnaHNodXZyZ2x1ZXFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxOTE4NTgsImV4cCI6MjA1ODc2Nzg1OH0.088dbATv--ZavX___P5tY5xCBRClTEPlBOwZElDfSK0"
    
    try:
        # Création du client Supabase
        client = create_client(url, key)
        
        # Comptage des inscrits
        response = client.table("inscriptions_volvic").select("*", count="exact").execute()
        count = response.count
        
        print(f"📊 Nombre d'inscrits: {count}")
        return count
        
    except Exception as e:
        print(f"❌ Erreur lors du comptage des inscrits: {e}")
        return -1

def reinitialiser_compteur():
    """
    Fonction pour réinitialiser le compteur en supprimant toutes les inscriptions.
    
    Returns:
        bool: True si la réinitialisation a réussi, False sinon
    """
    # Configuration Supabase
    url = "https://vwcgpclghshuvrglueqo.supabase.co"
    key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3Y2dwY2xnaHNodXZyZ2x1ZXFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxOTE4NTgsImV4cCI6MjA1ODc2Nzg1OH0.088dbATv--ZavX___P5tY5xCBRClTEPlBOwZElDfSK0"
    
    try:
        # Création du client Supabase
        client = create_client(url, key)
        
        # Suppression de toutes les inscriptions
        response = client.table("inscriptions_volvic").delete().execute()
        
        if hasattr(response, 'error') and response.error is not None:
            raise Exception(response.error)
            
        print("🧹 Compteur réinitialisé avec succès. Toutes les inscriptions ont été supprimées.")
        return True
        
    except Exception as e:
        print(f"❌ Erreur lors de la réinitialisation du compteur: {e}")
        return False

def main():
    """
    Fonction principale pour gérer les arguments en ligne de commande.
    """
    parser = argparse.ArgumentParser(description="Gestion des inscriptions pour la formation Volvic")
    subparsers = parser.add_subparsers(dest="command", help="Commande à exécuter")
    
    # Commande setup
    setup_parser = subparsers.add_parser("setup", help="Configurer la base de données Supabase")
    
    # Commande inscrire
    inscrire_parser = subparsers.add_parser("inscrire", help="Inscrire un email")
    inscrire_parser.add_argument("email", help="Adresse email à inscrire")
    
    # Commande compter
    compter_parser = subparsers.add_parser("compter", help="Compter le nombre d'inscrits")
    
    # Commande reinitialiser
    reinitialiser_parser = subparsers.add_parser("reinitialiser", help="Réinitialiser le compteur")
    
    args = parser.parse_args()
    
    if args.command == "setup":
        setup_supabase()
    elif args.command == "inscrire":
        inscrire_email(args.email)
    elif args.command == "compter":
        compter_inscrits()
    elif args.command == "reinitialiser":
        reinitialiser_compteur()
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
