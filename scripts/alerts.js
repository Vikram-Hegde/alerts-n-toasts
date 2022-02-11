let alert = (() => {
  let defaults = {
    position: 'bottomRight',
    timeout: 5000,
    autoDisappear: true,
  };

  let globalProps = {
    autoDisappear: defaults.autoDisappear,
  };

  let positions = {
    topRight: 'top right',
    bottomRight: 'bottom right',
    topLeft: 'top left',
    bottomLeft: 'bottom left',
  };

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
    animateInOut: 'animate-in-out var(--dur-main) ease-in-out forwards',
  };

  const createAlert = (type, message, props) => {
    let { autoDisappear } = props;
    autoDisappear ??= globalProps.autoDisappear;

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

  const animateAndRemove = (alert) => {
    alert.style.animation = animations.animateOut;
    const dur = parseFloat(alert.style.animationDuration) * 1000;
    let prevArr = prevElementsArr(alert);

    let moveY = window.getComputedStyle(alert).height;

    prevArr.forEach((prev) => {
      let anim = prev.style.animation;
      prev.setAttribute(
        'style',
        `--slide-distance: calc(${moveY} + var(--gap));
				animation: ${anim ? anim + ',' : ''} ${animations.slide};`
      );
    });

    setTimeout(() => {
      prevArr.forEach((prev) => {
        if (prev.classList.contains('with-progress')) {
          prev.setAttribute(
            'style',
            `animation: ${animations.animateInOut}; --slide-distance: 0;`
          );
        } else {
          prev.setAttribute('style', `animation: none; --slide-distance: 0;`);
        }
      });

      alert.remove();
    }, dur);
  };

  document.addEventListener('click', (e) => {
    if (!e.target.classList.contains('alert__close-btn')) return;

    let alert = e.target.parentElement;
    alert.style.animation = animations.animateOut;
    animateAndRemove(alert);
  });

  const prevElementsArr = (elem) => {
    let prev = elem.previousElementSibling;
    let prevArr = [];
    while (prev) {
      prevArr.push(prev);
      prev = prev.previousElementSibling;
    }
    return prevArr || [elem];
  };

  const removeWhenDone = async (elem) => {
    let prevArr = prevElementsArr(elem);
    let allElems = [elem, ...prevArr];
    let moveY = window.getComputedStyle(elem).height;

    // waiting until all the with-progress elements finish animating
    for (let alert of allElems) {
      await Promise.allSettled(
        alert.getAnimations().map((anim) => anim.finished)
      );
    }

		animateAndRemove(elem);

    // run code after that
    // prevArr.forEach(async (prev) => {
    //   let animateInOut =
    //     window.getComputedStyle(prev).animationName === 'animate-in-out';
    //   console.log(animateInOut);
    //   prev.setAttribute(
    //     'style',
    //     `animation: ${animateInOut ? animations.animateInOut + ', ' : ''} ${
    //       animations.slide
    //     };--slide-distance: calc(${moveY} + var(--gap))`
    //   );
    //   await Promise.allSettled(
    //     prev.getAnimations().map((anim) => anim.finished)
    //   );
    //   elem.remove(); // removing the requested element
    // });
  };

  const setGlobalProps = ({ timeout, position, autoDisappear }) => {
    console.log('is this called');
    timeout ??= defaults.timeout;
    position = positions[position] ?? positions[defaults.position];
    globalProps.autoDisappear = autoDisappear ?? defaults.autoDisappear;

    alertGroup.setAttribute(
      'style',
      `--dur-main: ${timeout}ms; ${position
        .split(' ')
        .map((pos) => `${pos}: 0;`)
        .join(' ')}`
    );
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

  return { setGlobalProps, danger, info, warn, success, alert };
})();

export default alert;
