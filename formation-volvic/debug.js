console.log('Debugging script loaded');
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM fully loaded');
  
  // Vérifier les éléments DOM
  const compteurContainer = document.getElementById('compteur-container');
  console.log('Compteur container:', compteurContainer);
  
  // Vérifier si Supabase est disponible
  console.log('Supabase disponible:', typeof supabase !== 'undefined');
  
  // Tester la connexion à Supabase
  if (typeof supabase !== 'undefined') {
    const SUPABASE_URL = 'https://vwcgpclghshuvrglueqo.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3Y2dwY2xnaHNodXZyZ2x1ZXFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxOTE4NTgsImV4cCI6MjA1ODc2Nzg1OH0.088dbATv--ZavX___P5tY5xCBRClTEPlBOwZElDfSK0';
    
    try {
      const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      console.log('Client Supabase créé avec succès');
      
      // Tester la requête de comptage
      client.from('inscriptions_volvic').select('*', { count: 'exact', head: true }).then(response => {
        console.log('Réponse de Supabase:', response);
        
        if (compteurContainer) {
          compteurContainer.textContent = response.count + ' personne(s) inscrite(s)';
          compteurContainer.style.backgroundColor = '#e0f7fa';
          compteurContainer.style.padding = '10px';
          compteurContainer.style.borderRadius = '5px';
          compteurContainer.style.marginBottom = '20px';
        }
      }).catch(error => {
        console.error('Erreur lors de la requête Supabase:', error);
        if (compteurContainer) {
          compteurContainer.textContent = 'Erreur lors du chargement du compteur';
          compteurContainer.style.color = 'red';
        }
      });
    } catch (error) {
      console.error('Erreur lors de la création du client Supabase:', error);
    }
  } else {
    console.error('Supabase n\'est pas disponible');
    if (compteurContainer) {
      compteurContainer.textContent = 'Erreur: Supabase non disponible';
      compteurContainer.style.color = 'red';
    }
  }
});
