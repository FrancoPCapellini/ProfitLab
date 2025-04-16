/* js/suscripciones.js */
// Funcionalidad para redirigir según código de referido en la página de suscripciones
document.addEventListener('DOMContentLoaded', () => {
    const subscribeBtn = document.getElementById('subscribeBtn');
  
    subscribeBtn.addEventListener('click', () => {
      const referralCode = document.getElementById('referral').value.trim().toUpperCase();
      let redirectUrl = 'https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=default';
  
      // Asignar URL según código de referido
      if (referralCode === 'PROFIT50') {
        redirectUrl = 'https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=xxx123';
      } else if (referralCode === 'AMIGOPLUS') {
        redirectUrl = 'https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=yyy456';
      }
      
      window.location.href = redirectUrl;
    });
  });
  