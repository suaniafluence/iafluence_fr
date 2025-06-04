// Fonction pour envoyer une notification par email
function envoyerNotificationEmail() {
    // Dans un environnement réel, cette fonction serait implémentée côté serveur
    // Ici, nous simulons l'envoi d'un email à suan.tay@iafluence.fr
    
    // Créer un objet FormData pour envoyer les données
    const formData = new FormData();
    formData.append('destinataire', 'suan.tay@iafluence.fr');
    formData.append('objet', 'Inscriptions closes - Formation Volvic');
    formData.append('message', '12 personnes se sont inscrites. Il est temps de fermer les inscriptions.');
    
    // Simuler l'envoi d'un email via une requête fetch
    // Dans un environnement réel, cette requête serait envoyée à un endpoint de serveur
    console.log('Notification envoyée à suan.tay@iafluence.fr');
    console.log('Objet: Inscriptions closes - Formation Volvic');
    console.log('Message: 12 personnes se sont inscrites. Il est temps de fermer les inscriptions.');
    
    // Afficher un message dans la console pour indiquer que la notification a été envoyée
    return true;
}
