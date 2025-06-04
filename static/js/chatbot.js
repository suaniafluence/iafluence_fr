document.addEventListener("DOMContentLoaded", function() {
    // Éléments du DOM
    const chatbotContainer = document.getElementById("iafluence-chatbot-container");
    const chatbotHeader = document.getElementById("chatbot-header");
    const chatbotToggle = document.getElementById("chatbot-toggle");
    const chatbotMessages = document.getElementById("chatbot-messages");
    const userInput = document.getElementById("user-input");
    const sendButton = document.getElementById("send-button");
	const md = window.markdownit({
    html:        false,   // pas de HTML sandboxé
    linkify:     true,    // transforme automatiquement URL→<a>
    typographer: true     // belles citations, tirets…
  });
    
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
   
	// Nouvelle version full-MD + sécurité XSS 
	function markdownToHtml(text) { 
	const raw = md.render(text); // Markdown-it → HTML brut return DOMPurify.sanitize(raw); // DOMPurify nettoie tout
	}


    
	function addMessage(content, isUser = false) {
	  const messageDiv = document.createElement("div");
	  messageDiv.classList.add("message", isUser ? "user-message" : "bot-message");

	  const messagePara = document.createElement("p");
	  if (isUser) {
		messagePara.textContent = content;
	  } else {
		// c’est ici que votre markdownToHtml intervient
		messagePara.innerHTML = markdownToHtml(content);
	  }

	  messageDiv.appendChild(messagePara);
	  chatbotMessages.appendChild(messageDiv);
	  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
	}
    
    // Fonction pour envoyer un message à l'API
    async function sendMessage(message) {
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
            
            // Afficher la réponse du bot
            addMessage(data.response);
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
            
            // Envoyer le message à l'API
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
