// assets/js/adapters/gvizAdapter.js
export async function fetchSheetGViz(sheetId, sheetName){
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GViz error ${res.status}`);
  const txt = await res.text();
  const jsonStr = txt.slice(txt.indexOf('{'), txt.lastIndexOf('}') + 1);
  const obj = JSON.parse(jsonStr);
  const rows = obj.table?.rows || [];
  return rows.map(r => r.c.map(c => (c ? (c.f ?? c.v ?? "") : "")));
}
