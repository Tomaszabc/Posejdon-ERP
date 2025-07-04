const { defineConfig } = require('cypress');
const { exec } = require('child_process');

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on('before:run', () => {
        // Przywróć bazę danych z pliku .dump
        exec('pg_restore -U test_user -d warehouse_manager_test /ścieżka/do/pliku.dump', (err) => {
          if (err) {
            console.error('Błąd przywracania bazy danych:', err);
          } else {
            console.log('Baza danych testowa została przywrócona.');
          }
        });
      });
    },
  },
});
