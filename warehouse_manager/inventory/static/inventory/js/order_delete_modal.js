document.addEventListener('DOMContentLoaded', function() {
  const modal = document.getElementById('order-delete-modal');
  const yesBtn = document.getElementById('order-delete-yes');
  const noBtn = document.getElementById('order-delete-no');
  const details = document.getElementById('order-delete-details');
  let formToDelete = null;

  document.querySelectorAll('.order-delete-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      formToDelete = document.getElementById(btn.getAttribute('data-form-id'));
      // Pobierz szczegóły zamówienia z data-*
      const id = btn.getAttribute('data-order-id');
      const diameter = btn.getAttribute('data-order-diameter');
      const shape = btn.getAttribute('data-order-shape');
      const size = btn.getAttribute('data-order-size');
      const color = btn.getAttribute('data-order-color');
      const qty = btn.getAttribute('data-order-qty');
      // Wstaw szczegóły do modala
      details.innerHTML = `ID: ${id} - ${diameter}/ ${shape}/ ${size}/ ${color}/ ${qty} szt.`;
      modal.classList.remove('hidden');
    });
  });

  yesBtn.addEventListener('click', function() {
    if (formToDelete) {
      formToDelete.submit();
      formToDelete = null;
    }
    modal.classList.add('hidden');
    details.innerHTML = '';
  });

  noBtn.addEventListener('click', function() {
    modal.classList.add('hidden');
    formToDelete = null;
    details.innerHTML = '';
  });

  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      modal.classList.add('hidden');
      formToDelete = null;
      details.innerHTML = '';
    }
  });
});