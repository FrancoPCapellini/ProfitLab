/* js/login.js */
// Validación y mejoras interactivas para el formulario de login
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
  
    // Añadir efecto de foco a los inputs del formulario de login
    document.querySelectorAll('#loginForm input').forEach(input => {
      input.addEventListener('focus', () => {
        input.classList.add('input-focus');
      });
      input.addEventListener('blur', () => {
        input.classList.remove('input-focus');
      });
    });
  
    // Validación del formulario de login
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
  
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;
  
      if (!email || !password) {
        alert('Por favor, complete ambos campos.');
        return;
      }
      
      // Simulación de login exitoso
      alert('Login exitoso');
      loginForm.reset();
    });
  });
  