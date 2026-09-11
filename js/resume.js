const files = { en: 'resume/Resume EN.pdf', ru: 'resume/Resume RU.pdf' };
const frame = document.getElementById('resumeFrame');
const downloadLink = document.getElementById('downloadLink');
const btns = { en: document.getElementById('langEN'), ru: document.getElementById('langRU') };
const activeClass = ['bg-ink', 'text-white', 'dark:bg-white', 'dark:text-black'];
const inactiveClass = ['text-gray-500', 'dark:text-gray-400', 'hover:text-gray-900', 'dark:hover:text-white'];

function setLang(lang) {
  const file = files[lang];
  // PDF open parameters (view=Fit) tell the browser's built-in viewer to scale
  // the whole page to fit the window instead of opening at 100% zoom.
  frame.src = encodeURI(file) + '#view=Fit';
  downloadLink.href = encodeURI(file);
  Object.entries(btns).forEach(([key, btn]) => {
    btn.classList.remove(...activeClass, ...inactiveClass);
    btn.classList.add(...(key === lang ? activeClass : inactiveClass));
  });
}

btns.en.addEventListener('click', () => setLang('en'));
btns.ru.addEventListener('click', () => setLang('ru'));
setLang('en');
