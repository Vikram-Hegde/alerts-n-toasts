import Alert from './alerts.js';

document.querySelector('button[type=button]').addEventListener('click', (e) => {
	e.preventDefault();
	// Alert("warning", "this is a warning!!");
	// Alert("danger", "this is dangerous!!");
	Alert('information', 'this is for your info!!');
	// Alert("success", "this is your success!!");
});
