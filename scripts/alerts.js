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

  const animateRestElem = (alert) => {
    alert.style.animation = animations.animateOut;
    const dur = parseFloat(alert.style.animationDuration) * 1000;
    let prevArr = prevElementsArr(alert);

    let moveY = window.getComputedStyle(alert).height;

    prevArr.forEach((prev) => {
      let anim = prev.style.animation;
      prev.setAttribute(
        'style',
        `--slide-distance: calc(${parseInt(moveY)}px + var(--gap));
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
    animateRestElem(alert);
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
    let prevArr = prevElementsArr(elem);
    let allElems = [elem, ...prevArr];
    let moveY = window.getComputedStyle(elem).height;

		// waiting until all the with-progress elements finish animating
    for (let alert of allElems) {
      await Promise.allSettled(
        alert.getAnimations().map((anim) => anim.finished)
      );
    }

		// run code after that
		prevArr.forEach(async (prev) => {
			prev.setAttribute('style', `animation: ${animations.slide};--slide-distance: calc(${moveY} + var(--gap))`)
			await Promise.allSettled(
				prev.getAnimations().map((anim) => anim.finished)
			)
			prev.setAttribute('style', 'animation: none; --slide-distance: 0')
			elem.remove(); // removing the requested element
		})

    //  allElems.forEach(async (elems) => {
    //    await Promise.allSettled(
    //      alertGroup.getAnimations({ subtree: true }).map((anim) => anim.finished)
    //    );
    //    if (elems !== elem) {
    //      elems.style.animation = animations.slide;
    // 	console.log(elems)
    //    }
    //
    // elems.classList.contains('with-progress') && elems.remove();
    //
    //    await Promise.allSettled(
    //      elem.getAnimations().map((anim) => anim.finished)
    //    );
    //    console.log('after sliding');
    //  });

    // prevArr.forEach((prev) => (prev.style.animation = animations.slide));

    // new Promise(async () => {
    //   await Promise.allSettled(
    //     alertGroup.getAnimations({ subtree: true }).map((anim) => anim.finished)
    //   );
    //
    //   prevArr.forEach((prev) => {
    //     prev.style.animation = 'slide 0.25s ease-in-out forwards';
    //   });
    //
    //   await Promise.allSettled(
    //     alertGroup.getAnimations({ subtree: true }).map((anim) => anim.finished)
    //   );
    //
    //   prevArr.forEach((prev) => {
    //     let prevAnim = prev.style.animation;
    //     prev.setAttribute(
    //       'style',
    //       `animation: ${prevAnim ? prevAnim : 'none'}; --slide-distance: 0;` // resuming previous anim here
    //     );
    //   });
    //
    //   elem.style.animationName !== 'animate-out' && elem.remove();
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
