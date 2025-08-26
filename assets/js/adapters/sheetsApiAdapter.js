// assets/js/adapters/sheetsApiAdapter.js
export async function fetchSheetAPI(sheetId, apiKey, sheetName){
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(sheetName)}?key=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const data = await res.json();
  return data.values || [];
}
