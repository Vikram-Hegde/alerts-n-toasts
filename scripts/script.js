import Alert from './alerts.js';

let btns = document.querySelectorAll('.split-btn');

Alert.setGlobalProps({
	timeout: 3000,
	position: 'bottomRight',
	autoDisappear: false,
});

btns.forEach((btn) =>
	btn.addEventListener('click', (e) => {
		let alertType = e.target.parentNode.getAttribute('data-alert');
		Alert.alert(alertType, `this will not disappear until manually removed`);
		Alert.alert(alertType, `this alert will autoDisappear`, {
			autoDisappear: true,
		});
	})
);
