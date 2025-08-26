// assets/js/utils/debounce.js
export const debounce = (fn, ms=250) => {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(()=>fn(...args), ms); };
};
