let alert = (() => {
  let defaults = {
    position: 'bottomRight',
    timeout: 5000,
    autoDisappear: true,
  };

  // let positions = {
  //   topRight: 'top right',
  //   bottomRight: 'bottom right',
  //   topLeft: 'top left',
  //   bottomLeft: 'bottom left',
  // };

  const initGroup = (type) => {
    let elem = document.querySelector(`.${type}`);
    if (elem) return elem;
    let group = document.createElement('section');
    group.classList.add(type);
    document.body.append(group);
    return group;
  };

  const alertGroup = initGroup('alert-group');
  // const toastGroup = initGroup('toastGroup');

  let animations = {
    animateOut: 'animate-out 0.25s ease-in-out forwards',
    slide: 'slide 0.25s ease-in-out forwards',
  };

  const createAlert = (type, message, props) => {
    let { autoDisappear } = props;
    autoDisappear ??= defaults.autoDisappear;

    let newAlert = document.createElement('div');
    newAlert.classList.add('alert');
    autoDisappear && newAlert.classList.add('with-progress');
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

  const addToGroup = (elem) => {
    alertGroup.children.length ? animateSlide(elem) : alertGroup.append(elem);
  };

  const animateSlide = (elem) => {
    const first = alertGroup.offsetHeight;
    alertGroup.append(elem);
    const last = alertGroup.offsetHeight;

    const invert = last - first;

    // include logic here to convert invert to negative if the class contains "top" word
    // if (elem.classList.contains('top')) invert = invert * -1;
    // TODO: Do take care of the animations in css by changing the variables, and flex direction

    alertGroup.animate(
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

  const animateRestElem = (alert) => {
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
            `animation: ${prevAnim}; --slide-distance: 0;` // resuming previous anim here
          );
        } else {
          prev.setAttribute('style', `animation: none; --slide-distance: 0;`);
        }
      });

      alert.remove();
    }, dur * 0.9);
  };

  document.addEventListener('click', (e) => {
    if (!e.target.classList.contains('alert__close-btn')) return;

    let alert = e.target.parentElement;
    alert.style.animation = animations.animateOut;
    animateRestElem(alert);
  });

  const removeWhenDone = (elem) => {
    let prev = elem.previousElementSibling;
    let prevArr = [];

    while (prev) {
      prevArr.push(prev);
      prev.setAttribute(
        'style',
        `--slide-distance: calc(${parseInt(
          window.getComputedStyle(elem).height
        )}px + var(--gap))`
      );
      prev = prev.previousElementSibling;
    }

    new Promise(async () => {
      await Promise.allSettled(
        alertGroup.getAnimations({ subtree: true }).map((anim) => anim.finished)
      );

      prevArr.forEach((prev) => {
        prev.style.animation = 'slide 0.25s ease-in-out forwards';
      });

      await Promise.allSettled(
        alertGroup.getAnimations({ subtree: true }).map((anim) => anim.finished)
      );

      elem.style.animationName !== 'animate-out' && elem.remove();
    });
  };

  const setAlertProps = () => {
    // this'll be used to set alertGroup position
    console.log('hello there, i"ll set props here');
  };

  const alert = (type, message, props = {}) => {
    const alert = createAlert(type, message, props);
    addToGroup(alert);
    alert.classList.contains('with-progress') && removeWhenDone(alert);
  };

  const danger = (message, props) => alert('danger', message, props);
  const info = (message, props) => alert('information', message, props);
  const warn = (message, props) => alert('warning', message, props);
  const success = (message, props) => alert('success', message, props);

  const toast = (message) => {
    console.log(message);
  };

  return { danger, info, warn, success, alert };
})();

export default alert;
