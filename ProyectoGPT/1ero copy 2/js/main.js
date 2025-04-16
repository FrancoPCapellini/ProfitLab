/* js/main.js (JavaScript Unificado) */
document.addEventListener('DOMContentLoaded', () => {
  // Smooth scroll para enlaces internos
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetID = this.getAttribute('href').substring(1);
      const target = document.getElementById(targetID);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Establecer la fecha de promoción (en index.html)
  const promoDateElem = document.getElementById('promoDate');
  if (promoDateElem) {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    promoDateElem.textContent = `${dd}/${mm}/${yyyy}`;
  }

  // Lógica para la página de Registro
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.querySelectorAll('input').forEach(input => {
      input.addEventListener('focus', () => input.classList.add('input-focus'));
      input.addEventListener('blur', () => input.classList.remove('input-focus'));
    });

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

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert('Ingrese un correo electrónico válido.');
        return;
      }

      if (password !== confirmPassword) {
        alert('Las contraseñas no coinciden.');
        return;
      }

      alert('Registro exitoso');
      registerForm.reset();
    });
  }

  // Lógica para la página de Login
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.querySelectorAll('input').forEach(input => {
      input.addEventListener('focus', () => input.classList.add('input-focus'));
      input.addEventListener('blur', () => input.classList.remove('input-focus'));
    });

    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;
      if (!email || !password) {
        alert('Por favor, complete ambos campos.');
        return;
      }
      alert('Login exitoso');
      loginForm.reset();
    });
  }

  // Lógica para la página de Suscripciones
  const subscribeBtn = document.getElementById('subscribeBtn');
  if (subscribeBtn) {
    subscribeBtn.addEventListener('click', () => {
      const referralCode = document.getElementById('referral').value.trim().toUpperCase();
      let redirectUrl = 'https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=default';
      if (referralCode === 'PROFIT50') {
        redirectUrl = 'https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=xxx123';
      } else if (referralCode === 'AMIGOPLUS') {
        redirectUrl = 'https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=yyy456';
      }
      window.location.href = redirectUrl;
    });
  }
});
