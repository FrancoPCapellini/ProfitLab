/* js/registro.js */
// Validación y mejoras interactivas para el formulario de registro
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
  
    // Añadir efecto de foco a los inputs
    document.querySelectorAll('#registerForm input').forEach(input => {
      input.addEventListener('focus', () => {
        input.classList.add('input-focus');
      });
      input.addEventListener('blur', () => {
        input.classList.remove('input-focus');
      });
    });
  
    // Validación del formulario de registro
    registerForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const fullName = document.getElementById('fullName').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
  
      if (!fullName || !email || !password || !confirmPassword) {
        alert('Por favor, complete todos los campos.');
        return;
      }
      
      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert('Ingrese un correo electrónico válido.');
        return;
      }
      
      if (password !== confirmPassword) {
        alert('Las contraseñas no coinciden.');
        return;
      }
      
      // Simulación de registro exitoso
      alert('Registro exitoso');
      registerForm.reset();
    });
  });
  