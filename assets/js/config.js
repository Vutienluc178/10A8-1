// assets/js/config.js
export const SHEETS = [
  "ThongBao","HocSinh","DiemDanh","KhenThuong","ViPham",
  "PhongTrao","TaiNguyen","NeNep","GopY","ThoiKhoaBieu","MonHoc","SuKien"
];

const LS = {
  sheetId: "app.sheetId",
  apiKey: "app.apiKey",
  role: "app.role"
};

export function saveConfig({sheetId, apiKey}){
  if (sheetId) localStorage.setItem(LS.sheetId, sheetId.trim());
  if (apiKey !== undefined) localStorage.setItem(LS.apiKey, (apiKey||'').trim());
}
export function loadConfig(){
  return {
    sheetId: localStorage.getItem(LS.sheetId) || "",
    apiKey: localStorage.getItem(LS.apiKey) || ""
  };
}
export function resetConfig(){
  localStorage.removeItem(LS.sheetId);
  localStorage.removeItem(LS.apiKey);
}

export function getRole(){
  return localStorage.getItem(LS.role) || "hocsinh";
}
export function setRole(role){
  localStorage.setItem(LS.role, role);
}
