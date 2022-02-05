import alert from './refactor.js'

let btns = document.querySelectorAll('.add-alert');
// console.log(notify);
// const {alert, setProps} = notify;
// console.log(alert, setProps);

btns.forEach((btn) =>
  btn.addEventListener('click', () => {
		alert.danger('ha ha, the heck is happening now?', { autoDisappear: true });
		alert.danger('ha ha, the heck is happening now?', { autoDisappear: false });
  })
);
