document.addEventListener('DOMContentLoaded', function() {
  const menuBtn = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      mobileMenu.classList.toggle('hidden');
    });

    // Zamknij menu po kliknięciu linku w menu
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
      });
    });

    // Zamknij menu po kliknięciu poza menu
    document.addEventListener('click', function(e) {
      if (!mobileMenu.classList.contains('hidden')) {
        // Jeśli kliknięto poza menu i poza przyciskiem
        if (!mobileMenu.contains(e.target) && e.target !== menuBtn) {
          mobileMenu.classList.add('hidden');
        }
      }
    });
  }
});