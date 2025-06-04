// Script pour les animations et interactions
document.addEventListener('DOMContentLoaded', function() {
    // Animation au défilement pour les sections
    const sections = document.querySelectorAll('.poc-section');
    
    // Fonction pour vérifier si un élément est visible dans la fenêtre
    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.75 &&
            rect.bottom >= 0
        );
    }
    
    // Fonction pour ajouter la classe 'visible' aux sections visibles
    function handleScroll() {
        sections.forEach(section => {
            if (isElementInViewport(section)) {
                section.classList.add('visible');
            }
        });
    }
    
    // Ajouter l'écouteur d'événement pour le défilement
    window.addEventListener('scroll', handleScroll);
    
    // Déclencher une fois au chargement
    handleScroll();
    
    // Navigation fluide
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            window.scrollTo({
                top: targetSection.offsetTop - 80,
                behavior: 'smooth'
            });
        });
    });
});
