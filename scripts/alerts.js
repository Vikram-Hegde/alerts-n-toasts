let alert = (() => {
  let defaults = {
    position: 'bottomRight',
    timeout: 5000,
    autoDisappear: true,
  };

  let globalProps = {
    autoDisappear: defaults.autoDisappear,
		multiplier: 1,
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
        { transform: `translateY(calc(${invert}px * var(--multiplier)))` },
        { transform: 'translateY(0)' },
      ],
      {
        duration: 150,
        easing: 'ease-out',
      }
    );
  };

  const animateAndRemove = async (alert) => {
    let prevArr = prevElementsArr(alert);
    let moveY = window.getComputedStyle(alert).height;

    prevArr.forEach((prev) => {
      let onGoingAnim = window.getComputedStyle(prev).animation;
      prev.setAttribute(
        'style',
        `--slide-distance: calc(${moveY} + var(--gap));
				animation: ${onGoingAnim ? onGoingAnim + ',' : ''} ${animations.slide};`
      );
    });

		// waiting until the element being removed is finished animating
		await Promise.allSettled(alert.getAnimations().map(anim => anim.finished))

      prevArr.forEach((prev) => {
        if (prev.classList.contains('with-progress')) {
          prev.setAttribute('style', '--slide-distance: 0');
        } else {
          prev.setAttribute('style', `animation: none; --slide-distance: 0;`);
        }
      });

      alert.remove();
  };

  document.addEventListener('click', (e) => {
    if (!e.target.classList.contains('alert__close-btn')) return;

    let alert = e.target.parentElement;
		alert.setAttribute('style', `animation: ${animations.animateOut}`)
    animateAndRemove(alert);
  });

  const prevElementsArr = (elem) => {
    let prev = elem.previousElementSibling;
    let prevArr = [];
    while (prev) {
      prevArr.push(prev);
      prev = prev.previousElementSibling;
    }
    return prevArr;
  };

  const removeWhenDone = async (elem) => {
    let allElems = [elem, ...prevElementsArr(elem)];
		
    // waiting until <all> with-progress elements finish animating
    for (let alert of allElems) {
      await Promise.allSettled(
        alert.getAnimations().map((anim) => anim.finished)
      );
    }

    elem.setAttribute(
      'style',
      `animation: ${animations.animateInOut + ', ' + animations.animateOut}`
    );
    animateAndRemove(elem);
  };

  const setGlobalProps = ({ timeout, position, autoDisappear }) => {
    timeout ??= defaults.timeout;
    position = positions[position] ?? positions[defaults.position];
    globalProps.autoDisappear = autoDisappear ?? defaults.autoDisappear;
		const has = (str) => position.includes(str);

		if(has('top')){ globalProps.multiplier = -1; }

    alertGroup.setAttribute(
      'style',
      `--dur-main: ${timeout}ms; ${position
        .split(' ')
        .map((pos) => `${pos}: 0;`)
        .join(' ')}
 	 	 	 	--multiplier: ${globalProps.multiplier};
			 	flex-direction: ${globalProps.multiplier === -1 ? 'column-reverse' : 'column'};
		 	 	${has('top') ? 'padding-top: var(--gap);' : 'padding-bottom: var(--gap);'}
		 	 	${has('right') ? 'padding-right: var(--gap);' : 'padding-left: var(--gap);'}
		 	 	${has('right') ? 'align-item: flex-end' : 'align-items: flex-start'}
			`
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
