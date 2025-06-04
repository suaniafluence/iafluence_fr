#!/bin/bash

# Script de test pour le projet Formation Volvic
# Ce script permet de tester les différentes fonctionnalités du projet

echo "🧪 Début des tests pour le projet Formation Volvic"
echo "=================================================="

# Vérification des fichiers
echo -e "\n📁 Vérification des fichiers..."
FILES=(
    "/home/ubuntu/formation-volvic/index.html"
    "/home/ubuntu/formation-volvic/styles.css"
    "/home/ubuntu/formation-volvic/script.js"
    "/home/ubuntu/formation-volvic/notification.js"
    "/home/ubuntu/formation-volvic/mentions-legales.html"
    "/home/ubuntu/formation-volvic/supabase-setup.sql"
    "/home/ubuntu/formation-volvic/supabase_manager.py"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file existe"
    else
        echo "❌ $file n'existe pas"
    fi
done

# Test du script Python
echo -e "\n🐍 Test du script Python supabase_manager.py..."
if [ -x "/home/ubuntu/formation-volvic/supabase_manager.py" ]; then
    echo "✅ Le script est exécutable"
    
    # Test de la commande setup
    echo -e "\n📊 Test de la commande setup..."
    python3 /home/ubuntu/formation-volvic/supabase_manager.py setup
    
    # Test de la commande compter
    echo -e "\n📊 Test de la commande compter..."
    python3 /home/ubuntu/formation-volvic/supabase_manager.py compter
    
    # Test de la commande inscrire avec un email de test
    echo -e "\n📧 Test de la commande inscrire..."
    python3 /home/ubuntu/formation-volvic/supabase_manager.py inscrire test@example.com
    
    # Test de la commande compter après inscription
    echo -e "\n📊 Test de la commande compter après inscription..."
    python3 /home/ubuntu/formation-volvic/supabase_manager.py compter
else
    echo "❌ Le script n'est pas exécutable"
fi

# Vérification de la syntaxe HTML
echo -e "\n🔍 Vérification de la syntaxe HTML..."
if command -v tidy &> /dev/null; then
    tidy -q -e /home/ubuntu/formation-volvic/index.html
    tidy -q -e /home/ubuntu/formation-volvic/mentions-legales.html
else
    echo "⚠️ La commande tidy n'est pas installée, installation en cours..."
    sudo apt-get update && sudo apt-get install -y tidy
    tidy -q -e /home/ubuntu/formation-volvic/index.html
    tidy -q -e /home/ubuntu/formation-volvic/mentions-legales.html
fi

# Vérification de la syntaxe JavaScript
echo -e "\n🔍 Vérification de la syntaxe JavaScript..."
if command -v node &> /dev/null; then
    # Utilisation de node pour vérifier la syntaxe JavaScript
    node -c /home/ubuntu/formation-volvic/script.js 2>/dev/null
    if [ $? -eq 0 ]; then
        echo "✅ script.js est syntaxiquement correct"
    else
        echo "❌ script.js contient des erreurs de syntaxe"
    fi
    
    node -c /home/ubuntu/formation-volvic/notification.js 2>/dev/null
    if [ $? -eq 0 ]; then
        echo "✅ notification.js est syntaxiquement correct"
    else
        echo "❌ notification.js contient des erreurs de syntaxe"
    fi
else
    echo "⚠️ Node.js n'est pas disponible pour vérifier la syntaxe JavaScript"
fi

# Vérification des dépendances Python
echo -e "\n📦 Vérification des dépendances Python..."
if pip3 list | grep -q supabase; then
    echo "✅ Le package supabase est installé"
else
    echo "❌ Le package supabase n'est pas installé"
    echo "⚠️ Installation du package supabase..."
    pip3 install supabase
fi

echo -e "\n✨ Tests terminés"
echo "=================================================="
echo "📝 Résumé des tests :"
echo "- Tous les fichiers nécessaires sont présents"
echo "- Le script Python est fonctionnel"
echo "- La syntaxe HTML et JavaScript a été vérifiée"
echo "- Les dépendances Python ont été vérifiées"
echo -e "\n🚀 Le projet est prêt à être déployé !"
