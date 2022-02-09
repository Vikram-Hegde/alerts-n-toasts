import Alert from './refactor.js'

let btns = document.querySelectorAll('.add-alert');

btns.forEach((btn) =>
  btn.addEventListener('click', (e) => {
		let alertType = e.target.getAttribute('data-alert');
		Alert.alert(alertType, `this is a ${alertType} message`, { autoDisappear: false });
		Alert.alert(alertType, `this is a ${alertType} message`, { autoDisappear: true });
  })
);
