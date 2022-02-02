const alertsNToasts = (() => {
  // let positions = {
  //   topRight: 'top right',
  //   bottomRight: 'bottom right',
  //   topLeft: 'top left',
  //   bottomLeft: 'bottom left',
  // };

  let animations = {
    animateOut: 'animate-out 0.25s ease-in-out forwards',
    slide: 'slide 0.25s ease-in-out forwards',
  };

  const initGroup = () => {
		let alertGroup = document.createElement('section');
		alertGroup.classList.add('alert-group');
		// let toastGroup = document.createElement('section');
		// toastGroup.classList.add('toast-group');
		// document.body.append(alertGroup, toastGroup);
		document.body.append(alertGroup);
  };

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

  const addToGroup = (elem, parent) => {
    parent.children.length ? animateSlide(parent, elem) : parent.append(elem);
  };

  const animateSlide = (parent, elem) => {
    const first = parent.offsetHeight;
    parent.append(elem);
    const last = parent.offsetHeight;

    const invert = last - first;

    // include logic here to convert invert to negative if the class contains "top" word
    if (elem.classList.contains('top')) invert = invert * -1;
    // TODO: Do take care of the animations in css by changing the variables. and flex direction

    parent.animate(
      [
        { transform: `translateY(${invert}px)` },
        { transform: 'translateY(0)' },
      ],
      {
        duration: 150,
        easing: 'ease-out',
      }
    );
  };

  document.addEventListener('click', (e) => {
    if (!e.target.classList.contains('alert__close-btn')) return;

    let alert = e.target.parentElement;
    alert.style.animation = animations.animateOut;
    const dur = parseFloat(alert.style.animationDuration) * 1000;

    let prev = alert.previousElementSibling;
    let prevArr = [];
    let prevAnim;

    while (prev) {
      const { animation, height } = window.getComputedStyle(prev);
      prevAnim = animation; // to resume previous anim after sliding
      prevArr.push(prev);
      prev.setAttribute(
        'style',
        `--slide-distance: calc(${parseInt(height)}px + var(--gap));
			animation: ${animation}, ${animations.slide};`
      );
      prev = prev.previousElementSibling;
    }

    setTimeout(() => {
      prevArr.forEach((prev) => {
        if (prev.classList.contains('with-progress')) {
          prev.setAttribute(
            'style',
            `animation: ${prevAnim}; --slide-distance: 0;`
          );
        } else {
          prev.setAttribute('style', `animation: none; --slide-distance: 0;`);
        }
      });

      alert.remove();
    }, dur * 0.85);
  });

  const removeWhenDone = (elem) => {
		console.log('removeWhenDone');
    new Promise(async () => {
      await Promise.allSettled(
        elem.getAnimations().map((animation) => animation.finished)
      );
      // only specific to alerts, no issues for toasts
      elem.style.animationName !== 'animate-out' && elem.remove();
    });
  };

	initGroup();

  const Alert = (type, message) => {
    let parent = document.querySelector('.alert-group');
    const alert = createAlert(type, message);
    addToGroup(alert, parent);
    alert.classList.contains('with-progress') && removeWhenDone(alert);
  };

	return {
		Alert,
	}
})();

export default alertsNToasts.Alert;
