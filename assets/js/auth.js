// assets/js/auth.js
import { qs } from "./utils/dom.js";

const LS = {
  pinHash: "app.gvcn.pinHash",
  auth: "app.gvcn.auth"
};
const PEPPER = "10A8@NHC";

async function sha256Hex(str){
  const data = new TextEncoder().encode(str);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function hasPin(){ return !!localStorage.getItem(LS.pinHash); }
function isAuthenticated(){ return localStorage.getItem(LS.auth) === "1"; }
function logout(){ localStorage.removeItem(LS.auth); }

async function setPin(pin){
  if (!pin || pin.length < 4) throw new Error("PIN tối thiểu 4 ký tự");
  const hash = await sha256Hex(pin + PEPPER);
  localStorage.setItem(LS.pinHash, hash);
}
async function verifyPin(pin){
  const hash = localStorage.getItem(LS.pinHash);
  if (!hash) return false;
  const inputHash = await sha256Hex(pin + PEPPER);
  return inputHash === hash;
}

function openModal(){
  const modalEl = qs('#gvcnAuthModal');
  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
  qs('#authSetup').classList.toggle('d-none', hasPin());
  qs('#authLogin').classList.toggle('d-none', !hasPin());
  modal.show();
}
function closeModal(){
  const modalEl = qs('#gvcnAuthModal');
  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
  modal.hide();
}

function bindAuthUI({onLogin}={}){
  const setupBtn = qs('#btnSetupPin');
  const loginBtn = qs('#btnLoginPin');
  const loginInput = qs('#loginPin');
  const setupPin1 = qs('#setupPin');
  const setupPin2 = qs('#setupPin2');

  if (setupBtn){
    setupBtn.addEventListener('click', async () => {
      try{
        const p1 = setupPin1.value.trim();
        const p2 = setupPin2.value.trim();
        if (p1 !== p2) return alert("PIN nhập lại không khớp!");
        await setPin(p1);
        alert("Đã thiết lập PIN GVCN!");
        qs('#authSetup').classList.add('d-none');
        qs('#authLogin').classList.remove('d-none');
      }catch(e){
        alert(e.message || "Không thiết lập được PIN");
      }
    });
  }
  if (loginBtn){
    loginBtn.addEventListener('click', async () => {
      if (!hasPin()) return alert("Chưa thiết lập PIN. Hãy thiết lập trước.");
      const ok = await verifyPin(loginInput.value.trim());
      if (!ok) return alert("PIN sai!");
      localStorage.setItem(LS.auth, "1");
      closeModal();
      loginInput.value = "";
      onLogin && onLogin();
    });
  }
}

export const Auth = { hasPin, isAuthenticated, logout, openModal, bindAuthUI };
