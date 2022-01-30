/* 
	Extending the same code from https://web.dev/building-a-toast-component/ but for alerts and toasts 
*/

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
  newAlert.classList.add('alert', 'with-progress');
  newAlert.setAttribute('data-alert', type);
  newAlert.setAttribute('role', 'alert');
  newAlert.innerHTML = `
	<svg class="alert__icon" role="img" aria-label="${type}:">
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
  alert.style.animation = 'animate-out .2s ease-in-out forwards';
  const dur = parseFloat(alert.style.animationDuration) * 1000;

  if (!alert.classList.contains('with-progress')) {
    let prev = alert.previousElementSibling;
    let prevArr = [];

    while (prev) {
      prevArr.push(prev);
      prev.setAttribute(
        'style',
        `--variable: calc(${parseInt(
          window.getComputedStyle(alert).height
        )}px + var(--gap));
			animation: slide 0.25s forwards;`
      );
      prev = prev.previousElementSibling;
    }

    setTimeout(() => {
      prevArr.forEach((prev) =>
        prev.setAttribute('style', `animation: none; --variable: 0;`)
      );

      alert.remove();
    }, dur * 0.8);
  } else {
    setTimeout(() => {
      alert.remove();
    }, dur);
  }
});

/**
 * Removes alert from DOM after animation
 * @param {string} type String
 * @param {string} message String
 */
const Alert = (type, message) => {
  const alert = createAlert(type, message);
  addAlert(alert);

  alert.classList.contains('with-progress') &&
    new Promise(async () => {
      await Promise.allSettled(
        alert.getAnimations().map((animation) => animation.finished)
      );
      alert.style.animationName !== 'animate-out' && alert.remove();
    });
};

const AlertGroup = init();

export default Alert;
