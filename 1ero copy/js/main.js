/* js/main.js */
// Funciones globales para todas las páginas
document.addEventListener('DOMContentLoaded', () => {
  // Aplicar smooth scroll a enlaces internos
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetID = this.getAttribute('href').substr(1);
      const target = document.getElementById(targetID);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Establecer la fecha actual en la promoción de index.html
  const promoDateElem = document.getElementById('promoDate');
  if (promoDateElem) {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    promoDateElem.textContent = `${dd}/${mm}/${yyyy}`;
  }
});

