// ============ core.js — Supabase init, auth, ustawienia globalne, render feedu, komentarze, powiadomienia, helpery ============

const SUPABASE_URL='https://qasfdynmzeatkkfphaqi.supabase.co';
const SUPABASE_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhc2ZkeW5temVhdGtrZnBoYXFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1ODc3MjEsImV4cCI6MjA5ODE2MzcyMX0.piwZ0v0UnoOo5L6Q53l6P1hTOfDE6uPr0lNILzehCSo';
const SITE_URL=window.location.origin+window.location.pathname;
const sb=supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
const BOT_GUARD_URL='https://qasfdynmzeatkkfphaqi.functions.supabase.co/bot-guard';
let myDetectedIp='';
async function checkBotGuard(){
  try{
    const res=await fetch(BOT_GUARD_URL,{method:'POST',headers:{'content-type':'application/json','Authorization':'Bearer '+SUPABASE_KEY},body:JSON.stringify({userAgent:navigator.userAgent,endpoint:'page_load'})});
    const data=await res.json();
    if(data?.ip)myDetectedIp=data.ip;
    if(data?.blocked){
      document.getElementById('bot-block-screen').style.display='flex';
      return true;
    }
  }catch(e){/* Edge Function niedostępna — appka działa dalej normalnie */}
  return false;
}

let videos=[];
let cur=null;
let watchHeartbeat=null;
let currentUser=null;
let pendingDeleteId=null;
const colors=['#cc0000','#1a73e8','#188038','#e37400','#7b1fa2','#c2185b'];
const likedSet=new Set(JSON.parse(localStorage.getItem('liked')||'[]'));
const dislikedSet=new Set(JSON.parse(localStorage.getItem('disliked')||'[]'));
const subscribedSet=new Set();

function saveLiked(){localStorage.setItem('liked',JSON.stringify([...likedSet]));}
function saveDisliked(){localStorage.setItem('disliked',JSON.stringify([...dislikedSet]));}
function saveSubscribed(){}// handled by Supabase


// ── POTWIERDZENIE (styl YouTube) ────────────────────────────────────────
function showConfirm(title,subtitle,okLabel){
  return new Promise(resolve=>{
    document.getElementById('confirm-title').textContent=title;
    document.getElementById('confirm-subtitle').textContent=subtitle||'';
    const okBtn=document.getElementById('confirm-ok-btn');
    const cancelBtn=document.getElementById('confirm-cancel-btn');
    okBtn.textContent=okLabel||t('confirm_delete_default');
    cancelBtn.textContent=t('confirm_cancel');
    const modal=document.getElementById('confirm-modal');
    modal.classList.add('open');
    const cleanup=(result)=>{
      modal.classList.remove('open');
      okBtn.removeEventListener('click',onOk);
      cancelBtn.removeEventListener('click',onCancel);
      modal.removeEventListener('click',onBg);
      resolve(result);
    };
    const onOk=()=>cleanup(true);
    const onCancel=()=>cleanup(false);
    const onBg=(e)=>{if(e.target===modal)cleanup(false);};
    okBtn.addEventListener('click',onOk);
    cancelBtn.addEventListener('click',onCancel);
    modal.addEventListener('click',onBg);
  });
}


// ── AUTOODTWARZANIE NASTĘPNEGO FILMU ────────────────────────────────────
function getAutoplayNext(){return localStorage.getItem('wt_autoplay_next')!=='0';} // domyślnie włączone
function setAutoplayNextPref(on){localStorage.setItem('wt_autoplay_next',on?'1':'0');}
function toggleAutoplayNext(){
  setAutoplayNextPref(!getAutoplayNext());
  syncAutoplayToggleUI();
}
function syncAutoplayToggleUI(){
  const el=document.getElementById('autoplay-toggle');
  if(el)el.classList.toggle('on',getAutoplayNext());
}


// ── MOTYW (jasny/ciemny) ─────────────────────────────────────────────────
function getTheme(){return localStorage.getItem('wt_theme')||'dark';}

function applyTheme(){
  const theme=getTheme();
  document.documentElement.classList.toggle('light-mode',theme==='light');
}

function setTheme(theme){
  localStorage.setItem('wt_theme',theme);
  applyTheme();
  updateThemeButtons();
  toast(theme==='light'?'Jasny motyw włączony ☀️':'Ciemny motyw włączony 🌙');
}

function updateThemeButtons(){
  const theme=getTheme();
  const darkBtn=document.getElementById('theme-btn-dark');
  const lightBtn=document.getElementById('theme-btn-light');
  const activeStyle='flex:1;display:flex;align-items:center;justify-content:center;gap:8px;padding:12px 14px;border-radius:10px;cursor:pointer;font-size:14px;background:rgba(62,166,255,.15);border:1px solid #3ea6ff;color:var(--text-primary)';
  const inactiveStyle='flex:1;display:flex;align-items:center;justify-content:center;gap:8px;padding:12px 14px;border-radius:10px;cursor:pointer;font-size:14px;background:var(--bg-sunken);border:1px solid var(--border);color:var(--text-primary)';
  if(darkBtn)darkBtn.style.cssText=theme==='dark'?activeStyle:inactiveStyle;
  if(lightBtn)lightBtn.style.cssText=theme==='light'?activeStyle:inactiveStyle;
}

function updateLangButtons(){
  const lang=getLang();
  const plBtn=document.getElementById('lang-btn-pl');
  const ruBtn=document.getElementById('lang-btn-ru');
  const enBtn=document.getElementById('lang-btn-en');
  const esBtn=document.getElementById('lang-btn-es');
  if(plBtn)plBtn.style.cssText=lang==='pl'?'display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:10px;cursor:pointer;font-size:14px;text-align:left;background:rgba(62,166,255,.15);border:1px solid #3ea6ff;color:var(--text-primary)':'display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:10px;cursor:pointer;font-size:14px;text-align:left;background:var(--bg-sunken);border:1px solid var(--border);color:var(--text-primary)';
  if(ruBtn)ruBtn.style.cssText=lang==='ru'?'display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:10px;cursor:pointer;font-size:14px;text-align:left;background:rgba(62,166,255,.15);border:1px solid #3ea6ff;color:var(--text-primary)':'display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:10px;cursor:pointer;font-size:14px;text-align:left;background:var(--bg-sunken);border:1px solid var(--border);color:var(--text-primary)';
  if(enBtn)enBtn.style.cssText=lang==='en'?'display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:10px;cursor:pointer;font-size:14px;text-align:left;background:rgba(62,166,255,.15);border:1px solid #3ea6ff;color:var(--text-primary)':'display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:10px;cursor:pointer;font-size:14px;text-align:left;background:var(--bg-sunken);border:1px solid var(--border);color:var(--text-primary)';
  if(esBtn)esBtn.style.cssText=lang==='es'?'display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:10px;cursor:pointer;font-size:14px;text-align:left;background:rgba(62,166,255,.15);border:1px solid #3ea6ff;color:var(--text-primary)':'display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:10px;cursor:pointer;font-size:14px;text-align:left;background:var(--bg-sunken);border:1px solid var(--border);color:var(--text-primary)';
}

function setLanguage(lang){
  localStorage.setItem('wt_lang',lang);
  applyTranslations();
  updateLangButtons();
  if(currentUser&&document.getElementById('settings-country-sel'))loadMyCountryIntoSettings();
  toast(lang==='ru'?'Язык изменён 🌐':lang==='en'?'Language changed 🌐':lang==='es'?'Idioma cambiado 🌐':'Język zmieniony 🌐');
}


// ── BEZPIECZEŃSTWO: zabezpieczenie przed XSS ────────────────────────────
function likeIcon(size){
  size=size||13;
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="currentColor" style="vertical-align:-2px;opacity:.75"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/></svg>`;
}
function dislikeIcon(size){
  size=size||13;
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="currentColor" style="vertical-align:-2px;opacity:.75"><path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z"/></svg>`;
}
const APP_ICON_PATHS={
  like:'M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z',
  dislike:'M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z',
  fire:'M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z',
  heart:'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
  star:'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z',
  check:'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z',
  close:'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
  sparkle:'M12 1c1 6 5 10 11 11-6 1-10 5-11 11-1-6-5-10-11-11C7 11 11 7 12 1z',
  bolt:'M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66L13 3h1l-1 7h3.5c.49 0 .56.33.47.51l-.07.15C12.56 17.06 11 21 11 21z',
  moodHappy:'M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z',
  moodSad:'M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 2c-2.33 0-4.31 1.46-5.11 3.5h10.22c-.8-2.04-2.78-3.5-5.11-3.5z',
  moodNeutral:'M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-3.5-9c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm7 0c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zM8 15h8v1.5H8z',
  music:'M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z',
  camera:'M12 15.2a3.2 3.2 0 100-6.4 3.2 3.2 0 000 6.4zM9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z',
  controller:'M11.5 6.027a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0m-1.5 1.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1m2.5-.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0m-1.5 1.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1m-6.5-3h1v1h1v1h-1v1h-1v-1h-1v-1h1zM3.051 3.26a.5.5 0 0 1 .354-.613l1.932-.518a.5.5 0 0 1 .62.39c.655-.079 1.35-.117 2.043-.117.72 0 1.443.041 2.12.126a.5.5 0 0 1 .622-.399l1.932.518a.5.5 0 0 1 .306.729q.211.136.373.297c.408.408.78 1.05 1.095 1.772.32.733.599 1.591.805 2.466s.34 1.78.364 2.606c.024.816-.059 1.602-.328 2.21a1.42 1.42 0 0 1-1.445.83c-.636-.067-1.115-.394-1.513-.773-.245-.232-.496-.526-.739-.808-.126-.148-.25-.292-.368-.423-.728-.804-1.597-1.527-3.224-1.527s-2.496.723-3.224 1.527c-.119.131-.242.275-.368.423-.243.282-.494.575-.739.808-.398.38-.877.706-1.513.773a1.42 1.42 0 0 1-1.445-.83c-.27-.608-.352-1.395-.329-2.21.024-.826.16-1.73.365-2.606.206-.875.486-1.733.805-2.466.315-.722.687-1.364 1.094-1.772a2.3 2.3 0 0 1 .433-.335l-.028-.079zm2.036.412c-.877.185-1.469.443-1.733.708-.276.276-.587.783-.885 1.465a14 14 0 0 0-.748 2.295 12.4 12.4 0 0 0-.339 2.406c-.022.755.062 1.368.243 1.776a.42.42 0 0 0 .426.24c.327-.034.61-.199.929-.502.212-.202.4-.423.615-.674.133-.156.276-.323.44-.504C4.861 9.969 5.978 9.027 8 9.027s3.139.942 3.965 1.855c.164.181.307.348.44.504.214.251.403.472.615.674.318.303.601.468.929.503a.42.42 0 0 0 .426-.241c.18-.408.265-1.02.243-1.776a12.4 12.4 0 0 0-.339-2.406 14 14 0 0 0-.748-2.295c-.298-.682-.61-1.19-.885-1.465-.264-.265-.856-.523-1.733-.708-.85-.179-1.877-.27-2.913-.27s-2.063.091-2.913.27',
  film:'M0 1a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1zm4 0v6h8V1zm8 8H4v6h8zM1 1v2h2V1zm2 3H1v2h2zM1 7v2h2V7zm2 3H1v2h2zm-2 3v2h2v-2zM15 1h-2v2h2zm-2 3v2h2V4zm2 3h-2v2h2zm-2 3v2h2v-2zm2 3h-2v2h2z',
  trophy:'M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.95V18H7v2h10v-2h-4v-2.11c1.63-.32 2.98-1.45 3.61-2.95C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z',
  rocket:'M12 2c-1.1 2.3-2 5.4-2 8 0 1.5.4 3 1 4.3L9 16v4l3-2 3 2v-4l-2-1.7c.6-1.3 1-2.8 1-4.3 0-2.6-.9-5.7-2-8zm0 7a2 2 0 110-4 2 2 0 010 4z',
  bulb:'M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z',
  clock:'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z',
  folder:'M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z',
  calendar:'M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z',
  keyboard:'M20 5H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zM11 8h2v2h-2V8zM8 8h2v2H8V8zM5 8h2v2H5V8zm0 3h2v2H5v-2zm3 0h2v2H8v-2zm3 0h2v2h-2v-2zm3-3h2v2h-2V8zm3 0h2v2h-2V8zm0 3h2v2h-2v-2zM6 16h12v2H6v-2zm8-5h2v2h-2v-2z',
  rules:'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z',
  block:'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9C4.63 15.55 4 13.85 4 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1C19.37 8.45 20 10.15 20 12c0 4.42-3.58 8-8 8z',
  pencil:'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z',
  muteIcon:'M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.8L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z',
  volumeIcon:'M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z',
  globe:'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm7 6h-3.01c-.3-1.26-.74-2.45-1.32-3.56A8.04 8.04 0 0119 8zm-7-4c.83 1.17 1.48 2.5 1.91 4h-3.82c.43-1.5 1.08-2.83 1.91-4zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2H4.26zm.82 2h3.01c.3 1.26.74 2.45 1.32 3.56A7.987 7.987 0 015.08 16zm3.01-8H5.08a7.987 7.987 0 013.33-3.56A15.65 15.65 0 007.09 8zM12 20c-.83-1.17-1.48-2.5-1.91-4h3.82c-.43 1.5-1.08 2.83-1.91 4zm2.34-6H9.66c-.09-.66-.16-1.32-.16-2 0-.68.07-1.35.16-2h4.68c.09.65.16 1.32.16 2 0 .68-.07 1.34-.16 2zm.25 5.56c.58-1.11 1.02-2.3 1.32-3.56h3.01a8.04 8.04 0 01-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z',
  trash:'M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z',
  flag:'M14.4 6L14 4H5v17h2v-7h6.6l.4 2h7V6z',
  megaphone:'M18 11v2h4v-2h-4zm-2 6.61c.96.71 2.21 1.65 3.2 2.39.4-.53.8-1.07 1.2-1.6-.99-.74-2.24-1.68-3.2-2.4-.4.54-.8 1.08-1.2 1.61zM20.4 5.6c-.4-.53-.8-1.07-1.2-1.6-.99.74-2.24 1.68-3.2 2.4.4.53.8 1.07 1.2 1.6.96-.72 2.21-1.65 3.2-2.4zM4 9c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h1v4h2v-4h1l5 3V6L8 9H4zm9.54.12c.98.78 1.46 2.02 1.46 3.38s-.48 2.6-1.46 3.38l1.23 1.28c1.44-1.14 2.23-2.84 2.23-4.66s-.79-3.52-2.23-4.66l-1.23 1.28z',
  mobile:'M17 1H7c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 18H7V4h10v15z',
  bug:'M12 2L1 21h22L12 2zm0 3.99L18.53 19H5.47L12 5.99zM11 10h2v5h-2zm0 6h2v2h-2z',
  gift:'M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z',
  mail:'M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z',
  cup:'M2 21h18v-2H2v2zM20 8h-2V5H4v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-3h2c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm0 4h-2v-2h2v2z',
  burger:'M4 11h16c0-3.5-3.5-6-8-6s-8 2.5-8 6zm-1 3h18v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-1zm0 5h18v1H3z',
  fruit:'M12 4c-.5-1-1.5-2-3-2 .3 1.2 1 2 2 2.5A7 7 0 005 12c0 4 3 8 7 8s7-4 7-8a7 7 0 00-6-7.5z',
  donut:'M12 2a10 10 0 100 20 10 10 0 000-20zm0 14a4 4 0 110-8 4 4 0 010 8z',
  gem:'M12 2L2 9l10 13L22 9 12 2zm0 2.5L18.5 9H5.5L12 4.5zM5 11h5.2l1.8 7.8L5 11zm8.8 0H19l-6 7.8 1.8-7.8z',
  cloud:'M19 18H6a4 4 0 01-1-7.87A5.5 5.5 0 0115 7.1 4.5 4.5 0 0119 18z',
  palette:'M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10c1.1 0 2-.9 2-2 0-.52-.2-.99-.52-1.34-.3-.33-.48-.77-.48-1.26 0-1.1.9-2 2-2h2.35C19.48 15.4 22 13 22 12c0-5.51-4.49-10-10-10zm-5.5 9a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm3-4a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm5 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm3 4a1.5 1.5 0 110-3 1.5 1.5 0 010 3z',
  laugh:'M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-3.5-9a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm7 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm-3.5 2c-1.66 0-3 1.34-3 3h6c0-1.66-1.34-3-3-3z',
  cool:'M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM6 9h5v2a2 2 0 01-2 2H8a2 2 0 01-2-2V9zm7 0h5v2a2 2 0 01-2 2h-1a2 2 0 01-2-2V9zm-7-1h12v1H6V8zm3.5 9c1 .8 2 .8 3 0',
  eye:'M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zm0 12.5a5 5 0 110-10 5 5 0 010 10zm0-8a3 3 0 100 6 3 3 0 000-6z',
  think:'M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-13c-1.66 0-3 1.34-3 3h2c0-.55.45-1 1-1s1 .45 1 1c0 .55-.45.75-1.17 1.42C11.08 12.17 11 12.81 11 14h2c0-.75.08-1.17.83-1.83C14.5 11.5 15 10.83 15 9.5 15 8.12 13.88 7 12 7z',
  sleepy:'M12 3a9 9 0 109 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 01-4.4 2.26 5.403 5.403 0 01-3.14-9.8c-.44-.06-.9-.1-1.36-.1z',
  skull:'M240-80v-170q-39-17-68.5-45.5t-50-64.5q-20.5-36-31-77T80-520q0-158 112-259t288-101q176 0 288 101t112 259q0 42-10.5 83t-31 77q-20.5 36-50 64.5T720-250v170H240Zm80-80h40v-80h80v80h80v-80h80v80h40v-142q38-9 67.5-30t50-50q20.5-29 31.5-64t11-74q0-125-88.5-202.5T480-800q-143 0-231.5 77.5T160-520q0 39 11 74t31.5 64q20.5 29 50.5 50t67 30v142Zm100-200h120l-60-120-60 120Zm-80-80q33 0 56.5-23.5T420-520q0-33-23.5-56.5T340-600q-33 0-56.5 23.5T260-520q0 33 23.5 56.5T340-440Zm280 0q33 0 56.5-23.5T700-520q0-33-23.5-56.5T620-600q-33 0-56.5 23.5T540-520q0 33 23.5 56.5T620-440ZM480-160Z',
  crown:'M12 17C13.1046 17 14 16.1046 14 15C14 13.8954 13.1046 13 12 13C10.8954 13 10 13.8954 10 15C10 16.1046 10.8954 17 12 17ZM14 5C14 5.53031 13.7936 6.01241 13.4568 6.37036L16.0806 9.65021C16.1543 9.74226 16.2822 9.77036 16.3877 9.71764L19.0385 8.39225C19.0132 8.26541 19 8.13425 19 8C19 6.89543 19.8954 6 21 6C22.1046 6 23 6.89543 23 8C23 8.95189 22.335 9.74847 21.4442 9.95049L19.6401 19.5725C19.4849 20.4002 18.7622 21 17.9201 21H6.07993C5.2378 21 4.51509 20.4002 4.3599 19.5725L2.55577 9.95049C1.665 9.74847 1 8.95189 1 8C1 6.89543 1.89543 6 3 6C4.10457 6 5 6.89543 5 8C5 8.13425 4.98677 8.26541 4.96155 8.39225L7.61234 9.71765C7.71778 9.77036 7.84572 9.74226 7.91936 9.65021L10.5432 6.37036C10.2064 6.01241 10 5.53031 10 5C10 3.89543 10.8954 3 12 3C13.1046 3 14 3.89543 14 5ZM12 7C11.9869 7 11.9738 6.99987 11.9608 6.99962L9.09066 10.5873C8.57517 11.2316 7.67959 11.4283 6.94152 11.0593L4.12737 9.65221C4.09778 9.67244 4.06762 9.69189 4.03692 9.71054L5.83421 19.2961C5.85638 19.4143 5.95962 19.5 6.07993 19.5H17.9201C18.0404 19.5 18.1436 19.4143 18.1658 19.2961L19.9631 9.71055C19.9324 9.69189 19.9022 9.67244 19.8726 9.65221L17.0585 11.0593C16.3204 11.4283 15.4248 11.2316 14.9093 10.5873L12.0392 6.99962C12.0262 6.99987 12.0131 7 12 7Z',
  handshake:'M21.71 8.71c1.25-1.25.68-2.71 0-3.42l-3-3c-1.26-1.25-2.71-.68-3.42 0L13.59 4H11C9.1 4 8 5 7.44 6.15L3 10.59v4l-.71.7c-1.25 1.26-.68 2.71 0 3.42l3 3c.54.54 1.12.74 1.67.74.71 0 1.36-.35 1.75-.74l2.7-2.71H15c1.7 0 2.56-1.06 2.87-2.1 1.13-.3 1.75-1.16 2-2C21.42 14.5 22 13.03 22 12V9h-.59l.3-.29M20 12c0 .45-.19 1-1 1h-1v1c0 .45-.19 1-1 1h-1v1c0 .45-.19 1-1 1h-4.41l-3.28 3.28c-.31.29-.49.12-.6.01l-2.99-2.98c-.29-.31-.12-.49-.01-.6L5 15.41v-4l2-2V11c0 1.21.8 3 3 3s3-1.79 3-3h7v1m.29-4.71L18.59 9H11v2c0 .45-.19 1-1 1s-1-.55-1-1V8c0-.46.17-2 2-2h3.41l2.28-2.28c.31-.29.49-.12.6-.01l2.99 2.98c.29.31.12.49.01.6Z',
  ball:'M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM10.0738 3.71918C10.6927 3.57579 11.3375 3.5 12 3.5C12.6624 3.5 13.3071 3.57577 13.9259 3.7191L12.0016 4.87263L10.0738 3.71918ZM8.24434 4.37259L11.252 6.1721V8.36588L8.46062 10.3939L6.41688 9.68704L5.83031 6.15319C6.51967 5.426 7.33622 4.82059 8.24434 4.37259ZM4.58887 7.83458L4.94703 9.99236L3.51948 11.4199C3.60685 10.1236 3.98485 8.90694 4.58887 7.83458ZM3.62136 13.4394L5.94849 11.1122L7.98712 11.8174L9.06985 15.1497L8.10089 16.725L4.80714 16.5312C4.22302 15.6059 3.8125 14.56 3.62136 13.4394ZM6.09012 18.1093L7.99484 18.2214L8.67002 19.8229C7.70552 19.4119 6.83254 18.8276 6.09012 18.1093ZM10.5299 20.3733L9.34569 17.5643L10.3094 15.9974H13.6806L14.5926 17.5783L13.553 20.3585C13.0495 20.4514 12.5304 20.5 12 20.5C11.4986 20.5 11.0074 20.4566 10.5299 20.3733ZM15.3594 19.8103L15.9268 18.2931L17.5964 18.3978C16.9337 18.978 16.1799 19.457 15.3594 19.8103ZM18.892 16.9761L15.8675 16.7865L14.9302 15.1618L16.0169 11.8174L18.0296 11.1213L20.3416 13.6417C20.1016 14.8681 19.5979 16 18.892 16.9761ZM20.49 11.5845L19.0495 10.0141L19.4124 7.83686C20.0412 8.95395 20.4247 10.2275 20.49 11.5845ZM18.172 6.15558L17.5831 9.68852L15.5434 10.3939L12.752 8.36588V6.17168L15.7543 4.37191C16.6639 4.82047 17.4818 5.42696 18.172 6.15558ZM9.46674 11.5171L12.002 9.67507L14.5373 11.5171L13.5689 14.4974H10.4351L9.46674 11.5171Z',
  dumbbell:'M20.5 3.69a2.98 2.98 0 0 0-4.5.34 3.6 3.6 0 0 0-3.2 6.11l1.52 1.52-1.6 1.6 2.05 2.05 1.6-1.6 1.52 1.51a3.61 3.61 0 0 0 6.1-3.18 2.99 2.99 0 0 0 .35-4.5l-.9-.9.79-.79a1.45 1.45 0 0 0-2.05-2.05l-.79.79-.9-.9zm.4 6.38c-.3.3-.77.3-1.06 0l-1.91-1.9a.75.75 0 0 1 1.06-1.07l1.9 1.91c.3.3.3.77 0 1.06zm-5.68 7.82-5.08-5.09A3.61 3.61 0 0 0 4.03 16a3 3 0 0 0-.34 4.5l.9.9-.82.8a1.45 1.45 0 1 0 2.05 2.05l.82-.8.9.89a2.98 2.98 0 0 0 4.5-.34 3.6 3.6 0 0 0 3.18-6.11zm-5.78 2.58a.75.75 0 0 1-1.06 1.06l-1.9-1.91a.75.75 0 1 1 1.05-1.06l1.91 1.9z',
  pizza:'M5.003 4.664c0-1.496 1.231-2.804 2.821-2.647a20.782 20.782 0 0 1 13.442 6.827c1.07 1.193.737 2.964-.479 3.845l-.423.307l-.363-.54l-.008-.012c-3.19-4.406-8.38-7.274-14.24-7.274h-.75v-.506zm13.768 8.65l.378.563a4004.33 4004.33 0 0 0-3.947 2.865l-.202.15v2.102a1 1 0 1 1-2 0v-.06a.5.5 0 0 0-.996.06v1.501a1 1 0 0 1-1.995.1l-1.44 1.04c-1.489 1.074-3.57.01-3.569-1.826l.003-13.14h.75c5.354 0 10.096 2.617 13.018 6.645zm-9.767-2.32a1 1 0 1 0 0-2a1 1 0 0 0 0 2zm4 2.998a1 1 0 1 0 0-2a1 1 0 0 0 0 2zm-4 2.998a1 1 0 1 0 0-2a1 1 0 0 0 0 2z',
  beermug:'M7.25 2A3.25 3.25 0 0 0 4 5.25v14.5C4 20.99 5 22 6.25 22h9c1.24 0 2.25-1 2.25-2.25V18h1.25c1.8 0 3.25-1.46 3.25-3.25v-5.5C22 7.45 20.54 6 18.75 6H17.5v-.75c0-1.8-1.46-3.25-3.25-3.25h-7zm11.5 14.5H17.5v-9h1.25c.97 0 1.75.78 1.75 1.75v5.5c0 .97-.78 1.75-1.75 1.75zM16 6H5.5v-.75c0-.97.78-1.75 1.75-1.75h7c.97 0 1.75.78 1.75 1.75V6zm-7.5 4v7A.75.75 0 0 1 7 17v-7a.75.75 0 0 1 1.5 0zm3 0v7a.75.75 0 0 1-1.5 0v-7a.75.75 0 0 1 1.5 0zm3 0v7a.75.75 0 0 1-1.5 0v-7a.75.75 0 0 1 1.5 0z'
};
const EMOJI_TO_ICON={
  '👍':'like','👎':'dislike','❤️':'heart','💔':'heart','😍':'heart','🙏':'heart','🥰':'heart',
  '💪':'dumbbell','🤝':'handshake',
  '😀':'moodHappy','😁':'moodHappy','🙂':'moodHappy','🙃':'moodHappy','😊':'moodHappy','😉':'moodHappy','😇':'moodHappy','😅':'moodHappy',
  '😂':'laugh','🤣':'laugh','😆':'laugh',
  '😎':'cool','🤔':'think','🙄':'think',
  '😐':'moodNeutral','😑':'moodNeutral',
  '😴':'sleepy','🥱':'sleepy',
  '😭':'moodSad','😢':'moodSad','😔':'moodSad','😞':'moodSad','😟':'moodSad','🥺':'moodSad','😱':'moodSad',
  '😡':'bolt','🤬':'bolt','⚡':'bolt',
  '🥳':'sparkle','🤗':'sparkle','💫':'sparkle','✨':'sparkle','🎉':'sparkle',
  '🔥':'fire','💯':'star','⭐':'star','🌟':'star',
  '💀':'skull',
  '🎬':'film','🎮':'controller','⚽':'ball','🏀':'ball','🎵':'music','🎶':'music',
  '📸':'camera','📷':'camera','🍕':'pizza','☕':'cup','🍵':'cup','🍺':'beermug','🍻':'beermug',
  '🚀':'rocket','💡':'bulb',
  '⏰':'clock','⏱️':'clock','⏳':'clock','⌛':'clock',
  '✅':'check','✔️':'check','❌':'close','✖️':'close',
  '👀':'eye','🏆':'trophy','🥇':'trophy','🥈':'trophy','🥉':'trophy',
  '💎':'gem','👑':'crown','🍩':'donut',
  '📁':'folder','🗂️':'folder','📅':'calendar','🗓️':'calendar',
  '⌨️':'keyboard','📜':'rules','📋':'rules','🚫':'block','⛔':'block',
  '✏️':'pencil','📝':'pencil','🔇':'muteIcon','🔊':'volumeIcon','🔈':'volumeIcon',
  '🌍':'globe','🌎':'globe','🌐':'globe','🗑️':'trash','🚩':'flag','📢':'megaphone','📣':'megaphone',
  '📱':'mobile','🐛':'bug','🎁':'gift','📧':'mail','✉️':'mail',
  '🍔':'burger','🍎':'fruit','🍓':'fruit','🍌':'fruit','🎨':'palette'
};
const APP_EMOJI_SVG_PATHS={};
Object.entries(EMOJI_TO_ICON).forEach(([e,k])=>{APP_EMOJI_SVG_PATHS[e]=APP_ICON_PATHS[k];});
const APP_EMOJI_SVG_VB={'🎬':'0 0 16 16','🎮':'0 0 16 16','💀':'0 -960 960 960','💪':'0 0 28 28','🍕':'0 0 24 25'};
function applyAppEmojiStyleToEl(el){
  if(!el)return;
  const keys=Object.keys(APP_EMOJI_SVG_PATHS);
  const re=new RegExp('('+keys.map(k=>k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')','gu');
  const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT,null);
  const nodes=[];let n;
  while(n=walker.nextNode())nodes.push(n);
  nodes.forEach(node=>{
    const text=node.nodeValue;
    re.lastIndex=0;
    if(!re.test(text))return;
    re.lastIndex=0;
    const frag=document.createDocumentFragment();
    let last=0,m;
    while(m=re.exec(text)){
      if(m.index>last)frag.appendChild(document.createTextNode(text.slice(last,m.index)));
      const span=document.createElement('span');
      span.style.cssText='display:inline-flex;vertical-align:-3px';
      span.innerHTML=`<svg viewBox="${APP_EMOJI_SVG_VB[m[0]]||'0 0 24 24'}" width="1em" height="1em" fill="currentColor"><path d="${APP_EMOJI_SVG_PATHS[m[0]]}"/></svg>`;
      frag.appendChild(span);
      last=re.lastIndex;
    }
    if(last<text.length)frag.appendChild(document.createTextNode(text.slice(last)));
    node.parentNode.replaceChild(frag,node);
  });
}
function statIconSvg(path,size){
  size=size||20;
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="currentColor" style="opacity:.85"><path fill-rule="evenodd" d="${path}"/></svg>`;
}
function viewsIcon(size){return statIconSvg('M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zm0 12.5c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z',size);}
function subsIcon(size){return statIconSvg('M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z',size);}
function videosIcon(size){return statIconSvg('M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z',size);}
function commentsIcon(size){return statIconSvg('M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z',size);}
function barChartIcon(size){return statIconSvg('M5 9.2h3V19H5V9.2zM10.6 5h2.8v14h-2.8V5zm5.6 8H19v6h-2.8v-6z',size);}
function trendingIcon(size){return statIconSvg('M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z',size);}
function saveIcon(size){return statIconSvg('M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z',size);}
function watchLaterIcon(size){return statIconSvg('M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm.5 5H11v6l5.25 3.15.75-1.23-4.5-2.67V7z',size);}
function postIcon(size){return statIconSvg('M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z',size);}

// Blokuje schematy typu javascript:/data: w linkach z user-controlled URL (href/window.open) - esc() sam tego nie robi
function safeUrl(url){
  const u=(url||'').trim();
  return /^https?:\/\//i.test(u)?u:'';
}
function esc(str){
  if(str===null||str===undefined)return'';
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#039;');
}

let collapsibleDescSeq=0;
// Zwijany opis w stylu YouTube (X linii + przycisk "...więcej"/"mniej"). text ma być już zescapowany (lub bezpieczny HTML).
function collapsibleDesc(text,lines,fontSize){
  if(!text)return'';
  lines=lines||2;fontSize=fontSize||13;
  const id='cdesc-'+(++collapsibleDescSeq);
  const showBtn=(text.replace(/<[^>]*>/g,'').length>120)||text.split('\n').length>lines;
  return`<div>
    <div id="${id}" class="desc-text desc-collapsed" style="color:var(--text-secondary);font-size:${fontSize}px;line-height:1.5;-webkit-line-clamp:${lines}">${text}</div>
    ${showBtn?`<button onclick="toggleCollapsibleDesc('${id}',this)" style="background:none;border:none;color:var(--text-primary);font-weight:600;cursor:pointer;font-size:${fontSize}px;padding:4px 0">${t('btn_more')}</button>`:''}
  </div>`;
}
function toggleCollapsibleDesc(id,btn){
  const el=document.getElementById(id);
  if(!el)return;
  const collapsed=el.classList.toggle('desc-collapsed');
  btn.textContent=collapsed?t('btn_more'):t('btn_less');
}

// Bezpieczne wstawianie tekstu użytkownika do onclick="...('${jsesc(x)}')" - zapobiega "wyrwaniu się" z apostrofu
// Powiadomienia: dozwolone tylko <b>...</b>, reszta zescapowana
function safeNotifHtml(m){
  return esc(m).replace(/&lt;b&gt;/g,'<b>').replace(/&lt;\/b&gt;/g,'</b>');
}

function jsesc(str){
  if(str===null||str===undefined)return'';
  return String(str)
    .replace(/\\/g,'\\\\')
    .replace(/'/g,"\\'")
    .replace(/"/g,'&quot;')
    .replace(/\n/g,'\\n')
    .replace(/\r/g,'')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;');
}

function toast(msg,isHtml){
  const t=document.getElementById('toast');
  if(isHtml)t.innerHTML=msg;else t.textContent=msg;
  t.style.display='block';
  setTimeout(()=>t.style.display='none',2500);
}


// ── PUSTE WIDOKI W STYLU YOUTUBE (szara ikonka zamiast dużej emotki) ─────
const EMPTY_ICONS={
  clock:'<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>',
  history:'<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 12a9 9 0 109-9"/><path d="M3 4v5h5"/><path d="M12 7v5l3.5 2"/></svg>',
  bookmark:'<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 3h12v18l-6-4-6 4V3z"/></svg>',
  bell:'<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M18 8a6 6 0 10-12 0c0 6-2 7-2 7h16s-2-1-2-7"/><path d="M10 20a2 2 0 004 0"/></svg>',
  megaphone:'<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 10v4h3l6 4V6l-6 4H3z"/><path d="M16 9a4 4 0 010 6"/><path d="M19 6a8 8 0 010 12"/></svg>',
  phone:'<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/></svg>',
  film:'<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16M17 4v16M3 9h4M17 9h4M3 15h4M17 15h4"/></svg>'
};
const SLABEL_ICONS={
  bookmark:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 3h12v18l-6-4-6 4V3z"/></svg>',
  clock:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>',
  megaphone:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 10v4h3l6 4V6l-6 4H3z"/><path d="M16 9a4 4 0 010 6"/><path d="M19 6a8 8 0 010 12"/></svg>',
  flame:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/></svg>'
};
function setSlabel(iconKey,label){
  document.getElementById('slabel').innerHTML=`<span style="display:flex;align-items:center;gap:8px">${SLABEL_ICONS[iconKey]||''}<span>${esc(label)}</span></span>`;
}
function emptyStateHtml(iconKey,title,subtitle){
  return `<div class="empty" style="display:flex;flex-direction:column;align-items:center;padding:70px 20px">
    <div style="width:72px;height:72px;border-radius:50%;background:var(--bg-card);display:flex;align-items:center;justify-content:center;margin-bottom:18px;color:var(--text-tertiary)">${EMPTY_ICONS[iconKey]||''}</div>
    <p style="font-size:16px;font-weight:600;color:var(--text-primary);margin:0 0 6px">${title}</p>
    ${subtitle?`<p style="font-size:13px;color:var(--text-tertiary);margin:0;max-width:320px;text-align:center;line-height:1.5">${subtitle}</p>`:''}
  </div>`;
}


// ── MODERACJA OBRAZKÓW (NSFW) ───────────────────────────────────────────────
async function checkImageModeration(image){
  try{
    const{data,error}=await sb.functions.invoke('moderate-image',{body:{image}});
    if(error)return{flagged:false};
    return data||{flagged:false};
  }catch{
    return{flagged:false};
  }
}

// ── AUTH ──────────────────────────────────────────────────────────────────────
async function loginWithGoogle(){
  await sb.auth.signInWithOAuth({
    provider:'google',
    options:{redirectTo:SITE_URL,queryParams:{prompt:'select_account'}}
  });
}

async function logout(){
  if(currentUser)removeStoredAccount(currentUser.id);
  await sb.auth.signOut();
  currentUser=null;
  updateAuthUI();
  toggleDropdown(true);
  toast('Wylogowano!');
}

async function deleteMyAccount(){
  if(!currentUser)return;
  const ok1=await showConfirm(t('confirm_delete_account'),t('confirm_delete_account_sub'),t('settings_delete_btn'));
  if(!ok1)return;
  const ok2=await showConfirm(t('confirm_delete_account_2'),t('confirm_delete_account_2_sub'),t('confirm_delete_account_final_btn'));
  if(!ok2)return;
  const btn=document.getElementById('delete-account-btn');
  const lbl=document.getElementById('delete-account-label');
  btn.disabled=true;if(lbl)lbl.textContent=t('settings_delete_loading');
  try{
    const{data:{session}}=await sb.auth.getSession();
    const{data,error}=await sb.functions.invoke('delete-account',{
      headers:{Authorization:`Bearer ${session.access_token}`}
    });
    if(error||!data?.success){
      toast('Błąd: '+(error?.message||data?.error||'nie udało się usunąć konta'));
      btn.disabled=false;if(lbl)lbl.textContent=t('settings_delete_btn');
      return;
    }
    removeStoredAccount(currentUser.id);
    await sb.auth.signOut();
    toast(t('settings_delete_done'));
    setTimeout(()=>location.reload(),1500);
  }catch(e){
    toast('Błąd: '+e.message);
    btn.disabled=false;btn.textContent=t('settings_delete_btn');
  }
}

// ── PRZEŁĄCZANIE KONT (jak w YouTube — bez pełnego wylogowania) ───────────────
const ACCOUNTS_KEY='wt_accounts';
function getStoredAccounts(){
  try{return JSON.parse(localStorage.getItem(ACCOUNTS_KEY)||'[]');}catch{return[];}
}
function persistAccounts(list){
  localStorage.setItem(ACCOUNTS_KEY,JSON.stringify(list));
}
function rememberCurrentAccount(session){
  if(!session?.user)return;
  const u=session.user;
  const list=getStoredAccounts().filter(a=>a.id!==u.id);
  list.unshift({
    id:u.id,
    email:u.email||'',
    name:u.user_metadata?.full_name||u.user_metadata?.name||u.email||'',
    avatar:u.user_metadata?.avatar_url||'',
    access_token:session.access_token,
    refresh_token:session.refresh_token
  });
  persistAccounts(list.slice(0,6));
  renderAccountSwitcher();
}
function removeStoredAccount(id){
  persistAccounts(getStoredAccounts().filter(a=>a.id!==id));
  renderAccountSwitcher();
}
async function switchToAccount(id){
  const acc=getStoredAccounts().find(a=>a.id===id);
  if(!acc)return;
  if(currentUser&&currentUser.id===acc.id){toggleDropdown(true);return;}
  toggleDropdown(true);
  const{error}=await sb.auth.setSession({access_token:acc.access_token,refresh_token:acc.refresh_token});
  if(error){
    toast('Ta sesja wygasła, zaloguj się ponownie');
    removeStoredAccount(id);
    return loginWithGoogle();
  }
  toast(`Przełączono na ${acc.name} ✓`);
  location.reload();
}
async function addAnotherAccount(){
  toggleDropdown(true);
  await loginWithGoogle();
}
function renderAccountSwitcher(){
  const box=document.getElementById('account-switcher-list');
  if(!box)return;
  const accs=getStoredAccounts();
  if(accs.length<2){box.innerHTML='';return;}
  box.innerHTML=accs.map(a=>`
    <div class="dropdown-item" onclick="switchToAccount('${jsesc(a.id)}')" style="${currentUser&&currentUser.id===a.id?'opacity:.5;pointer-events:none':''}">
      ${a.avatar?`<img src="${esc(a.avatar)}" style="width:20px;height:20px;border-radius:50%;object-fit:cover">`:`<div style="width:20px;height:20px;border-radius:50%;background:#3ea6ff;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#0f0f0f">${esc((a.name||'?')[0].toUpperCase())}</div>`}
      <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(a.name)}${currentUser&&currentUser.id===a.id?' ✓':''}</span>
    </div>`).join('');
}

function toggleDropdown(forceClose=false){
  const d=document.getElementById('dropdown');
  if(forceClose)d.classList.remove('open');
  else d.classList.toggle('open');
}

document.addEventListener('click',e=>{
  if(!e.target.closest('.user-menu'))document.getElementById('dropdown').classList.remove('open');
});

function updateAuthUI(){
  const authArea=document.getElementById('auth-area');
  const userArea=document.getElementById('user-area');
  if(currentUser){
    authArea.style.display='none';
    userArea.style.display='flex';
    document.getElementById('notif-wrap').style.display='block';
    updateNotifBadge();
    userArea.style.alignItems='center';
    userArea.style.gap='10px';
    const av=document.getElementById('user-av');
    const meta=currentUser.user_metadata;
    const frameBorder=myAvatarFrame?`3px solid ${esc(myAvatarFrame)}`:'2px solid #cc0000';
    if(meta&&meta.avatar_url){
      av.innerHTML=`<img src="${esc(meta.avatar_url)}" style="width:34px;height:34px;border-radius:50%;object-fit:cover;border:${frameBorder}">`;
    } else {
      av.textContent=(meta&&meta.full_name?meta.full_name[0]:(currentUser.email?currentUser.email[0]:'?')).toUpperCase();
    }
    // wypełniamy nagłówek dropdownu (avatar/nick/email)
    const dispName=getMyDisplayName()||currentUser.email||'';
    const headerAv=document.getElementById('dropdown-header-av');
    const headerName=document.getElementById('dropdown-header-name');
    const headerEmail=document.getElementById('dropdown-header-email');
    if(headerAv){
      headerAv.innerHTML=meta&&meta.avatar_url?`<img src="${esc(meta.avatar_url)}">`:esc((dispName[0]||'?').toUpperCase());
      headerAv.style.border=myAvatarFrame?`3px solid ${esc(myAvatarFrame)}`:'';
    }
    if(headerName)headerName.textContent=dispName;
    if(headerEmail)headerEmail.textContent=currentUser.email||'';
    renderAccountSwitcher();
    // update comment avatar
    const comAv=document.getElementById('com-av');
    if(meta&&meta.avatar_url){
      comAv.innerHTML=`<img src="${esc(meta.avatar_url)}">`;
    } else {
      comAv.textContent=(meta&&meta.full_name?meta.full_name[0]:'?').toUpperCase();
    }
    // update admin panel link visibility
    const adminItem=document.getElementById('admin-dropdown-item');
    if(adminItem)adminItem.style.display=isAdmin()?'flex':'none';
    const vipItem=document.getElementById('vip-dropdown-item');
    if(vipItem)vipItem.style.display=isVIP()?'flex':'none';
  } else {
    authArea.style.display='block';
    userArea.style.display='none';
    document.getElementById('notif-wrap').style.display='none';
  }
}


// ── SUPABASE DATA ─────────────────────────────────────────────────────────────
// ── PROFILES ─────────────────────────────────────────────────────────────────
const profileCache={};

// e-mail nie jest już publicznie czytelny w tabeli profiles - wyszukiwanie id po e-mailu idzie przez RPC
async function profileIdByEmail(email){
  if(!email)return null;
  const{data}=await sb.rpc('profile_id_by_email',{p_email:email});
  return data?{id:data}:null;
}

async function saveProfile(user){
  if(!user)return;
  const meta=user.user_metadata;
  const rawName=meta?.full_name||user.email?.split('@')[0]||'Użytkownik';
  const profile={
    id:user.id,
    name:rawName.slice(0,30),
    avatar:meta?.avatar_url||'',
    email:user.email||'',
    last_seen_at:new Date().toISOString()
  };
  profileCache[user.id]={...(profileCache[user.id]||{}),...profile};
  // nie uzywamy .upsert() - ON CONFLICT DO UPDATE wymaga SELECT na kolumnach (w tym email),
  // ktorego zwykli userzy celowo nie maja (F-013). insert+ignore dla nowych, zwykly update dla istniejacych.
  await sb.from('profiles').upsert([profile],{onConflict:'id',ignoreDuplicates:true});
  await sb.from('profiles').update(profile).eq('id',user.id);
  if(myDetectedIp)sb.rpc('set_my_last_ip',{p_ip:myDetectedIp});
}

async function checkAndShowTermsGate(){
  if(!currentUser)return;
  const{data}=await sb.from('profiles').select('terms_accepted').eq('id',currentUser.id).single();
  if(!data?.terms_accepted){
    document.getElementById('terms-checkbox').checked=false;
    toggleTermsContinue();
    document.getElementById('terms-gate').classList.add('open');
  }
}
function toggleTermsContinue(){
  const cb=document.getElementById('terms-checkbox');
  const btn=document.getElementById('terms-continue-btn');
  btn.disabled=!cb.checked;
  btn.style.opacity=cb.checked?'1':'.5';
}
async function acceptTerms(){
  if(!currentUser||!document.getElementById('terms-checkbox').checked)return;
  const{error}=await sb.from('profiles').update({terms_accepted:true}).eq('id',currentUser.id);
  if(error){toast('Błąd zapisu: '+error.message);return;}
  document.getElementById('terms-gate').classList.remove('open');
}
function openTermsModal(){
  const lang=getLang();
  const content=TERMS_CONTENT[lang]||TERMS_CONTENT.pl;
  const title=(TRANSLATIONS[lang]&&TRANSLATIONS[lang].terms_modal_title)||'Zasady WaveTube';
  const rulesIconSvg='<svg viewBox="0 0 24 24" width="22" height="22"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" fill="currentColor"/></svg>';
  const html=`<!DOCTYPE html><html lang="${lang}"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title.replace(/[<>]/g,'')} — WaveTube</title>
<style>
  :root{color-scheme:dark}
  *{box-sizing:border-box}
  body{margin:0;background:#0f0f0f;color:#aaa;font-family:Roboto,Arial,sans-serif;line-height:1.7}
  .wrap{max-width:760px;margin:0 auto;padding:40px 24px 80px;position:relative}
  h1{color:#fff;font-size:22px;margin:0 0 28px;display:flex;align-items:center;gap:10px}
  h1 svg{flex-shrink:0}
  h4{color:#fff;font-size:16px;margin:26px 0 8px}
  p{font-size:14px;margin:0 0 4px}
  .close-x{position:fixed;top:16px;right:20px;background:#1f1f1f;border:1px solid #333;color:#fff;width:36px;height:36px;border-radius:50%;cursor:pointer;font-size:18px;line-height:1}
</style>
</head><body><button class="close-x" onclick="window.close()">✕</button><div class="wrap"><h1>${rulesIconSvg}${title}</h1>${content}</div></body></html>`;
  const blob=new Blob([html],{type:'text/html'});
  const url=URL.createObjectURL(blob);
  const w=window.open(url,'_blank');
  if(!w){toast('Zablokowano otwieranie nowej karty — zezwól przeglądarce na wyskakujące okna.');}
  setTimeout(()=>URL.revokeObjectURL(url),30000);
}
function closeTermsModal(){}

let heartbeatInterval=null;
function startHeartbeat(){
  stopHeartbeat();
  heartbeatInterval=setInterval(()=>{
    if(currentUser)sb.from('profiles').update({last_seen_at:new Date().toISOString()}).eq('id',currentUser.id);
  },3*60*1000); // co 3 minuty
}
function stopHeartbeat(){
  if(heartbeatInterval){clearInterval(heartbeatInterval);heartbeatInterval=null;}
}

const VIP_BADGE_COLORS_ADMIN=['#3ea6ff','#ffd700','#ff6b35','#c084fc','#4ade80','#f472b6','#fb7185','#a78bfa','#22d3ee','#ef4444','#84cc16','#e879f9','#fb923c','#14b8a6','#eab308','#f43f5e'];

async function saveAdminBadgeColor(color){
  if(!isAdmin())return;
  const{error}=await sb.from('profiles').upsert([{id:currentUser.id,vip_badge_color:color}],{onConflict:'id'});
  if(error){toast('Błąd: '+error.message);return;}
  adminBadgeColor=color;
  renderAdminPanel();
  toast('Kolor plakietki zapisany! 🏅');
}


// ── WYCISZANIE (MUTE) ────────────────────────────────────────────────────
let myMuteUntil=null; // null=nie wyciszony, undefined=na zawsze wyciszony, Date=do kiedy

async function checkIfMuted(){
  if(!currentUser){myMuteUntil=null;return;}
  const{data}=await sb.from('muted_users').select('*').eq('user_id',currentUser.id);
  if(!data||!data.length){myMuteUntil=null;return;}
  const active=data.find(m=>!m.expires_at||new Date(m.expires_at)>new Date());
  myMuteUntil=active?(active.expires_at||undefined):null;
}

function isMutedNow(){
  if(myMuteUntil===null)return false;
  if(myMuteUntil===undefined)return true;
  return new Date(myMuteUntil)>new Date();
}

function muteToastMsg(){
  if(myMuteUntil===undefined)return'Zostałeś wyciszony przez administratora na zawsze — nie możesz pisać.';
  return`Zostałeś wyciszony przez administratora do ${new Date(myMuteUntil).toLocaleString(localeCode())} — nie możesz pisać.`;
}

let currentCmtMenu=null;
let cmtMenuOutsideListener=null;

function closeCmtMenu(){
  if(currentCmtMenu){currentCmtMenu.style.display='none';currentCmtMenu=null;}
  if(cmtMenuOutsideListener){document.removeEventListener('click',cmtMenuOutsideListener);cmtMenuOutsideListener=null;}
}

function toggleCmtMenu(btnEl,menuId){
  const menu=document.getElementById(menuId);
  if(!menu)return;
  if(currentCmtMenu===menu){closeCmtMenu();return;}
  closeCmtMenu();
  menu.style.display='block';
  const rect=btnEl.getBoundingClientRect();
  const menuWidth=200;
  let left=Math.min(rect.right-menuWidth,window.innerWidth-menuWidth-8);
  left=Math.max(8,left);
  let top=rect.bottom+4;
  const approxHeight=menu.offsetHeight||160;
  if(top+approxHeight>window.innerHeight)top=Math.max(8,rect.top-approxHeight-4);
  menu.style.top=top+'px';
  menu.style.left=left+'px';
  currentCmtMenu=menu;
  setTimeout(()=>{
    cmtMenuOutsideListener=function(e){
      if(!menu.contains(e.target)&&e.target!==btnEl&&!btnEl.contains(e.target)){closeCmtMenu();}
    };
    document.addEventListener('click',cmtMenuOutsideListener);
  },0);
}

function toggleMuteMenu(userId,btnEl){
  const existing=document.getElementById('admin-mute-menu');
  if(existing){existing.remove();if(existing.dataset.user===userId)return;}
  const rect=btnEl.getBoundingClientRect();
  const menu=document.createElement('div');
  menu.id='admin-mute-menu';
  menu.dataset.user=userId;
  menu.style.cssText=`position:fixed;top:${rect.bottom+4}px;left:${Math.min(rect.left,window.innerWidth-190)}px;background:var(--bg-panel);border:1px solid var(--border);border-radius:10px;min-width:170px;z-index:2000;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.5)`;
  menu.innerHTML=`
    <div style="padding:9px 16px;font-size:11px;color:var(--text-tertiary);text-transform:uppercase">Wycisz na</div>
    <div onclick="muteUser('${jsesc(userId)}',1)" style="padding:11px 16px;cursor:pointer;font-size:13px" onmouseover="this.style.background='var(--border)'" onmouseout="this.style.background='none'">1 godzinę</div>
    <div onclick="muteUser('${jsesc(userId)}',24)" style="padding:11px 16px;cursor:pointer;font-size:13px" onmouseover="this.style.background='var(--border)'" onmouseout="this.style.background='none'">24 godziny</div>
    <div onclick="muteUser('${jsesc(userId)}',168)" style="padding:11px 16px;cursor:pointer;font-size:13px" onmouseover="this.style.background='var(--border)'" onmouseout="this.style.background='none'">7 dni</div>
    <div onclick="muteUser('${jsesc(userId)}',720)" style="padding:11px 16px;cursor:pointer;font-size:13px" onmouseover="this.style.background='var(--border)'" onmouseout="this.style.background='none'">30 dni</div>
    <div onclick="muteUser('${jsesc(userId)}',null)" style="padding:11px 16px;cursor:pointer;font-size:13px;color:#ff6b6b" onmouseover="this.style.background='var(--border)'" onmouseout="this.style.background='none'">Na zawsze</div>
    <div style="border-top:1px solid var(--border)"></div>
    <div onclick="unmuteUser('${jsesc(userId)}')" style="padding:11px 16px;cursor:pointer;font-size:13px;color:#7fe08a" onmouseover="this.style.background='var(--border)'" onmouseout="this.style.background='none'">🔊 Cofnij wyciszenie</div>
  `;
  document.body.appendChild(menu);
  setTimeout(()=>{
    document.addEventListener('click',function closeIt(e){
      if(!menu.contains(e.target)&&e.target!==btnEl){menu.remove();document.removeEventListener('click',closeIt);}
    });
  },0);
}

async function muteUser(userId,hours){
  if(!isAdmin())return;
  if(userId===currentUser.id){toast('Nie możesz wyciszyć samego siebie! 😅');return;}
  const expires_at=hours?new Date(Date.now()+hours*3600*1000).toISOString():null;
  await sb.from('muted_users').delete().eq('user_id',userId);
  await sb.from('muted_users').insert([{user_id:userId,expires_at,muted_by:currentUser.id}]);
  logAdminAction('mute',`Wyciszono użytkownika (ID: ${userId}) na ${hours?hours+'h':'zawsze'}`);
  const menu=document.getElementById('admin-mute-menu');
  if(menu)menu.remove();
  toast('Użytkownik wyciszony 🔇');
  const modalOpen=document.getElementById('admin-panel-modal')?.classList.contains('open');
  if(modalOpen&&(adminTab==='users'||adminTab==='moderation'))renderAdminPanel();
}

async function unmuteUser(userId){
  if(!isAdmin())return;
  await sb.from('muted_users').delete().eq('user_id',userId);
  logAdminAction('unmute',`Cofnięto wyciszenie użytkownika (ID: ${userId})`);
  const menu=document.getElementById('admin-mute-menu');
  if(menu)menu.remove();
  toast('Wyciszenie cofnięte 🔊');
  const modalOpen=document.getElementById('admin-panel-modal')?.classList.contains('open');
  if(modalOpen&&(adminTab==='users'||adminTab==='moderation'))renderAdminPanel();
}


// ── HELPERS ───────────────────────────────────────────────────────────────────
function ytId(url){const m=(url||'').match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);return m?m[1]:null;}
function gdId(url){const m=(url||'').match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/);return m?m[1]:null;}
function ttId(url){const m=(url||'').match(/tiktok\.com\/@[^/]+\/video\/(\d+)/);return m?m[1]:null;}
function dropboxDirectUrl(url){
  if(!/dropbox\.com\//.test(url||''))return null;
  let u=url.replace('www.dropbox.com','dl.dropboxusercontent.com');
  u=u.replace(/([?&])dl=0/,'$1dl=1');
  if(!/[?&]dl=1/.test(u))u+=(u.includes('?')?'&':'?')+'dl=1';
  return u;
}
function isOneDriveEmbed(url){
  return /onedrive\.live\.com\/embed/.test(url||'')||/1drv\.ms/.test(url||'');
}
function megaEmbedUrl(url){
  const u=url||'';
  // nowy format: mega.nz/file/<id>#<key>
  let m=u.match(/mega\.nz\/file\/([a-zA-Z0-9]+)#([^/?\s]+)/);
  if(m)return`https://mega.nz/embed/${m[1]}#${m[2]}`;
  // stary format: mega.nz/#!<id>!<key>
  m=u.match(/mega\.nz\/#!([a-zA-Z0-9]+)!([^/?\s]+)/);
  if(m)return`https://mega.nz/embed#!${m[1]}!${m[2]}`;
  return null;
}
function isYandexDiskLink(url){
  return /disk\.yandex\.(ru|com|by|kz|ua)\/[di]\//.test(url||'')||/yadi\.sk\//.test(url||'');
}
function pcloudCode(url){
  const m=(url||'').match(/pcloud\.link\/publink\/show\?code=([a-zA-Z0-9]+)/);
  return m?m[1]:null;
}
async function resolveCloudDirectUrl(url){
  if(isYandexDiskLink(url)){
    try{
      const res=await fetch(`https://cloud-api.yandex.net/v1/disk/public/resources/download?public_key=${encodeURIComponent(url)}`);
      const data=await res.json();
      return data.href||null;
    }catch(e){return null;}
  }
  const code=pcloudCode(url);
  if(code){
    try{
      const res=await fetch(`https://api.pcloud.com/getpublinkdownload?code=${code}`);
      const data=await res.json();
      if(data.hosts&&data.hosts[0]&&data.path)return`https://${data.hosts[0]}${data.path}`;
      return null;
    }catch(e){return null;}
  }
  return null;
}
function safeHttp(u){return /^https?:\/\//i.test(String(u||'').trim())?String(u).trim():'';}
function getPlayer(url){
  const ytid=ytId(url);if(ytid)return{type:'yt',src:`https://www.youtube.com/embed/${ytid}?autoplay=1&enablejsapi=1&origin=${encodeURIComponent(location.origin)}`};
  const gdid=gdId(url);if(gdid)return{type:'gd',src:`https://drive.google.com/file/d/${gdid}/preview`};
  const ttid=ttId(url);if(ttid)return{type:'tt',src:`https://www.tiktok.com/embed/v2/${ttid}`};
  if(isOneDriveEmbed(url)&&safeHttp(url))return{type:'od',src:safeHttp(url)};
  const mega=megaEmbedUrl(url);if(mega)return{type:'mega',src:mega};
  const dbx=dropboxDirectUrl(url);if(dbx)return{type:'mp4',src:dbx};
  if(isYandexDiskLink(url)||pcloudCode(url))return{type:'resolve',src:safeHttp(url)};
  if((url||'').match(/\.(mp4|webm|mov)(\?|$)/i))return{type:'mp4',src:safeHttp(url)};
  return{type:'unknown',src:safeHttp(url)};
}
function relativeDate(dateStr){
  if(!dateStr)return'';
  const d=new Date(dateStr);
  const now=new Date();
  const sec=Math.floor((now-d)/1000);
  const lang=getLang();
  const isRu=lang==='ru',isEn=lang==='en';
  const units=[
    [31536000,isRu?['год','года','лет']:isEn?['year','years','years']:['rok','lata','lat']],
    [2592000,isRu?['месяц','месяца','месяцев']:isEn?['month','months','months']:['miesiąc','miesiące','miesięcy']],
    [604800,isRu?['неделю','недели','недель']:isEn?['week','weeks','weeks']:['tydzień','tygodnie','tygodni']],
    [86400,isRu?['день','дня','дней']:isEn?['day','days','days']:['dzień','dni','dni']],
    [3600,isRu?['час','часа','часов']:isEn?['hour','hours','hours']:['godzinę','godziny','godzin']],
    [60,isRu?['минуту','минуты','минут']:isEn?['minute','minutes','minutes']:['minutę','minuty','minut']]
  ];
  for(const[secs,forms] of units){
    const n=Math.floor(sec/secs);
    if(n>=1){
      let form;
      if(isRu){
        form=(n%10===1&&n%100!==11)?forms[0]:(n%10>=2&&n%10<=4&&(n%100<10||n%100>=20))?forms[1]:forms[2];
      }else if(isEn){
        form=n===1?forms[0]:forms[1];
      }else{
        form=n===1?forms[0]:(n%10>=2&&n%10<=4&&(n%100<10||n%100>=20))?forms[1]:forms[2];
      }
      return isRu?`${n} ${form} назад`:isEn?`${n} ${form} ago`:`${n} ${form} temu`;
    }
  }
  return isRu?'только что':isEn?'just now':'przed chwilą';
}

function thumbFor(v){
  if(v.thumb)return v.thumb;
  const ytid=ytId(v.url);if(ytid)return`https://img.youtube.com/vi/${ytid}/hqdefault.jpg`;
  const gdid=gdId(v.url);if(gdid)return`https://lh3.googleusercontent.com/d/${gdid}`;
  return'';
}
function viewsLabel(v,long){
  const lang=getLang();
  const isRu=lang==='ru',isEn=lang==='en',isEs=lang==='es';
  if(v.hide_views&&!(currentUser&&(currentUser.id===v.user_id||isAdmin()))){
    return isRu?'Просмотры скрыты':isEn?'Views hidden':isEs?'Visualizaciones ocultas':'Wyświetlenia ukryte';
  }
  let suffix;
  if(isRu)suffix=long?' просмотров':' просм.';
  else if(isEn)suffix=' views';
  else if(isEs)suffix=long?' visualizaciones':' vis.';
  else suffix=long?' wyświetleń':' wyśw.';
  return(v.views||0)+suffix;
}

function isDiscoverable(v){
  // Publiczne widać zawsze. Niepubliczne/prywatne widzi tylko właściciel i admin —
  // używane na stronie głównej, w wyszukiwarce, popularnych, shortsach i cudzych kanałach.
  if(!v.visibility||v.visibility==='public')return true;
  return!!(currentUser&&(v.user_id===currentUser.id||isAdmin()));
}
function canViewVideo(v){
  // Prywatny = tylko właściciel/admin, nawet z bezpośrednim linkiem.
  // Niepubliczny (unlisted) da się otworzyć z linku — to jest sens tej opcji.
  if(v.visibility!=='private')return true;
  return!!(currentUser&&(v.user_id===currentUser.id||isAdmin()));
}

function getUserName(v){const p=profileCache[v.user_id||''];return(p&&p.name)||v.user_name||v.user_email||'Anonim';}
function makeNick(name,email){
  if(!name||name.match(/^[0-9a-f-]{8,}$/i))return email?'@'+email.split('@')[0]:'@kanał';
  const base=name.toLowerCase().replace(/\s+/g,'').replace(/[^a-z0-9]/g,'');
  return '@'+(base||email?.split('@')[0]||'user');
}

let vipEmailsMap=new Map(); // user_id -> vip_badge_color, wypełniane z profiles.is_vip=true
let vipSinceMap=new Map(); // user_id -> vip_since (data nadania VIP-a)
function isVIP(){return!!(currentUser&&vipEmailsMap.has(currentUser.id));}

async function adminSetVip(userId,email,makeVip){
  if(!isAdmin())return;
  const payload={id:userId,email:email||null,is_vip:makeVip};
  if(makeVip)payload.vip_since=new Date().toISOString();
  const{error}=await sb.from('profiles').upsert([payload],{onConflict:'id'});
  if(error){toast('Błąd: '+error.message);return;}
  await loadVipEmails();
  logAdminAction(makeVip?'grant_vip':'revoke_vip',`${makeVip?'Nadano':'Odebrano'} VIP: ${email||userId}`);
  renderAdminPanel();
  toast(makeVip?'Nadano status VIP ⭐':'Odebrano status VIP');
}

function verifiedBadge(email,userId){
  if(userId&&userId===ADMIN_USER_ID){
    const badgeColor=adminBadgeColor||'#3ea6ff';
    return`<span title="Administrator" style="display:inline-flex;align-items:center;gap:3px;margin-left:5px;flex-shrink:0"><span style="display:inline-flex;align-items:center;justify-content:center;background:${esc(badgeColor)};border-radius:50%;width:16px;height:16px;flex-shrink:0"><svg viewBox="0 0 24 24" width="10" height="10" fill="#fff"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg></span><span style="font-size:10px;font-weight:800;color:${esc(badgeColor)};letter-spacing:.5px">ADMIN</span></span>`;
  }
  if(userId&&vipEmailsMap.has(userId)){
    const badgeColor=vipEmailsMap.get(userId)||'#ffd700';
    const since=vipSinceMap.get(userId);
    const sinceTitle=since?` · VIP ${t('vip_since_label')} ${new Date(since).toLocaleDateString(localeCode(),{day:'numeric',month:'long',year:'numeric'})}`:'';
    return`<span title="VIP${sinceTitle}" style="display:inline-flex;align-items:center;gap:3px;margin-left:5px;flex-shrink:0"><span style="display:inline-flex;align-items:center;justify-content:center;background:${esc(badgeColor)};border-radius:50%;width:16px;height:16px;flex-shrink:0"><svg viewBox="0 0 24 24" width="10" height="10" fill="#000"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg></span><span style="font-size:10px;font-weight:800;color:${esc(badgeColor)};letter-spacing:.5px">VIP</span></span>`;
  }
  return'';
}
function getUserColor(email){
  if(!email)return colors[0];
  let h=0;for(let i=0;i<email.length;i++)h=email.charCodeAt(i)+((h<<5)-h);
  return colors[Math.abs(h)%colors.length];
}
function setThumbMode(mode){
  ['url','file','auto'].forEach(m=>{
    const panel=document.getElementById('thumb-'+m+'-panel');
    const tab=document.getElementById('thumb-tab-'+m);
    if(panel)panel.style.display=m===mode?'block':'none';
    if(tab){tab.style.background=m===mode?'#cc0000':'transparent';tab.style.borderColor=m===mode?'#cc0000':'var(--border)';tab.style.color=m===mode?'#fff':'#aaa';}
  });
  if(mode==='auto'){
    const url=document.getElementById('furl')?.value.trim()||'';
    const type=getPlayer(url).type;
    const hint=document.getElementById('thumb-auto-hint-text');
    if(hint){
      if(type==='yt')hint.textContent=t('form_thumb_auto_hint');
      else if(type==='gd')hint.textContent='Miniaturka zostanie pobrana automatycznie z Google Drive';
      else hint.textContent='⚠️ Auto nie działa dla tego linku (np. MEGA) — nie da się pobrać kadru z tego hostingu. Wybierz "Z dysku" albo "Link URL".';
    }
  }
}

document.getElementById('fthumb-file')?.addEventListener('change',function(){
  const file=this.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=e=>{
    document.getElementById('thumb-img-preview').src=e.target.result;
    document.getElementById('thumb-preview').style.display='block';
  };
  reader.readAsDataURL(file);
});

function selectVisibility(val){
  document.getElementById('fvis').value=val;
  document.querySelectorAll('.vis-opt').forEach(el=>{
    const active=el.dataset.val===val;
    el.style.borderColor=active?'#cc0000':'var(--border)';
    el.style.background=active?'rgba(204,0,0,.08)':'transparent';
  });
}


// ── WYSZUKIWANIE GŁOSEM ──────────────────────────────────────────────────
let voiceRecognition=null;
function toggleVoiceSearch(){
  const SpeechRec=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SpeechRec){toast('Twoja przeglądarka nie obsługuje wyszukiwania głosem 😕');return;}
  const btn=document.getElementById('mic-btn');
  if(voiceRecognition){
    voiceRecognition.stop();
    return;
  }
  voiceRecognition=new SpeechRec();
  voiceRecognition.lang=getLang()==='ru'?'ru-RU':'pl-PL';
  voiceRecognition.interimResults=true;
  voiceRecognition.maxAlternatives=1;
  btn.classList.add('listening');
  voiceRecognition.onresult=e=>{
    const transcript=[...e.results].map(r=>r[0].transcript).join('');
    const inp=document.getElementById('search');
    inp.value=transcript;
    render();
  };
  voiceRecognition.onerror=()=>{
    btn.classList.remove('listening');
    voiceRecognition=null;
  };
  voiceRecognition.onend=()=>{
    btn.classList.remove('listening');
    voiceRecognition=null;
  };
  voiceRecognition.start();
}

function detectSource(){
  const url=document.getElementById('furl').value.trim();
  const hint=document.getElementById('fhint');
  if(!url){hint.innerHTML=t('hint_paste_link');return;}
  if(ytId(url))hint.innerHTML='✅ <b style="color:#cc0000">YouTube</b>';
  else if(gdId(url))hint.innerHTML=t('hint_gdrive');
  else if(ttId(url))hint.innerHTML='✅ <b style="color:#000;background:#69C9D0;padding:2px 6px;border-radius:4px">TikTok</b>';
  else if(megaEmbedUrl(url))hint.innerHTML='✅ <b style="color:#d9272e">MEGA</b>';
  else if(isYandexDiskLink(url))hint.innerHTML='✅ <b style="color:#ffcc00;background:#000;padding:2px 6px;border-radius:4px">Яндекс.Диск</b>';
  else if(pcloudCode(url))hint.innerHTML='✅ <b style="color:#17bed0">pCloud</b>';
  else if(url.match(/\.(mp4|webm|mov)(\?|$)/i)){
    hint.innerHTML=t('hint_mp4_detecting');
    detectVideoDuration(url);
  }
  else hint.innerHTML=t('hint_unknown_format');
}

function detectVideoDuration(url){
  const durField=document.getElementById('fdur');
  const hint=document.getElementById('fhint');
  const probe=document.createElement('video');
  probe.preload='metadata';
  probe.onloadedmetadata=()=>{
    if(isFinite(probe.duration)&&probe.duration>0&&durField.dataset.userEdited!=='1'){
      const total=Math.round(probe.duration);
      const mm=Math.floor(total/60),ss=total%60;
      durField.value=`${mm}:${String(ss).padStart(2,'0')}`;
      if(hint)hint.innerHTML=t('hint_mp4_detected');
    }
    probe.remove();
  };
  probe.onerror=()=>{probe.remove();};
  probe.src=url;
}


// ── SIDEBAR (hamburger, jak w YouTube) ─────────────────────────────────────
function isMobileLayout(){return window.innerWidth<=860;}

function toggleSidebar(){
  const sb=document.getElementById('sidebar-left');
  const overlay=document.getElementById('sidebar-overlay');
  if(!sb)return;
  if(isMobileLayout()){
    sb.classList.toggle('mobile-open');
    if(overlay)overlay.classList.toggle('open',sb.classList.contains('mobile-open'));
  } else {
    const collapsed=sb.classList.toggle('collapsed');
    localStorage.setItem('wt_sidebar_collapsed',collapsed?'1':'0');
  }
}

function closeSidebarMobile(){
  const sb=document.getElementById('sidebar-left');
  const overlay=document.getElementById('sidebar-overlay');
  if(sb)sb.classList.remove('mobile-open');
  if(overlay)overlay.classList.remove('open');
}

function initSidebarState(){
  const sb=document.getElementById('sidebar-left');
  if(!sb)return;
  if(!isMobileLayout()&&localStorage.getItem('wt_sidebar_collapsed')==='1'){
    sb.classList.add('collapsed');
  }
}

// ── RENDER ────────────────────────────────────────────────────────────────────
function setSbActive(id){
  document.querySelectorAll('.sb-item').forEach(el=>el.classList.remove('active'));
  const el=document.getElementById(id);
  if(el)el.classList.add('active');
  if(isMobileLayout())closeSidebarMobile();
}

function showShortsPage(){
  showHome();
  const ff=document.getElementById('feed-filters');
  if(ff)ff.style.display='none';
  const shortsSection0=document.getElementById('shorts-section');
  if(shortsSection0)shortsSection0.style.display='none';
  document.getElementById('slabel').textContent=t('page_shorts');
  const shorts=videos.filter(v=>v.is_short===true&&isDiscoverable(v));
  const g=document.getElementById('grid');
  g.style.display='block';
  if(!shorts.length){
    g.innerHTML=emptyStateHtml('phone','Brak Shorts');
    return;
  }
  g.innerHTML='';
  // Show shorts in vertical grid
  const wrap=document.createElement('div');
  wrap.style.cssText='display:flex;flex-wrap:wrap;gap:12px';
  shorts.forEach(v=>{
    const th=thumbFor(v);
    const el=document.createElement('div');
    el.style.cssText='width:180px;cursor:pointer';
    el.innerHTML=`<div style="position:relative;width:180px;height:320px;background:var(--bg-card);border-radius:12px;overflow:hidden">
      ${th?`<img src="${esc(th)}" style="width:100%;height:100%;object-fit:cover">`:'<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#333;font-size:48px">📱</div>'}
      <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:0;background:rgba(0,0,0,.3);transition:opacity .2s" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0"><div style="width:54px;height:54px;background:rgba(0,0,0,.75);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:22px">▶</div></div>
      <div style="position:absolute;top:8px;left:8px;background:#ff0000;color:var(--text-primary);font-size:10px;font-weight:700;padding:2px 6px;border-radius:4px">SHORT</div>
      <div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(0,0,0,.8));padding:12px 10px 10px">
        <div style="font-size:13px;font-weight:600;color:var(--text-primary);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${esc(v.title)}</div>
        <div style="font-size:11px;color:rgba(255,255,255,.7);margin-top:3px">${v.likes||0} ${likeIcon()} · ${viewsLabel(v)}</div>
      </div>
    </div>`;
    el.onclick=()=>openShortsFeed(v.id);
    wrap.appendChild(el);
  });
  g.appendChild(wrap);
}

function showHome(){
  closeP();
  const mc=document.getElementById('main-content');
  if(mc)mc.style.display='block';
  const sb=document.getElementById('sidebar-left');
  if(sb)sb.style.display='block';
  const mw=document.getElementById('main-wrapper');
  if(mw)mw.style.display='flex';
  document.getElementById('channel-content').classList.remove('open');
  setSbActive('sb-home');
  render();
}

function durationToSeconds(dur){
  if(dur===null||dur===undefined||dur==='')return null;
  if(typeof dur==='number'&&isFinite(dur))return Math.round(dur);
  const parts=String(dur).trim().split(':').map(n=>parseInt(n.trim(),10));
  if(parts.some(isNaN))return null;
  if(parts.length===3)return parts[0]*3600+parts[1]*60+parts[2];
  if(parts.length===2)return parts[0]*60+parts[1];
  if(parts.length===1)return parts[0];
  return null;
}

const CATEGORY_LABEL_KEYS={Gaming:'cat_gaming',Music:'cat_music',Sport:'cat_sport',Vlog:'cat_vlog',Tutorial:'cat_tutorial',Comedy:'cat_humor',Travel:'cat_travel',Education:'cat_education',News:'cat_news',Technology:'cat_tech',Lifestyle:'cat_lifestyle',Food:'cat_food',Other:'cat_other',
  // starsze polskie wartości zapisane w bazie zanim ujednoliciliśmy nazwy na angielskie slugi
  Muzyka:'cat_music',Humor:'cat_humor',Podróże:'cat_travel',Inne:'cat_other'};
function categoryLabel(c){
  const key=CATEGORY_LABEL_KEYS[c];
  return key?t(key):c;
}

const feedFilters={cat:'',dur:'',sort:'newest'};

function toggleFeedFilterMenu(name){
  const wrap=document.getElementById(name+'-filter-wrap');
  const isOpen=wrap.classList.contains('open');
  document.querySelectorAll('.yt-filter.open').forEach(w=>w.classList.remove('open'));
  if(!isOpen)wrap.classList.add('open');
}
document.addEventListener('click',e=>{
  if(!e.target.closest('.yt-filter'))document.querySelectorAll('.yt-filter.open').forEach(w=>w.classList.remove('open'));
});

function selectFeedFilter(name,value,labelKey,labelText,el){
  feedFilters[name]=value;
  document.getElementById(name+'-filter-label').textContent=labelText||t(labelKey);
  const menu=document.getElementById(name+'-filter-menu');
  menu.querySelectorAll('.yt-filter-item').forEach(it=>it.classList.toggle('active',it===el));
  document.getElementById(name+'-filter-wrap').classList.remove('open');
  applyFeedFilters();
}

function populateFeedCategoryOptions(){
  const menu=document.getElementById('cat-filter-menu');
  if(!menu)return;
  const cats=[...new Set(videos.map(v=>v.category).filter(Boolean))].sort((a,b)=>categoryLabel(a).localeCompare(categoryLabel(b),'pl'));
  const key=cats.join('|')+'::'+getLang();
  if(menu.dataset.catsKey===key)return;
  menu.dataset.catsKey=key;
  const current=feedFilters.cat;
  menu.innerHTML=`<div class="yt-filter-item${current?'':' active'}" data-i18n="filter_all_categories" onclick="selectFeedFilter('cat','','filter_all_categories',null,this)">${esc(t('filter_all_categories'))}</div>`
    +cats.map(c=>`<div class="yt-filter-item${current===c?' active':''}" onclick="selectFeedFilter('cat','${jsesc(c)}',null,'${jsesc(categoryLabel(c))}',this)">${esc(categoryLabel(c))}</div>`).join('');
  if(!cats.includes(current))feedFilters.cat='';
}

function applyFeedFiltersToList(list){
  const cat=feedFilters.cat;
  const durFilter=feedFilters.dur;
  const sortMode=feedFilters.sort;

  let out=list;
  if(cat)out=out.filter(v=>v.category===cat);
  if(durFilter){
    out=out.filter(v=>{
      const sec=durationToSeconds(v.dur);
      if(sec===null)return false;
      if(durFilter==='tiny')return sec<60;
      if(durFilter==='short')return sec>=60&&sec<=180;
      if(durFilter==='medium')return sec>180&&sec<=1200;
      if(durFilter==='long')return sec>1200;
      return true;
    });
  }
  out=[...out].sort((a,b)=>{
    if(sortMode==='oldest')return new Date(a.created_at||0)-new Date(b.created_at||0);
    if(sortMode==='popular')return(b.views||0)-(a.views||0);
    if(sortMode==='liked')return(b.likes||0)-(a.likes||0);
    return new Date(b.created_at||0)-new Date(a.created_at||0); // newest (domyślne)
  });
  return out;
}

function applyFeedFilters(){
  render();
}

function renderVideoCards(list,g){
  g.innerHTML='';
  appendVideoCards(list,g);
}

function appendVideoCards(list,g){
  list.forEach(v=>{
    const th=thumbFor(v);
    const uname=getUserName(v);
    const ucol=getUserColor(v.user_id||v.user_email);
    const uav=v.user_avatar?`<img src="${esc(v.user_avatar)}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;cursor:pointer" onclick="event.stopPropagation();showChannel('${jsesc(v.user_id||'')}','${jsesc(uname)}','${jsesc(v.user_avatar||'')}','${jsesc(v.user_email||'')}')">`:`<div class="card-avatar-placeholder" style="background:${ucol}" onclick="event.stopPropagation();showChannel('${jsesc(v.user_id||'')}','${jsesc(uname)}','','${jsesc(v.user_email||'')}')">${uname[0].toUpperCase()}</div>`;
    const el=document.createElement('div');
    el.className='card';
    el.innerHTML=`<div class="thumb">
      ${th?`<img src="${esc(th)}" alt="${esc(v.title)}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div class="no-thumb" style="display:none">🎬</div>`:'<div class="no-thumb">🎬</div>'}
      <div class="play-ov"><div class="pb">▶</div></div>
      ${v.dur?`<div class="dur">${v.dur}</div>`:''}
      ${currentUser&&(currentUser.id===v.user_id||isAdmin())?`<button class="del" onclick="event.stopPropagation();askDelete(${v.id})">🗑</button>`:''}
      ${currentUser&&(currentUser.id===v.user_id||isAdmin())?`<button class="del" style="top:6px;right:40px;background:rgba(30,100,255,.75)" onclick="event.stopPropagation();openEditModal(${v.id})"><svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg></button>`:''}
      <button class="del" style="display:flex;top:6px;left:6px;right:auto" onclick="event.stopPropagation();toggleCardMenu('${jsesc(v.id)}',this)">⋮</button>
    </div>
    <div class="card-bottom">
      ${uav}
      <div class="card-info">
        <h3>${esc(v.title)}</h3>
        <div class="channel-name" style="${v.user_color?`color:${esc(v.user_color)};font-weight:700;`:''}${v.user_font?`font-family:${fontCssFor(v.user_font)};`:''}" onclick="event.stopPropagation();showChannel('${jsesc(v.user_id||'')}','${jsesc(uname)}','${jsesc(v.user_avatar||'')}','${jsesc(v.user_email||'')}')">${esc(uname)}</div>
        <p>${viewsLabel(v)} · ${v.likes||0} ${likeIcon()} · ${relativeDate(v.created_at)}</p>
      </div>
    </div>`;
    el.onclick=()=>openP(v.id);
    g.appendChild(el);
  });
}


// ── PAGINACJA GŁÓWNEGO FEEDU (renderujemy tylko część kart naraz - dużo szybsze
// przy większej liczbie filmów, reszta dogrywa się automatycznie przy scrollu) ──
const FEED_PAGE_SIZE=24;
let feedPageState={list:[],shown:0};
let feedObserver=null;

function loadNextFeedPage(){
  const g=document.getElementById('grid');
  if(!g)return;
  const{list,shown}=feedPageState;
  const next=list.slice(shown,shown+FEED_PAGE_SIZE);
  appendVideoCards(next,g);
  feedPageState.shown+=next.length;
  setupFeedSentinel();
}

function setupFeedSentinel(){
  const g=document.getElementById('grid');
  const old=document.getElementById('feed-sentinel');
  if(old)old.remove();
  if(!g||feedPageState.shown>=feedPageState.list.length)return; // wszystko już pokazane
  const sentinel=document.createElement('div');
  sentinel.id='feed-sentinel';
  sentinel.style.cssText='grid-column:1/-1;height:1px';
  g.appendChild(sentinel);
  if(feedObserver)feedObserver.disconnect();
  feedObserver=new IntersectionObserver(entries=>{
    if(entries[0].isIntersecting){
      feedObserver.disconnect();
      loadNextFeedPage();
    }
  },{rootMargin:'1000px'});
  feedObserver.observe(sentinel);
}

function render(){
  const ff=document.getElementById('feed-filters');
  if(ff)ff.style.display='flex';
  populateFeedCategoryOptions();
  const g0=document.getElementById('grid');
  g0.style.display='grid';
  g0.style.gridTemplateColumns='repeat(auto-fill,minmax(250px,1fr))';
  const q=(document.getElementById('search').value||'').toLowerCase();
  const allVids=(q?videos.filter(v=>v.title.toLowerCase().includes(q)):videos).filter(isDiscoverable);
  const shorts=allVids.filter(v=>v.is_short===true);
  let list=allVids.filter(v=>v.is_short!==true);
  list=applyFeedFiltersToList(list);

  // Shorts - nie pokazujemy na stronie głównej, tylko w osobnej zakładce Shorts
  const shortsSection=document.getElementById('shorts-section');
  if(shortsSection)shortsSection.style.display='none';

  document.getElementById('slabel').textContent=q?`${t('feed_results_for')}: "${q}" (${list.length})`:`${t('feed_all_videos')} (${list.length})`;
  const g=document.getElementById('grid');
  if(feedObserver){feedObserver.disconnect();feedObserver=null;}
  if(!list.length){
    g.innerHTML=emptyStateHtml('film',q?t('feed_no_results'):t('feed_no_videos'));
    return;
  }
  g.innerHTML='';
  feedPageState={list,shown:0};
  loadNextFeedPage();
}


// ── ZAPISANE FILMY (Do obejrzenia później) ──────────────────────────────
let savedVideoIds=new Set();

async function loadSavedVideos(){
  if(!currentUser){savedVideoIds=new Set();return;}
  const{data}=await sb.from('saved_videos').select('video_id').eq('user_id',currentUser.id);
  savedVideoIds=new Set((data||[]).map(r=>String(r.video_id)));
}

async function toggleSaveVideo(videoId){
  if(!currentUser){toast('Zaloguj się żeby zapisywać filmy!');return;}
  const idStr=String(videoId);
  if(savedVideoIds.has(idStr)){
    await sb.from('saved_videos').delete().eq('user_id',currentUser.id).eq('video_id',idStr);
    savedVideoIds.delete(idStr);
    toast('Usunięto z zapisanych');
  } else {
    await sb.from('saved_videos').insert([{user_id:currentUser.id,video_id:idStr}]);
    savedVideoIds.add(idStr);
    toast(t('save_added_label')+'! 💾');
  }
  updateSaveButtonUI(videoId);
}

function updateSaveButtonUI(videoId){
  const idStr=String(videoId);
  const isSaved=savedVideoIds.has(idStr);
  const menuBtn=document.getElementById(`save-menu-label-${idStr}`);
  if(menuBtn)menuBtn.textContent=isSaved?'✅ '+t('save_added_label'):'💾 '+t('save_label');
  const playerBtn=document.getElementById('player-save-btn');
  if(playerBtn&&cur&&String(cur.id)===idStr){
    playerBtn.innerHTML=isSaved
      ?`<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg> ${t('save_added_label')}`
      :`<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/></svg> ${t('save_label')}`;
  }
}

async function showSavedPage(){
  showHome();
  const ff=document.getElementById('feed-filters');
  if(ff)ff.style.display='none';
  const shortsSection=document.getElementById('shorts-section');
  if(shortsSection)shortsSection.style.display='none';
  setSlabel('bookmark',t('page_saved'));
  const g=document.getElementById('grid');
  if(!currentUser){
    g.innerHTML=emptyStateHtml('bookmark',t('saved_login'));
    return;
  }
  await loadSavedVideos();
  const saved=videos.filter(v=>savedVideoIds.has(String(v.id)));
  if(!saved.length){
    g.innerHTML=emptyStateHtml('bookmark',t('saved_empty'),t('saved_empty_sub'));
    return;
  }
  renderVideoCards(saved,g);
}


// ── OBEJRZĘ PÓŹNIEJ ──────────────────────────────────────────────────────
let watchLaterIds=new Set();

async function loadWatchLater(){
  if(!currentUser){watchLaterIds=new Set();return;}
  const{data}=await sb.from('watch_later').select('video_id').eq('user_id',currentUser.id);
  watchLaterIds=new Set((data||[]).map(r=>String(r.video_id)));
}

async function toggleWatchLater(videoId){
  if(!currentUser){toast(t('wl_login_toast'));return;}
  const idStr=String(videoId);
  if(watchLaterIds.has(idStr)){
    await sb.from('watch_later').delete().eq('user_id',currentUser.id).eq('video_id',idStr);
    watchLaterIds.delete(idStr);
    toast(t('wl_removed_toast'));
  } else {
    await sb.from('watch_later').insert([{user_id:currentUser.id,video_id:idStr}]);
    watchLaterIds.add(idStr);
    toast(t('wl_added_toast'));
  }
  updateWatchLaterButtonUI(videoId);
}

function updateWatchLaterButtonUI(videoId){
  const idStr=String(videoId);
  const isSaved=watchLaterIds.has(idStr);
  const menuBtn=document.getElementById(`wl-menu-label-${idStr}`);
  if(menuBtn)menuBtn.textContent=isSaved?'✅ '+t('wl_added_label'):'⏰ '+t('wl_label');
  const playerBtn=document.getElementById('player-wl-btn');
  if(playerBtn&&cur&&String(cur.id)===idStr){
    playerBtn.innerHTML=isSaved
      ?`<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg> ${t('wl_added_label')}`
      :`<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/></svg> ${t('wl_label')}`;
  }
}

async function showWatchLaterPage(){
  showHome();
  const ff=document.getElementById('feed-filters');
  if(ff)ff.style.display='none';
  const shortsSection=document.getElementById('shorts-section');
  if(shortsSection)shortsSection.style.display='none';
  setSlabel('clock',t('page_watchlater'));
  const g=document.getElementById('grid');
  if(!currentUser){
    g.innerHTML=emptyStateHtml('clock',t('wl_login'));
    return;
  }
  await loadWatchLater();
  const list=videos.filter(v=>watchLaterIds.has(String(v.id)));
  if(!list.length){
    g.innerHTML=emptyStateHtml('clock',t('wl_empty'),t('wl_empty_sub'));
    return;
  }
  renderVideoCards(list,g);
}

async function showAnnouncementsPage(){
  showHome();
  const ff=document.getElementById('feed-filters');
  if(ff)ff.style.display='none';
  const shortsSection=document.getElementById('shorts-section');
  if(shortsSection)shortsSection.style.display='none';
  setSlabel('megaphone',t('page_announcements'));
  const g=document.getElementById('grid');
  g.style.display='block';
  g.innerHTML=`<p style="color:var(--text-tertiary);padding:20px;text-align:center">${t('loading_generic')}</p>`;

  localStorage.setItem('wt_last_seen_announcement',new Date().toISOString());
  const dot=document.getElementById('announce-dot');
  if(dot)dot.style.display='none';

  const{data,error}=await sb.from('announcements').select('*').order('created_at',{ascending:false});
  if(error){
    g.innerHTML=emptyStateHtml('megaphone',t('announce_load_error'));
    return;
  }
  announcementsCache=data||[];
  renderAnnouncementsList();
}

function renderAnnouncementsList(){
  const g=document.getElementById('grid');
  if(!announcementsCache.length){
    g.innerHTML=emptyStateHtml('megaphone',t('announce_empty'),t('announce_empty_sub'));
    return;
  }
  g.innerHTML=`<div style="max-width:640px;margin:0 auto;display:flex;flex-direction:column;gap:14px">
    ${announcementsCache.map(a=>renderAnnouncementCard(a)).join('')}
  </div>`;
}

function renderAnnouncementCard(a){
  const voters=a.voters||{};
  const myVote=currentUser?voters[currentUser.id]:null;
  const likes=a.likes||0;
  const dislikes=a.dislikes||0;
  const comments=a.comments||[];
  return`<div style="background:var(--bg-sunken);border:1px solid var(--border-soft);border-radius:12px;padding:18px 20px" id="ann-${a.id}">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
      <svg width="30" height="22" viewBox="0 0 45 32" fill="none"><rect width="45" height="32" rx="9" fill="#3ea6ff"/><polygon points="18,10 31,16 18,22" fill="#fff"/></svg>
      <div style="flex:1">
        <div style="font-size:13px;font-weight:700">WaveTube · Twórca</div>
        <div style="font-size:11px;color:var(--text-tertiary)">${new Date(a.created_at).toLocaleString(localeCode())}</div>
      </div>
      ${isAdmin()?`<button onclick="deleteAnnouncement(${a.id})" title="Usuń ogłoszenie" style="background:none;border:none;color:var(--text-tertiary);cursor:pointer;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px" onmouseover="this.style.background='#3a1414';this.style.color='#ff6b6b'" onmouseout="this.style.background='none';this.style.color='#666'">🗑</button>`:''}
    </div>
    ${a.message?`<div style="font-size:14px;color:var(--text-primary);line-height:1.6;white-space:pre-wrap;margin-bottom:12px">${esc(a.message)}</div>`:''}
    ${a.image?`<img src="${esc(a.image)}" style="width:100%;max-height:360px;object-fit:cover;border-radius:10px;margin-bottom:12px;display:block">`:''}
    ${a.poll?renderAnnouncementPoll(a):''}
    <div style="display:flex;align-items:center;gap:14px;margin-top:12px">
      <button onclick="voteAnnouncement(${a.id},'like')" style="display:flex;align-items:center;gap:6px;background:none;border:none;color:${myVote==='like'?'#3ea6ff':'#aaa'};cursor:pointer;font-size:13px">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/></svg>
        ${likes}
      </button>
      <button onclick="voteAnnouncement(${a.id},'dislike')" style="display:flex;align-items:center;gap:6px;background:none;border:none;color:${myVote==='dislike'?'#ff6b6b':'#aaa'};cursor:pointer;font-size:13px">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style="transform:scaleX(-1) scaleY(-1)"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/></svg>
        ${dislikes}
      </button>
      <button onclick="toggleAnnouncementComments(${a.id})" style="display:flex;align-items:center;gap:6px;background:none;border:none;color:var(--text-secondary);cursor:pointer;font-size:13px">
        💬 ${comments.length}
      </button>
    </div>
    <div id="ann-comments-${a.id}" style="display:none;margin-top:14px;padding-top:14px;border-top:1px solid var(--border-soft)">
      <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:12px">
        ${comments.map(c=>`<div style="display:flex;gap:8px">
          ${c.avatar?`<img src="${esc(c.avatar)}" style="width:28px;height:28px;border-radius:50%;object-fit:cover;flex-shrink:0;cursor:pointer${c.avatar_frame?`;border:2px solid ${esc(c.avatar_frame)};box-sizing:border-box`:''}" onclick="showChannel('${jsesc(c.user_id||'')}','${jsesc(c.user)}','${jsesc(c.avatar||'')}','')">`:`<div style="width:28px;height:28px;border-radius:50%;background:#cc0000;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;cursor:pointer" onclick="showChannel('${jsesc(c.user_id||'')}','${jsesc(c.user)}','','')">${(c.user||'?')[0].toUpperCase()}</div>`}
          <div>
            <div style="font-size:12px;font-weight:600;cursor:pointer${c.name_color?`;color:${esc(c.name_color)}`:''}${c.name_font?`;font-family:${fontCssFor(c.name_font)}`:''}" onclick="showChannel('${jsesc(c.user_id||'')}','${jsesc(c.user)}','${jsesc(c.avatar||'')}','')">${esc(c.user)}</div>
            <div style="font-size:13px${c.text_color?`;color:${esc(c.text_color)}`:';color:var(--text-secondary)'}${c.text_font?`;font-family:${fontCssFor(c.text_font)}`:''}">${esc(c.text)}</div>
          </div>
        </div>`).join('')||`<p style="color:var(--text-tertiary);font-size:12px">${t('ann_no_comments')}</p>`}
      </div>
      ${currentUser?`<div style="display:flex;gap:8px">
        <input id="ann-cinp-${a.id}" placeholder="${t('comment_placeholder')}" style="flex:1;background:var(--bg-sunken);border:1px solid var(--border);border-radius:8px;color:var(--text-primary);padding:8px 12px;font-size:13px;outline:none" onkeydown="if(event.key==='Enter')addAnnouncementComment(${a.id})">
        <button onclick="toggleEmojiPicker('ann-cinp-${a.id}',this)" style="background:none;border:none;color:var(--text-secondary);cursor:pointer;font-size:16px" title="${t('emoji_tooltip')}">😊</button>
        <button onclick="addAnnouncementComment(${a.id})" style="background:#3ea6ff;border:none;color:#0f0f0f;padding:8px 16px;border-radius:8px;cursor:pointer;font-size:12px;font-weight:700">${t('btn_send')}</button>
      </div>`:`<p style="color:var(--text-tertiary);font-size:12px">${t('post_login_comment')}</p>`}
    </div>
  </div>`;
}

function renderAnnouncementPoll(a){
  const poll=a.poll;
  if(!poll)return'';
  const totalVotes=poll.options.reduce((s,o)=>s+(o.votes||0),0);
  const myVote=currentUser?poll.voters?.[currentUser.id]:undefined;
  const hasVoted=myVote!==undefined;
  return`<div style="margin-bottom:12px;background:var(--bg-sunken);border:1px solid var(--border-soft);border-radius:10px;padding:14px">
    <div style="font-size:14px;font-weight:600;margin-bottom:12px">${esc(poll.question)}</div>
    ${poll.options.map((o,oi)=>{
      const pct=totalVotes?Math.round((o.votes||0)/totalVotes*100):0;
      const isMine=hasVoted&&myVote===oi;
      return`<div onclick="voteAnnouncementPoll(${a.id},${oi})" style="position:relative;margin-bottom:8px;cursor:pointer;border-radius:8px;overflow:hidden;background:var(--bg-sunken);border:1px solid ${isMine?'#3ea6ff':'var(--border)'}">
        ${hasVoted?`<div style="position:absolute;inset:0;width:${pct}%;background:${isMine?'rgba(62,166,255,.25)':'rgba(255,255,255,.08)'};transition:width .3s"></div>`:''}
        <div style="position:relative;display:flex;justify-content:space-between;align-items:center;padding:9px 12px;font-size:13px">
          <span style="display:flex;align-items:center;gap:6px">${isMine?'✓ ':''}${esc(o.text)}</span>
          ${hasVoted?`<span style="color:var(--text-secondary);font-size:12px">${pct}% (${o.votes||0})</span>`:''}
        </div>
      </div>`;
    }).join('')}
    <div style="font-size:11px;color:var(--text-tertiary);margin-top:4px">${totalVotes} ${totalVotes===1?'głos':'głosów'}${!currentUser?' · Zaloguj się żeby głosować':''}</div>
  </div>`;
}

async function refreshAnnouncementRow(id){
  const{data}=await sb.from('announcements').select('*').eq('id',id).single();
  if(!data)return;
  const idx=announcementsCache.findIndex(x=>x.id===id);
  if(idx>-1)announcementsCache[idx]=data;
}

async function voteAnnouncementPoll(id,optionIndex){
  if(!currentUser){toast('Zaloguj się żeby zagłosować!');return;}
  const a=announcementsCache.find(x=>x.id===id);
  if(!a||!a.poll)return;
  const{error}=await sb.rpc('vote_announcement_poll',{p_id:id,p_option:optionIndex});
  if(error){toast('Błąd: '+error.message);return;}
  await refreshAnnouncementRow(id);
  renderAnnouncementsList();
}

async function deleteAnnouncement(id){
  if(!isAdmin())return;
  if(!await showConfirm('Usunąć to ogłoszenie?','Zniknie dla wszystkich użytkowników.'))return;
  const{error}=await sb.from('announcements').delete().eq('id',id);
  if(error){toast('Błąd: '+error.message);return;}
  announcementsCache=announcementsCache.filter(a=>a.id!==id);
  renderAnnouncementsList();
  logAdminAction('delete_announcement',`Usunięto ogłoszenie #${id}`);
  toast('Ogłoszenie usunięte 🗑');
}

function toggleAnnouncementComments(id){
  const el=document.getElementById(`ann-comments-${id}`);
  if(el)el.style.display=el.style.display==='none'?'block':'none';
}

async function voteAnnouncement(id,type){
  if(!currentUser){toast('Zaloguj się żeby ocenić!');return;}
  const a=announcementsCache.find(x=>x.id===id);
  if(!a)return;
  const{error}=await sb.rpc('vote_announcement',{p_id:id,p_type:type});
  if(error){toast('Błąd: '+error.message);return;}
  await refreshAnnouncementRow(id);
  renderAnnouncementsList();
}

async function addAnnouncementComment(id){
  if(!currentUser)return;
  const inp=document.getElementById(`ann-cinp-${id}`);
  const text=inp?.value.trim();
  if(!text)return;
  if(!commentCooldownOk())return;
  const a=announcementsCache.find(x=>x.id===id);
  if(!a)return;
  const meta=currentUser.user_metadata;
  const comment={
    user:getMyDisplayName(),
    text,ts:Date.now(),avatar:meta?.avatar_url||'',
    user_id:currentUser.id,name_color:myNameColor||'',name_font:myNameFont||'',avatar_frame:myAvatarFrame||'',text_color:myTextColor||'',text_font:myTextFont||'',emoji_style:myEmojiStyle||''
  };
  const{error}=await sb.rpc('add_announcement_comment',{p_id:id,p_comment:comment});
  if(error){toast('Błąd: '+error.message);return;}
  await refreshAnnouncementRow(id);
  renderAnnouncementsList();
  const el=document.getElementById(`ann-comments-${id}`);
  if(el)el.style.display='block';
}

async function checkNewAnnouncements(){
  const{data}=await sb.from('announcements').select('created_at').order('created_at',{ascending:false}).limit(1);
  const dot=document.getElementById('announce-dot');
  if(!dot||!data||!data.length)return;
  const lastSeen=localStorage.getItem('wt_last_seen_announcement');
  if(!lastSeen||new Date(data[0].created_at)>new Date(lastSeen)){
    dot.style.display='block';
  }
}

async function addToWatchHistory(v){
  if(!currentUser)return;
  await sb.from('watch_history').upsert(
    [{user_id:currentUser.id,video_id:v.id,watched_at:new Date().toISOString()}],
    {onConflict:'user_id,video_id'}
  );
}

async function showHistory(){
  showHome();
  const ff=document.getElementById('feed-filters');
  if(ff)ff.style.display='none';
  const shortsSection1=document.getElementById('shorts-section');
  if(shortsSection1)shortsSection1.style.display='none';
  document.getElementById('slabel').innerHTML=`${t('page_history')} <button onclick="clearHistory()" style="font-size:12px;background:none;border:1px solid #444;color:var(--text-secondary);padding:4px 12px;border-radius:14px;cursor:pointer;margin-left:12px">${t('btn_clear')}</button>`;
  const g=document.getElementById('grid');
  if(!currentUser){
    g.innerHTML=emptyStateHtml('history',t('history_login'));
    return;
  }
  g.innerHTML=`<p style="color:var(--text-tertiary);padding:20px;text-align:center">${t('loading_generic')}</p>`;
  const{data}=await sb.from('watch_history').select('*').eq('user_id',currentUser.id).order('watched_at',{ascending:false}).limit(100);
  const hist=(data||[]).map(h=>{
    const v=videos.find(x=>x.id===h.video_id);
    return v?{...v,watched_at:h.watched_at}:null;
  }).filter(Boolean);
  if(!hist.length){
    g.innerHTML=emptyStateHtml('history',t('history_empty'),t('history_empty_sub'));
    return;
  }
  g.innerHTML='';
  hist.forEach(v=>{
    const th=thumbFor(v);
    const el=document.createElement('div');
    el.className='card';
    el.innerHTML=`<div class="thumb">
      ${th?`<img src="${esc(th)}" alt="${esc(v.title)}" onerror="this.style.display='none'">`:'<div class="no-thumb">🎬</div>'}
      <div class="play-ov"><div class="pb">▶</div></div>
      ${v.dur?`<div class="dur">${v.dur}</div>`:''}
    </div>
    <div class="card-bottom">
      ${v.user_avatar?`<img src="${esc(v.user_avatar)}" class="card-avatar" style="width:36px;height:36px" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`:''}
      <div class="card-avatar-placeholder" style="background:${getUserColor(v.user_id||v.user_email)};width:36px;height:36px;border-radius:50%;display:${v.user_avatar?'none':'flex'};align-items:center;justify-content:center;font-size:13px;font-weight:700;color:var(--text-primary);flex-shrink:0">${esc((getUserName(v)||'?')[0])}</div>
      <div class="card-info">
        <h3>${esc(v.title)}</h3>
        <div class="channel-name">${esc(getUserName(v)||'Anonim')}</div>
        <p style="font-size:11px;color:var(--text-tertiary)">${t('watched_at_label')}: ${new Date(v.watched_at).toLocaleString(localeCode(),{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})}</p>
      </div>
    </div>`;
    el.onclick=()=>openP(v.id);
    g.appendChild(el);
  });
}

async function clearHistory(){
  if(!currentUser)return;
  if(!await showConfirm(t('confirm_clear_history'),t('confirm_clear_history_sub'),t('btn_clear')))return;
  await sb.from('watch_history').delete().eq('user_id',currentUser.id);
  showHistory();
  toast(t('toast_history_cleared'));
}

function showTrending(){
  showHome();
  const ff=document.getElementById('feed-filters');
  if(ff)ff.style.display='none';
  const shortsSection2=document.getElementById('shorts-section');
  if(shortsSection2)shortsSection2.style.display='none';
  setSlabel('flame',t('page_trending'));
  const sorted=[...videos].filter(isDiscoverable).sort((a,b)=>(b.views||0)-(a.views||0));
  const g=document.getElementById('grid');
  g.innerHTML='';
  sorted.forEach(v=>{
    const th=thumbFor(v);
    const uname=getUserName(v);
    const ucol=getUserColor(v.user_id||v.user_email||'');
    const cachedProfile=profileCache[v.user_id||''];
    const avatarUrl=v.user_avatar||cachedProfile?.avatar||'';
    const el=document.createElement('div');
    el.className='card';
    el.innerHTML=`<div class="thumb">
      ${th?`<img src="${esc(th)}" alt="${esc(v.title)}" onerror="this.style.display='none'">`:'<div class="no-thumb">🎬</div>'}
      <div class="play-ov"><div class="pb">▶</div></div>
      ${v.dur?`<div class="dur">${v.dur}</div>`:''}
    </div>
    <div class="card-bottom">
      ${avatarUrl
        ?`<img src="${esc(avatarUrl)}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;flex-shrink:0;cursor:pointer" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" onclick="event.stopPropagation();showChannel('${jsesc(v.user_id||'')}','${jsesc(uname)}','${jsesc(avatarUrl)}','${jsesc(v.user_email||'')}')"><div class="card-avatar-placeholder" style="background:${ucol};display:none;cursor:pointer" onclick="event.stopPropagation();showChannel('${jsesc(v.user_id||'')}','${jsesc(uname)}','','${jsesc(v.user_email||'')}')">${uname[0].toUpperCase()}</div>`
        :`<div class="card-avatar-placeholder" style="background:${ucol};cursor:pointer" onclick="event.stopPropagation();showChannel('${jsesc(v.user_id||'')}','${jsesc(uname)}','','${jsesc(v.user_email||'')}')">${uname[0].toUpperCase()}</div>`
      }
      <div class="card-info"><h3>${esc(v.title)}</h3><div class="channel-name">${esc(uname)}</div><p>${viewsLabel(v)} · ${v.likes||0} ${likeIcon()} · ${relativeDate(v.created_at)}</p></div>
    </div>`;
    el.onclick=()=>openP(v.id);
    g.appendChild(el);
  });
}


// ── KOMENTARZE ────────────────────────────────────────────────────────────────
let commentSortMode='top';

function timeAgo(ts){
  if(!ts)return '';
  const s=Math.floor((Date.now()-ts)/1000);
  const lang=getLang();
  const isRu=lang==='ru',isEn=lang==='en';
  if(s<60)return isRu?'только что':isEn?'just now':'przed chwilą';
  const m=Math.floor(s/60);
  if(m<60)return isRu?`${m} мин назад`:isEn?`${m} min ago`:`${m} min temu`;
  const h=Math.floor(m/60);
  if(h<24)return isRu?`${h} ч назад`:isEn?`${h} hr ago`:`${h} godz. temu`;
  const d=Math.floor(h/24);
  if(d<7)return isRu?`${d} дн назад`:isEn?`${d} days ago`:`${d} dni temu`;
  const w=Math.floor(d/7);
  if(w<4)return isRu?`${w} нед назад`:isEn?`${w} wk ago`:`${w} tyg. temu`;
  const mo=Math.floor(d/30);
  if(mo<12)return isRu?`${mo} мес назад`:isEn?`${mo} mo ago`:`${mo} mies. temu`;
  const y=Math.floor(d/365);
  return isRu?`${y} л назад`:isEn?`${y} yr ago`:`${y} ${y===1?'rok':'lata'} temu`;
}

function toggleSortMenu(){
  const el=document.getElementById('sort-menu');
  if(!el)return;
  el.style.display=el.style.display==='none'||!el.style.display?'block':'none';
}

function setCommentSort(mode){
  commentSortMode=mode;
  document.getElementById('sort-label').textContent=mode==='top'?t('sort_top'):t('sort_newest');
  document.getElementById('sort-menu').style.display='none';
  renderC();
}

document.addEventListener('click',e=>{
  const menu=document.getElementById('sort-menu');
  const btn=document.getElementById('sort-toggle-btn');
  if(menu&&menu.style.display==='block'&&!menu.contains(e.target)&&e.target!==btn&&!btn.contains(e.target)){
    menu.style.display='none';
  }
  const cmenu=document.getElementById('chat-menu');
  if(cmenu&&cmenu.style.display==='block'&&!cmenu.contains(e.target)&&!e.target.closest('.msg-chat-header button')){
    cmenu.style.display='none';
  }
});

// Jedno wspólne źródło sortowania komentarzy — używane wszędzie (render + akcje),
// żeby indeks klikniętego komentarza zawsze wskazywał na właściwy wpis w tablicy.
function getSortedComments(){
  const list=(cur&&cur.comments)||[];
  return[...list].sort((a,b)=>{
    const pin=(b.pinned?1:0)-(a.pinned?1:0);
    if(pin!==0)return pin;
    if(commentSortMode==='newest')return(b.ts||0)-(a.ts||0);
    const likeDiff=(b.likes||0)-(a.likes||0);
    if(likeDiff!==0)return likeDiff;
    return(b.ts||0)-(a.ts||0);
  });
}

async function renderC(){
  closeEmojiPicker();
  closeCmtMenu();
  if(!cur)return;
  const list=cur.comments||[];
  document.getElementById('ctitle').textContent=`${t('comments_label')} (${list.length})`;
  const isVideoOwner=currentUser&&cur&&currentUser.id===cur.user_id;
  const likedComments=new Set(JSON.parse(localStorage.getItem('liked_comments')||'[]'));
  const dislikedComments=new Set(JSON.parse(localStorage.getItem('disliked_comments')||'[]'));
  const sortedList=getSortedComments();
  const uidsForEmoji=[];
  sortedList.forEach(c=>{if(c.user_id)uidsForEmoji.push(c.user_id);(c.replies||[]).forEach(r=>{if(r.user_id)uidsForEmoji.push(r.user_id);});});
  await loadEmojiStylesFor(uidsForEmoji);
  document.getElementById('clist').innerHTML=sortedList.map((c,i)=>{
    const av=c.avatar?`<img src="${esc(c.avatar)}">`:`${(c.user||'?')[0].toUpperCase()}`;
    const uid=c.user_id||'';
    const uemail=c.user_email||'';
    const uavatar=c.avatar||'';
    const isPinned=c.pinned||false;
    const isAuthor=currentUser&&currentUser.id===uid;
    const canDelete=isVideoOwner||isAuthor||isAdmin();
    const canEdit=isAuthor;
    const cid=`${cur.id}_${i}`;
    const liked=likedComments.has(cid);
    const disliked=dislikedComments.has(cid);
    const likes=c.likes||0;
    const replies=c.replies||[];
    const displayTime=c.ts?timeAgo(c.ts):(c.time||'');
    return`<div class="citem" id="citem-${i}" style="${isPinned?'background:#1a2a1a;border-radius:8px;padding:8px 8px 4px;margin-bottom:8px':'margin-bottom:16px'}">
      ${isPinned?`<div style="color:#3ea6ff;font-size:11px;margin-bottom:6px;display:flex;align-items:center;gap:4px"><svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M17 4v7l2 3H5l2-3V4h10m0-2H7c-.55 0-1 .45-1 1v1H5v2h1v5.5L4 14v2h7v5h2v-5h7v-2l-2-2.5V6h1V4h-1V3c0-.55-.45-1-1-1z"/></svg> ${t('cmt_pinned_badge')}</div>`:''}
      <div class="cav" style="${c.avatar?'':'background:'+( c.col||colors[i%colors.length])};cursor:pointer;flex-shrink:0${c.avatar_frame?`;border:2px solid ${esc(c.avatar_frame)};box-sizing:border-box`:''}" onclick="closeP();showChannel('${jsesc(uid)}','${jsesc(c.user)}','${jsesc(uavatar)}','${jsesc(uemail)}')">${av}</div>
      <div class="cbody" style="flex:1;min-width:0">
        <div class="cname" style="display:flex;align-items:center;gap:4px;flex-wrap:wrap;justify-content:space-between;margin-bottom:4px">
          <div style="display:flex;align-items:center;gap:4px;flex-wrap:wrap">
            <span style="cursor:pointer;font-weight:600;font-size:14px${c.name_color?`;color:${esc(c.name_color)}`:''}${c.name_font?`;font-family:${fontCssFor(c.name_font)}`:''}" onclick="closeP();showChannel('${jsesc(uid)}','${jsesc(c.user)}','${jsesc(uavatar)}','${jsesc(uemail)}')">${esc(c.user)}</span>${verifiedBadge(uemail||'',uid)}
            <span style="color:var(--text-secondary);font-weight:400;font-size:11px">${displayTime}${c.edited?` <span style=\"color:var(--text-tertiary)\">${t('cmt_edited')}</span>`:''}</span>
          </div>
          <div style="display:flex;gap:4px;position:relative">
            ${(isVideoOwner||canEdit||canDelete||(isAdmin()&&!isAuthor&&uid))?`
            <button id="cmtdots-${i}" onclick="event.stopPropagation();toggleCmtMenu(this,'cmenu-${i}')" class="cmt-icon-btn" title="${t('cmt_more_title')}">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><circle cx="12" cy="6" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="18" r="2"/></svg>
            </button>
            <div id="cmenu-${i}" class="cmt-dropdown" style="display:none">
              ${isVideoOwner?`<div class="cmt-dropdown-item" onclick="closeCmtMenu();togglePinComment(${i})">
                <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><path d="M17 4v7l2 3H5l2-3V4h10m0-2H7c-.55 0-1 .45-1 1v1H5v2h1v5.5L4 14v2h7v5h2v-5h7v-2l-2-2.5V6h1V4h-1V3c0-.55-.45-1-1-1z"/></svg>
                ${isPinned?t('cmt_unpin'):t('cmt_pin')}
              </div>`:''}
              ${canEdit?`<div class="cmt-dropdown-item" onclick="closeCmtMenu();toggleEditComment(${i})">
                <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                ${t('cmt_edit')}
              </div>`:''}
              ${isAdmin()&&!isAuthor&&uid?`<div class="cmt-dropdown-item" onclick="closeCmtMenu();toggleMuteMenu('${jsesc(uid)}',document.getElementById('cmtdots-${i}'))">
                <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.42.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
                ${t('cmt_mute_user')}
              </div>`:''}
              ${canDelete?`<div class="cmt-dropdown-item cmt-dropdown-item-red" onclick="closeCmtMenu();deleteComment(${i})">
                <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                ${t('confirm_delete_default')}
              </div>`:''}
            </div>`:''}
          </div>
        </div>
        <div class="ctext" id="ctext-${i}" style="margin-bottom:8px;font-size:15px;line-height:1.5${c.text_color?`;color:${esc(c.text_color)}`:''}${c.text_font?`;font-family:${fontCssFor(c.text_font)}`:''}">${esc(c.text)}</div>
        <div id="cedit-${i}" style="display:none;margin-bottom:8px">
          <input id="cedit-inp-${i}" value="${(c.text||'').replace(/"/g,'&quot;')}" style="width:100%;background:transparent;border:none;border-bottom:1px solid #444;color:var(--text-primary);padding:6px 0;font-size:14px;outline:none">
          <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:6px">
            <button onclick="toggleEditComment(${i})" style="background:none;border:none;color:var(--text-secondary);padding:6px 12px;border-radius:16px;cursor:pointer;font-size:12px">${t('btn_cancel')}</button>
            <button onclick="saveEditComment(${i})" style="background:#3ea6ff;border:none;color:#0f0f0f;padding:6px 14px;border-radius:16px;cursor:pointer;font-size:12px;font-weight:700">${t('btn_save')}</button>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:4px;flex-wrap:wrap">
          <button onclick="likeComment(${i})" style="display:flex;align-items:center;gap:4px;background:none;border:none;color:${liked?'var(--text-primary)':'#aaa'};cursor:pointer;font-size:12px;padding:4px 8px;border-radius:16px;transition:background .1s" onmouseover="this.style.background='var(--border-soft)'" onmouseout="this.style.background='none'">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="${liked?'currentColor':'none'}" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/></svg>
            ${likes>0?likes:''}
          </button>
          <button onclick="dislikeComment(${i})" style="display:flex;align-items:center;gap:4px;background:none;border:none;color:${disliked?'var(--text-primary)':'#aaa'};cursor:pointer;font-size:12px;padding:4px 8px;border-radius:16px;transition:background .1s" onmouseover="this.style.background='var(--border-soft)'" onmouseout="this.style.background='none'">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="${disliked?'currentColor':'none'}" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z"/></svg>
          </button>
          <button onclick="toggleReplyForm(${i})" style="background:none;border:none;color:var(--text-secondary);cursor:pointer;font-size:12px;font-weight:600;padding:4px 8px;border-radius:16px" onmouseover="this.style.background='var(--border-soft)';this.style.color='#fff'" onmouseout="this.style.background='none';this.style.color='#aaa'">${t('btn_reply')}</button>
        </div>
        <div id="reply-form-${i}" style="display:none;margin-top:10px;display:none">
          <div style="display:flex;gap:8px;align-items:flex-start">
            ${currentUser&&currentUser.user_metadata?.avatar_url?`<img src="${esc(currentUser.user_metadata.avatar_url)}" style="width:28px;height:28px;border-radius:50%;object-fit:cover;flex-shrink:0">`:`<div style="width:28px;height:28px;border-radius:50%;background:#cc0000;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:var(--text-primary);flex-shrink:0">${currentUser?(currentUser.user_metadata?.full_name||currentUser.email||'?')[0].toUpperCase():'?'}</div>`}
            <div style="flex:1">
              <input id="reply-inp-${i}" placeholder="${t('cmt_reply_placeholder')}" style="width:100%;background:transparent;border:none;border-bottom:1px solid #444;color:var(--text-primary);padding:6px 0;font-size:13px;outline:none">
              <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:6px">
                <button onclick="toggleEmojiPicker('reply-inp-${i}',this)" style="background:none;border:none;color:var(--text-secondary);cursor:pointer;font-size:16px;margin-right:auto" title="${t('emoji_tooltip')}">😊</button>
                <button onclick="toggleReplyForm(${i})" style="background:none;border:none;color:var(--text-secondary);padding:6px 12px;border-radius:16px;cursor:pointer;font-size:12px">${t('btn_cancel')}</button>
                <button onclick="postReply(${i})" style="background:#3ea6ff;border:none;color:#0f0f0f;padding:6px 14px;border-radius:16px;cursor:pointer;font-size:12px;font-weight:700">${t('btn_reply')}</button>
              </div>
            </div>
          </div>
        </div>
        ${replies.length?`<div style="margin-top:10px">
          <button onclick="toggleReplies(${i})" style="background:none;border:none;color:#3ea6ff;cursor:pointer;font-size:13px;font-weight:600;padding:4px 0;display:flex;align-items:center;gap:4px">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
            ${replies.length} ${t('cmt_replies_label')}
          </button>
          <div id="replies-${i}" style="display:none;margin-top:8px;padding-left:4px;border-left:2px solid var(--border-soft)">
            ${replies.map((r,ri)=>{
              const replyIsAuthor=currentUser&&currentUser.id===r.user_id;
              const replyCanDelete=isVideoOwner||replyIsAuthor||isAdmin();
              return`<div style="display:flex;gap:10px;margin-bottom:12px">
              ${r.avatar?`<img src="${esc(r.avatar)}" style="width:28px;height:28px;border-radius:50%;object-fit:cover;flex-shrink:0${r.avatar_frame?`;border:2px solid ${esc(r.avatar_frame)};box-sizing:border-box`:''}">`:`<div style="width:28px;height:28px;border-radius:50%;background:#cc0000;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:var(--text-primary);flex-shrink:0">${(r.user||'?')[0]}</div>`}
              <div style="flex:1">
                <div style="font-size:12px;font-weight:600;display:flex;align-items:center;gap:4px;justify-content:space-between">
                  <span style="display:flex;align-items:center;gap:4px"><span style="${r.name_color?`color:${esc(r.name_color)};`:''}${r.name_font?`font-family:${fontCssFor(r.name_font)};`:''}">${esc(r.user)}</span>${verifiedBadge(r.user_email||'',r.user_id)} <span style="color:var(--text-secondary);font-weight:400;font-size:11px">${r.ts?timeAgo(r.ts):(r.time||'')}</span></span>
                  <span style="display:flex;gap:2px">
                    ${isAdmin()&&!replyIsAuthor&&r.user_id?`<button onclick="event.stopPropagation();toggleMuteMenu('${jsesc(r.user_id)}',this)" title="${t('cmt_mute_user')}" class="cmt-icon-btn" style="width:26px;height:26px;font-size:12px">🔇</button>`:''}
                    ${replyCanDelete?`<button onclick="deleteReply(${i},${ri})" title="${t('confirm_delete_default')}" class="cmt-icon-btn" style="width:26px;height:26px;font-size:12px">🗑</button>`:''}
                  </span>
                </div>
                <div id="rtext-${i}-${ri}" style="font-size:13px;margin-top:2px${r.text_color?`;color:${esc(r.text_color)}`:';color:var(--text-secondary)'}${r.text_font?`;font-family:${fontCssFor(r.text_font)}`:''}">${esc(r.text)}</div>
              </div>
            </div>`;
            }).join('')}
          </div>
        </div>`:''}
      </div>
    </div>`;
  }).join('');
  sortedList.forEach((c,i)=>{
    const ces=emojiStyleCache[c.user_id];
    if(ces==='flat')applyEmojiStyleToEl(document.getElementById(`ctext-${i}`));
    else if(ces==='app')applyAppEmojiStyleToEl(document.getElementById(`ctext-${i}`));
    (c.replies||[]).forEach((r,ri)=>{
      const res=emojiStyleCache[r.user_id];
      if(res==='flat')applyEmojiStyleToEl(document.getElementById(`rtext-${i}-${ri}`));
      else if(res==='app')applyAppEmojiStyleToEl(document.getElementById(`rtext-${i}-${ri}`));
    });
  });
}

function toggleReplyForm(i){
  const form=document.getElementById(`reply-form-${i}`);
  if(!form)return;
  const isHidden=form.style.display==='none'||!form.style.display;
  form.style.display=isHidden?'block':'none';
  if(isHidden)setTimeout(()=>{const inp=document.getElementById(`reply-inp-${i}`);if(inp)inp.focus();},50);
}

function toggleReplies(i){
  const el=document.getElementById(`replies-${i}`);
  if(!el)return;
  el.style.display=el.style.display==='none'?'block':'none';
}

async function likeComment(index){
  if(!currentUser){toast('Zaloguj się żeby polubić!');return;}
  if(!cur)return;
  const cid=`${cur.id}_${index}`;
  const liked=new Set(JSON.parse(localStorage.getItem('liked_comments')||'[]'));
  const disliked=new Set(JSON.parse(localStorage.getItem('disliked_comments')||'[]'));
  const sortedList=getSortedComments();
  const c=sortedList[index];
  if(!c)return;
  const origIdx=(cur.comments||[]).findIndex(x=>x.user===c.user&&x.text===c.text&&x.time===c.time);
  if(liked.has(cid)){liked.delete(cid);cur.comments[origIdx].likes=Math.max(0,(cur.comments[origIdx].likes||0)-1);}
  else{liked.add(cid);cur.comments[origIdx].likes=(cur.comments[origIdx].likes||0)+1;disliked.delete(cid);}
  localStorage.setItem('liked_comments',JSON.stringify([...liked]));
  localStorage.setItem('disliked_comments',JSON.stringify([...disliked]));
  await sb.rpc('set_comment_likes',{v_id:cur.id,c_index:origIdx,new_likes:cur.comments[origIdx].likes});
  const v=videos.find(x=>x.id===cur.id);if(v)v.comments=cur.comments;
  renderC();
}

async function dislikeComment(index){
  if(!currentUser){toast('Zaloguj się!');return;}
  if(!cur)return;
  const cid=`${cur.id}_${index}`;
  const liked=new Set(JSON.parse(localStorage.getItem('liked_comments')||'[]'));
  const disliked=new Set(JSON.parse(localStorage.getItem('disliked_comments')||'[]'));
  const sortedList=getSortedComments();
  const c=sortedList[index];
  if(!c)return;
  const origIdx=(cur.comments||[]).findIndex(x=>x.user===c.user&&x.text===c.text&&x.time===c.time);
  if(disliked.has(cid)){disliked.delete(cid);}
  else{disliked.add(cid);liked.delete(cid);cur.comments[origIdx].likes=Math.max(0,(cur.comments[origIdx].likes||0)-(liked.has(cid)?1:0));}
  localStorage.setItem('liked_comments',JSON.stringify([...liked]));
  localStorage.setItem('disliked_comments',JSON.stringify([...disliked]));
  renderC();
}

async function postReply(index){
  if(!currentUser){toast('Zaloguj się!');return;}
  if(isMutedNow()){toast(muteToastMsg());return;}
  if(!cur)return;
  const inp=document.getElementById(`reply-inp-${index}`);
  const txt=inp?.value.trim();
  if(!txt)return;
  if(!commentCooldownOk())return;
  const meta=currentUser.user_metadata;
  const now=new Date().toLocaleString(localeCode(),{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
  const sortedList=getSortedComments();
  const c=sortedList[index];
  if(!c)return;
  const origIdx=(cur.comments||[]).findIndex(x=>x.user===c.user&&x.text===c.text&&x.time===c.time);
  const newR={user:getMyDisplayName(),text:txt,time:now,ts:Date.now(),avatar:meta?.avatar_url||'',user_email:currentUser.email,user_id:currentUser.id,name_color:myNameColor||'',name_font:myNameFont||'',avatar_frame:myAvatarFrame||'',text_color:myTextColor||'',text_font:myTextFont||'',emoji_style:myEmojiStyle||''};
  inp.value='';
  const{error}=await sb.rpc('add_video_comment_reply',{p_id:cur.id,c_index:origIdx,r:newR});
  if(error){toast('Błąd: '+error.message);return;}
  if(!cur.comments[origIdx].replies)cur.comments[origIdx].replies=[];
  cur.comments[origIdx].replies.push(newR);
  const v=videos.find(x=>x.id===cur.id);if(v)v.comments=cur.comments;
  renderC();
  // Auto-show replies
  setTimeout(()=>{const el=document.getElementById(`replies-${index}`);if(el)el.style.display='block';},100);
}

async function togglePinComment(index){
  if(!cur||!currentUser||currentUser.id!==cur.user_id)return;
  const list=cur.comments||[];
  // Find the actual comment in original list (before sort)
  const sortedList=getSortedComments();
  const comment=sortedList[index];
  if(!comment)return;
  const origIndex=list.findIndex(c=>c.user===comment.user&&c.text===comment.text&&c.time===comment.time);
  if(origIndex===-1)return;
  const{error}=await sb.rpc('toggle_video_comment_pin',{p_id:cur.id,c_index:origIndex});
  if(error){toast('Błąd: '+error.message);return;}
  list[origIndex].pinned=!list[origIndex].pinned;
  cur.comments=list;
  const v=videos.find(x=>x.id===cur.id);
  if(v)v.comments=list;
  renderC();
  toast(list[origIndex].pinned?'Komentarz przypięty 📌':'Komentarz odpięty');
}

async function deleteComment(index){
  if(!cur||!currentUser)return;
  const sortedList=getSortedComments();
  const comment=sortedList[index];
  if(!comment)return;
  const isOwner=currentUser.id===cur.user_id;
  const isAuthor=currentUser.id===comment.user_id;
  if(!isOwner&&!isAuthor&&!isAdmin()){toast('Nie możesz usunąć tego komentarza');return;}
  if(!await showConfirm('Usunąć komentarz?','Ta czynność jest nieodwracalna.'))return;
  const origIdx=(cur.comments||[]).findIndex(c=>c.user===comment.user&&c.text===comment.text&&c.time===comment.time);
  if(origIdx===-1)return;
  const{error}=await sb.rpc('delete_video_comment',{p_id:cur.id,c_index:origIdx});
  if(error){toast('Błąd: '+error.message);return;}
  const list=cur.comments.filter((_,i)=>i!==origIdx);
  cur.comments=list;
  const v=videos.find(x=>x.id===cur.id);
  if(v)v.comments=list;
  renderC();
  toast('Komentarz usunięty');
}

async function deleteReply(commentIndex,replyIndex){
  if(!cur||!currentUser)return;
  const sortedList=getSortedComments();
  const comment=sortedList[commentIndex];
  if(!comment||!comment.replies)return;
  const reply=comment.replies[replyIndex];
  if(!reply)return;
  const isVideoOwner=currentUser.id===cur.user_id;
  const isReplyAuthor=currentUser.id===reply.user_id;
  if(!isVideoOwner&&!isReplyAuthor&&!isAdmin()){toast('Nie możesz usunąć tej odpowiedzi');return;}
  if(!await showConfirm('Usunąć odpowiedź?','Ta czynność jest nieodwracalna.'))return;
  const origIdx=(cur.comments||[]).findIndex(c=>c.user===comment.user&&c.text===comment.text&&c.time===comment.time);
  if(origIdx===-1)return;
  const{error}=await sb.rpc('delete_video_comment_reply',{p_id:cur.id,c_index:origIdx,r_index:replyIndex});
  if(error){toast('Błąd: '+error.message);return;}
  cur.comments[origIdx].replies=cur.comments[origIdx].replies.filter((r,idx)=>idx!==replyIndex);
  const v=videos.find(x=>x.id===cur.id);
  if(v)v.comments=cur.comments;
  renderC();
  toast('Odpowiedź usunięta');
}

function toggleEditComment(index){
  const textEl=document.getElementById(`ctext-${index}`);
  const editEl=document.getElementById(`cedit-${index}`);
  if(!textEl||!editEl)return;
  const isEditing=editEl.style.display==='block';
  editEl.style.display=isEditing?'none':'block';
  textEl.style.display=isEditing?'block':'none';
  if(!isEditing)setTimeout(()=>{const inp=document.getElementById(`cedit-inp-${index}`);if(inp){inp.focus();inp.setSelectionRange(inp.value.length,inp.value.length);}},50);
}

async function saveEditComment(index){
  if(!cur||!currentUser)return;
  const sortedList=getSortedComments();
  const comment=sortedList[index];
  if(!comment)return;
  if(currentUser.id!==comment.user_id){toast('Możesz edytować tylko swoje komentarze');return;}
  const inp=document.getElementById(`cedit-inp-${index}`);
  const newText=inp?.value.trim();
  if(!newText)return;
  const origIdx=(cur.comments||[]).findIndex(x=>x.user===comment.user&&x.text===comment.text&&x.time===comment.time);
  if(origIdx===-1)return;
  const{error}=await sb.rpc('edit_video_comment',{p_id:cur.id,c_index:origIdx,new_text:newText});
  if(error){toast('Błąd: '+error.message);return;}
  cur.comments[origIdx].text=newText;
  cur.comments[origIdx].edited=true;
  const v=videos.find(x=>x.id===cur.id);if(v)v.comments=cur.comments;
  renderC();
  toast('Komentarz zaktualizowany');
}

let lastCommentAt=0;
function commentCooldownOk(){
  const now=Date.now();
  if(now-lastCommentAt<3000){toast('Zwolnij trochę — poczekaj chwilę przed kolejnym komentarzem 🐢');return false;}
  lastCommentAt=now;
  return true;
}

async function postC(){
  if(!currentUser){toast('Zaloguj się żeby pisać komentarze!');return;}
  if(isMutedNow()){toast(muteToastMsg());return;}
  if(!cur)return;
  const t=document.getElementById('cinp').value.trim();
  if(!t)return;
  if(!commentCooldownOk())return;
  const meta=currentUser.user_metadata;
  const now=new Date().toLocaleString(localeCode(),{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
  const newC={user:getMyDisplayName(),text:t,time:now,ts:Date.now(),col:'#cc0000',avatar:meta?.avatar_url||'',user_id:currentUser.id||'',user_email:currentUser.email||'',name_color:myNameColor||'',name_font:myNameFont||'',avatar_frame:myAvatarFrame||'',text_color:myTextColor||'',text_font:myTextFont||'',emoji_style:myEmojiStyle||''};
  document.getElementById('cinp').value='';
  const{error}=await sb.rpc('add_video_comment',{p_id:cur.id,c:newC});
  if(error){toast('Błąd: '+error.message);return;}
  cur.comments=[newC,...(cur.comments||[])];
  const v=videos.find(x=>x.id===cur.id);if(v)v.comments=cur.comments;
  renderC();render();
}


// ── INIT ──────────────────────────────────────────────────────────────────────
async function editDesc(key){
  const wrap=document.getElementById('ch-desc-wrap');
  let current=localStorage.getItem('desc_'+key)||'';
  if(currentUser&&currentUser.id===key){
    const{data}=await sb.from('profiles').select('description').eq('id',key).single();
    if(data&&data.description)current=data.description;
  }
  wrap.innerHTML=`<textarea id="desc-inp" maxlength="1000" style="width:100%;background:var(--bg-card);border:1px solid #444;border-radius:8px;color:var(--text-primary);padding:8px;font-size:13px;resize:none;outline:none;margin-bottom:6px" rows="2" placeholder="${t('desc_placeholder')}">${current}</textarea>
  <div style="display:flex;gap:8px">
    <button onclick="saveDesc('${jsesc(key)}')" style="background:#cc0000;border:none;color:var(--text-primary);padding:6px 14px;border-radius:16px;cursor:pointer;font-size:12px;font-weight:600">${t('btn_save')}</button>
    <button onclick="showMyChannel()" style="background:var(--border-soft);border:none;color:var(--text-primary);padding:6px 14px;border-radius:16px;cursor:pointer;font-size:12px">${t('btn_cancel')}</button>
  </div>`;
  document.getElementById('desc-inp').focus();
}

async function saveDesc(key){
  const val=document.getElementById('desc-inp').value.trim();
  localStorage.setItem('desc_'+key,val);
  if(currentUser&&currentUser.id===key){
    const{error}=await sb.from('profiles').upsert([{id:key,description:val}],{onConflict:'id'});
    if(error){toast('Błąd zapisu: '+error.message);return;}
    if(profileCache[key])profileCache[key].description=val;
  }
  toast(t('desc_saved_toast'));
  showMyChannel();
}

// ── BANER: PODGLĄD + PRZESUWANIE (jak na YouTube) ──────────────────────────
let bcState=null; // {img, key, frameW, frameH, scale, offsetX, offsetY, naturalW, naturalH}

function changeBanner(e, key){
  const file=e.target.files[0];if(!file)return;
  if(file.size>8*1024*1024){toast('Zdjęcie za duże! Maksymalnie 8MB');return;}
  const img=new Image();
  img.onload=()=>{
    document.getElementById('banner-crop-modal').classList.add('open');
    const frame=document.getElementById('banner-crop-frame');
    const frameW=frame.clientWidth,frameH=frame.clientHeight;
    const scale=Math.max(frameW/img.naturalWidth,frameH/img.naturalHeight);
    bcState={
      img,key,frameW,frameH,scale,
      naturalW:img.naturalWidth,naturalH:img.naturalHeight,
      offsetX:(frameW-img.naturalWidth*scale)/2,
      offsetY:(frameH-img.naturalHeight*scale)/2,
      dragging:false,dragStartX:0,dragStartY:0,startOffX:0,startOffY:0
    };
    const imgEl=document.getElementById('banner-crop-img');
    imgEl.src=img.src;
    applyBannerCropTransform();
  };
  img.onerror=()=>toast('Nie udało się wczytać zdjęcia');
  img.src=URL.createObjectURL(file);
  e.target.value='';
}

function applyBannerCropTransform(){
  if(!bcState)return;
  const imgEl=document.getElementById('banner-crop-img');
  imgEl.style.width=(bcState.naturalW*bcState.scale)+'px';
  imgEl.style.height=(bcState.naturalH*bcState.scale)+'px';
  imgEl.style.transform=`translate(${bcState.offsetX}px,${bcState.offsetY}px)`;
}

function clampBannerOffset(){
  if(!bcState)return;
  const w=bcState.naturalW*bcState.scale,h=bcState.naturalH*bcState.scale;
  bcState.offsetX=Math.min(0,Math.max(bcState.frameW-w,bcState.offsetX));
  bcState.offsetY=Math.min(0,Math.max(bcState.frameH-h,bcState.offsetY));
}

(function initBannerCropDrag(){
  const frame=document.getElementById('banner-crop-frame');
  if(!frame)return;
  const start=(x,y)=>{
    if(!bcState)return;
    bcState.dragging=true;
    bcState.dragStartX=x;bcState.dragStartY=y;
    bcState.startOffX=bcState.offsetX;bcState.startOffY=bcState.offsetY;
    frame.style.cursor='grabbing';
  };
  const move=(x,y)=>{
    if(!bcState||!bcState.dragging)return;
    bcState.offsetX=bcState.startOffX+(x-bcState.dragStartX);
    bcState.offsetY=bcState.startOffY+(y-bcState.dragStartY);
    clampBannerOffset();
    applyBannerCropTransform();
  };
  const end=()=>{
    if(bcState)bcState.dragging=false;
    frame.style.cursor='grab';
  };
  frame.addEventListener('mousedown',e=>start(e.clientX,e.clientY));
  window.addEventListener('mousemove',e=>move(e.clientX,e.clientY));
  window.addEventListener('mouseup',end);
  frame.addEventListener('touchstart',e=>{if(e.touches[0])start(e.touches[0].clientX,e.touches[0].clientY);},{passive:true});
  window.addEventListener('touchmove',e=>{if(e.touches[0])move(e.touches[0].clientX,e.touches[0].clientY);},{passive:true});
  window.addEventListener('touchend',end);
})();

function closeBannerCropModal(){
  document.getElementById('banner-crop-modal').classList.remove('open');
  bcState=null;
}

async function saveBannerCrop(){
  if(!bcState)return;
  const{img,key,frameW,frameH,scale,offsetX,offsetY}=bcState;
  const outW=1920,outH=480;
  const canvas=document.createElement('canvas');
  canvas.width=outW;canvas.height=outH;
  const ctx=canvas.getContext('2d');
  const ratio=outW/frameW; // frame->output
  const drawScale=scale*ratio;
  ctx.drawImage(img,offsetX*ratio,offsetY*ratio,img.naturalWidth*drawScale,img.naturalHeight*drawScale);
  const compressed=canvas.toDataURL('image/jpeg',0.85);

  const el=document.getElementById('channel-banner');
  if(el){
    el.style.background='url('+compressed+') center/cover no-repeat';
  }
  try{localStorage.setItem('banner_'+key,compressed);}
  catch(err){try{localStorage.setItem('banner_'+key,compressed.substring(0,500000)||'');}catch(e2){}}
  if(currentUser){
    const{error}=await sb.from('profiles').update({banner_url:compressed}).eq('id',currentUser.id);
    if(error)toast('Baner zapisany lokalnie, ale nie na serwerze ⚠️');
  }
  toast('Baner zmieniony! 🎨');
  closeBannerCropModal();
}


// ── POWIADOMIENIA ─────────────────────────────────────────────────────────────
// ── ZEZWALAJ NA POWIADOMIENIA ───────────────────────────────────────────────
async function loadAllowNotifIntoSettings(){
  const el=document.getElementById('allownotif-toggle');
  if(!el||!currentUser)return;
  const{data}=await sb.from('profiles').select('allow_notifications').eq('id',currentUser.id).single();
  el.classList.toggle('on',data?.allow_notifications!==false);
}
async function toggleAllowNotifications(){
  if(!currentUser)return;
  const el=document.getElementById('allownotif-toggle');
  const{data}=await sb.from('profiles').select('allow_notifications').eq('id',currentUser.id).single();
  const newVal=!(data?.allow_notifications!==false);
  await sb.from('profiles').upsert([{id:currentUser.id,allow_notifications:newVal}],{onConflict:'id'});
  if(el)el.classList.toggle('on',newVal);
}

let notificationsList=[];

async function loadNotifications(){
  if(!currentUser)return;
  const{data}=await sb.from('notifications').select('*').eq('user_id',currentUser.id).order('created_at',{ascending:false}).limit(50);
  notificationsList=data||[];
  updateNotifBadge();
}

function updateNotifBadge(){
  const unread=notificationsList.filter(n=>!n.read).length;
  const badge=document.getElementById('notif-badge');
  if(badge){badge.style.display=unread>0?'flex':'none';badge.textContent=unread>9?'9+':unread;}
}

async function clearAllNotifications(){
  if(!currentUser)return;
  if(!notificationsList.length){toast(t('notif_clear_empty_toast'));return;}
  if(!await showConfirm(t('confirm_clear_notifications'),t('confirm_clear_notifications_sub'),t('btn_clear')))return;
  await sb.from('notifications').delete().eq('user_id',currentUser.id);
  notificationsList=[];
  updateNotifBadge();
  renderNotifications();
  toast(t('notif_cleared_toast'));
}

async function toggleNotifications(){
  const dd=document.getElementById('notif-dropdown');
  dd.classList.toggle('open');
  if(dd.classList.contains('open')){
    await loadNotifications();
    renderNotifications();
    // mark all as read
    if(currentUser){
      await sb.from('notifications').update({read:true}).eq('user_id',currentUser.id).eq('read',false);
      notificationsList.forEach(n=>n.read=true);
      updateNotifBadge();
    }
  }
}

function notifText(n){
  const ic=s=>`<span style="display:inline-flex;vertical-align:-2px;margin-left:4px;color:#fff">${s}</span>`;
  const strip=s=>s.replace(/\s*[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]\s*$/u,'');
  if(n.type==='subscribe')return`<b>${esc(n.sender_name||'')}</b> ${strip(t('notif_subscribed'))}${ic(subsIcon(14))}`;
  if(n.type==='new_post')return`<b>${esc(n.sender_name||'')}</b> ${strip(t('post_new_notification'))}${ic(postIcon(14))}`;
  if(n.type==='new_video')return`<b>${esc(n.sender_name||'')}</b> ${strip(t('notif_new_video'))}${ic(videosIcon(14))}`;
  return safeNotifHtml(n.message);
}
function renderNotifications(){
  const list=document.getElementById('notif-list');
  if(!notificationsList.length){list.innerHTML=`<div class="notif-empty">${t('notif_empty')}</div>`;return;}
  list.innerHTML=notificationsList.map(n=>`
    <div class="notif-item${n.read?'':' unread'}" style="position:relative" onclick="handleNotifClick('${jsesc(n.id)}','${jsesc(n.sender_id||'')}','${jsesc(n.sender_name||'')}','${jsesc(n.sender_avatar||'')}','${jsesc(n.sender_email||'')}')">
      ${(n.sender_avatar||n.avatar)?`<img class="notif-av" src="${esc(n.sender_avatar||n.avatar)}">`:`<div class="notif-av-ph" style="background:#cc0000;display:flex;align-items:center;justify-content:center"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg></div>`}
      <div>
        <div class="notif-text">${notifText(n)}</div>
        <div class="notif-time">${new Date(n.created_at).toLocaleString(localeCode(),{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</div>
      </div>
      <button type="button" onclick="event.stopPropagation();event.preventDefault();deleteNotification('${jsesc(n.id)}')" aria-label="${t('notif_delete_one')}" style="position:absolute;top:8px;right:8px;background:none;border:none;color:var(--text-tertiary);cursor:pointer;font-size:16px;line-height:1;padding:6px;z-index:5">✕</button>
    </div>`).join('');
}

async function deleteNotification(notifId){
  if(!currentUser)return;
  const{error}=await sb.from('notifications').delete().eq('id',notifId).eq('user_id',currentUser.id);
  if(error){console.error('[WaveTube] deleteNotification failed:',error);toast('Błąd: '+error.message);return;}
  notificationsList=notificationsList.filter(n=>String(n.id)!==String(notifId));
  updateNotifBadge();
  renderNotifications();
}

function handleNotifClick(notifId,senderId,senderName,senderAvatar,senderEmail){
  document.getElementById('notif-dropdown').classList.remove('open');
  if(senderId&&senderName){
    showChannel(senderId,senderName,senderAvatar,senderEmail);
  }
}

document.addEventListener('click',e=>{
  if(!e.target.closest('#notif-wrap'))document.getElementById('notif-dropdown')?.classList.remove('open');
});


// ── EMOTKI ────────────────────────────────────────────────────────────────
const EMOJI_LIST=['😀','😂','🥹','😊','😍','😘','😉','😎','🤔','😴','😭','😡','🥳','😱','🤯','🤗','😏','🙄','😅','😇',
'👍','👎','👏','🙌','🙏','💪','👌','✌️','🤝','👋','🔥','💯','✨','⭐','🎉','❤️','💔','💕','😻','💀',
'🎬','🎮','⚽','🎵','📸','🍕','☕','🍺','🚀','💡','⏰','📌','✅','❌','😆','🥰','😢','🤤','🫡','🙈',
'😜','🤪','🤨','🧐','🥸','😬','🙃','😐','😶','🤐','😮','😯','😲','🥶','🥵','🤢','🤮','🤧','😷','🤒',
'🤕','🤠','😈','👿','👹','👻','👽','🤖','🎃','😹','😽','🙉','🙊','💩','🤡','👑','💍','👀','🧠','🫀',
'🦴','💋','👅','👄','🖕','👊','✊','🤙','🖖','🤟','🫶','👐','🤲','🤜','🤛','💅','🦵','🦶','👣','🎯',
'🏆','🥇','🥈','🥉','🎖️','🎗️','🎫','🎟️','🎪','🎨','🎭','🎤','🎧','🎸','🥁','🎹','🎺','🎷','🪕','🎲',
'🃏','🀄','🧩','🪄','🔮','💎','⚡','☀️','🌙','⭐','🌈','☁️','⛈️','❄️','🔥','💥','🌊','🌪️','🍀','🌹',
'🌸','🌻','🍎','🍌','🍇','🍓','🍑','🍒','🥑','🌮','🍔','🍟','🌭','🍿','🍩','🍪','🎂','🍫','🍬','🧋'];

let emojiOutsideListener=null;

function closeEmojiPicker(){
  const picker=document.getElementById('emoji-picker');
  if(picker)picker.remove();
  if(emojiOutsideListener){
    document.removeEventListener('click',emojiOutsideListener);
    emojiOutsideListener=null;
  }
}

function toggleEmojiPicker(targetId,btnEl){
  const existing=document.getElementById('emoji-picker');
  const wasOpenForSameTarget=existing&&existing.dataset.target===targetId;
  closeEmojiPicker();
  if(wasOpenForSameTarget)return;
  const picker=document.createElement('div');
  picker.id='emoji-picker';
  picker.dataset.target=targetId;
  picker.innerHTML=EMOJI_LIST.map(e=>`<span onclick="insertEmoji('${jsesc(targetId)}','${jsesc(e)}')" style="cursor:pointer;font-size:22px;padding:6px 2px;border-radius:6px;text-align:center;display:flex;align-items:center;justify-content:center" onmouseover="this.style.background='var(--border)'" onmouseout="this.style.background='none'">${e}</span>`).join('');
  if(myEmojiStyle==='flat'&&window.applyEmojiStyleToEl)applyEmojiStyleToEl(picker);
  else if(myEmojiStyle==='app')applyAppEmojiStyleToEl(picker);

  const rect=btnEl.getBoundingClientRect();
  const maxPickerHeight=Math.min(320,window.innerHeight-32); // nie więcej niż ekran minus margines
  const pickerWidth=Math.min(360,window.innerWidth-16);
  const spaceAbove=rect.top;
  const spaceBelow=window.innerHeight-rect.bottom;
  const openUpward=spaceAbove>maxPickerHeight||spaceAbove>spaceBelow;
  const availableSpace=(openUpward?spaceAbove:spaceBelow)-16;
  const pickerHeight=Math.max(160,Math.min(maxPickerHeight,availableSpace));
  const top=openUpward?Math.max(8,rect.top-pickerHeight-8):Math.min(rect.bottom+8,window.innerHeight-pickerHeight-8);
  const left=Math.min(Math.max(8,rect.left-pickerWidth+28),window.innerWidth-pickerWidth-8);

  picker.style.cssText=`position:fixed;top:${top}px;left:${left}px;width:${pickerWidth}px;background:var(--bg-panel);border:1px solid var(--border);border-radius:12px;padding:10px;display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:2px;z-index:2000;max-height:${pickerHeight}px;overflow-y:auto;overflow-x:hidden;box-shadow:0 4px 20px rgba(0,0,0,.6)`;
  document.body.appendChild(picker);
  setTimeout(()=>{
    emojiOutsideListener=function(e){
      if(!picker.contains(e.target)&&e.target!==btnEl){
        closeEmojiPicker();
      }
    };
    document.addEventListener('click',emojiOutsideListener);
  },0);
}

function insertEmoji(targetId,emoji){
  const inp=document.getElementById(targetId);
  if(!inp)return;
  const start=inp.selectionStart??inp.value.length;
  const end=inp.selectionEnd??inp.value.length;
  inp.value=inp.value.slice(0,start)+emoji+inp.value.slice(end);
  inp.focus();
  const newPos=start+emoji.length;
  inp.setSelectionRange(newPos,newPos);
}

function openFindBugModal(){
  document.getElementById('findbug-modal').classList.add('open');
}
function closeFindBugModal(){
  document.getElementById('findbug-modal').classList.remove('open');
}
function copyFindBugEmail(btn){
  navigator.clipboard.writeText('wavetubebuisness@gmail.com').then(()=>{
    toast(t('findbug_copied_toast'));
  }).catch(()=>{toast('Nie udało się skopiować');});
}

// ── PLAYLISTY ────────────────────────────────────────────────────────────────
let myPlaylists=[];
let playlistPickerVideoId=null;
let currentPlaylistId=null;

async function loadMyPlaylists(){
  if(!currentUser){myPlaylists=[];return;}
  const{data}=await sb.from('playlists').select('*').eq('user_id',currentUser.id).order('created_at',{ascending:false});
  myPlaylists=data||[];
}

function playlistThumb(pl){
  const firstId=(pl.video_ids||[])[0];
  const v=firstId?videos.find(x=>String(x.id)===String(firstId)):null;
  return v?.thumb||'';
}

function renderPlaylistCards(list,g){
  if(!list.length){g.innerHTML=emptyStateHtml('bookmark',t('playlist_empty'),t('playlist_empty_sub'));return;}
  g.innerHTML=list.map(pl=>{
    const thumb=playlistThumb(pl);
    const count=(pl.video_ids||[]).length;
    return`<div class="card" onclick="openPlaylistDetail(${pl.id})">
      <div class="thumb">
        ${thumb?`<img src="${esc(thumb)}" style="width:100%;height:100%;object-fit:cover">`:'<div class="no-thumb">🎵</div>'}
        <div class="play-ov"><div class="pb">▶</div></div>
        <div class="dur" style="background:rgba(0,0,0,.85)">${count} ${t('playlist_videos_count')}</div>
        <button class="del" onclick="event.stopPropagation();deletePlaylist(${pl.id})">🗑</button>
      </div>
      <div class="card-bottom">
        <div class="card-avatar-placeholder" style="background:#3ea6ff">▶</div>
        <div class="card-info">
          <h3>${esc(pl.name)}</h3>
          <p>${count} ${t('playlist_videos_count')}</p>
        </div>
      </div>
    </div>`;
  }).join('');
}

async function showPlaylistsPage(){
  showHome();
  const ff=document.getElementById('feed-filters');
  if(ff)ff.style.display='none';
  const shortsSection=document.getElementById('shorts-section');
  if(shortsSection)shortsSection.style.display='none';
  document.getElementById('slabel').textContent=t('page_playlists');
  const g=document.getElementById('grid');
  if(!currentUser){
    g.innerHTML=emptyStateHtml('bookmark',t('playlist_login'));
    return;
  }
  await loadMyPlaylists();
  renderPlaylistCards(myPlaylists,g);
}

async function openPlaylistDetail(playlistId){
  const pl=myPlaylists.find(p=>p.id===playlistId);
  if(!pl)return;
  currentPlaylistId=playlistId;
  showHome();
  const ff=document.getElementById('feed-filters');
  if(ff)ff.style.display='none';
  const shortsSection=document.getElementById('shorts-section');
  if(shortsSection)shortsSection.style.display='none';
  document.getElementById('slabel').innerHTML=`<span onclick="showPlaylistsPage()" style="cursor:pointer;color:var(--text-secondary)">${t('page_playlists')} ›</span> ${esc(pl.name)}`;
  const g=document.getElementById('grid');
  const list=videos.filter(v=>(pl.video_ids||[]).map(String).includes(String(v.id)));
  if(!list.length){g.innerHTML=emptyStateHtml('bookmark',t('playlist_empty'),t('playlist_empty_sub'));return;}
  renderVideoCards(list,g);
}

async function createPlaylist(name){
  if(!currentUser)return null;
  const clean=(name||'').trim();
  if(!clean){toast(t('playlist_new_name_needed'));return null;}
  const{data,error}=await sb.from('playlists').insert([{user_id:currentUser.id,name:clean,video_ids:[]}]).select().single();
  if(error){toast('Błąd: '+error.message);return null;}
  myPlaylists.unshift(data);
  toast(t('playlist_created_toast'));
  return data;
}

async function deletePlaylist(playlistId){
  if(!confirm(t('playlist_delete_confirm')))return;
  await sb.from('playlists').delete().eq('id',playlistId).eq('user_id',currentUser.id);
  myPlaylists=myPlaylists.filter(p=>p.id!==playlistId);
  toast(t('playlist_deleted_toast'));
  showPlaylistsPage();
}

async function togglePlaylistVideo(playlistId,videoId){
  const pl=myPlaylists.find(p=>p.id===playlistId);
  if(!pl)return;
  const idStr=String(videoId);
  const ids=(pl.video_ids||[]).map(String);
  const has=ids.includes(idStr);
  const newIds=has?ids.filter(x=>x!==idStr):[...ids,idStr];
  const{error}=await sb.from('playlists').update({video_ids:newIds}).eq('id',playlistId).eq('user_id',currentUser.id);
  if(error){toast('Błąd: '+error.message);return;}
  pl.video_ids=newIds;
  toast(has?t('playlist_removed_toast'):t('playlist_added_toast'));
  renderPlaylistPickerList();
  if(currentPlaylistId===playlistId&&!document.getElementById('playlist-picker-modal').classList.contains('open')){
    openPlaylistDetail(playlistId);
  }
}

async function openPlaylistPicker(videoId){
  if(!currentUser){toast(t('wl_login_toast'));return;}
  playlistPickerVideoId=videoId;
  await loadMyPlaylists();
  renderPlaylistPickerList();
  document.getElementById('playlist-picker-modal').classList.add('open');
}

function closePlaylistPicker(){
  document.getElementById('playlist-picker-modal').classList.remove('open');
  const inp=document.getElementById('playlist-new-inp');
  if(inp)inp.value='';
}

function renderPlaylistPickerList(){
  const el=document.getElementById('playlist-picker-list');
  if(!el)return;
  if(!myPlaylists.length){el.innerHTML=`<p style="color:var(--text-tertiary);font-size:13px;padding:8px 0">${t('playlist_empty')}</p>`;return;}
  const idStr=String(playlistPickerVideoId);
  el.innerHTML=myPlaylists.map(pl=>{
    const checked=(pl.video_ids||[]).map(String).includes(idStr);
    return`<div onclick="togglePlaylistVideo(${pl.id},'${jsesc(idStr)}')" style="display:flex;align-items:center;gap:12px;padding:10px 8px;cursor:pointer;border-radius:8px" onmouseover="this.style.background='var(--border-soft)'" onmouseout="this.style.background='none'">
      <div style="width:20px;height:20px;border-radius:5px;border:2px solid ${checked?'#3ea6ff':'var(--border)'};background:${checked?'#3ea6ff':'transparent'};display:flex;align-items:center;justify-content:center;flex-shrink:0">${checked?'<svg viewBox="0 0 24 24" width="13" height="13" fill="#0f0f0f"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>':''}</div>
      <span style="font-size:13px;flex:1">${esc(pl.name)}</span>
      <span style="font-size:11px;color:var(--text-tertiary)">${(pl.video_ids||[]).length}</span>
    </div>`;
  }).join('');
}

async function createPlaylistFromPicker(){
  const inp=document.getElementById('playlist-new-inp');
  const name=inp?.value||'';
  const pl=await createPlaylist(name);
  if(!pl)return;
  if(inp)inp.value='';
  if(playlistPickerVideoId){
    await togglePlaylistVideo(pl.id,playlistPickerVideoId);
  } else {
    renderPlaylistPickerList();
  }
}
