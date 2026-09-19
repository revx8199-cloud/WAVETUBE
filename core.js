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
    okBtn.textContent=okLabel||'Usuń';
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
  if(plBtn)plBtn.style.cssText=lang==='pl'?'display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:10px;cursor:pointer;font-size:14px;text-align:left;background:rgba(62,166,255,.15);border:1px solid #3ea6ff;color:var(--text-primary)':'display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:10px;cursor:pointer;font-size:14px;text-align:left;background:var(--bg-sunken);border:1px solid var(--border);color:var(--text-primary)';
  if(ruBtn)ruBtn.style.cssText=lang==='ru'?'display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:10px;cursor:pointer;font-size:14px;text-align:left;background:rgba(62,166,255,.15);border:1px solid #3ea6ff;color:var(--text-primary)':'display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:10px;cursor:pointer;font-size:14px;text-align:left;background:var(--bg-sunken);border:1px solid var(--border);color:var(--text-primary)';
  if(enBtn)enBtn.style.cssText=lang==='en'?'display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:10px;cursor:pointer;font-size:14px;text-align:left;background:rgba(62,166,255,.15);border:1px solid #3ea6ff;color:var(--text-primary)':'display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:10px;cursor:pointer;font-size:14px;text-align:left;background:var(--bg-sunken);border:1px solid var(--border);color:var(--text-primary)';
}

function setLanguage(lang){
  localStorage.setItem('wt_lang',lang);
  applyTranslations();
  updateLangButtons();
  toast(lang==='ru'?'Язык изменён 🌐':lang==='en'?'Language changed 🌐':'Język zmieniony 🌐');
}


// ── BEZPIECZEŃSTWO: zabezpieczenie przed XSS ────────────────────────────
function likeIcon(size){
  size=size||13;
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="currentColor" style="vertical-align:-2px;opacity:.75"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/></svg>`;
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

// Bezpieczne wstawianie tekstu użytkownika do onclick="...('${x}')" - zapobiega "wyrwaniu się" z apostrofu
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

function toast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg;t.style.display='block';
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
function emptyStateHtml(iconKey,title,subtitle){
  return `<div class="empty" style="display:flex;flex-direction:column;align-items:center;padding:70px 20px">
    <div style="width:72px;height:72px;border-radius:50%;background:var(--bg-card);display:flex;align-items:center;justify-content:center;margin-bottom:18px;color:var(--text-tertiary)">${EMPTY_ICONS[iconKey]||''}</div>
    <p style="font-size:16px;font-weight:600;color:var(--text-primary);margin:0 0 6px">${title}</p>
    ${subtitle?`<p style="font-size:13px;color:var(--text-tertiary);margin:0;max-width:320px;text-align:center;line-height:1.5">${subtitle}</p>`:''}
  </div>`;
}


// ── AUTH ──────────────────────────────────────────────────────────────────────
async function loginWithGoogle(){
  await sb.auth.signInWithOAuth({
    provider:'google',
    options:{redirectTo:SITE_URL}
  });
}

async function logout(){
  await sb.auth.signOut();
  currentUser=null;
  updateAuthUI();
  toggleDropdown(true);
  toast('Wylogowano!');
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
    const frameBorder=myAvatarFrame?`3px solid ${myAvatarFrame}`:'2px solid #cc0000';
    if(meta&&meta.avatar_url){
      av.innerHTML=`<img src="${meta.avatar_url}" style="width:34px;height:34px;border-radius:50%;object-fit:cover;border:${frameBorder}">`;
    } else {
      av.textContent=(meta&&meta.full_name?meta.full_name[0]:(currentUser.email?currentUser.email[0]:'?')).toUpperCase();
    }
    // wypełniamy nagłówek dropdownu (avatar/nick/email)
    const dispName=getMyDisplayName()||currentUser.email||'';
    const headerAv=document.getElementById('dropdown-header-av');
    const headerName=document.getElementById('dropdown-header-name');
    const headerEmail=document.getElementById('dropdown-header-email');
    if(headerAv){
      headerAv.innerHTML=meta&&meta.avatar_url?`<img src="${meta.avatar_url}">`:esc((dispName[0]||'?').toUpperCase());
      headerAv.style.border=myAvatarFrame?`3px solid ${myAvatarFrame}`:'';
    }
    if(headerName)headerName.textContent=dispName;
    if(headerEmail)headerEmail.textContent=currentUser.email||'';
    // update comment avatar
    const comAv=document.getElementById('com-av');
    if(meta&&meta.avatar_url){
      comAv.innerHTML=`<img src="${meta.avatar_url}">`;
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
  if(myDetectedIp)profile.last_ip=myDetectedIp;
  profileCache[user.id]=profile;
  await sb.from('profiles').upsert([profile],{onConflict:'id'});
}

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
  const{error}=await sb.from('profiles').upsert([{id:currentUser.id,email:currentUser.email,vip_badge_color:color}],{onConflict:'id'});
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
  return`Zostałeś wyciszony przez administratora do ${new Date(myMuteUntil).toLocaleString('pl-PL')} — nie możesz pisać.`;
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
    <div onclick="muteUser('${userId}',1)" style="padding:11px 16px;cursor:pointer;font-size:13px" onmouseover="this.style.background='var(--border)'" onmouseout="this.style.background='none'">1 godzinę</div>
    <div onclick="muteUser('${userId}',24)" style="padding:11px 16px;cursor:pointer;font-size:13px" onmouseover="this.style.background='var(--border)'" onmouseout="this.style.background='none'">24 godziny</div>
    <div onclick="muteUser('${userId}',168)" style="padding:11px 16px;cursor:pointer;font-size:13px" onmouseover="this.style.background='var(--border)'" onmouseout="this.style.background='none'">7 dni</div>
    <div onclick="muteUser('${userId}',720)" style="padding:11px 16px;cursor:pointer;font-size:13px" onmouseover="this.style.background='var(--border)'" onmouseout="this.style.background='none'">30 dni</div>
    <div onclick="muteUser('${userId}',null)" style="padding:11px 16px;cursor:pointer;font-size:13px;color:#ff6b6b" onmouseover="this.style.background='var(--border)'" onmouseout="this.style.background='none'">Na zawsze</div>
    <div style="border-top:1px solid var(--border)"></div>
    <div onclick="unmuteUser('${userId}')" style="padding:11px 16px;cursor:pointer;font-size:13px;color:#7fe08a" onmouseover="this.style.background='var(--border)'" onmouseout="this.style.background='none'">🔊 Cofnij wyciszenie</div>
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
}

async function unmuteUser(userId){
  if(!isAdmin())return;
  await sb.from('muted_users').delete().eq('user_id',userId);
  logAdminAction('unmute',`Cofnięto wyciszenie użytkownika (ID: ${userId})`);
  const menu=document.getElementById('admin-mute-menu');
  if(menu)menu.remove();
  toast('Wyciszenie cofnięte 🔊');
}


// ── HELPERS ───────────────────────────────────────────────────────────────────
function ytId(url){const m=(url||'').match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);return m?m[1]:null;}
function gdId(url){const m=(url||'').match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/);return m?m[1]:null;}
function ttId(url){const m=(url||'').match(/tiktok\.com\/@[^/]+\/video\/(\d+)/);return m?m[1]:null;}
function getPlayer(url){
  const ytid=ytId(url);if(ytid)return{type:'yt',src:`https://www.youtube.com/embed/${ytid}?autoplay=1&enablejsapi=1&origin=${encodeURIComponent(location.origin)}`};
  const gdid=gdId(url);if(gdid)return{type:'gd',src:`https://drive.google.com/file/d/${gdid}/preview`};
  const ttid=ttId(url);if(ttid)return{type:'tt',src:`https://www.tiktok.com/embed/v2/${ttid}`};
  if((url||'').match(/\.(mp4|webm|mov)(\?|$)/i))return{type:'mp4',src:url};
  return{type:'unknown',src:url};
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
function viewsLabel(v,suffix){
  suffix=suffix||' wyśw.';
  if(v.hide_views&&!(currentUser&&(currentUser.id===v.user_id||isAdmin())))return'Wyświetlenia ukryte';
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

let vipEmailsMap=new Map(); // email -> vip_badge_color, wypełniane z profiles.is_vip=true
function isVIP(){return!!(currentUser&&vipEmailsMap.has(currentUser.email));}

async function adminSetVip(userId,email,makeVip){
  if(!isAdmin())return;
  const{error}=await sb.from('profiles').upsert([{id:userId,email:email||null,is_vip:makeVip}],{onConflict:'id'});
  if(error){toast('Błąd: '+error.message);return;}
  await loadVipEmails();
  logAdminAction(makeVip?'grant_vip':'revoke_vip',`${makeVip?'Nadano':'Odebrano'} VIP: ${email||userId}`);
  renderAdminPanel();
  toast(makeVip?'Nadano status VIP ⭐':'Odebrano status VIP');
}

function verifiedBadge(email){
  if(email===ADMIN_EMAIL){
    const badgeColor=adminBadgeColor||'#3ea6ff';
    return`<span title="Administrator" style="display:inline-flex;align-items:center;gap:3px;margin-left:5px;flex-shrink:0"><span style="display:inline-flex;align-items:center;justify-content:center;background:${badgeColor};border-radius:50%;width:16px;height:16px;flex-shrink:0"><svg viewBox="0 0 24 24" width="10" height="10" fill="#fff"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg></span><span style="font-size:10px;font-weight:800;color:${badgeColor};letter-spacing:.5px">ADMIN</span></span>`;
  }
  if(email&&vipEmailsMap.has(email)){
    const badgeColor=vipEmailsMap.get(email)||'#ffd700';
    return`<span title="VIP" style="display:inline-flex;align-items:center;gap:3px;margin-left:5px;flex-shrink:0"><span style="display:inline-flex;align-items:center;justify-content:center;background:${badgeColor};border-radius:50%;width:16px;height:16px;flex-shrink:0"><svg viewBox="0 0 24 24" width="10" height="10" fill="#000"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg></span><span style="font-size:10px;font-weight:800;color:${badgeColor};letter-spacing:.5px">VIP</span></span>`;
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


// ── RENDER ────────────────────────────────────────────────────────────────────
function setSbActive(id){
  document.querySelectorAll('.sb-item').forEach(el=>el.classList.remove('active'));
  const el=document.getElementById(id);
  if(el)el.classList.add('active');
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
      ${th?`<img src="${th}" style="width:100%;height:100%;object-fit:cover">`:'<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#333;font-size:48px">📱</div>'}
      <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:0;background:rgba(0,0,0,.3);transition:opacity .2s" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0"><div style="width:54px;height:54px;background:rgba(0,0,0,.75);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:22px">▶</div></div>
      <div style="position:absolute;top:8px;left:8px;background:#ff0000;color:var(--text-primary);font-size:10px;font-weight:700;padding:2px 6px;border-radius:4px">SHORT</div>
      <div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(0,0,0,.8));padding:12px 10px 10px">
        <div style="font-size:13px;font-weight:600;color:var(--text-primary);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${esc(v.title)}</div>
        <div style="font-size:11px;color:rgba(255,255,255,.7);margin-top:3px">${v.likes||0} ${likeIcon()} · ${viewsLabel(v)}</div>
      </div>
    </div>`;
    el.onclick=()=>openP(v.id);
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
  if(!dur)return null;
  const parts=String(dur).split(':').map(n=>parseInt(n,10));
  if(parts.some(isNaN))return null;
  if(parts.length===3)return parts[0]*3600+parts[1]*60+parts[2];
  if(parts.length===2)return parts[0]*60+parts[1];
  if(parts.length===1)return parts[0];
  return null;
}

function populateFeedCategoryOptions(){
  const sel=document.getElementById('feed-cat-filter');
  if(!sel)return;
  const cats=[...new Set(videos.map(v=>v.category).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pl'));
  const key=cats.join('|');
  if(sel.dataset.catsKey===key)return;
  sel.dataset.catsKey=key;
  const current=sel.value;
  sel.innerHTML=`<option value="">${t('filter_all_categories')}</option>`+cats.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join('');
  if(cats.includes(current))sel.value=current;
}

function applyFeedFiltersToList(list){
  const cat=document.getElementById('feed-cat-filter')?.value||'';
  const durFilter=document.getElementById('feed-dur-filter')?.value||'';
  const sortMode=document.getElementById('feed-sort-filter')?.value||'newest';

  let out=list;
  if(cat)out=out.filter(v=>v.category===cat);
  if(durFilter){
    out=out.filter(v=>{
      const sec=durationToSeconds(v.dur);
      if(sec===null)return false;
      if(durFilter==='short')return sec<=240;
      if(durFilter==='medium')return sec>240&&sec<=1200;
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
    const ucol=getUserColor(v.user_email);
    const uav=v.user_avatar?`<img src="${v.user_avatar}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;cursor:pointer" onclick="event.stopPropagation();showChannel('${v.user_id||''}','${jsesc(uname)}','${v.user_avatar||''}','${v.user_email||''}')">`:`<div class="card-avatar-placeholder" style="background:${ucol}" onclick="event.stopPropagation();showChannel('${v.user_id||''}','${jsesc(uname)}','','${v.user_email||''}')">${uname[0].toUpperCase()}</div>`;
    const el=document.createElement('div');
    el.className='card';
    el.innerHTML=`<div class="thumb">
      ${th?`<img src="${th}" alt="${esc(v.title)}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div class="no-thumb" style="display:none">🎬</div>`:'<div class="no-thumb">🎬</div>'}
      <div class="play-ov"><div class="pb">▶</div></div>
      ${v.dur?`<div class="dur">${v.dur}</div>`:''}
      <button class="del" onclick="event.stopPropagation();askDelete(${v.id})">🗑</button>
      ${currentUser&&(currentUser.id===v.user_id||isAdmin())?`<button class="del" style="top:6px;right:40px;background:rgba(30,100,255,.75)" onclick="event.stopPropagation();openEditModal(${v.id})">✏️</button>`:''}
      <button class="del" style="display:flex;top:6px;left:6px;right:auto" onclick="event.stopPropagation();toggleCardMenu('${v.id}',this)">⋮</button>
    </div>
    <div class="card-bottom">
      ${uav}
      <div class="card-info">
        <h3>${esc(v.title)}</h3>
        <div class="channel-name" style="${v.user_color?`color:${v.user_color};font-weight:700;`:''}${v.user_font?`font-family:${fontCssFor(v.user_font)};`:''}" onclick="event.stopPropagation();showChannel('${v.user_id||''}','${jsesc(uname)}','${v.user_avatar||''}','${v.user_email||''}')">${esc(uname)}</div>
        <p>${viewsLabel(v,' wyśw.')} · ${v.likes||0} ${likeIcon()} · ${relativeDate(v.created_at)}</p>
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
  document.getElementById('slabel').textContent=t('page_saved');
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
      :`<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm.5 5H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/></svg> ${t('wl_label')}`;
  }
}

async function showWatchLaterPage(){
  showHome();
  const ff=document.getElementById('feed-filters');
  if(ff)ff.style.display='none';
  const shortsSection=document.getElementById('shorts-section');
  if(shortsSection)shortsSection.style.display='none';
  document.getElementById('slabel').textContent=t('page_watchlater');
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
  document.getElementById('slabel').textContent=t('page_announcements');
  const g=document.getElementById('grid');
  g.style.display='block';
  g.innerHTML='<p style="color:var(--text-tertiary);padding:20px;text-align:center">Ładowanie...</p>';

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
        <div style="font-size:11px;color:var(--text-tertiary)">${new Date(a.created_at).toLocaleString('pl-PL')}</div>
      </div>
      ${isAdmin()?`<button onclick="deleteAnnouncement(${a.id})" title="Usuń ogłoszenie" style="background:none;border:none;color:var(--text-tertiary);cursor:pointer;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px" onmouseover="this.style.background='#3a1414';this.style.color='#ff6b6b'" onmouseout="this.style.background='none';this.style.color='#666'">🗑</button>`:''}
    </div>
    ${a.message?`<div style="font-size:14px;color:#eee;line-height:1.6;white-space:pre-wrap;margin-bottom:12px">${esc(a.message)}</div>`:''}
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
          ${c.avatar?`<img src="${c.avatar}" style="width:28px;height:28px;border-radius:50%;object-fit:cover;flex-shrink:0;cursor:pointer${c.avatar_frame?`;border:2px solid ${c.avatar_frame};box-sizing:border-box`:''}" onclick="showChannel('${c.user_id||''}','${jsesc(c.user)}','${c.avatar||''}','')">`:`<div style="width:28px;height:28px;border-radius:50%;background:#cc0000;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;cursor:pointer" onclick="showChannel('${c.user_id||''}','${jsesc(c.user)}','','')">${(c.user||'?')[0].toUpperCase()}</div>`}
          <div>
            <div style="font-size:12px;font-weight:600;cursor:pointer${c.name_color?`;color:${c.name_color}`:''}${c.name_font?`;font-family:${fontCssFor(c.name_font)}`:''}" onclick="showChannel('${c.user_id||''}','${jsesc(c.user)}','${c.avatar||''}','')">${esc(c.user)}</div>
            <div style="font-size:13px;color:var(--text-secondary)">${esc(c.text)}</div>
          </div>
        </div>`).join('')||'<p style="color:var(--text-tertiary);font-size:12px">Brak komentarzy — bądź pierwszy!</p>'}
      </div>
      ${currentUser?`<div style="display:flex;gap:8px">
        <input id="ann-cinp-${a.id}" placeholder="Napisz komentarz..." style="flex:1;background:var(--bg-sunken);border:1px solid var(--border);border-radius:8px;color:var(--text-primary);padding:8px 12px;font-size:13px;outline:none" onkeydown="if(event.key==='Enter')addAnnouncementComment(${a.id})">
        <button onclick="toggleEmojiPicker('ann-cinp-${a.id}',this)" style="background:none;border:none;color:var(--text-secondary);cursor:pointer;font-size:16px" title="Emotki">😊</button>
        <button onclick="addAnnouncementComment(${a.id})" style="background:#3ea6ff;border:none;color:#0f0f0f;padding:8px 16px;border-radius:8px;cursor:pointer;font-size:12px;font-weight:700">Wyślij</button>
      </div>`:'<p style="color:var(--text-tertiary);font-size:12px">Zaloguj się żeby komentować</p>'}
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
    <div style="font-size:14px;font-weight:600;margin-bottom:12px">📊 ${esc(poll.question)}</div>
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

async function voteAnnouncementPoll(id,optionIndex){
  if(!currentUser){toast('Zaloguj się żeby zagłosować!');return;}
  const a=announcementsCache.find(x=>x.id===id);
  if(!a||!a.poll)return;
  const poll=a.poll;
  if(!poll.voters)poll.voters={};
  const prevVote=poll.voters[currentUser.id];
  if(prevVote===optionIndex)return;
  if(prevVote!==undefined)poll.options[prevVote].votes=Math.max(0,(poll.options[prevVote].votes||0)-1);
  poll.options[optionIndex].votes=(poll.options[optionIndex].votes||0)+1;
  poll.voters[currentUser.id]=optionIndex;
  await sb.from('announcements').update({poll}).eq('id',id);
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
  const voters=a.voters||{};
  const prev=voters[currentUser.id];
  if(prev===type){
    delete voters[currentUser.id];
    a[type+'s']=Math.max(0,(a[type+'s']||0)-1);
  } else {
    if(prev){a[prev+'s']=Math.max(0,(a[prev+'s']||0)-1);}
    voters[currentUser.id]=type;
    a[type+'s']=(a[type+'s']||0)+1;
  }
  a.voters=voters;
  await sb.from('announcements').update({likes:a.likes||0,dislikes:a.dislikes||0,voters}).eq('id',id);
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
  const comments=[...(a.comments||[]),{
    user:getMyDisplayName(),
    text,ts:Date.now(),avatar:meta?.avatar_url||'',
    user_id:currentUser.id,name_color:myNameColor||'',name_font:myNameFont||'',avatar_frame:myAvatarFrame||''
  }];
  a.comments=comments;
  await sb.from('announcements').update({comments}).eq('id',id);
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
  g.innerHTML='<p style="color:var(--text-tertiary);padding:20px;text-align:center">Ładowanie...</p>';
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
      ${th?`<img src="${th}" alt="${esc(v.title)}" onerror="this.style.display='none'">`:'<div class="no-thumb">🎬</div>'}
      <div class="play-ov"><div class="pb">▶</div></div>
      ${v.dur?`<div class="dur">${v.dur}</div>`:''}
    </div>
    <div class="card-bottom">
      ${v.user_avatar?`<img src="${v.user_avatar}" class="card-avatar" style="width:36px;height:36px" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`:''}
      <div class="card-avatar-placeholder" style="background:${getUserColor(v.user_email)};width:36px;height:36px;border-radius:50%;display:${v.user_avatar?'none':'flex'};align-items:center;justify-content:center;font-size:13px;font-weight:700;color:var(--text-primary);flex-shrink:0">${esc((getUserName(v)||'?')[0])}</div>
      <div class="card-info">
        <h3>${esc(v.title)}</h3>
        <div class="channel-name">${esc(getUserName(v)||'Anonim')}</div>
        <p style="font-size:11px;color:var(--text-tertiary)">${t('watched_at_label')}: ${new Date(v.watched_at).toLocaleString(getLang()==='ru'?'ru-RU':'pl-PL',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})}</p>
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
  document.getElementById('slabel').textContent=t('page_trending');
  const sorted=[...videos].filter(isDiscoverable).sort((a,b)=>(b.views||0)-(a.views||0));
  const g=document.getElementById('grid');
  g.innerHTML='';
  sorted.forEach(v=>{
    const th=thumbFor(v);
    const uname=getUserName(v);
    const ucol=getUserColor(v.user_email||'');
    const cachedProfile=profileCache[v.user_id||''];
    const avatarUrl=v.user_avatar||cachedProfile?.avatar||'';
    const el=document.createElement('div');
    el.className='card';
    el.innerHTML=`<div class="thumb">
      ${th?`<img src="${th}" alt="${esc(v.title)}" onerror="this.style.display='none'">`:'<div class="no-thumb">🎬</div>'}
      <div class="play-ov"><div class="pb">▶</div></div>
      ${v.dur?`<div class="dur">${v.dur}</div>`:''}
    </div>
    <div class="card-bottom">
      ${avatarUrl
        ?`<img src="${avatarUrl}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;flex-shrink:0;cursor:pointer" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" onclick="event.stopPropagation();showChannel('${v.user_id||''}','${jsesc(uname)}','${avatarUrl}','${v.user_email||''}')"><div class="card-avatar-placeholder" style="background:${ucol};display:none;cursor:pointer" onclick="event.stopPropagation();showChannel('${v.user_id||''}','${jsesc(uname)}','','${v.user_email||''}')">${uname[0].toUpperCase()}</div>`
        :`<div class="card-avatar-placeholder" style="background:${ucol};cursor:pointer" onclick="event.stopPropagation();showChannel('${v.user_id||''}','${jsesc(uname)}','','${v.user_email||''}')">${uname[0].toUpperCase()}</div>`
      }
      <div class="card-info"><h3>${esc(v.title)}</h3><div class="channel-name">${esc(uname)}</div><p>${viewsLabel(v)}</p></div>
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

function renderC(){
  closeEmojiPicker();
  closeCmtMenu();
  if(!cur)return;
  const list=cur.comments||[];
  document.getElementById('ctitle').textContent=`${t('comments_label')} (${list.length})`;
  const isVideoOwner=currentUser&&cur&&currentUser.id===cur.user_id;
  const likedComments=new Set(JSON.parse(localStorage.getItem('liked_comments')||'[]'));
  const dislikedComments=new Set(JSON.parse(localStorage.getItem('disliked_comments')||'[]'));
  const sortedList=getSortedComments();
  document.getElementById('clist').innerHTML=sortedList.map((c,i)=>{
    const av=c.avatar?`<img src="${c.avatar}">`:`${(c.user||'?')[0].toUpperCase()}`;
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
      ${isPinned?`<div style="color:#3ea6ff;font-size:11px;margin-bottom:6px;display:flex;align-items:center;gap:4px"><svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M17 4v7l2 3H5l2-3V4h10m0-2H7c-.55 0-1 .45-1 1v1H5v2h1v5.5L4 14v2h7v5h2v-5h7v-2l-2-2.5V6h1V4h-1V3c0-.55-.45-1-1-1z"/></svg> Przypięty komentarz</div>`:''}
      <div class="cav" style="${c.avatar?'':'background:'+( c.col||colors[i%colors.length])};cursor:pointer;flex-shrink:0${c.avatar_frame?`;border:2px solid ${c.avatar_frame};box-sizing:border-box`:''}" onclick="closeP();showChannel('${uid}','${jsesc(c.user)}','${uavatar}','${uemail}')">${av}</div>
      <div class="cbody" style="flex:1;min-width:0">
        <div class="cname" style="display:flex;align-items:center;gap:4px;flex-wrap:wrap;justify-content:space-between;margin-bottom:4px">
          <div style="display:flex;align-items:center;gap:4px;flex-wrap:wrap">
            <span style="cursor:pointer;font-weight:600;font-size:14px${c.name_color?`;color:${c.name_color}`:''}${c.name_font?`;font-family:${fontCssFor(c.name_font)}`:''}" onclick="closeP();showChannel('${uid}','${jsesc(c.user)}','${uavatar}','${uemail}')">${esc(c.user)}</span>${verifiedBadge(uemail||'')}
            <span style="color:var(--text-secondary);font-weight:400;font-size:11px">${displayTime}${c.edited?' <span style=\"color:var(--text-tertiary)\">(edytowano)</span>':''}</span>
          </div>
          <div style="display:flex;gap:4px;position:relative">
            ${(isVideoOwner||canEdit||canDelete||(isAdmin()&&!isAuthor&&uid))?`
            <button id="cmtdots-${i}" onclick="event.stopPropagation();toggleCmtMenu(this,'cmenu-${i}')" class="cmt-icon-btn" title="Więcej">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><circle cx="12" cy="6" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="18" r="2"/></svg>
            </button>
            <div id="cmenu-${i}" class="cmt-dropdown" style="display:none">
              ${isVideoOwner?`<div class="cmt-dropdown-item" onclick="closeCmtMenu();togglePinComment(${i})">
                <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><path d="M17 4v7l2 3H5l2-3V4h10m0-2H7c-.55 0-1 .45-1 1v1H5v2h1v5.5L4 14v2h7v5h2v-5h7v-2l-2-2.5V6h1V4h-1V3c0-.55-.45-1-1-1z"/></svg>
                ${isPinned?'Odepnij komentarz':'Przypnij komentarz'}
              </div>`:''}
              ${canEdit?`<div class="cmt-dropdown-item" onclick="closeCmtMenu();toggleEditComment(${i})">
                <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                Edytuj
              </div>`:''}
              ${isAdmin()&&!isAuthor&&uid?`<div class="cmt-dropdown-item" onclick="closeCmtMenu();toggleMuteMenu('${uid}',document.getElementById('cmtdots-${i}'))">
                <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.42.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
                Wycisz użytkownika
              </div>`:''}
              ${canDelete?`<div class="cmt-dropdown-item cmt-dropdown-item-red" onclick="closeCmtMenu();deleteComment(${i})">
                <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                Usuń
              </div>`:''}
            </div>`:''}
          </div>
        </div>
        <div class="ctext" id="ctext-${i}" style="margin-bottom:8px;font-size:15px;line-height:1.5">${esc(c.text)}</div>
        <div id="cedit-${i}" style="display:none;margin-bottom:8px">
          <input id="cedit-inp-${i}" value="${(c.text||'').replace(/"/g,'&quot;')}" style="width:100%;background:transparent;border:none;border-bottom:1px solid #444;color:var(--text-primary);padding:6px 0;font-size:14px;outline:none">
          <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:6px">
            <button onclick="toggleEditComment(${i})" style="background:none;border:none;color:var(--text-secondary);padding:6px 12px;border-radius:16px;cursor:pointer;font-size:12px">Anuluj</button>
            <button onclick="saveEditComment(${i})" style="background:#3ea6ff;border:none;color:#0f0f0f;padding:6px 14px;border-radius:16px;cursor:pointer;font-size:12px;font-weight:700">Zapisz</button>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:4px;flex-wrap:wrap">
          <button onclick="likeComment(${i})" style="display:flex;align-items:center;gap:4px;background:none;border:none;color:${liked?'#cc0000':'#aaa'};cursor:pointer;font-size:12px;padding:4px 8px;border-radius:16px;transition:background .1s" onmouseover="this.style.background='var(--border-soft)'" onmouseout="this.style.background='none'">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/></svg>
            ${likes>0?likes:''}
          </button>
          <button onclick="dislikeComment(${i})" style="display:flex;align-items:center;gap:4px;background:none;border:none;color:${disliked?'#cc0000':'#aaa'};cursor:pointer;font-size:12px;padding:4px 8px;border-radius:16px;transition:background .1s" onmouseover="this.style.background='var(--border-soft)'" onmouseout="this.style.background='none'">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z"/></svg>
          </button>
          <button onclick="toggleReplyForm(${i})" style="background:none;border:none;color:var(--text-secondary);cursor:pointer;font-size:12px;font-weight:600;padding:4px 8px;border-radius:16px" onmouseover="this.style.background='var(--border-soft)';this.style.color='#fff'" onmouseout="this.style.background='none';this.style.color='#aaa'">Odpowiedz</button>
        </div>
        <div id="reply-form-${i}" style="display:none;margin-top:10px;display:none">
          <div style="display:flex;gap:8px;align-items:flex-start">
            ${currentUser&&currentUser.user_metadata?.avatar_url?`<img src="${currentUser.user_metadata.avatar_url}" style="width:28px;height:28px;border-radius:50%;object-fit:cover;flex-shrink:0">`:`<div style="width:28px;height:28px;border-radius:50%;background:#cc0000;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:var(--text-primary);flex-shrink:0">${currentUser?(currentUser.user_metadata?.full_name||currentUser.email||'?')[0].toUpperCase():'?'}</div>`}
            <div style="flex:1">
              <input id="reply-inp-${i}" placeholder="Odpowiedz..." style="width:100%;background:transparent;border:none;border-bottom:1px solid #444;color:var(--text-primary);padding:6px 0;font-size:13px;outline:none">
              <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:6px">
                <button onclick="toggleEmojiPicker('reply-inp-${i}',this)" style="background:none;border:none;color:var(--text-secondary);cursor:pointer;font-size:16px;margin-right:auto" title="Emotki">😊</button>
                <button onclick="toggleReplyForm(${i})" style="background:none;border:none;color:var(--text-secondary);padding:6px 12px;border-radius:16px;cursor:pointer;font-size:12px">Anuluj</button>
                <button onclick="postReply(${i})" style="background:#3ea6ff;border:none;color:#0f0f0f;padding:6px 14px;border-radius:16px;cursor:pointer;font-size:12px;font-weight:700">Odpowiedz</button>
              </div>
            </div>
          </div>
        </div>
        ${replies.length?`<div style="margin-top:10px">
          <button onclick="toggleReplies(${i})" style="background:none;border:none;color:#3ea6ff;cursor:pointer;font-size:13px;font-weight:600;padding:4px 0;display:flex;align-items:center;gap:4px">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
            ${replies.length} ${replies.length===1?'odpowiedź':'odpowiedzi'}
          </button>
          <div id="replies-${i}" style="display:none;margin-top:8px;padding-left:4px;border-left:2px solid var(--border-soft)">
            ${replies.map((r,ri)=>{
              const replyIsAuthor=currentUser&&currentUser.id===r.user_id;
              const replyCanDelete=isVideoOwner||replyIsAuthor||isAdmin();
              return`<div style="display:flex;gap:10px;margin-bottom:12px">
              ${r.avatar?`<img src="${r.avatar}" style="width:28px;height:28px;border-radius:50%;object-fit:cover;flex-shrink:0${r.avatar_frame?`;border:2px solid ${r.avatar_frame};box-sizing:border-box`:''}">`:`<div style="width:28px;height:28px;border-radius:50%;background:#cc0000;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:var(--text-primary);flex-shrink:0">${(r.user||'?')[0]}</div>`}
              <div style="flex:1">
                <div style="font-size:12px;font-weight:600;display:flex;align-items:center;gap:4px;justify-content:space-between">
                  <span style="display:flex;align-items:center;gap:4px"><span style="${r.name_color?`color:${r.name_color};`:''}${r.name_font?`font-family:${fontCssFor(r.name_font)};`:''}">${esc(r.user)}</span>${verifiedBadge(r.user_email||'')} <span style="color:var(--text-secondary);font-weight:400;font-size:11px">${r.ts?timeAgo(r.ts):(r.time||'')}</span></span>
                  <span style="display:flex;gap:2px">
                    ${isAdmin()&&!replyIsAuthor&&r.user_id?`<button onclick="event.stopPropagation();toggleMuteMenu('${r.user_id}',this)" title="Wycisz użytkownika" class="cmt-icon-btn" style="width:26px;height:26px;font-size:12px">🔇</button>`:''}
                    ${replyCanDelete?`<button onclick="deleteReply(${i},${ri})" title="Usuń" class="cmt-icon-btn" style="width:26px;height:26px;font-size:12px">🗑</button>`:''}
                  </span>
                </div>
                <div style="font-size:13px;color:var(--text-secondary);margin-top:2px">${esc(r.text)}</div>
              </div>
            </div>`;
            }).join('')}
          </div>
        </div>`:''}
      </div>
    </div>`;
  }).join('');
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
  const now=new Date().toLocaleString('pl-PL',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
  const sortedList=getSortedComments();
  const c=sortedList[index];
  if(!c)return;
  const origIdx=(cur.comments||[]).findIndex(x=>x.user===c.user&&x.text===c.text&&x.time===c.time);
  if(!cur.comments[origIdx].replies)cur.comments[origIdx].replies=[];
  cur.comments[origIdx].replies.push({user:getMyDisplayName(),text:txt,time:now,ts:Date.now(),avatar:meta?.avatar_url||'',user_email:currentUser.email,user_id:currentUser.id,name_color:myNameColor||'',name_font:myNameFont||'',avatar_frame:myAvatarFrame||''});
  inp.value='';
  await updateVideo(cur.id,{comments:cur.comments});
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
  list[origIndex].pinned=!list[origIndex].pinned;
  cur.comments=list;
  await updateVideo(cur.id,{comments:list});
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
  const list=(cur.comments||[]).filter(c=>!(c.user===comment.user&&c.text===comment.text&&c.time===comment.time));
  cur.comments=list;
  await updateVideo(cur.id,{comments:list});
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
  cur.comments[origIdx].replies=cur.comments[origIdx].replies.filter((r,idx)=>idx!==replyIndex);
  await updateVideo(cur.id,{comments:cur.comments});
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
  cur.comments[origIdx].text=newText;
  cur.comments[origIdx].edited=true;
  await updateVideo(cur.id,{comments:cur.comments});
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
  const now=new Date().toLocaleString('pl-PL',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
  const newC={user:getMyDisplayName(),text:t,time:now,ts:Date.now(),col:'#cc0000',avatar:meta?.avatar_url||'',user_id:currentUser.id||'',user_email:currentUser.email||'',name_color:myNameColor||'',name_font:myNameFont||'',avatar_frame:myAvatarFrame||''};
  const list=[newC,...(cur.comments||[])];
  cur.comments=list;
  document.getElementById('cinp').value='';
  renderC();
  await updateVideo(cur.id,{comments:list});
  const v=videos.find(x=>x.id===cur.id);if(v)v.comments=list;render();
}


// ── INIT ──────────────────────────────────────────────────────────────────────
async function editDesc(key){
  const wrap=document.getElementById('ch-desc-wrap');
  let current=localStorage.getItem('desc_'+key)||'';
  if(currentUser&&currentUser.id===key){
    const{data}=await sb.from('profiles').select('description').eq('id',key).single();
    if(data&&data.description)current=data.description;
  }
  wrap.innerHTML=`<textarea id="desc-inp" style="width:100%;background:var(--bg-card);border:1px solid #444;border-radius:8px;color:var(--text-primary);padding:8px;font-size:13px;resize:none;outline:none;margin-bottom:6px" rows="2" placeholder="${t('desc_placeholder')}">${current}</textarea>
  <div style="display:flex;gap:8px">
    <button onclick="saveDesc('${key}')" style="background:#cc0000;border:none;color:var(--text-primary);padding:6px 14px;border-radius:16px;cursor:pointer;font-size:12px;font-weight:600">${t('btn_save')}</button>
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

function changeBanner(e, key){
  const file=e.target.files[0];if(!file)return;
  if(file.size>5*1024*1024){toast('Zdjęcie za duże! Maksymalnie 5MB');return;}
  const objectUrl=URL.createObjectURL(file);
  const el=document.getElementById('channel-banner');
  if(el){
    el.style.background='url('+objectUrl+') center/cover no-repeat';
    el.style.backgroundSize='cover';
    el.style.backgroundPosition='center';
  }
  toast('Baner zmieniony! 🎨');
  const reader=new FileReader();
  reader.onload=ev=>{
    try{
      // Compress if too large
      const img=new Image();
      img.onload=()=>{
        const canvas=document.createElement('canvas');
        const maxW=1920;const maxH=480;
        let w=img.width;let h=img.height;
        if(w>maxW){h=h*maxW/w;w=maxW;}
        if(h>maxH){w=w*maxH/h;h=maxH;}
        canvas.width=w;canvas.height=h;
        canvas.getContext('2d').drawImage(img,0,0,w,h);
        const compressed=canvas.toDataURL('image/jpeg',0.85);
        try{localStorage.setItem('banner_'+key,compressed);}
        catch(err){try{localStorage.setItem('banner_'+key,compressed.substring(0,500000)||'');}catch(e2){}}
        if(currentUser){
          sb.from('profiles').update({banner_url:compressed}).eq('id',currentUser.id).then(({error})=>{
            if(error)toast('Baner zapisany lokalnie, ale nie na serwerze ⚠️');
          });
        }
      };
      img.src=ev.target.result;
    }catch(err){console.warn('Banner save error:',err);}
  };
  reader.readAsDataURL(file);
}


// ── POWIADOMIENIA ─────────────────────────────────────────────────────────────
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
  if(!await showConfirm('Wyczyścić powiadomienia?','Wszystkie powiadomienia zostaną usunięte.','Wyczyść'))return;
  await sb.from('notifications').delete().eq('user_id',currentUser.id);
  notificationsList=[];
  updateNotifBadge();
  renderNotifications();
  toast('Powiadomienia wyczyszczone 🔔');
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

function renderNotifications(){
  const list=document.getElementById('notif-list');
  if(!notificationsList.length){list.innerHTML=`<div class="notif-empty">${t('notif_empty')}</div>`;return;}
  list.innerHTML=notificationsList.map(n=>`
    <div class="notif-item${n.read?'':' unread'}" onclick="handleNotifClick('${n.id}','${n.sender_id||''}','${n.sender_name||''}','${n.sender_avatar||''}','${n.sender_email||''}')">
      ${n.avatar?`<img class="notif-av" src="${n.avatar}">`:`<div class="notif-av-ph" style="background:#cc0000">🔔</div>`}
      <div>
        <div class="notif-text">${n.message}</div>
        <div class="notif-time">${new Date(n.created_at).toLocaleString('pl-PL',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</div>
      </div>
    </div>`).join('');
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
  picker.innerHTML=EMOJI_LIST.map(e=>`<span onclick="insertEmoji('${targetId}','${e}')" style="cursor:pointer;font-size:20px;padding:5px;border-radius:6px;text-align:center" onmouseover="this.style.background='var(--border)'" onmouseout="this.style.background='none'">${e}</span>`).join('');

  const rect=btnEl.getBoundingClientRect();
  const maxPickerHeight=Math.min(320,window.innerHeight-32); // nie więcej niż ekran minus margines
  const pickerWidth=280;
  const spaceAbove=rect.top;
  const spaceBelow=window.innerHeight-rect.bottom;
  const openUpward=spaceAbove>maxPickerHeight||spaceAbove>spaceBelow;
  const availableSpace=(openUpward?spaceAbove:spaceBelow)-16;
  const pickerHeight=Math.max(160,Math.min(maxPickerHeight,availableSpace));
  const top=openUpward?Math.max(8,rect.top-pickerHeight-8):Math.min(rect.bottom+8,window.innerHeight-pickerHeight-8);
  const left=Math.min(Math.max(8,rect.left-pickerWidth+28),window.innerWidth-pickerWidth-8);

  picker.style.cssText=`position:fixed;top:${top}px;left:${left}px;background:var(--bg-panel);border:1px solid var(--border);border-radius:12px;padding:10px;display:grid;grid-template-columns:repeat(8,1fr);gap:2px;z-index:2000;max-width:${pickerWidth}px;max-height:${pickerHeight}px;overflow-y:auto;box-shadow:0 4px 20px rgba(0,0,0,.6)`;
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
