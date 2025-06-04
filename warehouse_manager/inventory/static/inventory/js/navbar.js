document.addEventListener('DOMContentLoaded', function() {
  // ======== 1. OBŁUGA PRZYCISKU HAMBURGERA (MOBILE MENU) ========
  const menuBtn = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');

  if (menuBtn && mobileMenu) {
    // Kliknięcie w ikonę hamburgera => pokaż/ukryj menu
    menuBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      mobileMenu.classList.toggle('hidden');
    });

    // Zamykaj menu, gdy klikniesz w dowolny link wewnątrz mobilnego menu
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
      });
    });

    // Zamknij mobilne menu, gdy klikniesz PÓŹNIEJ gdzie indziej na stronie
    document.addEventListener('click', function(e) {
      if (!mobileMenu.classList.contains('hidden')) {
        // jeśli kliknięto poza mobilnym menu ORAZ poza przyciskiem hamburgera
        if (!mobileMenu.contains(e.target) && e.target !== menuBtn) {
          mobileMenu.classList.add('hidden');
        }
      }
    });
  }


  // ======== 2. OBŁUGA DESKTOPOWEGO DROPDOWNA "Zarządzanie Sprzedażą" ========
  const salesBtn = document.getElementById('sales-dropdown-btn');
  const salesMenu = document.getElementById('sales-dropdown-menu');
  if (salesBtn && salesMenu) {
    // kliknięcie w przycisk "Zarządzanie Sprzedażą"
    salesBtn.addEventListener('click', (e) => {
      e.preventDefault();
      salesMenu.classList.toggle('hidden');
    });
    // kliknięcie poza menu => zamknij dropdown
    document.addEventListener('click', (e) => {
      if (salesBtn && salesMenu) {
        if (!salesBtn.contains(e.target) && !salesMenu.contains(e.target)) {
          salesMenu.classList.add('hidden');
        }
      }
    });
  }


  // ======== 3. OBŁUGA MOBILNEGO DROPDOWNA "Zarządzanie Sprzedażą" ========
  const mobileSalesBtn = document.getElementById('mobile-sales-dropdown-btn');
  const mobileSalesMenu = document.getElementById('mobile-sales-dropdown-menu');
  if (mobileSalesBtn && mobileSalesMenu) {
    // kliknięcie pokazuje/ukrywa liste opcji
    mobileSalesBtn.addEventListener('click', (e) => {
      e.preventDefault();
      mobileSalesMenu.classList.toggle('hidden');
    });
    // kliknięcie poza mobilnym dropdown => zamknij go
    document.addEventListener('click', (e) => {
      if (mobileSalesBtn && mobileSalesMenu) {
        if (!mobileSalesBtn.contains(e.target) && !mobileSalesMenu.contains(e.target)) {
          mobileSalesMenu.classList.add('hidden');
        }
      }
    });
  }
});
