// Source - https://github.com/argyleink/gui-challenges/blob/main/theme-switch/public/theme-toggle.js

const storageKey = 'theme-preference';

const onClick = () => {
	// flip current value
	theme.value = theme.value === 'light' ? 'dark' : 'light';

	setPreference();
};

const getColorPreference = () => {
	if (localStorage.getItem(storageKey)) return localStorage.getItem(storageKey);
	else
		return window.matchMedia('(prefers-color-scheme: dark)').matches
			? 'dark'
			: 'light';
};

const setPreference = () => {
	localStorage.setItem(storageKey, theme.value);
	reflectPreference();
};

const reflectPreference = () => {
	document.body.setAttribute('data-theme', theme.value);

	document
		.querySelector('.theme-toggle')
		?.setAttribute('aria-label', theme.value);
};

const theme = {
	value: getColorPreference(),
};

// set early so no page flashes / CSS is made aware
reflectPreference();

window.onload = () => {
	// now this script can find and listen for clicks on the control
	document.querySelector('.theme-toggle').addEventListener('click', onClick);
};

// sync with system changes
window
	.matchMedia('(prefers-color-scheme: dark)')
	.addEventListener('change', ({ matches: isDark }) => {
		theme.value = isDark ? 'dark' : 'light';
		setPreference();
	});
