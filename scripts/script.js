import Alert from './alerts.js';

let btns = document.querySelectorAll('.add-alert');

Alert.setGlobalProps({
  timeout: 3000,
  position: 'bottomRight',
  autoDisappear: true,
});

btns.forEach((btn) =>
  btn.addEventListener('click', (e) => {
    let alertType = e.target.getAttribute('data-alert');
		Alert.alert(alertType, `this is a ${alertType} message`, {autoDisappear: false})
    Alert.alert(alertType, `this is a ${alertType} message`);
  })
);
