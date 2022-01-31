import Alert from './alerts.js';

let btns = document.querySelectorAll('.add-alert');

btns.forEach((btn) =>
  btn.addEventListener('click', () => {
    let alertType = btn.getAttribute('data-alert');
    Alert(alertType, `Alert showing ${alertType}`);
  })
);
