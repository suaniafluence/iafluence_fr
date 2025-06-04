// Chargement des identifiants Supabase depuis le fichier .env
// Fonction pour charger les variables d'environnement
async function loadEnvVariables() {
  try {
    const response = await fetch('/.env');
    if (!response.ok) {
      console.error('Erreur lors du chargement du fichier .env');
      return null;
    }
    
    const text = await response.text();
    const env = {};
    
    text.split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length === 2) {
        const key = parts[0].trim();
        const value = parts[1].trim();
        env[key] = value;
      }
    });
    
    return env;
  } catch (error) {
    console.error('Erreur lors du chargement des variables d\'environnement:', error);
    return null;
  }
}

// Variables pour Supabase
let SUPABASE_URL = 'https://vwcgpclghshuvrglueqo.supabase.co';
let SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3Y2dwY2xnaHNodXZyZ2x1ZXFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxOTE4NTgsImV4cCI6MjA1ODc2Nzg1OH0.088dbATv--ZavX___P5tY5xCBRClTEPlBOwZElDfSK0';
let supabaseClient = null;

// Éléments DOM
let formulaireInscription;
let emailInput;
let rgpdCheckbox;
let btnInscription;
let messageResultat;
let compteurContainer;

// Fonction pour initialiser les éléments DOM
function initialiserElements() {
  formulaireInscription = document.getElementById('formulaire-inscription');
  emailInput = document.getElementById('email');
  rgpdCheckbox = document.getElementById('rgpd');
  btnInscription = document.getElementById('btn-inscription');
  messageResultat = document.getElementById('message-resultat');
  compteurContainer = document.getElementById('compteur-container');
  
  if (!formulaireInscription || !emailInput || !rgpdCheckbox || !btnInscription || !messageResultat || !compteurContainer) {
    console.error('Certains éléments DOM n\'ont pas été trouvés');
    return false;
  }
  
  return true;
}

// Fonction pour afficher un message de résultat
function afficherMessage(message, type) {
  if (!messageResultat) return;
  
  messageResultat.textContent = message;
  messageResultat.classList.remove('hidden', 'success', 'error');
  messageResultat.classList.add(type);
  
  // Masquer le message après 5 secondes
  setTimeout(() => {
    messageResultat.classList.add('hidden');
  }, 5000);
}

// Fonction pour mettre à jour le compteur
async function mettreAJourCompteur() {
  if (!compteurContainer || !supabaseClient) {
    console.error('Compteur container ou client Supabase non initialisé');
    return;
  }
  
  try {
    console.log('Mise à jour du compteur...');
    
    // Récupérer le nombre d'inscrits depuis Supabase
    const { count, error } = await supabaseClient
      .from('inscriptions_volvic')
      .select('*', { count: 'exact', head: true });
      
    if (error) {
      console.error('Erreur lors du comptage des inscrits:', error);
      throw error;
    }
    
    console.log('Nombre d\'inscrits:', count);
    
    // Déterminer le message à afficher selon le nombre d'inscrits
    let message = '';
    let classe = '';
    
    if (count >= 13) {
      message = '🚫 Les inscriptions sont closes !';
      classe = 'compteur-ferme';
      
      // Désactiver le formulaire si les inscriptions sont closes
      if (formulaireInscription) {
        formulaireInscription.querySelectorAll('input, button').forEach(element => {
          element.disabled = true;
        });
      }
    } else if (count >= 10) {
      message = '⚡ Il ne reste plus beaucoup de places...';
      classe = 'compteur-urgent';
    } else if (count >= 8) {
      message = '🔥 La formation est imminente !';
      classe = 'compteur-imminent';
    } else {
      message = `${count} personne${count > 1 ? 's' : ''} déjà inscrite${count > 1 ? 's' : ''}.`;
      classe = 'compteur-normal';
    }
    
    // Mettre à jour l'affichage du compteur
    compteurContainer.textContent = message;
    compteurContainer.className = classe;
    
    // Envoyer une notification par email si 12 inscrits sont atteints
    if (count === 12) {
      envoyerNotificationEmail();
    }
    
  } catch (error) {
    console.error('Erreur lors de la mise à jour du compteur:', error);
    compteurContainer.textContent = 'Erreur lors du chargement du compteur';
    compteurContainer.className = 'compteur-error';
  }
}

// Fonction pour inscrire un email
async function inscrireEmail(email) {
  if (!supabaseClient) {
    console.error('Client Supabase non initialisé');
    afficherMessage('❌ Erreur de connexion à la base de données', 'error');
    return false;
  }
  
  try {
    console.log('Inscription de l\'email:', email);
    
    const { data, error } = await supabaseClient
      .from('inscriptions_volvic')
      .insert([{ email: email }]);
      
    if (error) {
      // Vérifier si c'est une erreur de doublon (code 23505)
      if (error.code === '23505') {
        afficherMessage('⚠️ Cet email est déjà inscrit.', 'error');
      } else {
        afficherMessage('❌ Une erreur est survenue lors de l\'inscription.', 'error');
        console.error('Erreur Supabase:', error);
      }
      return false;
    }
    
    afficherMessage('✅ Inscription réussie !', 'success');
    return true;
  } catch (error) {
    afficherMessage('❌ Une erreur est survenue lors de l\'inscription.', 'error');
    console.error('Erreur:', error);
    return false;
  }
}

// Initialisation de l'application
async function initialiserApp() {
  console.log('Initialisation de l\'application...');
  
  // Essayer de charger les variables d'environnement
  try {
    const env = await loadEnvVariables();
    if (env && env.SUPABASE_URL && env.SUPABASE_KEY) {
      SUPABASE_URL = env.SUPABASE_URL;
      SUPABASE_KEY = env.SUPABASE_KEY;
      console.log('Variables d\'environnement chargées avec succès');
    } else {
      console.warn('Utilisation des identifiants par défaut');
    }
  } catch (error) {
    console.warn('Erreur lors du chargement des variables d\'environnement, utilisation des identifiants par défaut:', error);
  }
  
  // Initialiser le client Supabase
  try {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('Client Supabase initialisé');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation du client Supabase:', error);
    return;
  }
  
  // Initialiser les éléments DOM
  if (!initialiserElements()) {
    console.error('Impossible d\'initialiser les éléments DOM');
    return;
  }
  
  // Gestionnaire d'événement pour la soumission du formulaire
  formulaireInscription.addEventListener('submit', async function(event) {
    event.preventDefault();
    
    // Vérifier que les champs sont valides
    if (!emailInput.validity.valid) {
      afficherMessage('Veuillez entrer une adresse email valide.', 'error');
      return;
    }
    
    if (!rgpdCheckbox.checked) {
      afficherMessage('Vous devez accepter les conditions RGPD pour vous inscrire.', 'error');
      return;
    }
    
    // Désactiver le bouton pendant l'inscription
    btnInscription.disabled = true;
    btnInscription.textContent = 'Inscription en cours...';
    
    // Inscrire l'email
    const inscriptionReussie = await inscrireEmail(emailInput.value);
    
    // Réactiver le bouton
    btnInscription.disabled = false;
    btnInscription.textContent = 'Je m\'inscris';
    
    // Si l'inscription a réussi, réinitialiser le formulaire et mettre à jour le compteur
    if (inscriptionReussie) {
      formulaireInscription.reset();
      mettreAJourCompteur();
    }
  });
  
  // Mettre à jour le compteur au chargement
  mettreAJourCompteur();
}

// Initialiser l'application au chargement de la page
document.addEventListener('DOMContentLoaded', initialiserApp);
