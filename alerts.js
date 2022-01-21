// @ts-check

/**
 * Creates a alert group
 * @returns {HTMLElement} Alert Group
 */
const init = () => {
	const alertGroup = document.createElement('section');
	alertGroup.classList.add('alert-group');
	document.body.append(alertGroup);
	return alertGroup;
};

/**
 * Creates a new alert
 * @param {string} type String
 * @param {string} message String
 * @returns {HTMLElement} Alert element
 */
const createAlert = (type, message) => {
	let newAlert = document.createElement('div');
	newAlert.classList.add('alert');
	newAlert.setAttribute('data-alert', type);
	newAlert.setAttribute('role', 'alert');
	newAlert.innerHTML = `
	<svg class="alert__icon" role="img" aria-label="${
		type[0].toUpperCase() + type.slice(1)
	}:">
		<use href="#alert-${type}" />
	</svg>
	<output class="alert__message">${message}</output>
	<button title="Close Alert" type="button" class="alert__close-btn">
		<svg class="alert__close" aria-label="close alert">
			<use href="#alert-close" />
		</svg>
	</button>
	`;
	return newAlert;
};

/**
 * FLIP's if there are alerts else just appends a new one
 * @param {HTMLElement} alert Alert element
 */
const addAlert = (alert) => {
	AlertGroup.children.length ? flip(alert) : AlertGroup.append(alert);
};

/**
 * FLIP animation for AlertGroup
 * @param {HTMLElement} alert Alert element
 */
const flip = (alert) => {
	const first = AlertGroup.offsetHeight;
	AlertGroup.append(alert);
	const last = AlertGroup.offsetHeight;

	const invert = last - first;

	AlertGroup.animate(
		[{ transform: `translateY(${invert}px)` }, { transform: 'translateY(0)' }],
		{
			duration: 150,
			easing: 'ease-out',
		}
	);
};

document.addEventListener('click', (e) => {
	if (!e.target.classList.contains('alert__close-btn')) return;

	let alert = e.target.parentElement;

	alert.classList.add('animate-out');
	alert.style.animation = 'animate-out .25s ease-in-out forwards';
	setTimeout(() => {
		alert.remove();
	}, 250);
});

/**
 * Removes alert from DOM after animation
 * @param {string} type String
 * @param {string} message String
 * @returns {Promise<void>} Promise
 */
const Alert = (type, message) => {
	const alert = createAlert(type, message);
	addAlert(alert);

	if (
		alert.classList.contains('with-progress') &&
		!alert.classList.contains('animate-out')
	)
		return new Promise(async () => {
			await Promise.allSettled(
				alert.getAnimations().map((animation) => animation.finished)
			);
			alert.remove();
		});
};

const AlertGroup = init();

export default Alert;
