document.addEventListener("DOMContentLoaded", function() {
    // Éléments du DOM
    const chatbotContainer = document.getElementById("iafluence-chatbot-container");
    const chatbotHeader = document.getElementById("chatbot-header");
    const chatbotToggle = document.getElementById("chatbot-toggle");
    const chatbotMessages = document.getElementById("chatbot-messages");
    const userInput = document.getElementById("user-input");
    const sendButton = document.getElementById("send-button");
    
    // État initial (déplié)
    let isChatbotCollapsed = false;
    
    // Fonction pour basculer l'état du chatbot (déplié/replié)
    function toggleChatbot() {
        isChatbotCollapsed = !isChatbotCollapsed;
        if (isChatbotCollapsed) {
            chatbotContainer.classList.add("collapsed");
            chatbotToggle.querySelector(".toggle-icon").textContent = "▲";
        } else {
            chatbotContainer.classList.remove("collapsed");
            chatbotToggle.querySelector(".toggle-icon").textContent = "▼";
        }
    }
    
    // Fonction pour convertir le markdown en HTML
    function markdownToHtml(text) {
        // Convertir les ** en balises <strong> pour le texte en gras
        return text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    }
    
    // Fonction pour ajouter un message au chatbot
    function addMessage(content, isUser = false) {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message");
        messageDiv.classList.add(isUser ? "user-message" : "bot-message");
        
        const messagePara = document.createElement("p");
        
        // Utiliser innerHTML avec la conversion markdown pour les messages du bot
        if (isUser) {
            messagePara.textContent = content;
        } else {
            messagePara.innerHTML = markdownToHtml(content);
        }
        
        messageDiv.appendChild(messagePara);
        chatbotMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        
        return messagePara; // Retourner le paragraphe pour pouvoir le modifier plus tard
    }
    
    // Fonction pour afficher le texte caractère par caractère
    function typeText(element, text, index = 0, speed = 20) {
        if (index < text.length) {
            // Ajouter le caractère suivant
            element.innerHTML = markdownToHtml(text.substring(0, index + 1));
            
            // Scroll to bottom pendant le typing
            chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
            
            // Appeler récursivement avec le prochain index
            setTimeout(() => {
                typeText(element, text, index + 1, speed);
            }, speed);
        }
    }
    
    // Fonction pour envoyer un message à l'API avec streaming
    async function sendMessage(message) {
        try {
            // Créer un élément de message pour la réponse du bot
            const messageDiv = document.createElement("div");
            messageDiv.classList.add("message", "bot-message");
            const messagePara = document.createElement("p");
            messageDiv.appendChild(messagePara);
            chatbotMessages.appendChild(messageDiv);
            
            // Afficher un indicateur de chargement initial
            messagePara.textContent = "...";
            
            // Appel à l'API en mode streaming
            const response = await fetch("/api/chat/stream", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ message: message })
            });
            
            if (!response.ok) {
                throw new Error("Erreur de communication avec le serveur");
            }
            
            // Lire la réponse en streaming
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let responseText = "";
            
            // Fonction pour traiter les chunks de données
            async function readStream() {
                const { done, value } = await reader.read();
                
                if (done) {
                    // Fin du stream
                    return;
                }
                
                // Décoder et ajouter le nouveau texte
                const chunk = decoder.decode(value, { stream: true });
                responseText += chunk;
                
                // Mettre à jour le message avec le texte complet
                messagePara.innerHTML = markdownToHtml(responseText);
                
                // Scroll to bottom
                chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
                
                // Continuer à lire
                return readStream();
            }
            
            // Commencer à lire le stream
            await readStream();
            
        } catch (error) {
            console.error("Erreur:", error);
            addMessage("Désolé, une erreur est survenue. Veuillez réessayer plus tard.");
        }
    }
    
    // Fonction alternative pour simuler l'effet de streaming côté client
    async function sendMessageWithClientSideStreaming(message) {
        try {
            // Afficher un indicateur de chargement
            const loadingDiv = document.createElement("div");
            loadingDiv.classList.add("message", "bot-message");
            loadingDiv.innerHTML = "<p>...</p>";
            chatbotMessages.appendChild(loadingDiv);
            
            // Appel à l'API
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ message: message })
            });
            
            // Supprimer l'indicateur de chargement
            chatbotMessages.removeChild(loadingDiv);
            
            if (!response.ok) {
                throw new Error("Erreur de communication avec le serveur");
            }
            
            const data = await response.json();
            
            // Créer un élément pour la réponse
            const messageDiv = document.createElement("div");
            messageDiv.classList.add("message", "bot-message");
            const messagePara = document.createElement("p");
            messageDiv.appendChild(messagePara);
            chatbotMessages.appendChild(messageDiv);
            
            // Afficher la réponse caractère par caractère
            typeText(messagePara, data.response, 0, 15); // Vitesse légèrement plus rapide que ChatGPT
            
        } catch (error) {
            console.error("Erreur:", error);
            addMessage("Désolé, une erreur est survenue. Veuillez réessayer plus tard.");
        }
    }
    
    // Gestionnaire d'événement pour le bouton d'envoi
    function handleSend() {
        const message = userInput.value.trim();
        if (message) {
            // Afficher le message de l'utilisateur
            addMessage(message, true);
            
            // Envoyer le message à l'API avec l'effet de streaming côté client
            // (nous utiliserons cette méthode en attendant que le backend soit mis à jour)
            sendMessageWithClientSideStreaming(message);
            
            // Vider le champ de saisie
            userInput.value = "";
        }
    }
    
    // Événements
    chatbotToggle.addEventListener("click", toggleChatbot);
    
    sendButton.addEventListener("click", handleSend);
    
    userInput.addEventListener("keypress", function(e) {
        if (e.key === "Enter") {
            handleSend();
        }
    });
    
    // Code pour intégrer le chatbot dans n'importe quelle page
    window.IAfluenceChatbot = {
        init: function(options) {
            // Options personnalisables (couleurs, position, etc.)
            if (options) {
                if (options.primaryColor) {
                    document.documentElement.style.setProperty("--primary-color", options.primaryColor);
                }
                if (options.accentColor) {
                    document.documentElement.style.setProperty("--accent-color", options.accentColor);
                }
                // Autres options...
            }
        }
    };
});
