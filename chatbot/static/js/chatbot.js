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
    
    // Configurer marked.js
    marked.setOptions({ breaks: true });

    // Fonction pour convertir le markdown en HTML
    function markdownToHtml(text) {
        return marked.parse(text);
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
    
    // Fonction pour envoyer un message à l'API avec streaming réel
    async function sendMessage(message) {
        try {
            // Créer un élément de message pour la réponse du bot
            const messageDiv = document.createElement("div");
            messageDiv.classList.add("message", "bot-message");
            const messagePara = document.createElement("div");
            messageDiv.appendChild(messagePara);
            chatbotMessages.appendChild(messageDiv);

            // Afficher un indicateur de chargement initial
            messagePara.innerHTML = "<span class='typing-dots'>...</span>";

            // Appel à l'API en mode streaming
            const response = await fetch("/api/chat/stream", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: message })
            });

            if (!response.ok) {
                throw new Error("Erreur de communication avec le serveur");
            }

            // Lire la réponse en streaming token par token
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullText = "";
            let firstChunk = true;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                fullText += chunk;

                // Supprimer les "..." dès le premier token reçu
                if (firstChunk) {
                    firstChunk = false;
                }

                // Render le markdown sur le texte accumulé
                messagePara.innerHTML = markdownToHtml(fullText);
                chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
            }

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
            
            // Envoyer le message à l'API avec streaming réel
            sendMessage(message);
            
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
