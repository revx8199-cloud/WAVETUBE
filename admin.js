// ============ admin.js — panel administratora, kosz, boty, konsola admina/efekty, obecność online ============

// ── PANEL ADMINISTRATORA ────────────────────────────────────────────────
let adminTab='videos';
let adminUsersCache=[];
let adminUsersBanMap={};

function toggleRenameUser(userId,btnEl){
  const existing=document.getElementById('admin-rename-popup');
  if(existing){existing.remove();if(existing.dataset.user===userId)return;}
  const user=adminUsersCache.find(u=>u.id===userId);
  const rect=btnEl.getBoundingClientRect();
  const popup=document.createElement('div');
  popup.id='admin-rename-popup';
  popup.dataset.user=userId;
  popup.style.cssText=`position:fixed;top:${rect.bottom+4}px;left:${Math.min(rect.left-200,window.innerWidth-260)}px;background:var(--bg-panel);border:1px solid var(--border);border-radius:10px;padding:12px;min-width:240px;z-index:2000;box-shadow:0 4px 20px rgba(0,0,0,.5)`;
  popup.innerHTML=`
    <div style="font-size:11px;color:var(--text-tertiary);margin-bottom:8px">Nowy nick dla ${user?.email||''}</div>
    <input id="rename-inp-${userId}" maxlength="30" value="${esc(user?.name||'')}" style="width:100%;background:var(--bg-sunken);border:1px solid var(--border);border-radius:6px;color:var(--text-primary);padding:8px 10px;font-size:13px;outline:none;margin-bottom:10px" onkeydown="if(event.key==='Enter')saveRenameUser('${userId}')">
    <div style="display:flex;gap:8px;justify-content:flex-end">
      <button onclick="document.getElementById('admin-rename-popup').remove()" style="background:none;border:none;color:var(--text-tertiary);padding:6px 12px;border-radius:8px;cursor:pointer;font-size:12px">Anuluj</button>
      <button onclick="saveRenameUser('${userId}')" style="background:#3ea6ff;border:none;color:#0f0f0f;padding:6px 14px;border-radius:8px;cursor:pointer;font-size:12px;font-weight:700">Zapisz</button>
    </div>`;
  document.body.appendChild(popup);
  const inp=document.getElementById(`rename-inp-${userId}`);
  if(inp){inp.focus();inp.select();}
}

async function saveRenameUser(userId){
  const inp=document.getElementById(`rename-inp-${userId}`);
  const newName=inp?.value.trim();
  if(!newName){toast('Wpisz nick');return;}
  if(newName.length>30){toast('Nick może mieć max 30 znaków!');return;}
  const{error}=await sb.from('profiles').upsert([{id:userId,name:newName}],{onConflict:'id'});
  const popup=document.getElementById('admin-rename-popup');
  if(popup)popup.remove();
  if(error){toast('Błąd: '+error.message);return;}
  const user=adminUsersCache.find(u=>u.id===userId);
  logAdminAction('rename_user',`Zmieniono nick ${user?.email||userId} na "${newName}"`);
  if(user)user.name=newName;
  profileCache[userId]={...(profileCache[userId]||{id:userId,avatar:'',email:user?.email||''}),name:newName};
  const nameEl=document.getElementById(`uname-${userId}`);
  if(nameEl)nameEl.textContent=newName;
  toast('Nick zmieniony! ✏️');
}

function renderOnlineUsersList(){
  const body=document.getElementById('admin-panel-body');
  const badge=document.getElementById('online-count-badge');
  const entries=Object.entries(onlineUsersState); // {userId: [{name,email,avatar,online_at}, ...]}
  if(badge)badge.textContent=entries.length;
  if(!entries.length){
    body.innerHTML='<p style="color:var(--text-tertiary);padding:30px 20px;text-align:center">Nikt teraz nie jest online 👻</p>';
    return;
  }
  const sorted=entries.map(([userId,presences])=>({userId,...(presences[0]||{})}))
    .sort((a,b)=>(a.name||'').localeCompare(b.name||'','pl'));
  body.innerHTML=sorted.map(u=>`
    <div class="admin-row">
      <div style="position:relative;flex-shrink:0">
        ${u.avatar?`<img src="${u.avatar}" style="width:36px;height:36px;border-radius:50%;object-fit:cover">`:`<div style="width:36px;height:36px;border-radius:50%;background:${getUserColor(u.email||'')};display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px">${(u.name||'?')[0].toUpperCase()}</div>`}
        <span style="position:absolute;bottom:-1px;right:-1px;width:11px;height:11px;background:#4ade80;border:2px solid var(--bg-panel);border-radius:50%"></span>
      </div>
      <div style="flex:1;min-width:0">
        <div style="font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(u.name||'Użytkownik')}</div>
        <div style="font-size:11px;color:var(--text-tertiary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(u.email||'')}</div>
      </div>
      <div style="font-size:11px;color:#4ade80;font-weight:600;flex-shrink:0">🟢 online</div>
    </div>`).join('');
}

async function renderActivityList(){
  const body=document.getElementById('admin-panel-body');
  body.innerHTML='<p style="color:var(--text-tertiary);padding:30px 20px;text-align:center">Ładowanie...</p>';
  const{data,error}=await sb.from('profiles').select('id,name,email,avatar,last_seen_at').order('last_seen_at',{ascending:false,nullsFirst:false}).limit(200);
  if(error){body.innerHTML=`<p style="color:#ff6b6b;padding:30px 20px;text-align:center">Błąd: ${error.message}</p>`;return;}
  if(!data||!data.length){body.innerHTML='<p style="color:var(--text-tertiary);padding:30px 20px;text-align:center">Brak danych</p>';return;}
  body.innerHTML=data.map(u=>{
    const isOnline=!!onlineUsersState[u.id];
    return`<div class="admin-row">
      <div style="position:relative;flex-shrink:0">
        ${u.avatar?`<img src="${u.avatar}" style="width:36px;height:36px;border-radius:50%;object-fit:cover">`:`<div style="width:36px;height:36px;border-radius:50%;background:${getUserColor(u.email||'')};display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px">${(u.name||'?')[0]?.toUpperCase()||'?'}</div>`}
        ${isOnline?`<span style="position:absolute;bottom:-1px;right:-1px;width:11px;height:11px;background:#4ade80;border:2px solid var(--bg-panel);border-radius:50%"></span>`:''}
      </div>
      <div style="flex:1;min-width:0">
        <div style="font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(u.name||'Użytkownik')}</div>
        <div style="font-size:11px;color:var(--text-tertiary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(u.email||'')}</div>
      </div>
      <div style="font-size:11px;color:${isOnline?'#4ade80':'var(--text-tertiary)'};font-weight:600;flex-shrink:0">${isOnline?'🟢 online':(u.last_seen_at?'widziany(a) '+relativeDate(u.last_seen_at):'nigdy')}</div>
    </div>`;
  }).join('');
}


// ── KOSZ (soft-delete filmów i postów, 24h na przywrócenie) ─────────────
async function renderTrashList(){
  const body=document.getElementById('admin-panel-body');
  body.innerHTML='<p style="color:var(--text-tertiary);padding:30px 20px;text-align:center">Ładowanie...</p>';
  const{data:trashVideos}=await sb.from('videos').select('id,title,user_email,user_id,deleted_at').not('deleted_at','is',null).order('deleted_at',{ascending:false});
  const{data:trashPosts}=await sb.from('posts').select('id,text,user_email,user_id,deleted_at').not('deleted_at','is',null).order('deleted_at',{ascending:false});
  const items=[
    ...(trashVideos||[]).map(v=>({...v,type:'video',label:v.title||'Bez tytułu'})),
    ...(trashPosts||[]).map(p=>({...p,type:'post',label:p.text?(p.text.slice(0,60)+(p.text.length>60?'…':'')):'(post bez tekstu)'}))
  ].sort((a,b)=>new Date(b.deleted_at)-new Date(a.deleted_at));

  const clearBtnHtml=`<div style="padding:14px 20px;border-bottom:1px solid var(--border-soft);display:flex;justify-content:space-between;align-items:center;gap:10px">
    <span style="font-size:11px;color:var(--text-tertiary)">Elementy starsze niż 24h można trwale usunąć.</span>
    <button onclick="purgeOldTrash()" style="background:#3a1414;border:1px solid #5c1f1f;color:#ff6b6b;padding:8px 16px;border-radius:8px;cursor:pointer;font-size:12px;font-weight:600;white-space:nowrap">🗑 Wyczyść stare (24h+)</button>
  </div>`;

  if(!items.length){body.innerHTML=clearBtnHtml+'<p style="color:var(--text-tertiary);padding:30px 20px;text-align:center">Kosz jest pusty 🎉</p>';return;}

  body.innerHTML=clearBtnHtml+items.map(it=>{
    const deletedMs=Date.now()-new Date(it.deleted_at).getTime();
    const expired=deletedMs>24*3600*1000;
    const hoursLeft=Math.max(0,Math.ceil(24-deletedMs/3600000));
    return`<div class="admin-row">
      <div style="font-size:18px;flex-shrink:0">${it.type==='video'?'🎬':'📝'}</div>
      <div style="flex:1;min-width:0">
        <div style="font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(it.label)}</div>
        <div style="font-size:11px;color:var(--text-tertiary)">${esc(it.user_email||it.user_id||'')} · usunięte ${relativeDate(it.deleted_at)} · ${expired?'<span style="color:#ff6b6b">wygasło</span>':`wygasa za ${hoursLeft}h`}</div>
      </div>
      <button onclick="restoreFromTrash('${it.type}','${it.id}')" style="background:#14301a;border:1px solid #1f5c2a;color:#7fe08a;padding:6px 12px;border-radius:8px;cursor:pointer;font-size:12px;flex-shrink:0">↩️ Przywróć</button>
      <button onclick="hardDeleteFromTrash('${it.type}','${it.id}')" style="background:#3a1414;border:1px solid #5c1f1f;color:#ff6b6b;padding:6px 12px;border-radius:8px;cursor:pointer;font-size:12px;flex-shrink:0">Usuń na stałe</button>
    </div>`;
  }).join('');
}


// ── BOTY (wykrywanie/banowanie automatycznego ruchu) ─────────────────────
async function renderBotsList(){
  const body=document.getElementById('admin-panel-body');
  body.innerHTML='<p style="color:var(--text-tertiary);padding:30px 20px;text-align:center">Ładowanie...</p>';
  const{data:banned}=await sb.from('banned_bots').select('*').order('banned_at',{ascending:false});
  const{data:activity}=await sb.from('bot_activity_log').select('*').order('created_at',{ascending:false}).limit(200);
  const badge=document.getElementById('bots-count-badge');

  const bannedSet=new Set((banned||[]).map(b=>b.ip_address));
  const byIp={};
  (activity||[]).forEach(a=>{
    if(!byIp[a.ip_address])byIp[a.ip_address]={ip_address:a.ip_address,user_agent:a.user_agent,count:0,last:a.created_at,reason:a.flagged_reason};
    byIp[a.ip_address].count++;
    if(new Date(a.created_at)>new Date(byIp[a.ip_address].last)){byIp[a.ip_address].last=a.created_at;byIp[a.ip_address].reason=a.flagged_reason;}
  });
  if(badge)badge.textContent=(banned||[]).length+Object.keys(byIp).filter(ip=>!bannedSet.has(ip)).length;

  const banBtnHtml=`<div style="padding:14px 20px;border-bottom:1px solid var(--border-soft);display:flex;gap:8px;align-items:center">
    <input id="bot-manual-ip" aria-label="IP do zbanowania ręcznie" placeholder="IP do zbanowania ręcznie" style="flex:1;background:var(--bg-sunken);border:1px solid var(--border-soft);color:var(--text-primary);padding:8px 12px;border-radius:8px;font-size:12px">
    <button onclick="banBotManual()" style="background:#3a1414;border:1px solid #5c1f1f;color:#ff6b6b;padding:8px 16px;border-radius:8px;cursor:pointer;font-size:12px;font-weight:600;white-space:nowrap">🚫 Zbanuj IP</button>
  </div>`;

  const bannedHtml=(banned||[]).map(b=>`<div class="admin-row">
      <div style="font-size:18px;flex-shrink:0">🚫</div>
      <div style="flex:1;min-width:0">
        <div style="font-size:13px;font-weight:600">${esc(b.ip_address)}</div>
        <div style="font-size:11px;color:var(--text-tertiary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(b.user_agent||'')} ${b.reason?'· '+esc(b.reason):''}</div>
      </div>
      <button onclick="unbanBotManual('${esc(b.ip_address)}')" style="background:#14301a;border:1px solid #1f5c2a;color:#7fe08a;padding:6px 12px;border-radius:8px;cursor:pointer;font-size:12px;flex-shrink:0">✅ Odbanuj</button>
    </div>`).join('');

  const watchedHtml=Object.values(byIp).filter(b=>!bannedSet.has(b.ip_address)).sort((a,b)=>b.count-a.count).map(b=>`<div class="admin-row">
      <div style="font-size:18px;flex-shrink:0">👁</div>
      <div style="flex:1;min-width:0">
        <div style="font-size:13px;font-weight:600">${esc(b.ip_address)} <span style="color:var(--text-tertiary);font-weight:400">· ${b.count} żądań</span></div>
        <div style="font-size:11px;color:var(--text-tertiary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(b.user_agent||'')} ${b.reason?'· '+esc(b.reason):''} · ${relativeDate(b.last)}</div>
      </div>
      <button onclick="banBotManual('${esc(b.ip_address)}')" style="background:#3a1414;border:1px solid #5c1f1f;color:#ff6b6b;padding:6px 12px;border-radius:8px;cursor:pointer;font-size:12px;flex-shrink:0">🚫 Zbanuj</button>
    </div>`).join('');

  const sections=[
    banBtnHtml,
    `<div style="padding:10px 20px 4px;font-size:11px;font-weight:700;color:var(--text-tertiary);text-transform:uppercase">Zbanowane (${(banned||[]).length})</div>`,
    bannedHtml||'<p style="color:var(--text-tertiary);padding:10px 20px">Brak zbanowanych.</p>',
    `<div style="padding:16px 20px 4px;font-size:11px;font-weight:700;color:var(--text-tertiary);text-transform:uppercase">Obserwowane / podejrzane (${Object.keys(byIp).length-bannedSet.size<0?0:Object.values(byIp).filter(b=>!bannedSet.has(b.ip_address)).length})</div>`,
    watchedHtml||'<p style="color:var(--text-tertiary);padding:10px 20px">Brak podejrzanej aktywności.</p>'
  ];
  body.innerHTML=sections.join('');
}

async function banBotManual(ipArg){
  if(!isAdmin()){toast('Brak uprawnień');return;}
  const ip=ipArg||document.getElementById('bot-manual-ip')?.value?.trim();
  if(!ip){toast('Podaj adres IP');return;}
  await sb.from('banned_bots').upsert([{ip_address:ip,reason:'Ręczny ban z Admin Studio',banned_by:currentUser.email}],{onConflict:'ip_address'});
  logAdminAction('ban_bot',`Zbanowano IP bota: ${ip}`);
  toast('Zbanowano IP ✅');
  renderBotsList();
}

async function unbanBotManual(ip){
  if(!isAdmin()){toast('Brak uprawnień');return;}
  await sb.from('banned_bots').delete().eq('ip_address',ip);
  logAdminAction('unban_bot',`Odbanowano IP bota: ${ip}`);
  toast('Odbanowano IP ✅');
  renderBotsList();
}

async function restoreFromTrash(type,id){
  if(!isAdmin()){toast('Brak uprawnień');return;}
  const table=type==='video'?'videos':'posts';
  await sb.from(table).update({deleted_at:null,deleted_by:null}).eq('id',id);
  logAdminAction('restore_'+type,`Przywrócono z kosza: ${type} #${id}`);
  toast('Przywrócono ✅');
  if(type==='video')await loadVideos();
  renderTrashList();
}

async function hardDeleteFromTrash(type,id){
  if(!isAdmin()){toast('Brak uprawnień');return;}
  if(!await showConfirm('Usunąć na stałe?','Tej czynności NIE da się cofnąć.'))return;
  const table=type==='video'?'videos':'posts';
  await sb.from(table).delete().eq('id',id);
  logAdminAction('hard_delete_'+type,`Trwale usunięto: ${type} #${id}`);
  toast('Usunięto na stałe 🗑');
  renderTrashList();
}

async function purgeOldTrash(){
  if(!isAdmin()){toast('Brak uprawnień');return;}
  if(!await showConfirm('Wyczyścić stary kosz?','Wszystkie elementy usunięte ponad 24h temu znikną na zawsze.'))return;
  const cutoff=new Date(Date.now()-24*3600*1000).toISOString();
  await sb.from('videos').delete().not('deleted_at','is',null).lt('deleted_at',cutoff);
  await sb.from('posts').delete().not('deleted_at','is',null).lt('deleted_at',cutoff);
  logAdminAction('purge_trash','Wyczyszczono elementy z kosza starsze niż 24h');
  toast('Kosz wyczyszczony 🗑');
  renderTrashList();
}


async function adminBanUserIp(userId){
  if(!isAdmin())return;
  const u=adminUsersCache.find(x=>x.id===userId);
  if(!u?.last_ip){toast('Brak zapisanego IP dla tego użytkownika');return;}
  await sb.from('banned_bots').upsert([{ip_address:u.last_ip,reason:`Zbanowano IP użytkownika ${u.email||u.name}`,banned_by:currentUser.email}],{onConflict:'ip_address'});
  logAdminAction('ban_ip','Zbanowano IP '+u.last_ip+' (użytkownik: '+(u.email||u.name)+')');
  toast(`Zbanowano IP: ${u.last_ip} 🌐🚫`);
}

function renderAdminUsersList(banMap){
  if(banMap)adminUsersBanMap=banMap;
  const body=document.getElementById('admin-panel-body');
  const q=(document.getElementById('admin-user-search')?.value||'').trim().toLowerCase();
  const filtered=q?adminUsersCache.filter(u=>(u.name||'').toLowerCase().includes(q)||(u.email||'').toLowerCase().includes(q)):adminUsersCache;
  const listHtml=!filtered.length
    ?`<p style="color:var(--text-tertiary);padding:20px;text-align:center">${q?'Brak wyników dla "'+q+'"':'Brak użytkowników'}</p>`
    :filtered.map(u=>{
      const ban=adminUsersBanMap[u.id];
      return`<div style="display:flex;align-items:center;gap:12px;padding:10px 14px;border-bottom:1px solid var(--border-soft)">
        ${u.avatar?`<img src="${u.avatar}" style="width:34px;height:34px;border-radius:50%;object-fit:cover;flex-shrink:0;cursor:pointer" onclick="closeAdminPanel();showChannel('${u.id}','${jsesc(u.name)}','${u.avatar}','${u.email||''}')">`:`<div style="width:34px;height:34px;border-radius:50%;background:#cc0000;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;flex-shrink:0;cursor:pointer" onclick="closeAdminPanel();showChannel('${u.id}','${jsesc(u.name)}','','${u.email||''}')">${esc((u.name||'?')[0].toUpperCase())}</div>`}
        <div style="flex:1;min-width:0;cursor:pointer" onclick="closeAdminPanel();showChannel('${u.id}','${jsesc(u.name)}','${u.avatar||''}','${u.email||''}')">
          <div style="font-size:13px;font-weight:600" id="uname-${u.id}">${esc(u.name)}${ban?' <span style="color:#ff6b6b;font-size:11px">🚫 zablokowany</span>':''}</div>
          <div style="font-size:11px;color:var(--text-tertiary)">${esc(u.email)}${u.last_ip?` · IP: ${esc(u.last_ip)}`:''}</div>
        </div>
        <button onclick="event.stopPropagation();toggleRenameUser('${u.id}',this)" title="Zmień nick" style="background:var(--border-soft);border:none;color:var(--text-primary);padding:6px 10px;border-radius:8px;cursor:pointer;font-size:12px;flex-shrink:0">✏️</button>
        ${u.last_ip?`<button onclick="event.stopPropagation();adminBanUserIp('${u.id}')" title="Zbanuj adres IP tego użytkownika (jak ban bota)" style="background:#3a1414;border:1px solid #5c1f1f;color:#ff6b6b;padding:6px 10px;border-radius:8px;cursor:pointer;font-size:12px;flex-shrink:0">🌐 IP</button>`:''}
        ${u.is_vip?
          `<button onclick="event.stopPropagation();adminSetVip('${u.id}','${jsesc(u.email||'')}',false)" style="background:#332a0a;border:1px solid #5c4a0f;color:#ffd700;padding:6px 12px;border-radius:8px;cursor:pointer;font-size:12px;flex-shrink:0">⭐ Odbierz VIP</button>`
          :`<button onclick="event.stopPropagation();adminSetVip('${u.id}','${jsesc(u.email||'')}',true)" style="background:var(--border-soft);border:1px solid #3a3a3a;color:var(--text-secondary);padding:6px 12px;border-radius:8px;cursor:pointer;font-size:12px;flex-shrink:0">⭐ Nadaj VIP</button>`}
        ${ban?
          `<button onclick="event.stopPropagation();adminUnbanUser('${u.id}')" style="background:#14301a;border:1px solid #1f5c2a;color:#7fe08a;padding:6px 12px;border-radius:8px;cursor:pointer;font-size:12px;flex-shrink:0">Odblokuj</button>`
          :`<div style="position:relative;flex-shrink:0">
            <button onclick="event.stopPropagation();toggleAdminBanMenu('${u.id}',this)" style="background:#3a1414;border:1px solid #5c1f1f;color:#ff6b6b;padding:6px 12px;border-radius:8px;cursor:pointer;font-size:12px">🚫 Zablokuj</button>
          </div>`}
      </div>`;
    }).join('');
  body.innerHTML=`
    <div style="padding:12px 14px;position:sticky;top:0;background:var(--bg-panel);z-index:5">
      <input id="admin-user-search" type="text" placeholder="🔍 Szukaj po nicku lub e-mailu..." value="${q}" oninput="renderAdminUsersList()" style="width:100%;background:var(--bg-sunken);border:1px solid var(--border);border-radius:8px;color:var(--text-primary);padding:10px 14px;font-size:13px;outline:none">
    </div>
    <div>${listHtml}</div>`;
  const inp=document.getElementById('admin-user-search');
  if(inp){inp.focus();inp.setSelectionRange(inp.value.length,inp.value.length);}
}

function openAdminPanel(){
  if(!isAdmin()){toast('Brak uprawnień');return;}
  document.getElementById('admin-panel-modal').classList.add('open');
  document.body.style.overflow='hidden';
  renderAdminPanel();
}

function closeAdminPanel(){
  document.getElementById('admin-panel-modal').classList.remove('open');
  document.body.style.overflow='';
}

function setAdminTab(tab){
  adminTab=tab;
  renderAdminPanel();
}


// ── KONSOLA ADMINA / EFEKTY GLOBALNE ────────────────────────────────────
let lastSeenBurstAt=null; // null = jeszcze nie sprawdzone w tej sesji

// ── MUZYKA DISCO (generowana na żywo, bez praw autorskich) ─────────────
let discoAudioCtx=null,discoAudioInterval=null;

function startDiscoMusic(){
  if(discoAudioInterval)return;
  try{
    discoAudioCtx=discoAudioCtx||new(window.AudioContext||window.webkitAudioContext)();
    if(discoAudioCtx.state==='suspended')discoAudioCtx.resume();
    let step=0;
    const bpm=124;
    const stepTime=(60/bpm/2)*1000;
    discoAudioInterval=setInterval(()=>{
      const t=discoAudioCtx.currentTime;
      if(step%4===0){ // stopa (kick) na każdą ćwiartkę
        const osc=discoAudioCtx.createOscillator();
        const gain=discoAudioCtx.createGain();
        osc.frequency.setValueAtTime(150,t);
        osc.frequency.exponentialRampToValueAtTime(45,t+.15);
        gain.gain.setValueAtTime(.55,t);
        gain.gain.exponentialRampToValueAtTime(.01,t+.15);
        osc.connect(gain);gain.connect(discoAudioCtx.destination);
        osc.start(t);osc.stop(t+.16);
      }
      if(step%2===1){ // hi-hat na ósemkach
        const bufSize=discoAudioCtx.sampleRate*.03;
        const buf=discoAudioCtx.createBuffer(1,bufSize,discoAudioCtx.sampleRate);
        const d=buf.getChannelData(0);
        for(let i=0;i<bufSize;i++)d[i]=(Math.random()*2-1)*.25;
        const noise=discoAudioCtx.createBufferSource();
        noise.buffer=buf;
        const hp=discoAudioCtx.createBiquadFilter();
        hp.type='highpass';hp.frequency.value=7000;
        const hg=discoAudioCtx.createGain();
        hg.gain.setValueAtTime(.25,t);
        hg.gain.exponentialRampToValueAtTime(.01,t+.03);
        noise.connect(hp);hp.connect(hg);hg.connect(discoAudioCtx.destination);
        noise.start(t);
      }
      if(step===2||step===6){ // basowa nutka w kontrze
        const osc=discoAudioCtx.createOscillator();
        const gain=discoAudioCtx.createGain();
        osc.type='sawtooth';
        osc.frequency.setValueAtTime([98,110,123][Math.floor(Math.random()*3)],t);
        gain.gain.setValueAtTime(.12,t);
        gain.gain.exponentialRampToValueAtTime(.01,t+.2);
        osc.connect(gain);gain.connect(discoAudioCtx.destination);
        osc.start(t);osc.stop(t+.2);
      }
      step=(step+1)%8;
    },stepTime);
  }catch(e){/* autoplay zablokowany przez przeglądarkę - trudno, zadziała po pierwszej interakcji usera */}
}

function stopDiscoMusic(){
  if(discoAudioInterval){clearInterval(discoAudioInterval);discoAudioInterval=null;}
}

async function checkDiscoState(){
  const{data,error}=await sb.from('site_state').select('*').eq('id',1).single();
  if(error||!data)return; // nie zmieniamy stanu przy przejściowym błędzie - to psuło disco po ~4s
  const overlay=document.getElementById('disco-overlay');
  if(overlay){
    const wasActive=overlay.classList.contains('active');
    const nowActive=data.active_effect==='disco';
    overlay.classList.toggle('active',nowActive);
    if(nowActive&&!wasActive)startDiscoMusic();
    if(!nowActive&&wasActive)stopDiscoMusic();
  }
  toggleSnowEffect(data.active_effect==='snow');
  toggleRainEffect(data.active_effect==='rain');
  toggleMatrixEffect(data.active_effect==='matrix');
  toggleEarthquakeEffect(data.active_effect==='earthquake');
  toggleUpsidedownEffect(data.active_effect==='upsidedown');
  toggleZoomEffect(data.active_effect==='zoom');
  toggleRainbowEffect(data.active_effect==='rainbow');
  toggleBlurEffect(data.active_effect==='blur');
  toggleSpinEffect(data.active_effect==='spin');
  if(!ny2027Playing)toggleFireworksEffect(data.active_effect==='fireworks');
  syncMusicState(data.music_url,!!data.music_active);
  syncBroadcastText(data.broadcast_text||'',data.broadcast_by||'');
  if(lastSeenBurstAt===null){
    // pierwsze sprawdzenie w tej sesji - zapamiętaj ostatni wybuch, ale go NIE odpalaj (to stary event sprzed wejścia do appki)
    lastSeenBurstAt=data.last_burst_at||'';
  } else if(data.last_burst_at&&data.last_burst_at!==lastSeenBurstAt){
    lastSeenBurstAt=data.last_burst_at;
    if(data.last_burst==='confetti')fireConfetti();
    if(data.last_burst==='shake')fireShake();
    if(data.last_burst==='hearts')fireHearts();
    if(data.last_burst==='flash')fireFlash();
    if(data.last_burst==='newyear2027')fireNewYear2027();
  }
}

async function setActiveEffect(effect){
  const{data,error:selErr}=await sb.from('site_state').select('active_effect').eq('id',1).single();
  if(selErr){consoleLog('Błąd odczytu stanu: '+selErr.message,'#ff6b6b');return null;}
  const newEffect=data?.active_effect===effect?null:effect;
  const{error:upErr}=await sb.from('site_state').upsert([{id:1,active_effect:newEffect,updated_at:new Date().toISOString()}]);
  if(upErr){consoleLog('Błąd zapisu stanu: '+upErr.message,'#ff6b6b');return null;}
  checkDiscoState();
  return newEffect;
}

async function fireGlobalBurst(effect){
  const{error}=await sb.from('site_state').upsert([{id:1,last_burst:effect,last_burst_at:new Date().toISOString()}]);
  if(error)consoleLog('Błąd: '+error.message,'#ff6b6b');
}

async function setMusic(url){
  const{data,error:selErr}=await sb.from('site_state').select('music_url,music_active').eq('id',1).single();
  if(selErr){consoleLog('Błąd odczytu stanu: '+selErr.message,'#ff6b6b');return null;}
  let newUrl=data?.music_url||'',newActive;
  if(url==='off'){
    newActive=false;
  }else if(url){
    const gdid=gdId(url);
    newUrl=gdid?`https://drive.google.com/uc?export=download&id=${gdid}`:url;
    newActive=true;
    if(gdid)consoleLog('Wykryto link Google Drive — upewnij się że plik ma udostępnianie "Każdy, kto ma link"','#ffd700');
  }else{
    // brak argumentu = przełącz obecny/ostatni utwór
    newActive=!data?.music_active;
  }
  if(newActive&&!newUrl){consoleLog('Podaj link do muzyki: music <url>','#ff6b6b');return null;}
  const{error:upErr}=await sb.from('site_state').upsert([{id:1,music_url:newUrl,music_active:newActive,updated_at:new Date().toISOString()}]);
  if(upErr){consoleLog('Błąd zapisu stanu: '+upErr.message,'#ff6b6b');return null;}
  checkDiscoState();
  return{active:newActive,url:newUrl};
}

let musicState={url:'',attempted:false};
function syncMusicState(url,active){
  const audioEl=document.getElementById('bg-music-player');
  if(!audioEl)return;
  if(active&&url){
    if(musicState.url!==url){
      musicState={url,attempted:false};
      audioEl.src=url;
    }
    if(musicState.attempted)return; // nie spamuj play() co 4 sekundy jeśli już próbowaliśmy
    musicState.attempted=true;
    audioEl.volume=0.35;
    audioEl.play().catch(()=>{}); // autoplay może być zablokowany do pierwszej interakcji - i tak nie pokazujemy przycisku
  }else{
    audioEl.pause();
    musicState={url:'',attempted:false};
  }
}

// Przeglądarki blokują dźwięk do pierwszej interakcji usera na stronie - łapiemy to
// po cichu przy pierwszym kliknięciu/dotknięciu, żeby muzyka ruszyła bez żadnego przycisku.
// Faza "capture" (true na końcu) - żeby złapać zdarzenie ZANIM jakiś przycisk zatrzyma je stopPropagation().
['click','touchstart','keydown'].forEach(evt=>{
  document.addEventListener(evt,()=>{
    const audioEl=document.getElementById('bg-music-player');
    if(audioEl&&audioEl.paused&&musicState.url)audioEl.play().catch(()=>{});
  },true);
});

// ── ŚNIEG ────────────────────────────────────────────────────────────────
// Samodzielny moduł: canvas na całą stronę, płatki spadają i osiadają w
// narastającą warstwę (mapa wysokości per-kolumna), użytkownik odgarnia
// śnieg ruchem myszy (kursor-miotła). W 100% lokalne - stan istnieje
// tylko w pamięci tej przeglądarki, zero synchronizacji przez Supabase.
// Globalne jest tylko WŁĄCZENIE/WYŁĄCZENIE (flaga w site_state.active_effect),
// czytane przez checkDiscoState() i przekazywane tu jako toggleSnowEffect(on).
const SnowFX=(()=>{
  let canvas=null,ctx=null,rafId=null,active=false,fadingOut=false;
  let dpr=1,colW=10,cols=0,heightMap=null;
  let particles=[];
  const MAX_PARTICLES=500,GROW_MINUTES=15;
  let activatedAt=0,lastFrameTs=0,lastSpawnTs=0;

  function ensureCanvas(){
    if(canvas)return;
    canvas=document.getElementById('snow-canvas');
    if(!canvas)return;
    ctx=canvas.getContext('2d');
    window.addEventListener('resize',resize);
    window.addEventListener('mousemove',e=>{if(active)shovelAt(e.clientX,e.clientY);});
    window.addEventListener('touchmove',e=>{if(active&&e.touches[0])shovelAt(e.touches[0].clientX,e.touches[0].clientY);},{passive:true});
  }

  function resize(){
    if(!canvas)return;
    dpr=Math.min(window.devicePixelRatio||1,2);
    canvas.width=window.innerWidth*dpr;
    canvas.height=window.innerHeight*dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    cols=Math.ceil(window.innerWidth/colW)+1;
    const old=heightMap;
    heightMap=new Float32Array(cols);
    if(old)heightMap.set(old.subarray(0,Math.min(old.length,cols)));
  }

  function currentMaxLayer(){
    const elapsedMin=(Date.now()-activatedAt)/60000;
    const fullScreen=window.innerHeight;
    return Math.min(fullScreen,(elapsedMin/GROW_MINUTES)*fullScreen);
  }

  function spawnParticle(){
    particles.push({
      x:Math.random()*window.innerWidth,
      y:-10,
      r:2.5+Math.random()*4,
      vy:320+Math.random()*220,
      sway:Math.random()*Math.PI*2,
      swaySpeed:.5+Math.random()*1
    });
  }

  function shovelAt(mx,my){
    const radius=42;
    const c0=Math.max(0,Math.floor((mx-radius)/colW));
    const c1=Math.min(cols-1,Math.ceil((mx+radius)/colW));
    for(let c=c0;c<=c1;c++){
      const colX=c*colW;
      const dist=Math.abs(colX-mx);
      if(dist>radius)continue;
      const groundY=window.innerHeight-heightMap[c];
      if(my>=groundY-radius){
        const falloff=1-dist/radius;
        heightMap[c]=Math.max(0,heightMap[c]-falloff*9);
      }
    }
    // odgarnij też lecące płatki blisko kursora
    particles=particles.filter(p=>{
      const dx=p.x-mx,dy=p.y-my;
      return dx*dx+dy*dy>radius*radius*0.4;
    });
  }

  function depositAt(x){
    const c=Math.max(0,Math.min(cols-1,Math.round(x/colW)));
    const cap=currentMaxLayer();
    const spread=[[c,1],[c-1,.5],[c+1,.5]];
    spread.forEach(([ci,w])=>{
      if(ci<0||ci>=cols)return;
      heightMap[ci]=Math.min(cap+Math.random()*8,heightMap[ci]+1.6*w);
    });
  }

  function drawLayer(){
    if(!cols)return;
    ctx.beginPath();
    ctx.moveTo(0,window.innerHeight);
    ctx.lineTo(0,window.innerHeight-heightMap[0]);
    for(let c=1;c<cols;c++){
      const x=c*colW,y=window.innerHeight-heightMap[c];
      const px=(c-0.5)*colW,py=window.innerHeight-((heightMap[c-1]+heightMap[c])/2);
      ctx.quadraticCurveTo(px,py,x,y);
    }
    ctx.lineTo(window.innerWidth,window.innerHeight);
    ctx.closePath();
    ctx.fillStyle='rgba(255,255,255,.94)';
    ctx.fill();
    ctx.strokeStyle='rgba(200,220,255,.5)';
    ctx.lineWidth=2;
    ctx.stroke();
  }

  function tick(ts){
    if(!lastFrameTs)lastFrameTs=ts;
    const dt=Math.min(.05,(ts-lastFrameTs)/1000);
    lastFrameTs=ts;
    ctx.clearRect(0,0,window.innerWidth,window.innerHeight);

    if(active&&!fadingOut&&ts-lastSpawnTs>10&&particles.length<MAX_PARTICLES){
      lastSpawnTs=ts;
      spawnParticle();
    }

    particles=particles.filter(p=>{
      p.y+=p.vy*dt;
      p.sway+=p.swaySpeed*dt;
      p.x+=Math.sin(p.sway)*12*dt;
      const groundY=window.innerHeight-heightMap[Math.max(0,Math.min(cols-1,Math.round(p.x/colW)))];
      if(p.y>=groundY){
        depositAt(p.x);
        return false;
      }
      return true;
    });

    ctx.fillStyle='#fff';
    particles.forEach(p=>{
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fill();
    });

    drawLayer();

    if(active||particles.length||heightMap?.some(h=>h>0.5)){
      rafId=requestAnimationFrame(tick);
    }else{
      rafId=null;
    }
  }

  function start(){
    ensureCanvas();
    if(!canvas)return;
    resize();
    active=true;fadingOut=false;
    activatedAt=Date.now();
    lastFrameTs=0;lastSpawnTs=0;
    canvas.style.display='block';
    document.body.classList.add('snow-active');
    requestAnimationFrame(()=>{canvas.style.opacity='1';});
    if(!rafId)rafId=requestAnimationFrame(tick);
  }

  function stop(){
    active=false;fadingOut=true;
    document.body.classList.remove('snow-active');
    if(canvas)canvas.style.opacity='0';
    setTimeout(()=>{
      fadingOut=false;
      particles=[];
      if(heightMap)heightMap.fill(0);
      if(canvas)canvas.style.display='none';
    },1800);
  }

  return{
    toggle(on){
      if(on&&!active)start();
      else if(!on&&active)stop();
    }
  };
})();

function toggleSnowEffect(on){
  SnowFX.toggle(on);
}

// ── DESZCZ / WODA ────────────────────────────────────────────────────────
// Analogicznie do śniegu: canvas na całą stronę, krople spadają i dokładają
// się do warstwy wody (mapa wysokości per-kolumna). W przeciwieństwie do
// śniegu wody NIE da się usunąć - ruch myszy tylko PRZEPYCHA ją do
// sąsiednich kolumn (suma wysokości jest zachowana), plus prosta "fizyka"
// wyrównywania poziomu (dyfuzja) każdej klatki, żeby fala się rozchodziła
// i opadała jak prawdziwa woda. Wyłączenie efektu czyści wodę do zera.
const RainFX=(()=>{
  let canvas=null,ctx=null,rafId=null,active=false,fadingOut=false;
  let dpr=1,colW=10,cols=0,heightMap=null;
  let drops=[];
  const MAX_DROPS=260,GROW_MINUTES=15;
  let activatedAt=0,lastFrameTs=0,lastSpawnTs=0;

  function ensureCanvas(){
    if(canvas)return;
    canvas=document.getElementById('rain-canvas');
    if(!canvas)return;
    ctx=canvas.getContext('2d');
    window.addEventListener('resize',resize);
    window.addEventListener('mousemove',e=>{if(active)pushAt(e.clientX,e.clientY);});
    window.addEventListener('touchmove',e=>{if(active&&e.touches[0])pushAt(e.touches[0].clientX,e.touches[0].clientY);},{passive:true});
  }

  function resize(){
    if(!canvas)return;
    dpr=Math.min(window.devicePixelRatio||1,2);
    canvas.width=window.innerWidth*dpr;
    canvas.height=window.innerHeight*dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    cols=Math.ceil(window.innerWidth/colW)+1;
    const old=heightMap;
    heightMap=new Float32Array(cols);
    if(old)heightMap.set(old.subarray(0,Math.min(old.length,cols)));
  }

  function currentMaxLayer(){
    const elapsedMin=(Date.now()-activatedAt)/60000;
    const fullScreen=window.innerHeight;
    return Math.min(fullScreen,(elapsedMin/GROW_MINUTES)*fullScreen);
  }

  function spawnDrop(){
    drops.push({
      x:Math.random()*window.innerWidth,
      y:-10,
      vy:340+Math.random()*180,
      len:14+Math.random()*12
    });
  }

  // Przepychanie: bierze wodę z kolumn pod kursorem i przenosi ją tuż za
  // promień po obu stronach - suma wysokości się nie zmienia, woda tylko
  // "ucieka" spod kursora jak fala.
  function pushAt(mx,my){
    if(!cols)return;
    const radius=60;
    const c0=Math.max(0,Math.floor((mx-radius)/colW));
    const c1=Math.min(cols-1,Math.ceil((mx+radius)/colW));
    const leftTarget=Math.max(0,Math.floor((mx-radius-6)/colW));
    const rightTarget=Math.min(cols-1,Math.ceil((mx+radius+6)/colW));
    for(let c=c0;c<=c1;c++){
      const colX=c*colW;
      const dist=Math.abs(colX-mx);
      if(dist>radius)continue;
      const groundY=window.innerHeight-heightMap[c];
      if(my<groundY-radius)continue;
      const falloff=1-dist/radius;
      const amount=heightMap[c]*falloff*.05;
      if(amount<=0)continue;
      heightMap[c]-=amount;
      const half=amount/2;
      heightMap[leftTarget]+=half;
      heightMap[rightTarget]+=half;
    }
  }

  function depositAt(x){
    const c=Math.max(0,Math.min(cols-1,Math.round(x/colW)));
    const cap=currentMaxLayer();
    if(heightMap[c]<cap)heightMap[c]=Math.min(cap,heightMap[c]+1.4);
  }

  // Prosta dyfuzja - woda dąży do wspólnego poziomu z sąsiadami, dzięki
  // czemu fale po przepchnięciu płynnie się rozchodzą i opadają.
  function settleWater(){
    if(!cols)return;
    for(let c=1;c<cols-1;c++){
      const avg=(heightMap[c-1]+heightMap[c]+heightMap[c+1])/3;
      heightMap[c]+=(avg-heightMap[c])*.06;
    }
  }

  function drawLayer(){
    if(!cols)return;
    ctx.beginPath();
    ctx.moveTo(0,window.innerHeight);
    ctx.lineTo(0,window.innerHeight-heightMap[0]);
    for(let c=1;c<cols;c++){
      const x=c*colW,y=window.innerHeight-heightMap[c];
      const px=(c-0.5)*colW,py=window.innerHeight-((heightMap[c-1]+heightMap[c])/2);
      ctx.quadraticCurveTo(px,py,x,y);
    }
    ctx.lineTo(window.innerWidth,window.innerHeight);
    ctx.closePath();
    ctx.fillStyle='rgba(40,110,200,.55)';
    ctx.fill();
    ctx.strokeStyle='rgba(140,200,255,.6)';
    ctx.lineWidth=2;
    ctx.stroke();
  }

  function tick(ts){
    if(!lastFrameTs)lastFrameTs=ts;
    const dt=Math.min(.05,(ts-lastFrameTs)/1000);
    lastFrameTs=ts;
    ctx.clearRect(0,0,window.innerWidth,window.innerHeight);

    if(active&&!fadingOut&&ts-lastSpawnTs>16&&drops.length<MAX_DROPS){
      lastSpawnTs=ts;
      spawnDrop();
    }

    drops=drops.filter(d=>{
      d.y+=d.vy*dt;
      const groundY=window.innerHeight-heightMap[Math.max(0,Math.min(cols-1,Math.round(d.x/colW)))];
      if(d.y>=groundY){
        depositAt(d.x);
        return false;
      }
      return true;
    });

    ctx.strokeStyle='rgba(180,220,255,.55)';
    ctx.lineWidth=1.5;
    drops.forEach(d=>{
      ctx.beginPath();
      ctx.moveTo(d.x,d.y);
      ctx.lineTo(d.x,d.y+d.len);
      ctx.stroke();
    });

    settleWater();
    drawLayer();

    if(active||drops.length||heightMap?.some(h=>h>0.5)){
      rafId=requestAnimationFrame(tick);
    }else{
      rafId=null;
    }
  }

  function start(){
    ensureCanvas();
    if(!canvas)return;
    resize();
    active=true;fadingOut=false;
    activatedAt=Date.now();
    lastFrameTs=0;lastSpawnTs=0;
    canvas.style.display='block';
    requestAnimationFrame(()=>{canvas.style.opacity='1';});
    if(!rafId)rafId=requestAnimationFrame(tick);
  }

  function stop(){
    active=false;fadingOut=true;
    if(canvas)canvas.style.opacity='0';
    setTimeout(()=>{
      fadingOut=false;
      drops=[];
      if(heightMap)heightMap.fill(0);
      if(canvas)canvas.style.display='none';
    },1800);
  }

  return{
    toggle(on){
      if(on&&!active)start();
      else if(!on&&active)stop();
    }
  };
})();

function toggleRainEffect(on){
  RainFX.toggle(on);
}

// ── FAJERWERKI (globalny przełącznik, trwa dopóki admin nie wyłączy) ──────
// Canvas na całą stronę: rakiety z ogonem lecą w górę, w losowym momencie
// wybuchają w kulę iskier z grawitacją/oporem powietrza i zanikaniem alpha,
// część wybuchów dostaje dodatkowy "crackle" (doleciałe iskry z opóźnieniem).
// Nowe rakiety odpalane w losowych odstępach, czasem podwójnie - ciągły pokaz.
const FireworksFX=(()=>{
  let canvas=null,ctx=null,rafId=null,active=false,boostMode=false;
  let dpr=1,W=0,H=0;
  let rockets=[],particles=[];
  let nextLaunchAt=0,lastTs=0;
  let audioCtx=null;
  const GRAVITY=140;
  const PALETTES=[
    ['#ff4757','#ffa502','#ffd166'],
    ['#1e90ff','#70a1ff','#a4e8ff'],
    ['#2ed573','#7bed9f','#c3ffce'],
    ['#a55eea','#d3a5ff','#ffe0ff'],
    ['#ff6b81','#ff9ff3','#ffe6f0'],
    ['#00ffff','#7afcff','#ffffff'],
    ['#ffdd59','#ffe58f','#fff6d5']
  ];

  function ensureCanvas(){
    if(canvas)return;
    canvas=document.getElementById('fireworks-canvas');
    if(!canvas)return;
    ctx=canvas.getContext('2d');
    window.addEventListener('resize',resize);
  }

  function resize(){
    if(!canvas)return;
    dpr=Math.min(window.devicePixelRatio||1,2);
    W=window.innerWidth;H=window.innerHeight;
    canvas.width=W*dpr;canvas.height=H*dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }

  function hexToRgba(hex,a){
    const h=hex.replace('#','');
    const r=parseInt(h.length===3?h[0]+h[0]:h.substring(0,2),16);
    const g=parseInt(h.length===3?h[1]+h[1]:h.substring(2,4),16);
    const b=parseInt(h.length===3?h[2]+h[2]:h.substring(4,6),16);
    return`rgba(${r},${g},${b},${a})`;
  }

  function ensureAudio(){
    try{
      audioCtx=audioCtx||new(window.AudioContext||window.webkitAudioContext)();
      if(audioCtx.state==='suspended')audioCtx.resume();
    }catch(e){audioCtx=null;}
  }

  function noiseBuffer(dur){
    const size=Math.floor(audioCtx.sampleRate*dur);
    const buf=audioCtx.createBuffer(1,size,audioCtx.sampleRate);
    const d=buf.getChannelData(0);
    for(let i=0;i<size;i++)d[i]=Math.random()*2-1;
    return buf;
  }

  function playLaunchSound(){
    if(!audioCtx)return;
    try{
      const t=audioCtx.currentTime;
      const noise=audioCtx.createBufferSource();
      noise.buffer=noiseBuffer(.5);
      const bp=audioCtx.createBiquadFilter();
      bp.type='bandpass';
      bp.Q.value=.8;
      bp.frequency.setValueAtTime(700,t);
      bp.frequency.exponentialRampToValueAtTime(2600,t+.5);
      const g=audioCtx.createGain();
      g.gain.setValueAtTime(.001,t);
      g.gain.exponentialRampToValueAtTime(.12,t+.08);
      g.gain.exponentialRampToValueAtTime(.001,t+.5);
      noise.connect(bp);bp.connect(g);g.connect(audioCtx.destination);
      noise.start(t);noise.stop(t+.5);
    }catch(e){}
  }

  function playExplosionSound(big){
    if(!audioCtx)return;
    try{
      const t=audioCtx.currentTime;
      // niski "bum"
      const osc=audioCtx.createOscillator();
      const og=audioCtx.createGain();
      osc.type='sine';
      osc.frequency.setValueAtTime(big?90:130,t);
      osc.frequency.exponentialRampToValueAtTime(30,t+.25);
      og.gain.setValueAtTime(big?.4:.25,t);
      og.gain.exponentialRampToValueAtTime(.01,t+.35);
      osc.connect(og);og.connect(audioCtx.destination);
      osc.start(t);osc.stop(t+.36);
      // trzask iskier - kilka rozsypanych paczek szumu
      const crackles=big?7:4;
      for(let i=0;i<crackles;i++){
        const dt=Math.random()*.4;
        const cNoise=audioCtx.createBufferSource();
        cNoise.buffer=noiseBuffer(.12);
        const hp=audioCtx.createBiquadFilter();
        hp.type='highpass';hp.frequency.value=3500+Math.random()*2500;
        const cg=audioCtx.createGain();
        cg.gain.setValueAtTime(.001,t+dt);
        cg.gain.exponentialRampToValueAtTime(.06+Math.random()*.05,t+dt+.01);
        cg.gain.exponentialRampToValueAtTime(.001,t+dt+.12);
        cNoise.connect(hp);hp.connect(cg);cg.connect(audioCtx.destination);
        cNoise.start(t+dt);cNoise.stop(t+dt+.13);
      }
    }catch(e){}
  }

  function launchRocket(){
    playLaunchSound();
    const x=W*0.1+Math.random()*W*0.8;
    const targetY=H*0.12+Math.random()*H*0.35;
    const palette=PALETTES[Math.floor(Math.random()*PALETTES.length)];
    const big=boostMode&&Math.random()<0.4;
    rockets.push({x,y:H+10,targetY,vy:-(520+Math.random()*160),trail:[],palette,spinShell:Math.random()<(boostMode?0.4:0.25),big});
  }

  function explode(r){
    playExplosionSound(r.spinShell||r.big);
    const mul=r.big?2.6:(boostMode?1.6:1);
    const count=Math.floor((60+Math.floor(Math.random()*50))*mul);
    const speed=(90+Math.random()*90)*(r.big?1.5:(boostMode?1.2:1));
    for(let i=0;i<count;i++){
      const angle=(Math.PI*2*i)/count+Math.random()*0.15;
      const s=speed*(0.6+Math.random()*0.5);
      particles.push({
        x:r.x,y:r.y,vx:Math.cos(angle)*s,vy:Math.sin(angle)*s,
        color:r.palette[Math.floor(Math.random()*r.palette.length)],
        life:0,maxLife:(r.big?1.5:1)+Math.random()*0.8,trail:[],
        size:(1.4+Math.random()*1.6)*(r.big?1.8:(boostMode?1.3:1)),glitter:Math.random()<0.3
      });
    }
    if(r.spinShell){
      setTimeout(()=>{
        for(let i=0;i<24;i++){
          const angle=Math.random()*Math.PI*2;
          const s=40+Math.random()*40;
          particles.push({x:r.x,y:r.y,vx:Math.cos(angle)*s,vy:Math.sin(angle)*s-30,color:'#fff',life:0,maxLife:0.5+Math.random()*0.4,trail:[],size:1,glitter:true});
        }
      },250);
    }
  }

  function tick(ts){
    if(!lastTs)lastTs=ts;
    const dt=Math.min(.05,(ts-lastTs)/1000);
    lastTs=ts;
    ctx.clearRect(0,0,W,H);

    if(active&&ts>=nextLaunchAt){
      launchRocket();
      if(Math.random()<(boostMode?0.65:0.3))setTimeout(launchRocket,150+Math.random()*250);
      nextLaunchAt=ts+(boostMode?250+Math.random()*450:700+Math.random()*1200);
    }

    for(let i=rockets.length-1;i>=0;i--){
      const r=rockets[i];
      r.trail.push({x:r.x,y:r.y});
      if(r.trail.length>6)r.trail.shift();
      r.vy+=GRAVITY*0.35*dt;
      r.y+=r.vy*dt;
      r.x+=Math.sin(r.y*0.02)*6*dt;

      for(let t=0;t<r.trail.length;t++){
        const p=r.trail[t];
        const a=(t+1)/r.trail.length;
        ctx.fillStyle=`rgba(255,220,150,${a*0.6})`;
        ctx.beginPath();ctx.arc(p.x,p.y,1.6*a,0,Math.PI*2);ctx.fill();
      }
      ctx.fillStyle='#fff8e0';
      ctx.beginPath();ctx.arc(r.x,r.y,2.2,0,Math.PI*2);ctx.fill();

      if(r.y<=r.targetY||r.vy>=0){
        explode(r);
        rockets.splice(i,1);
      }
    }

    for(let i=particles.length-1;i>=0;i--){
      const p=particles[i];
      p.life+=dt;
      const lt=p.life/p.maxLife;
      if(lt>=1){particles.splice(i,1);continue;}
      p.trail.push({x:p.x,y:p.y});
      if(p.trail.length>5)p.trail.shift();
      p.vy+=GRAVITY*dt;
      p.vx*=(1-0.9*dt);
      p.x+=p.vx*dt;
      p.y+=p.vy*dt;

      const alpha=1-lt;
      for(let k=0;k<p.trail.length;k++){
        const tp=p.trail[k];
        const a2=((k+1)/p.trail.length)*alpha*0.5;
        ctx.fillStyle=hexToRgba(p.color,a2);
        ctx.beginPath();ctx.arc(tp.x,tp.y,p.size*0.7,0,Math.PI*2);ctx.fill();
      }
      const flicker=p.glitter&&Math.random()<0.5?0:1;
      ctx.fillStyle=hexToRgba(p.color,alpha*flicker);
      ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();
    }

    if(active||rockets.length||particles.length){
      rafId=requestAnimationFrame(tick);
    }else{
      rafId=null;
    }
  }

  function start(){
    ensureCanvas();
    if(!canvas)return;
    resize();
    ensureAudio();
    active=true;
    lastTs=0;nextLaunchAt=0;
    canvas.style.display='block';
    requestAnimationFrame(()=>{canvas.style.opacity='1';});
    if(!rafId)rafId=requestAnimationFrame(tick);
  }

  function stop(){
    active=false;
    if(canvas)canvas.style.opacity='0';
    setTimeout(()=>{if(canvas)canvas.style.display='none';},700);
  }

  return{
    toggle(on,opts){
      boostMode=!!(opts&&opts.boost);
      if(on&&!active)start();
      else if(!on&&active)stop();
    }
  };
})();

function toggleFireworksEffect(on){
  FireworksFX.toggle(on);
}

// ── MATRIX ───────────────────────────────────────────────────────────────
let matrixCanvasEl=null,matrixAnimFrame=null;
function toggleMatrixEffect(on){
  if(on&&!matrixCanvasEl){
    matrixCanvasEl=document.createElement('canvas');
    matrixCanvasEl.style.cssText='position:fixed;inset:0;z-index:8400;pointer-events:none;opacity:.55';
    document.body.appendChild(matrixCanvasEl);
    const ctx=matrixCanvasEl.getContext('2d');
    const resize=()=>{matrixCanvasEl.width=window.innerWidth;matrixCanvasEl.height=window.innerHeight;};
    resize();
    const chars='アイウエオカキクケコ0123456789';
    const fontSize=16;
    let columns=Math.floor(matrixCanvasEl.width/fontSize);
    let drops=Array(columns).fill(1);
    const draw=()=>{
      ctx.fillStyle='rgba(0,0,0,.08)';
      ctx.fillRect(0,0,matrixCanvasEl.width,matrixCanvasEl.height);
      ctx.fillStyle='#0f0';
      ctx.font=fontSize+'px monospace';
      drops.forEach((y,i)=>{
        const text=chars[Math.floor(Math.random()*chars.length)];
        ctx.fillText(text,i*fontSize,y*fontSize);
        if(y*fontSize>matrixCanvasEl.height&&Math.random()>.975)drops[i]=0;
        drops[i]++;
      });
      matrixAnimFrame=requestAnimationFrame(draw);
    };
    draw();
  } else if(!on&&matrixCanvasEl){
    cancelAnimationFrame(matrixAnimFrame);
    matrixCanvasEl.remove();
    matrixCanvasEl=null;
  }
}

// ── KONFETTI (jednorazowy wybuch) ──────────────────────────────────────
function fireConfetti(){
  const colors=['#ff4757','#ffa502','#2ed573','#1e90ff','#eccc68','#a55eea','#ff6b81'];
  for(let i=0;i<120;i++){
    const c=document.createElement('div');
    const size=6+Math.random()*8;
    c.style.cssText=`position:fixed;top:-20px;left:${Math.random()*100}vw;width:${size}px;height:${size}px;background:${colors[Math.floor(Math.random()*colors.length)]};z-index:8600;pointer-events:none;opacity:${.7+Math.random()*.3};border-radius:${Math.random()>.5?'50%':'0'};animation:confettiFall ${2.5+Math.random()*2}s ease-in forwards;transform:rotate(${Math.random()*360}deg)`;
    document.body.appendChild(c);
    setTimeout(()=>c.remove(),5000);
  }
}

// ── TRZĘSIENIE EKRANU (jednorazowe) ────────────────────────────────────
function fireShake(){
  document.body.classList.add('shake-effect');
  setTimeout(()=>document.body.classList.remove('shake-effect'),600);
}

// ── EFEKTY CIĄGŁE (bezpieczne - nie dotykają <body> transformem/filtrem) ──
function toggleEarthquakeEffect(on){document.body.classList.toggle('earthquake-mode',on);}
function toggleUpsidedownEffect(on){document.body.classList.toggle('upsidedown-mode',on);}
function toggleZoomEffect(on){document.body.classList.toggle('zoom-mode',on);}
function toggleSpinEffect(on){document.body.classList.toggle('spin-mode',on);}
function toggleRainbowEffect(on){document.body.classList.toggle('rainbow-mode',on);}
function toggleBlurEffect(on){document.body.classList.toggle('blur-mode',on);}

// ── DESZCZ (jednorazowy wybuch) ────────────────────────────────────────
function fireRain(){
  for(let i=0;i<80;i++){
    setTimeout(()=>{
      const drop=document.createElement('div');
      drop.style.cssText=`position:fixed;top:-40px;left:${Math.random()*100}vw;width:2px;height:${16+Math.random()*14}px;background:linear-gradient(rgba(120,180,255,0),rgba(120,180,255,.8));z-index:8500;pointer-events:none;animation:rainDrop ${.6+Math.random()*.4}s linear forwards`;
      document.body.appendChild(drop);
      setTimeout(()=>drop.remove(),1200);
    },i*30);
  }
}

// ── FLASH (jednorazowy błysk ekranu) ───────────────────────────────────
function fireFlash(){
  const flash=document.createElement('div');
  flash.style.cssText='position:fixed;inset:0;background:#fff;z-index:9998;pointer-events:none;animation:flashPulse .4s ease-out forwards';
  document.body.appendChild(flash);
  setTimeout(()=>flash.remove(),450);
}

// ── SERDUSZKA (jednorazowy wybuch) ─────────────────────────────────────
function fireHearts(){
  for(let i=0;i<40;i++){
    setTimeout(()=>{
      const heart=document.createElement('div');
      heart.textContent=['❤️','💕','💖','💗','💓'][Math.floor(Math.random()*5)];
      heart.style.cssText=`position:fixed;bottom:-30px;left:${Math.random()*100}vw;font-size:${16+Math.random()*20}px;z-index:8600;pointer-events:none;animation:heartFloat ${3+Math.random()*2}s ease-in forwards`;
      document.body.appendChild(heart);
      setTimeout(()=>heart.remove(),5500);
    },i*80);
  }
}

// ── 2027 (jednorazowy "wow" efekt: fajerwerki + napis 2027 + Happy New Year) ──
let ny2027Playing=false;
function fireNewYear2027(){
  ny2027Playing=true;
  FireworksFX.toggle(true,{boost:true});
  for(let i=0;i<12;i++)setTimeout(fireConfetti,i*2200);
  const ov=document.createElement('div');
  ov.style.cssText='position:fixed;inset:0;z-index:9700;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none;opacity:0;transition:opacity 1s ease;text-align:center;padding:0 16px;background:radial-gradient(ellipse at center,rgba(0,0,0,.35),rgba(0,0,0,0) 70%)';
  ov.innerHTML='<div style="font-size:min(22vw,190px);line-height:1;font-weight:900;background:linear-gradient(135deg,#ffd700,#ff6b6b,#a55eea,#3ea6ff,#ffd700);background-size:300% 300%;-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 0 50px rgba(255,215,0,.65));animation:ny2027Pulse 1.6s ease-in-out infinite,ny2027Shine 4s linear infinite;letter-spacing:4px">2027</div><div style="font-size:min(6vw,46px);font-weight:800;color:#fff;text-shadow:0 0 24px rgba(0,0,0,.9);margin-top:12px;letter-spacing:2px;animation:ny2027Pulse 1.6s ease-in-out infinite .3s">🎉 HAPPY NEW YEAR 🎉</div>';
  document.body.appendChild(ov);
  requestAnimationFrame(()=>{ov.style.opacity='1';});
  setTimeout(()=>{ov.style.opacity='0';},29000);
  setTimeout(()=>{ov.remove();FireworksFX.toggle(false);ny2027Playing=false;},30000);
}
// odpala się automatycznie u KAŻDEGO otwartego klienta dokładnie o 00:00 1 stycznia 2027 (czas polski, UTC+1)
function scheduleNewYear2027Auto(){
  const target=Date.UTC(2026,11,31,23,0,0);
  const check=()=>{
    const diff=target-Date.now();
    if(diff<=0){
      if(diff>-60000)fireNewYear2027(); // nie odpalaj jeśli strona wróciła do życia dużo później
      return;
    }
    if(diff<=2147000000)setTimeout(fireNewYear2027,diff); // limit setTimeout ~24.8 dnia
    else setTimeout(check,24*60*60*1000);
  };
  check();
}

let adminConsoleOpen=false;

function toggleAdminConsole(){
  if(!isAdmin()){toast('Brak uprawnień');return;}
  adminConsoleOpen=!adminConsoleOpen;
  const el=document.getElementById('admin-console');
  el.style.display=adminConsoleOpen?'flex':'none';
  if(adminConsoleOpen){
    const out=document.getElementById('console-output');
    if(!out.dataset.restored){
      out.dataset.restored='1';
      const saved=JSON.parse(localStorage.getItem('wt_console_log')||'[]');
      if(saved.length){
        saved.forEach(l=>consoleLog(l.msg,l.color,false));
      }else{
        consoleLog('WaveTube Admin Console v1.0');
        consoleLog('Wpisz "help" żeby zobaczyć dostępne komendy.');
      }
    }
    document.getElementById('console-input').focus();
  }
}

let consoleLogBuffer=JSON.parse(localStorage.getItem('wt_console_log')||'[]');
function consoleLog(msg,color,persist){
  const out=document.getElementById('console-output');
  const line=document.createElement('div');
  line.textContent=msg;
  if(color)line.style.color=color;
  out.appendChild(line);
  out.scrollTop=out.scrollHeight;
  if(persist!==false){
    consoleLogBuffer.push({msg,color});
    if(consoleLogBuffer.length>200)consoleLogBuffer.shift();
    localStorage.setItem('wt_console_log',JSON.stringify(consoleLogBuffer));
  }
}

async function runConsoleCommand(raw){
  const cmd=raw.trim();
  if(!cmd)return;
  consoleLog('wavetube> '+cmd,'#3ea6ff');
  const parts=cmd.split(' ');
  const base=parts[0].toLowerCase();
  const RELAKS_SONG_URL='https://raw.githubusercontent.com/revx8199-cloud/WAVETUBE/main/music.mp3';
  const NY_SONG_URL='https://raw.githubusercontent.com/revx8199-cloud/WAVETUBE/main/musiccc.mp3';

  if(base==='disco'){
    const on=await setActiveEffect('disco');
    consoleLog(on?'🕺 DISCO MODE: ON dla WSZYSTKICH — impreza się zaczyna':'Disco mode: OFF dla wszystkich');
  }
  else if(base==='snow'){
    const on=await setActiveEffect('snow');
    consoleLog(on?'❄️ ŚNIEG: ON dla wszystkich':'Śnieg: OFF dla wszystkich');
  }
  else if(base==='matrix'){
    const on=await setActiveEffect('matrix');
    consoleLog(on?'💻 MATRIX: ON dla wszystkich':'Matrix: OFF dla wszystkich');
  }
  else if(base==='earthquake'){
    const on=await setActiveEffect('earthquake');
    consoleLog(on?'🌍 EARTHQUAKE: ON dla wszystkich':'Earthquake: OFF dla wszystkich');
  }
  else if(base==='upsidedown'){
    const on=await setActiveEffect('upsidedown');
    consoleLog(on?'🙃 UPSIDEDOWN: ON dla wszystkich':'Upsidedown: OFF dla wszystkich');
  }
  else if(base==='zoom'){
    const on=await setActiveEffect('zoom');
    consoleLog(on?'🔍 ZOOM PULSE: ON dla wszystkich':'Zoom: OFF dla wszystkich');
  }
  else if(base==='rainbow'){
    const on=await setActiveEffect('rainbow');
    consoleLog(on?'🌈 RAINBOW: ON dla wszystkich':'Rainbow: OFF dla wszystkich');
  }
  else if(base==='blur'){
    const on=await setActiveEffect('blur');
    consoleLog(on?'🌫️ BLUR: ON dla wszystkich':'Blur: OFF dla wszystkich');
  }
  else if(base==='spin'){
    const on=await setActiveEffect('spin');
    consoleLog(on?'🌀 SPIN: ON dla wszystkich — trzymajcie się czegoś':'Spin: OFF dla wszystkich');
  }
  else if(base==='rain'){
    const on=await setActiveEffect('rain');
    consoleLog(on?'🌧️ DESZCZ: ON dla wszystkich':'Deszcz: OFF dla wszystkich');
  }
  else if(base==='fireworks'){
    const on=await setActiveEffect('fireworks');
    consoleLog(on?'🎆 FAJERWERKI: ON dla wszystkich':'Fajerwerki: OFF dla wszystkich');
  }
  else if(base==='flash'){
    await fireGlobalBurst('flash');
    consoleLog('⚡ Błysk u wszystkich!');
  }
  else if(base==='confetti'){
    await fireGlobalBurst('confetti');
    consoleLog('🎉 Konfetti wystrzelone u wszystkich!');
  }
  else if(base==='shake'){
    await fireGlobalBurst('shake');
    consoleLog('💥 Ekran zatrząsł się u wszystkich!');
  }
  else if(base==='hearts'){
    await fireGlobalBurst('hearts');
    consoleLog('💕 Serduszka wysłane do wszystkich!');
  }
  else if(base==='2027'){
    await fireGlobalBurst('newyear2027');
    consoleLog('🎊 2027 WOW efekt odpalony dla wszystkich!');
  }
  else if(base==='music'&&(parts[1]||'').toLowerCase()==='link'){
    consoleLog('relaks:');
    consoleLog(RELAKS_SONG_URL,'#3ea6ff');
    consoleLog('ny:');
    consoleLog(NY_SONG_URL,'#3ea6ff');
  }
  else if(base==='music'){
    const al=(parts[1]||'').toLowerCase();
    const arg=al==='ny'?NY_SONG_URL:al==='relaks'?RELAKS_SONG_URL:al==='off'?'off':'';
    if(!arg){consoleLog('Użyj: music relaks / music ny / music off','#ff6b6b');return;}
    const res=await setMusic(arg);
    if(res!==null){
      consoleLog(res.active?'🎵 MUZYKA: ON dla wszystkich — relaks się zaczyna':'Muzyka: OFF dla wszystkich');
      if(res.url){
        consoleLog('Link (skopiuj żeby użyć ponownie):');
        consoleLog(res.url,'#3ea6ff');
      }
    }
  }
  else if(base==='help'){
    consoleLog('Dostępne komendy:');
    consoleLog('  disco              - włącz/wyłącz tryb disco 🕺');
    consoleLog('  snow               - włącz/wyłącz padający śnieg ❄️');
    consoleLog('  matrix             - włącz/wyłącz deszcz znaków (Matrix) 💻');
    consoleLog('  earthquake         - włącz/wyłącz trzęsienie ekranu 🌍');
    consoleLog('  upsidedown         - włącz/wyłącz odwrócenie strony 🙃');
    consoleLog('  zoom               - włącz/wyłącz pulsowanie zoomu 🔍');
    consoleLog('  rainbow            - włącz/wyłącz cykl kolorów tęczy 🌈');
    consoleLog('  blur               - włącz/wyłącz rozmycie ekranu 🌫️');
    consoleLog('  spin               - włącz/wyłącz obracanie ekranu 🌀');
    consoleLog('  fireworks          - włącz/wyłącz ciągłe fajerwerki, wł/wył dla wszystkich 🎆');
    consoleLog('  music relaks       - włącz relaksującą muzykę dla wszystkich 🎵');
    consoleLog('  music ny           - włącz noworoczną piosenkę 🎆');
    consoleLog('  music off          - wyłącz muzykę u wszystkich');
    consoleLog('  music link         - pokaż aktualny link do muzyki (do skopiowania)');
    consoleLog('  confetti           - jednorazowy wybuch konfetti 🎉');
    consoleLog('  shake              - jednorazowe zatrzęsienie ekranem 💥');
    consoleLog('  hearts             - jednorazowe serduszka 💕');
    consoleLog('  2027               - WOW: fajerwerki + napis 2027 + Happy New Year (odpala się też SAM o 00:00 1.01.2027)');
    consoleLog('  rain               - deszcz z wodą, wł/wył dla wszystkich (nie da się jej usunąć, tylko przesunąć) 🌧️');
    consoleLog('  flash              - jednorazowy błysk ekranu ⚡');
    consoleLog('  say <tekst>        - pokaż baner z tekstem u wszystkich 📢');
    consoleLog('  say off            - ukryj baner u wszystkich');
    consoleLog('  ban <email> <godz>  - zbanuj użytkownika (0 = na zawsze)');
    consoleLog('  unban <email>       - odbanuj użytkownika');
    consoleLog('  mute <email> <godz>  - wycisz użytkownika (0 = na zawsze)');
    consoleLog('  unmute <email>      - cofnij wyciszenie');
    consoleLog('  vip <email>         - nadaj status VIP');
    consoleLog('  unvip <email>       - odbierz status VIP');
    consoleLog('  banbot <ip>         - zbanuj IP bota');
    consoleLog('  unbanbot <ip>       - odbanuj IP bota');
    consoleLog('  stats              - statystyki appki');
    consoleLog('  announce <tekst>    - wyślij ogłoszenie do wszystkich');
    consoleLog('  clear              - wyczyść konsolę');
  }
  else if(base==='clear'){
    document.getElementById('console-output').innerHTML='';
    consoleLogBuffer=[];
    localStorage.setItem('wt_console_log','[]');
  }
  else if(base==='stats'){
    consoleLog('Ładowanie statystyk...');
    const{count:userCount}=await sb.from('profiles').select('*',{count:'exact',head:true});
    const{count:reportCount}=await sb.from('reports').select('*',{count:'exact',head:true});
    consoleLog(`👥 Użytkownicy: ${userCount||0}`);
    consoleLog(`🎬 Filmy: ${videos.length}`);
    consoleLog(`🚩 Zgłoszenia: ${reportCount||0}`);
  }
  else if(base==='ban'||base==='unban'||base==='mute'||base==='unmute'||base==='vip'||base==='unvip'){
    const email=parts[1];
    if(!email){consoleLog('Podaj e-mail, np: ban jan@gmail.com 24','#ff6b6b');return;}
    const{data:prof}=await sb.from('profiles').select('id').eq('email',email).single();
    if(!prof){consoleLog('Nie znaleziono użytkownika o tym e-mailu','#ff6b6b');return;}
    if(base==='ban'){
      const hours=parseInt(parts[2])||0;
      await adminBanUser(prof.id,hours||null);
      consoleLog(`🚫 Zbanowano ${email}`,'#4ade80');
    } else if(base==='unban'){
      await adminUnbanUser(prof.id);
      consoleLog(`✅ Odbanowano ${email}`,'#4ade80');
    } else if(base==='mute'){
      const hours=parseInt(parts[2])||0;
      await muteUser(prof.id,hours||null);
      consoleLog(`🔇 Wyciszono ${email}`,'#4ade80');
    } else if(base==='unmute'){
      await unmuteUser(prof.id);
      consoleLog(`🔊 Cofnięto wyciszenie ${email}`,'#4ade80');
    } else if(base==='vip'){
      await adminSetVip(prof.id,email,true);
      consoleLog(`⭐ Nadano VIP: ${email}`,'#4ade80');
    } else if(base==='unvip'){
      await adminSetVip(prof.id,email,false);
      consoleLog(`Odebrano VIP: ${email}`,'#4ade80');
    }
  }
  else if(base==='say'){
    const text=parts.slice(1).join(' ');
    if(text.toLowerCase()==='off'||text.toLowerCase()==='clear'||!text){
      await sb.from('site_state').upsert([{id:1,broadcast_text:'',updated_at:new Date().toISOString()}]);
      consoleLog('Komunikat usunięty u wszystkich.','#4ade80');
    }else{
      await sb.from('site_state').upsert([{id:1,broadcast_text:text,broadcast_by:getMyDisplayName(),updated_at:new Date().toISOString()}]);
      consoleLog('📢 Wysłano do wszystkich: "'+text+'"','#4ade80');
    }
    checkDiscoState();
  }
  else if(base==='banbot'){
    const ip=parts[1];
    if(!ip){consoleLog('Podaj IP, np: banbot 1.2.3.4','#ff6b6b');return;}
    await sb.from('banned_bots').upsert([{ip_address:ip,reason:'Ban z konsoli admina',banned_by:currentUser.email}],{onConflict:'ip_address'});
    logAdminAction('ban_bot',`Zbanowano IP bota (konsola): ${ip}`);
    consoleLog(`🚫 Zbanowano IP: ${ip}`,'#4ade80');
  }
  else if(base==='unbanbot'){
    const ip=parts[1];
    if(!ip){consoleLog('Podaj IP, np: unbanbot 1.2.3.4','#ff6b6b');return;}
    await sb.from('banned_bots').delete().eq('ip_address',ip);
    logAdminAction('unban_bot',`Odbanowano IP bota (konsola): ${ip}`);
    consoleLog(`✅ Odbanowano IP: ${ip}`,'#4ade80');
  }
  else if(base==='announce'){
    const text=parts.slice(1).join(' ');
    if(!text){consoleLog('Podaj treść ogłoszenia','#ff6b6b');return;}
    await sb.from('announcements').insert([{message:text,created_by:currentUser.id}]);
    consoleLog('📢 Ogłoszenie wysłane','#4ade80');
  }
  else{
    consoleLog(`Nieznana komenda: "${base}". Wpisz "help".`,'#ff6b6b');
  }
}

document.addEventListener('keydown',e=>{
  if((e.key==='`'||e.key==='~')&&isAdmin()){
    const activeTag=document.activeElement.tagName;
    const activeId=document.activeElement.id;
    if((activeTag==='INPUT'||activeTag==='TEXTAREA')&&activeId!=='console-input')return;
    e.preventDefault();
    toggleAdminConsole();
  }
});

let consoleHistory=JSON.parse(localStorage.getItem('wt_console_history')||'[]');
let consoleHistoryIdx=consoleHistory.length;

document.addEventListener('DOMContentLoaded',()=>{
  scheduleNewYear2027Auto();
  const inp=document.getElementById('console-input');
  if(inp)inp.addEventListener('keydown',e=>{
    if(e.key==='Enter'){
      const val=inp.value;
      inp.value='';
      if(val.trim()){
        consoleHistory=consoleHistory.filter(c=>c!==val); // bez duplikatów w historii
        consoleHistory.push(val);
        if(consoleHistory.length>50)consoleHistory.shift();
        localStorage.setItem('wt_console_history',JSON.stringify(consoleHistory));
      }
      consoleHistoryIdx=consoleHistory.length;
      runConsoleCommand(val);
    }else if(e.key==='ArrowUp'){
      if(consoleHistoryIdx>0){
        e.preventDefault();
        consoleHistoryIdx--;
        inp.value=consoleHistory[consoleHistoryIdx]||'';
      }
    }else if(e.key==='ArrowDown'){
      e.preventDefault();
      if(consoleHistoryIdx<consoleHistory.length-1){
        consoleHistoryIdx++;
        inp.value=consoleHistory[consoleHistoryIdx]||'';
      }else{
        consoleHistoryIdx=consoleHistory.length;
        inp.value='';
      }
    }
  });
});

async function logAdminAction(action,details){
  if(!isAdmin())return;
  await sb.from('admin_logs').insert([{action,details,admin_email:currentUser.email}]);
}

async function renderAdminPanel(){
  const body=document.getElementById('admin-panel-body');
  ['videos','users','online','activity','trash','bots','reports','color','announce','logs'].forEach(tab=>{
    const el=document.getElementById('admin-tab-'+tab);
    if(el)el.classList.toggle('active',adminTab===tab);
  });

  if(adminTab==='videos'){
    renderAdminVideosList();
  }

  if(adminTab==='online'){
    renderOnlineUsersList();
  }

  if(adminTab==='activity'){
    renderActivityList();
  }

  if(adminTab==='trash'){
    renderTrashList();
  }

  if(adminTab==='bots'){
    renderBotsList();
  }

if(adminTab==='users'){
  body.innerHTML='<p style="color:var(--text-tertiary);padding:20px;text-align:center">Ładowanie użytkowników...</p>';
    const usersMap={};
    videos.forEach(v=>{if(v.user_id)usersMap[v.user_id]={id:v.user_id,name:getUserName(v),email:v.user_email||'',avatar:v.user_avatar||'',is_vip:false};});
    const{data:profs}=await sb.from('profiles').select('*');
    const{data:ips}=await sb.rpc('admin_get_user_ips');
    const ipMap={};if(ips)ips.forEach(r=>{ipMap[r.id]=r.last_ip;});
    if(profs)profs.forEach(p=>{if(p.id)usersMap[p.id]={id:p.id,name:p.name||'Użytkownik',email:p.email||'',avatar:p.avatar||'',is_vip:!!p.is_vip,last_ip:ipMap[p.id]||''};});
    const{data:bans}=await sb.from('banned_users').select('*');
    const banMap={};
    if(bans)bans.forEach(b=>{if(!b.expires_at||new Date(b.expires_at)>new Date())banMap[b.user_id]=b;});
    adminUsersCache=Object.values(usersMap).filter(u=>u.email!==ADMIN_EMAIL);
    renderAdminUsersList(banMap);
  }

  if(adminTab==='reports'){
    body.innerHTML='<p style="color:var(--text-tertiary);padding:30px 20px;text-align:center">Ładowanie zgłoszeń...</p>';
    const{data:reports}=await sb.from('reports').select('*').order('created_at',{ascending:false});
    if(!reports||!reports.length){body.innerHTML='<p style="color:var(--text-tertiary);padding:30px 20px;text-align:center">Brak zgłoszeń</p>';return;}
    body.innerHTML=reports.map(r=>`
      <div class="admin-row" style="align-items:flex-start">
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:600">${esc(r.video_title)||'(usunięty film)'}</div>
          <div style="font-size:12px;color:#ff8a8a;margin:3px 0">${esc(r.reason)}</div>
          ${r.details?`<div style="font-size:12px;color:var(--text-secondary);margin-bottom:4px">${esc(r.details)}</div>`:''}
          <div style="font-size:11px;color:var(--text-tertiary)">Zgłosił: ${esc(r.reporter_email)} · ${new Date(r.created_at).toLocaleString('pl-PL')}</div>
        </div>
        <button onclick="deleteReport(${r.id})" title="Usuń zgłoszenie" class="admin-btn admin-btn-red">🗑 Usuń</button>
      </div>`).join('');
  }

  if(adminTab==='color'){
    const current=myNameColor||'#3ea6ff';
    const meta=currentUser.user_metadata;
    const myDisplayName=getMyDisplayName()||'Ty';
    body.innerHTML=`
      <div style="padding:24px">

        <div style="margin-bottom:28px;padding-bottom:24px;border-bottom:1px solid var(--border)">
          <div style="font-size:13px;font-weight:700;color:var(--text-primary);margin-bottom:4px">✏️ Twój nick</div>
          <p style="color:var(--text-secondary);font-size:12px;margin-bottom:12px">Zmienia nazwę wyświetlaną wszędzie w aplikacji (natychmiastowo, także dla starszych wpisów).</p>
          <div style="display:flex;gap:10px">
            <input id="admin-nick-inp" maxlength="30" value="${myDisplayName}" placeholder="Twój nick" style="flex:1;background:var(--bg-sunken);border:1px solid var(--border);border-radius:8px;color:var(--text-primary);padding:10px 14px;font-size:13px;outline:none">
            <button onclick="saveMyNickname()" style="background:#3ea6ff;border:none;color:#0f0f0f;padding:10px 18px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:700;white-space:nowrap">Zapisz nick</button>
          </div>
        </div>

        <div style="margin-bottom:28px;padding-bottom:24px;border-bottom:1px solid var(--border)">
          <div style="font-size:13px;font-weight:700;color:var(--text-primary);margin-bottom:4px">🏅 Kolor plakietki</div>
          <p style="color:var(--text-secondary);font-size:12px;margin-bottom:12px">Kolor Twojej plakietki "ADMIN" widocznej obok nicku.</p>
          <div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:12px">
            ${VIP_BADGE_COLORS_ADMIN.map(c=>`<div onclick="saveAdminBadgeColor('${c}')" style="width:34px;height:34px;border-radius:50%;background:${c};cursor:pointer;border:3px solid ${adminBadgeColor===c?'#fff':'transparent'};display:flex;align-items:center;justify-content:center">${adminBadgeColor===c?'<svg viewBox="0 0 24 24" width="14" height="14" fill="#fff"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>':''}</div>`).join('')}
          </div>
          <div style="display:flex;align-items:center;gap:8px;font-size:14px;font-weight:700">
            <span>${myDisplayName}</span>
            ${verifiedBadge(ADMIN_EMAIL)}
          </div>
        </div>

        <div style="margin-bottom:28px;padding-bottom:24px;border-bottom:1px solid var(--border)">
          <div style="font-size:13px;font-weight:700;color:var(--text-primary);margin-bottom:4px">🎨 Kolor nicku</div>
          <p style="color:var(--text-secondary);font-size:12px;margin-bottom:14px">Ustaw specjalny kolor swojego nicku widoczny w komentarzach, na filmach i postach.</p>
          <div style="display:flex;align-items:center;gap:16px;margin-bottom:16px">
            <input type="color" id="admin-color-inp" value="${current}" style="width:56px;height:56px;border:none;border-radius:10px;cursor:pointer;background:none;padding:0">
            <div>
              <div style="font-size:11px;color:var(--text-tertiary);margin-bottom:4px">Podgląd:</div>
              <div id="admin-color-preview" style="font-size:16px;font-weight:700;color:${myNameColor||'#fff'};font-family:${fontCssFor(myNameFont)}">${myDisplayName}</div>
            </div>
          </div>
          <div style="display:flex;gap:10px">
            <button onclick="saveMyNameColor()" style="background:#3ea6ff;border:none;color:#0f0f0f;padding:10px 20px;border-radius:20px;cursor:pointer;font-size:13px;font-weight:700">Zapisz kolor</button>
            <button onclick="resetMyNameColor()" style="background:var(--border-soft);border:none;color:var(--text-primary);padding:10px 20px;border-radius:20px;cursor:pointer;font-size:13px">Resetuj</button>
          </div>
        </div>

        <div>
          <div style="font-size:13px;font-weight:700;color:var(--text-primary);margin-bottom:4px">🔤 Czcionka nicku</div>
          <p style="color:var(--text-secondary);font-size:12px;margin-bottom:14px">Wybierz styl czcionki dla swojego nicku.</p>
          <div style="display:flex;flex-direction:column;gap:8px">
            ${FONT_OPTIONS.map(f=>`
              <div onclick="saveMyFont('${f.id}')" style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-radius:10px;cursor:pointer;background:${myNameFont===f.id?'rgba(62,166,255,.15)':'var(--bg-sunken)'};border:1px solid ${myNameFont===f.id?'#3ea6ff':'var(--border)'}">
                <span style="font-family:${f.css};font-size:16px;color:${myNameColor||'#fff'}">${myDisplayName||f.label}</span>
                <span style="font-size:11px;color:var(--text-tertiary)">${f.label}${myNameFont===f.id?' ✓':''}</span>
              </div>`).join('')}
          </div>
        </div>

        <p style="color:var(--text-tertiary);font-size:11px;margin-top:20px">Kolor i czcionka obejmą nowe komentarze, filmy i posty — starsze wpisy zachowają dotychczasowy wygląd.</p>
      </div>`;
    setTimeout(()=>{
      const inp=document.getElementById('admin-color-inp');
      if(inp)inp.addEventListener('input',()=>{document.getElementById('admin-color-preview').style.color=inp.value;});
    },0);
  }

  if(adminTab==='announce'){
    body.innerHTML=`
      <div style="padding:24px">
        <p style="color:var(--text-secondary);font-size:13px;margin-bottom:16px">Wyślij powiadomienie do <b>wszystkich zarejestrowanych użytkowników</b>. Pojawi się w ich dzwoneczku 🔔.</p>
        <div class="field" style="margin-bottom:14px;position:relative">
          <label style="text-transform:none;font-size:12px;color:var(--text-tertiary);display:block;margin-bottom:6px">Wiadomość</label>
          <textarea id="admin-announce-text" placeholder="Np. Dodaliśmy nowe funkcje! Sprawdź co nowego 🎉" style="width:100%;background:var(--bg-sunken);border:1px solid var(--border);border-radius:8px;color:var(--text-primary);padding:10px 14px;font-size:13px;outline:none;resize:none;height:90px"></textarea>
          <button onclick="toggleEmojiPicker('admin-announce-text',this)" style="position:absolute;right:8px;bottom:8px;background:none;border:none;color:var(--text-secondary);cursor:pointer;font-size:18px" title="Emotki">😊</button>
        </div>
        <div class="field" style="margin-bottom:14px">
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;text-transform:none;font-size:13px;color:var(--text-secondary)">
            <input type="checkbox" id="ann-poll-toggle" onchange="toggleAnnPollFields()" style="width:auto"> 📊 Dodaj ankietę
          </label>
          <div id="ann-poll-fields" style="display:none;margin-top:12px">
            <input id="ann-poll-question" placeholder="Zadaj pytanie..." style="width:100%;background:var(--bg-sunken);border:1px solid var(--border);border-radius:8px;color:var(--text-primary);padding:10px 14px;font-size:13px;outline:none;margin-bottom:10px">
            <div id="ann-poll-options-list"></div>
            <button type="button" onclick="addAnnPollOption()" id="ann-poll-add-btn" style="background:none;border:1px dashed #444;color:var(--text-secondary);padding:7px 14px;border-radius:8px;cursor:pointer;font-size:12px;margin-top:4px">+ Dodaj opcję</button>
          </div>
        </div>
        <button onclick="sendAnnouncement()" id="admin-announce-btn" style="background:#3ea6ff;border:none;color:#0f0f0f;padding:10px 22px;border-radius:20px;cursor:pointer;font-size:13px;font-weight:700">📢 Wyślij do wszystkich</button>
        <div id="admin-announce-status" style="margin-top:12px;font-size:12px;color:var(--text-tertiary)"></div>
      </div>`;
  }

  if(adminTab==='logs'){
    body.innerHTML='<p style="color:var(--text-tertiary);padding:30px 20px;text-align:center">Ładowanie logów...</p>';
    const{data:logs}=await sb.from('admin_logs').select('*').order('created_at',{ascending:false}).limit(200);
    const clearBtnHtml=`<div style="padding:14px 20px;border-bottom:1px solid var(--border-soft);display:flex;justify-content:flex-end">
      <button onclick="clearAdminLogs()" style="background:#3a1414;border:1px solid #5c1f1f;color:#ff6b6b;padding:8px 16px;border-radius:8px;cursor:pointer;font-size:12px;font-weight:600">🗑 Wyczyść logi</button>
    </div>`;
    if(!logs||!logs.length){body.innerHTML=clearBtnHtml+'<p style="color:var(--text-tertiary);padding:30px 20px;text-align:center">Brak zapisanych akcji</p>';return;}
    const ACTION_ICONS={ban:'🚫',unban:'✅',mute:'🔇',unmute:'🔊',delete_video:'🗑',edit_video:'✏️',delete_report:'🚩',rename_user:'✏️',delete_announcement:'📢'};
    body.innerHTML=clearBtnHtml+logs.map(l=>`
      <div class="admin-row" style="align-items:flex-start">
        <div style="font-size:16px;flex-shrink:0">${ACTION_ICONS[l.action]||'📝'}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;color:var(--text-primary)">${esc(l.details)}</div>
          <div style="font-size:11px;color:var(--text-tertiary);margin-top:2px">${new Date(l.created_at).toLocaleString('pl-PL')}</div>
        </div>
      </div>`).join('');
  }
}

async function clearAdminLogs(){
  if(!await showConfirm('Wyczyścić logi?','Wszystkie zapisane akcje admina zostaną trwale usunięte. Tej operacji nie można cofnąć.'))return;
  const{error}=await sb.from('admin_logs').delete().not('id','is',null);
  if(error){toast('Błąd: '+error.message);return;}
  toast('Logi wyczyszczone 🗑');
  renderAdminPanel();
}

function renderAdminVideosList(){
  const body=document.getElementById('admin-panel-body');
  const q=(document.getElementById('admin-video-search')?.value||'').trim().toLowerCase();
  const filtered=q?videos.filter(v=>(v.title||'').toLowerCase().includes(q)||(getUserName(v)||'').toLowerCase().includes(q)||(v.user_email||'').toLowerCase().includes(q)):videos;
  const listHtml=!filtered.length
    ?`<p style="color:var(--text-tertiary);padding:20px;text-align:center">${q?'Brak wyników dla "'+esc(q)+'"':'Brak filmów'}</p>`
    :filtered.map(v=>`
      <div style="display:flex;align-items:center;gap:12px;padding:10px 14px;border-bottom:1px solid var(--border-soft)">
        <div style="width:64px;height:38px;background:var(--bg-card);border-radius:6px;overflow:hidden;flex-shrink:0">${thumbFor(v)?`<img src="${thumbFor(v)}" style="width:100%;height:100%;object-fit:cover">`:''}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(v.title)}</div>
          <div style="font-size:11px;color:var(--text-tertiary)">${esc(getUserName(v))} · ${esc(v.user_email)}</div>
        </div>
        <button onclick="closeAdminPanel();openEditModal(${v.id})" style="background:#142a3a;border:1px solid #1f4a5c;color:#7fd3ff;padding:6px 12px;border-radius:8px;cursor:pointer;font-size:12px;flex-shrink:0">✏️ Edytuj</button>
        <button onclick="adminDeleteVideo(${v.id})" style="background:#3a1414;border:1px solid #5c1f1f;color:#ff6b6b;padding:6px 12px;border-radius:8px;cursor:pointer;font-size:12px;flex-shrink:0">🗑 Usuń</button>
      </div>`).join('');
  body.innerHTML=`
    <div style="padding:12px 14px;position:sticky;top:0;background:var(--bg-panel);z-index:5">
      <input id="admin-video-search" type="text" placeholder="🔍 Szukaj po tytule, autorze lub e-mailu..." value="${esc(q)}" oninput="renderAdminVideosList()" style="width:100%;background:var(--bg-sunken);border:1px solid var(--border);border-radius:8px;color:var(--text-primary);padding:10px 14px;font-size:13px;outline:none">
    </div>
    <div>${listHtml}</div>`;
  const inp=document.getElementById('admin-video-search');
  if(inp){inp.focus();inp.setSelectionRange(inp.value.length,inp.value.length);}
}

function toggleAnnPollFields(){
  const on=document.getElementById('ann-poll-toggle').checked;
  document.getElementById('ann-poll-fields').style.display=on?'block':'none';
  const list=document.getElementById('ann-poll-options-list');
  if(on&&!list.children.length){addAnnPollOption();addAnnPollOption();}
}

function addAnnPollOption(){
  const list=document.getElementById('ann-poll-options-list');
  if(list.children.length>=4){toast('Maksymalnie 4 opcje');return;}
  const idx=list.children.length;
  const row=document.createElement('div');
  row.style.cssText='display:flex;gap:6px;margin-bottom:8px;align-items:center';
  row.innerHTML=`<input class="ann-poll-opt-inp" placeholder="Opcja ${idx+1}" style="flex:1;background:var(--bg-sunken);border:1px solid var(--border);border-radius:8px;color:var(--text-primary);padding:8px 12px;font-size:13px;outline:none">
    <button type="button" onclick="this.parentElement.remove()" style="background:none;border:none;color:var(--text-tertiary);cursor:pointer;font-size:16px">✕</button>`;
  list.appendChild(row);
  if(list.children.length>=4)document.getElementById('ann-poll-add-btn').style.display='none';
}

function resetAnnPollForm(){
  document.getElementById('ann-poll-toggle').checked=false;
  document.getElementById('ann-poll-fields').style.display='none';
  document.getElementById('ann-poll-question').value='';
  document.getElementById('ann-poll-options-list').innerHTML='';
  document.getElementById('ann-poll-add-btn').style.display='block';
}

async function sendAnnouncement(){
  if(!isAdmin())return;
  const text=document.getElementById('admin-announce-text').value.trim();
  const pollOn=document.getElementById('ann-poll-toggle').checked;
  let poll=null;
  if(pollOn){
    const question=document.getElementById('ann-poll-question').value.trim();
    const opts=[...document.querySelectorAll('.ann-poll-opt-inp')].map(i=>i.value.trim()).filter(Boolean);
    if(!question){toast('Wpisz pytanie ankiety!');return;}
    if(opts.length<2){toast('Dodaj przynajmniej 2 opcje!');return;}
    poll={question,options:opts.map(t=>({text:t,votes:0})),voters:{}};
  }
  if(!text&&!poll){toast('Napisz treść ogłoszenia lub dodaj ankietę');return;}
  if(!await showConfirm('Wysłać ogłoszenie?','Wiadomość trafi do WSZYSTKICH zarejestrowanych użytkowników.','Wyślij'))return;
  const btn=document.getElementById('admin-announce-btn');
  const status=document.getElementById('admin-announce-status');
  btn.disabled=true;btn.style.opacity='.6';btn.textContent='Wysyłanie...';
  status.textContent='Zbieranie listy użytkowników...';

  status.textContent='Publikowanie ogłoszenia...';
  await sb.from('announcements').insert([{message:text,created_by:currentUser.id,poll}]);

  const userIds=new Set();
  const{data:profs}=await sb.from('profiles').select('id');
  if(profs)profs.forEach(p=>{if(p.id)userIds.add(p.id);});
  videos.forEach(v=>{if(v.user_id)userIds.add(v.user_id);});
  userIds.delete(currentUser.id);

  if(!userIds.size){
    status.textContent='Brak użytkowników do wysłania.';
    btn.disabled=false;btn.style.opacity='1';btn.textContent='📢 Wyślij do wszystkich';
    return;
  }

  const notifs=[...userIds].map(uid=>({
    user_id:uid,
    message:`📢 <b>Ogłoszenie:</b> ${esc(text||poll.question)}`,
    avatar:'',
    sender_id:currentUser.id
  }));
  status.textContent=`Wysyłanie do ${notifs.length} użytkowników...`;
  const{error}=await sb.from('notifications').insert(notifs);
  if(error){
    status.textContent='Błąd: '+error.message;
  } else {
    status.textContent=`✅ Wysłano do ${notifs.length} użytkowników!`;
    document.getElementById('admin-announce-text').value='';
    resetAnnPollForm();
    toast('Ogłoszenie wysłane! 📢');
  }
  btn.disabled=false;btn.style.opacity='1';btn.textContent='📢 Wyślij do wszystkich';
}

async function deleteReport(id){
  if(!isAdmin())return;
  if(!await showConfirm('Usunąć to zgłoszenie?','Zniknie z listy zgłoszeń.'))return;
  const{error}=await sb.from('reports').delete().eq('id',id);
  if(error){toast('Błąd: '+error.message);return;}
  logAdminAction('delete_report',`Usunięto zgłoszenie #${id}`);
  renderAdminPanel();
  toast('Zgłoszenie usunięte 🗑');
}

async function adminDeleteVideo(id){
  if(!isAdmin())return;
  if(!await showConfirm('Usunąć ten film?','Usuwasz go jako administrator. Tej czynności nie można cofnąć.'))return;
  const v=videos.find(x=>x.id===id);
  logAdminAction('delete_video',`Usunięto film "${v?.title||id}" (autor: ${getUserName(v)||'?'})`);
  await deleteVideo(id);
  renderAdminPanel();
  toast('Film usunięty przez administratora 🛡');
}

function toggleAdminBanMenu(userId,btnEl){
  const existing=document.getElementById('admin-ban-menu');
  if(existing){existing.remove();if(existing.dataset.user===userId)return;}
  const rect=btnEl.getBoundingClientRect();
  const menu=document.createElement('div');
  menu.id='admin-ban-menu';
  menu.dataset.user=userId;
  menu.style.cssText=`position:fixed;top:${rect.bottom+4}px;left:${Math.min(rect.left,window.innerWidth-190)}px;background:var(--bg-panel);border:1px solid var(--border);border-radius:10px;min-width:170px;z-index:2000;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.5)`;
  menu.innerHTML=`
    <div onclick="adminBanUser('${userId}',1/60)" style="padding:11px 16px;cursor:pointer;font-size:13px" onmouseover="this.style.background='var(--border)'" onmouseout="this.style.background='none'">1 minuta</div>
    <div onclick="adminBanUser('${userId}',24)" style="padding:11px 16px;cursor:pointer;font-size:13px" onmouseover="this.style.background='var(--border)'" onmouseout="this.style.background='none'">24 godziny</div>
    <div onclick="adminBanUser('${userId}',168)" style="padding:11px 16px;cursor:pointer;font-size:13px" onmouseover="this.style.background='var(--border)'" onmouseout="this.style.background='none'">7 dni</div>
    <div onclick="adminBanUser('${userId}',240)" style="padding:11px 16px;cursor:pointer;font-size:13px" onmouseover="this.style.background='var(--border)'" onmouseout="this.style.background='none'">10 dni</div>
    <div onclick="adminBanUser('${userId}',720)" style="padding:11px 16px;cursor:pointer;font-size:13px" onmouseover="this.style.background='var(--border)'" onmouseout="this.style.background='none'">30 dni</div>
    <div onclick="adminBanUser('${userId}',43800)" style="padding:11px 16px;cursor:pointer;font-size:13px" onmouseover="this.style.background='var(--border)'" onmouseout="this.style.background='none'">5 lat</div>
    <div onclick="adminBanUser('${userId}',null)" style="padding:11px 16px;cursor:pointer;font-size:13px;color:#ff6b6b" onmouseover="this.style.background='var(--border)'" onmouseout="this.style.background='none'">Na zawsze</div>
  `;
  document.body.appendChild(menu);
  setTimeout(()=>{
    document.addEventListener('click',function closeIt(e){
      if(!menu.contains(e.target)&&e.target!==btnEl){menu.remove();document.removeEventListener('click',closeIt);}
    });
  },0);
}

async function adminBanUser(userId,hours){
  if(!isAdmin())return;
  if(userId===currentUser.id){toast('Nie możesz zbanować samego siebie! 😅');return;}
  const expires_at=hours?new Date(Date.now()+hours*3600*1000).toISOString():null;
  await sb.from('banned_users').delete().eq('user_id',userId);
  await sb.from('banned_users').insert([{user_id:userId,expires_at,banned_by:currentUser.id}]);
  const targetEmail=adminUsersCache.find(u=>u.id===userId)?.email||userId;
  await purgeUserTraces(userId,targetEmail);
  logAdminAction('ban',`Zbanowano ${targetEmail} na ${formatBanDuration(hours)} (dane wyczyszczone)`);
  const menu=document.getElementById('admin-ban-menu');
  if(menu)menu.remove();
  renderAdminPanel();
  toast('Użytkownik zablokowany 🚫');
}

function formatBanDuration(hours){
  if(!hours)return'zawsze';
  if(hours<1)return Math.round(hours*60)+' min';
  if(hours<24)return hours+'h';
  if(hours<24*365)return Math.round(hours/24)+' dni';
  return Math.round(hours/(24*365))+' lat';
}

// Usuwa ślady zbanowanego użytkownika: jego komentarze (filmy/posty/ogłoszenia) i powiadomienia
async function purgeUserTraces(userId,email){
  const isHim=c=>c&&((c.user_id&&c.user_id===userId)||(c.user_email&&email&&c.user_email===email)||(c.email&&email&&c.email===email));
  // 1) komentarze pod filmami (+ odpowiedzi)
  for(const v of videos){
    if(!Array.isArray(v.comments)||!v.comments.length)continue;
    let changed=false;
    const cleaned=v.comments.filter(c=>{
      if(isHim(c)){changed=true;return false;}
      return true;
    }).map(c=>{
      if(Array.isArray(c.replies)&&c.replies.some(isHim)){
        changed=true;
        return{...c,replies:c.replies.filter(r=>!isHim(r))};
      }
      return c;
    });
    if(changed){
      await updateVideo(v.id,{comments:cleaned});
      v.comments=cleaned;
    }
  }
  // 2) komentarze pod postami
  const{data:allPosts}=await sb.from('posts').select('id,comments');
  if(allPosts){
    for(const p of allPosts){
      if(!Array.isArray(p.comments)||!p.comments.length)continue;
      if(p.comments.some(isHim)){
        const cleaned=p.comments.filter(c=>!isHim(c));
        await sb.from('posts').update({comments:cleaned}).eq('id',p.id);
      }
    }
  }
  // 3) komentarze pod ogłoszeniami
  const{data:allAnn}=await sb.from('announcements').select('id,comments');
  if(allAnn){
    for(const a of allAnn){
      if(!Array.isArray(a.comments)||!a.comments.length)continue;
      if(a.comments.some(isHim)){
        const cleaned=a.comments.filter(c=>!isHim(c));
        await sb.from('announcements').update({comments:cleaned}).eq('id',a.id);
      }
    }
  }
  // 4) powiadomienia (otrzymane i wysłane przez niego)
  await sb.from('notifications').delete().eq('user_id',userId);
  await sb.from('notifications').delete().eq('sender_id',userId);
}

async function adminUnbanUser(userId){
  if(!isAdmin())return;
  await sb.from('banned_users').delete().eq('user_id',userId);
  const targetEmail=adminUsersCache.find(u=>u.id===userId)?.email||userId;
  logAdminAction('unban',`Odbanowano ${targetEmail}`);
  renderAdminPanel();
  toast('Użytkownik odblokowany ✅');
}


// ── OBECNOŚĆ (kto jest online) - Supabase Realtime Presence ─────────────
let presenceChannel=null;
let onlineUsersState={};

function subscribePresence(){
  unsubscribePresence();
  if(!currentUser)return;
  presenceChannel=sb.channel('online-users',{config:{presence:{key:currentUser.id}}});
  presenceChannel
    .on('presence',{event:'sync'},()=>{
      onlineUsersState=presenceChannel.presenceState();
      const modalOpen=document.getElementById('admin-panel-modal')?.classList.contains('open');
      if(modalOpen&&adminTab==='online')renderAdminPanel();
    })
    .subscribe(async status=>{
      if(status==='SUBSCRIBED'){
        await presenceChannel.track({
          name:getMyDisplayName(),
          email:currentUser.email||'',
          avatar:currentUser.user_metadata?.avatar_url||'',
          online_at:new Date().toISOString()
        });
      }
    });
}

function unsubscribePresence(){
  if(presenceChannel){sb.removeChannel(presenceChannel);presenceChannel=null;}
  onlineUsersState={};
}

function handleMessageRealtimeEvent(payload){
  const row=payload.new||payload.old;
  if(row&&currentConvId&&row.conv_id===currentConvId)loadMessages();
  if(document.getElementById('messages-page')?.classList.contains('open'))loadConvList();
}

function handleNotificationRealtimeEvent(){
  loadNotifications().then(()=>{
    if(document.getElementById('notif-dropdown')?.classList.contains('open'))renderNotifications();
  });
}

function getConvId(uid1,uid2){return [uid1,uid2].sort().join('_');}

