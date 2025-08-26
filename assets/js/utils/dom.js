// assets/js/utils/dom.js
export const qs = (sel, root = document) => root.querySelector(sel);
export const qsa = (sel, root = document) => [...root.querySelectorAll(sel)];
export const empty = el => { while (el.firstChild) el.removeChild(el.firstChild); };

export function el(tag, opts = {}){
  const node = document.createElement(tag);
  if (opts.className) node.className = opts.className;
  if (opts.text) node.textContent = opts.text; // an toàn, không innerHTML dữ liệu người dùng
  if (opts.attrs) Object.entries(opts.attrs).forEach(([k,v])=> node.setAttribute(k, v));
  if (opts.children) opts.children.forEach(c => node.appendChild(c));
  return node;
}

export function rowsToObjects([header, ...rows] = [[]]){
  if (!header) return [];
  return rows.map(r => Object.fromEntries(header.map((k,i) => [k, r?.[i] ?? ""])));
}
