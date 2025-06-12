document.addEventListener('DOMContentLoaded', function () {
  const form = document.querySelector('form');
  const btn = document.getElementById('order-submit-btn');
  const modal = document.getElementById('custom-confirm-modal');
  const yesBtn = document.getElementById('custom-confirm-yes');
  const noBtn = document.getElementById('custom-confirm-no');
  const summary = document.getElementById('custom-confirm-summary');
  let submitAfterConfirm = false;

  if (form && btn && modal && yesBtn && noBtn && summary) {
    form.addEventListener('submit', function (e) {
      if (submitAfterConfirm) {
        submitAfterConfirm = false;
        return;
      }
      if (form.checkValidity()) {
        e.preventDefault();
        // Pobierz wartości z formularza
        const diameter = document.getElementById('diffuser_diameter')?.value || '-';
        const shape = document.getElementById('diffuser_shape')?.value || '-';
        const size = document.getElementById('diffuser_size')?.value || '-';
        const color = document.getElementById('diffuser_color')?.value || '-';
        const qty = document.getElementById('quantity_to_assemble')?.value || '-';
        // Wstaw podsumowanie do modala
        summary.innerHTML = `
          <div class="text-left">
            <div><span class="font-semibold">Średnica:</span> ${diameter}</div>
            <div><span class="font-semibold">Kształt:</span> ${shape}</div>
            <div><span class="font-semibold">Rozmiar:</span> ${size}</div>
            <div><span class="font-semibold">Kolor:</span> ${color}</div>
            <div><span class="font-semibold">Ilość:</span> ${qty}</div>
          </div>
        `;
        modal.classList.remove('hidden');
      }
      // Jeśli niepoprawny, pozwól przeglądarce pokazać błędy
    });

    yesBtn.addEventListener('click', function () {
      modal.classList.add('hidden');
      submitAfterConfirm = true;
      form.requestSubmit();
    });

    noBtn.addEventListener('click', function () {
      modal.classList.add('hidden');
      submitAfterConfirm = false;
    });

    modal.addEventListener('click', function (e) {
      if (e.target === modal) {
        modal.classList.add('hidden');
        submitAfterConfirm = false;
      }
    });
  }
});
