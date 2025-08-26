// assets/js/main.js
import { SHEETS, saveConfig, loadConfig, resetConfig, getRole, setRole } from "./config.js";
import { state } from "./state.js";
import { qs, qsa } from "./utils/dom.js";
import { debounce } from "./utils/debounce.js";
import { fetchSheetAPI } from "./adapters/sheetsApiAdapter.js";
import { fetchSheetGViz } from "./adapters/gvizAdapter.js";
import { renderAnnouncements, renderBirthdays, renderStats, renderStudents, renderTimetable, renderAwards, renderViolations, renderDiscipline, renderActivities, renderAttendance, renderEvents, renderResources, renderFeedback } from "./ui/renderers.js";
import { initRouter, showPage } from "./ui/router.js";
import { Auth } from "./auth.js";
import { demo } from "../data/demoData.js";

let sheetId = "", apiKey = "";
let prevRole = "hocsinh";

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  initRouter();
  bindUI();
  loadFromStorage();
  autoSyncOrDemo();
  Auth.bindAuthUI({ onLogin: () => { applyRole('gvcn'); qs('#roleSelect').value = 'gvcn'; updateAuthButtons(); } });
  updateAuthButtons();
  window.canNavigateTo = (page) => {
    if (page === 'config' && !Auth.isAuthenticated()) { Auth.openModal(); return false; }
    return true;
  };
  window.App = { syncData, showPage };
});

function bindUI(){
  qs('#btnSaveConfig').addEventListener('click', onSaveConfig);
  qs('#btnResetConfig').addEventListener('click', onResetConfig);
  qs('#btnRefresh').addEventListener('click', () => syncData(true));
  qs('#roleSelect').addEventListener('change', (e) => {
    const role = e.target.value;
    if (role === 'gvcn' && !Auth.isAuthenticated()){
      e.target.value = prevRole;
      Auth.openModal();
      return;
    }
    prevRole = role;
    setRole(role);
    applyRole(role);
  });
  qs('#btnGVCNLogin').addEventListener('click', () => Auth.openModal());
  qs('#btnGVCNLogout').addEventListener('click', () => { Auth.logout(); updateAuthButtons(); if (qs('#roleSelect').value === 'gvcn'){ qs('#roleSelect').value = 'hocsinh'; setRole('hocsinh'); applyRole('hocsinh'); } });

  const onSearch = debounce(() => filterStudents(qs('#studentsSearch').value.trim()), 250);
  qs('#studentsSearch').addEventListener('input', onSearch);
  const onSearchAwards = debounce(() => filterGeneric('KhenThuong', '#awardsSearch', renderAwards), 250);
  const onSearchViol = debounce(() => filterGeneric('ViPham', '#violationsSearch', renderViolations), 250);
  const aInp = qs('#awardsSearch'); if (aInp) aInp.addEventListener('input', onSearchAwards);
  const vInp = qs('#violationsSearch'); if (vInp) vInp.addEventListener('input', onSearchViol);
}

function loadFromStorage(){
  const cfg = loadConfig();
  sheetId = cfg.sheetId;
  apiKey = cfg.apiKey;
  qs('#sheetId').value = sheetId;
  qs('#apiKey').value = apiKey;
  qs('#roleSelect').value = getRole();
  applyRole(getRole());
}

function applyRole(role){
  const configLink = qs('[data-page="config"]');
  const ok = role === 'gvcn' && Auth.isAuthenticated();
  configLink.classList.toggle('d-none', !ok);
}

function onSaveConfig(){
  sheetId = qs('#sheetId').value.trim();
  apiKey  = qs('#apiKey').value.trim();
  saveConfig({ sheetId, apiKey });
  syncData(true);
}

function onResetConfig(){
  resetConfig();
  sheetId = ""; apiKey = "";
  qs('#sheetId').value = "";
  qs('#apiKey').value = "";
  setSyncStatus('Đã xóa cấu hình, dùng dữ liệu demo');
  loadDemoData();
  showPage('home');
}

function setSyncStatus(text, type='muted'){
  const el = qs('#syncStatus');
  el.textContent = text;
  el.className = 'small text-' + (type === 'error' ? 'danger' : type === 'ok' ? 'success' : 'muted');
}
function updateAuthButtons(){
  const logged = Auth.isAuthenticated();
  qs('#btnGVCNLogin').classList.toggle('d-none', logged);
  qs('#btnGVCNLogout').classList.toggle('d-none', !logged);
}

async function autoSyncOrDemo(){
  if (sheetId) {
    await syncData();
  } else {
    loadDemoData();
  }
}

async function syncData(force=false){
  if (!sheetId) { setSyncStatus('Chưa cấu hình Sheet ID'); return; }
  setSyncStatus('Đang đồng bộ...');
  try {
    const useApi = Boolean(apiKey);
    const fetcher = useApi
      ? (name) => fetchSheetAPI(sheetId, apiKey, name)
      : (name) => fetchSheetGViz(sheetId, name);
    const entries = await Promise.all(SHEETS.map(async name => {
      try { return [name, await fetcher(name)]; }
      catch (e) { console.warn('Thiếu sheet', name, e); return [name, []]; }
    }));
    state.sheetsData = Object.fromEntries(entries.filter(Boolean));
    renderAll();
    setSyncStatus('Đã đồng bộ', 'ok');
  } catch (err) {
    console.error(err);
    setSyncStatus('Lỗi đồng bộ', 'error');
    if (!state.demoLoaded) loadDemoData();
  }
}

function loadDemoData(){
  state.sheetsData = {
    ThongBao: demo.ThongBao,
    HocSinh: demo.HocSinh,
    ThoiKhoaBieu: demo.ThoiKhoaBieu,
    KhenThuong: demo.KhenThuong,
    ViPham: demo.ViPham,
    NeNep: demo.NeNep,
    PhongTrao: demo.PhongTrao,
    DiemDanh: demo.DiemDanh,
    SuKien: demo.SuKien,
    TaiNguyen: demo.TaiNguyen,
    GopY: demo.GopY
  };
  state.demoLoaded = true;
  renderAll();
}

function renderAll(){
  renderAnnouncements(state.sheetsData.ThongBao || []);
  renderBirthdays(state.sheetsData.HocSinh || []);
  renderStats(state.sheetsData.HocSinh || []);
  renderStudents(state.sheetsData.HocSinh || []);
  renderTimetable(state.sheetsData.ThoiKhoaBieu || []);
  renderAwards(state.sheetsData.KhenThuong || []);
  renderViolations(state.sheetsData.ViPham || []);
  renderDiscipline(state.sheetsData.NeNep || []);
  renderActivities(state.sheetsData.PhongTrao || []);
  renderAttendance(state.sheetsData.DiemDanh || []);
  renderEvents(state.sheetsData.SuKien || []);
  renderResources(state.sheetsData.TaiNguyen || []);
  renderFeedback(state.sheetsData.GopY || []);
}

function filterGeneric(sheetName, inputSel, renderFn){
  const sheet = state.sheetsData[sheetName] || [];
  const q = qs(inputSel)?.value?.trim().toLowerCase() || '';
  if (!q){ renderFn(sheet); return; }
  const [header, ...rows] = sheet;
  const filtered = [header, ...rows.filter(r => (r||[]).some(c => String(c).toLowerCase().includes(q)))];
  renderFn(filtered);
}

function filterStudents(q){
  const sheet = state.sheetsData.HocSinh || [];
  if (!q) { renderStudents(sheet); return; }
  const [header, ...rows] = sheet;
  const qLower = q.toLowerCase();
  const filtered = [header, ...rows.filter(r => (r||[]).some(c => String(c).toLowerCase().includes(qLower)))];
  renderStudents(filtered);
}
