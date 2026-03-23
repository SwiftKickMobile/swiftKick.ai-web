/* ==========================================================================
   main.js — Mobile menu toggle (homepage only)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {
  var menuToggle = document.getElementById('menuToggle');
  var mobileMenu = document.getElementById('mobileMenu');
  var hamburger = menuToggle ? menuToggle.querySelector('.hamburger-icon') : null;

  if (menuToggle && mobileMenu && hamburger) {
    menuToggle.addEventListener('click', function () {
      hamburger.classList.toggle('is-open');
      mobileMenu.classList.toggle('is-open');
    });
  }
});
