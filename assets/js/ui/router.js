// assets/js/ui/router.js
import { qsa } from "../utils/dom.js";

export function initRouter(){
  const links = qsa('#navLinks [data-page]');
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.getAttribute('data-page');
      if (typeof window.canNavigateTo === 'function' && !window.canNavigateTo(page)) return;
      showPage(page);
    });
  });
}

export function showPage(page){
  const links = qsa('#navLinks [data-page]');
  const pages = qsa('.page');
  links.forEach(a => a.classList.toggle('active', a.getAttribute('data-page') === page));
  pages.forEach(sec => sec.classList.toggle('d-none', sec.getAttribute('data-page') !== page));
}
