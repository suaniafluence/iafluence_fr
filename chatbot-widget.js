(function () {
  // 1. Bouton flottant
  const button = document.createElement('div');
  button.id = 'iafluence-button';
  Object.assign(button.style, {
    position: 'fixed',
    bottom: '10px',
    right: '20px',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #007BFF 0%, #28A745 100%)',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: '9999'
  });

  const icon = document.createElement('i');
  icon.className = 'fas fa-comment-dots';
  Object.assign(icon.style, {
    color: 'white',
    fontSize: '24px'
  });
  button.appendChild(icon);
  document.body.appendChild(button);

  // 2. Iframe chatbot
  const iframe = document.createElement('iframe');
  iframe.src = 'https://iafluence.fr/chatbot-frame.html';
  Object.assign(iframe.style, {
    position: 'fixed',
    bottom: '90px',
    right: '20px',
    width: '380px',
    height: '500px',
    border: 'none',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
    zIndex: '9998',
    display: 'none',
    backgroundColor: 'white'
  });
  document.body.appendChild(iframe);

  // 3. Toggle ouverture/fermeture
  let isOpen = false;
  button.addEventListener('click', () => {
    isOpen = !isOpen;
    iframe.style.display = isOpen ? 'block' : 'none';
  });

  // 4. Responsive mobile
  function adjustPosition() {
    const isMobile = window.innerWidth <= 600;
    if (isMobile) {
      iframe.style.width = '95vw';
      iframe.style.height = '80vh';
      iframe.style.right = '2.5vw';
      iframe.style.bottom = '80px';
    } else {
      iframe.style.width = '385px';
      iframe.style.height = '540px';
      iframe.style.right = '20px';
      iframe.style.bottom = '90px';
    }
  }

  window.addEventListener('resize', adjustPosition);
  adjustPosition(); // Appel initial
})();
