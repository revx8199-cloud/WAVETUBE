// ============ channel.js — strona kanału, statystyki, panel VIP, kraj kanału ============

// ── PANEL VIP ────────────────────────────────────────────────────────────
const VIP_BADGE_COLORS=['#ffd700','#ff6b35','#c084fc','#4ade80','#f472b6','#fb7185','#facc15','#a78bfa','#22d3ee','#ef4444','#84cc16','#e879f9','#fb923c','#14b8a6','#eab308','#f43f5e','#3ea6ff','#00e676','#2979ff','#d500f9','#ff3d00','#76ff03','#00e5ff','#ff4081','#651fff','#1de9b6'];
const AVATAR_FRAME_COLORS=['#ffd700','#ff6b35','#c084fc','#4ade80','#f472b6','#fb7185','#facc15','#a78bfa','#22d3ee','#ef4444','#84cc16','#e879f9','#fb923c','#14b8a6','#eab308','#f43f5e','#3ea6ff','#ffffff','#000000','#ff1744','#00e676','#2979ff','#d500f9','#ff3d00','#76ff03','#00e5ff','#c6ff00','#ff4081','#651fff','#1de9b6','#ffab00','#6d4c41'];
const AVATAR_PARTICLE_TYPES=['✨','💖','🔥','❄️','🍀','⭐','💎','🌸','⚡','🌟','💫','🎈','🦋','🌈','☠️','👑','🎃','💀'];

function openVipPanel(){
  if(!isVIP()){toast('Brak uprawnień');return;}
  document.getElementById('vip-panel-modal').classList.add('open');
  renderVipPanel();
}

function closeVipPanel(){
  document.getElementById('vip-panel-modal').classList.remove('open');
}


// ── STATYSTYKI KANAŁU ────────────────────────────────────────────────────────
function statCard(icon,label,value){
  return`<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:10px;padding:14px 10px;text-align:center">
    <div style="font-size:20px">${icon}</div>
    <div style="font-size:18px;font-weight:700;margin-top:4px">${(value||0).toLocaleString('pl-PL')}</div>
    <div style="font-size:11px;color:var(--text-tertiary);margin-top:2px">${label}</div>
  </div>`;
}

function hBarChart(items,opts){
  opts=opts||{};
  const color=opts.color||'#cc0000';
  const max=Math.max(1,...items.map(i=>i.value));
  return items.map(i=>{
    const pct=Math.max(2,Math.round((i.value/max)*100));
    return`<div style="margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;gap:10px;font-size:12px;color:var(--text-secondary);margin-bottom:4px">
        <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(i.label)}</span>
        <span style="font-weight:600;color:var(--text-primary);flex-shrink:0">${(i.value||0).toLocaleString('pl-PL')}</span>
      </div>
      <div style="background:var(--bg-sunken);border-radius:6px;height:8px;overflow:hidden">
        <div style="background:${color};height:100%;width:${pct}%;border-radius:6px"></div>
      </div>
    </div>`;
  }).join('');
}

function svgLineChart(points){
  if(!points.length)return'<div style="color:var(--text-tertiary);font-size:12px;padding:16px 0;text-align:center">Za mało danych</div>';
  const w=600,h=140,pad=20;
  const maxY=Math.max(1,...points.map(p=>p.y));
  const stepX=points.length>1?(w-pad*2)/(points.length-1):0;
  const coords=points.map((p,i)=>[pad+i*stepX,h-pad-((p.y/maxY)*(h-pad*2))]);
  const linePath='M'+coords.map(c=>c[0]+','+c[1]).join(' L');
  const areaPath=linePath+` L${coords[coords.length-1][0]},${h-pad} L${coords[0][0]},${h-pad} Z`;
  return`<svg viewBox="0 0 ${w} ${h}" style="width:100%;height:140px;display:block">
    <path d="${areaPath}" fill="rgba(204,0,0,.12)" stroke="none"/>
    <path d="${linePath}" fill="none" stroke="#cc0000" stroke-width="2"/>
    ${coords.map(c=>`<circle cx="${c[0]}" cy="${c[1]}" r="3" fill="#cc0000"/>`).join('')}
  </svg>
  <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text-tertiary);margin-top:2px">
    <span>${esc(points[0].label)}</span>${points.length>1?`<span>${esc(points[points.length-1].label)}</span>`:''}
  </div>`;
}

async function openStatsPanel(){
  if(!currentUser)return;
  document.getElementById('stats-modal').classList.add('open');
  const body=document.getElementById('stats-body');
  body.innerHTML='<p style="color:var(--text-tertiary);padding:30px 0;text-align:center">Ładowanie statystyk...</p>';

  const ownVideos=videos.filter(v=>v.user_id===currentUser.id);
  const ownVideoIds=ownVideos.map(v=>String(v.id));
  const totalViews=ownVideos.reduce((s,v)=>s+(v.views||0),0);
  const totalLikes=ownVideos.reduce((s,v)=>s+(v.likes||0),0);
  const totalDislikes=ownVideos.reduce((s,v)=>s+(v.dislikes||0),0);
  const totalComments=ownVideos.reduce((s,v)=>s+((v.comments||[]).length),0);
  const avgViews=ownVideos.length?Math.round(totalViews/ownVideos.length):0;
  const engagement=totalViews?(((totalLikes+totalComments)/totalViews)*100).toFixed(1):'0';
  const shortsCount=ownVideos.filter(v=>v.is_short===true).length;
  const longCount=ownVideos.length-shortsCount;
  const shortsViews=ownVideos.filter(v=>v.is_short===true).reduce((s,v)=>s+(v.views||0),0);
  const longViews=totalViews-shortsViews;

  const{data:subs}=await sb.from('subscriptions').select('created_at').eq('channel_id',currentUser.id).order('created_at',{ascending:true});
  const subCount=(subs||[]).length;

  let savedCount=0,wlCount=0;
  if(ownVideoIds.length){
    const savedCounts=await Promise.all(ownVideoIds.map(vid=>sb.rpc('count_saved_video',{p_video_id:vid})));
    savedCount=savedCounts.reduce((s,r)=>s+(r.data||0),0);
    const wlCounts=await Promise.all(ownVideoIds.map(vid=>sb.rpc('count_watch_later',{p_video_id:vid})));
    wlCount=wlCounts.reduce((s,r)=>s+(r.data||0),0);
  }

  const{data:ownPosts}=await sb.from('posts').select('likes,comments').eq('user_id',currentUser.id);
  const postCount=(ownPosts||[]).length;
  const postLikes=(ownPosts||[]).reduce((s,p)=>s+(p.likes||0),0);
  const postComments=(ownPosts||[]).reduce((s,p)=>s+((p.comments||[]).length),0);

  const topVideos=[...ownVideos].sort((a,b)=>(b.views||0)-(a.views||0)).slice(0,8)
    .map(v=>({label:v.title||'Bez tytułu',value:v.views||0}));

  const catMap={};
  ownVideos.forEach(v=>{const c=v.category||'Bez kategorii';catMap[c]=(catMap[c]||0)+(v.views||0);});
  const catData=Object.entries(catMap).sort((a,b)=>b[1]-a[1]).map(([label,value])=>({label,value}));

  const monthMap={};
  ownVideos.forEach(v=>{
    const d=new Date(v.created_at||Date.now());
    const key=d.toLocaleDateString('pl-PL',{month:'short',year:'2-digit'});
    monthMap[key]=(monthMap[key]||0)+1;
  });
  const uploadPoints=Object.entries(monthMap).map(([label,y])=>({label,y}));

  let running=0;
  const subMonthMap={};
  (subs||[]).forEach(s=>{
    const d=new Date(s.created_at);
    const key=d.toLocaleDateString('pl-PL',{month:'short',year:'2-digit'});
    subMonthMap[key]=(subMonthMap[key]||0)+1;
  });
  const subPoints=Object.entries(subMonthMap).map(([label,c])=>{running+=c;return{label,y:running};});

  body.innerHTML=`
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:10px;margin-bottom:14px">
      ${statCard('👁️','Wyświetlenia',totalViews)}
      ${statCard(likeIcon(),'Polubienia',totalLikes)}
      ${statCard('🔔','Subskrybenci',subCount)}
      ${statCard('🎬','Filmy',ownVideos.length)}
      ${statCard('💬','Komentarze',totalComments)}
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:10px;margin-bottom:26px">
      ${statCard('📊','Śr. wyświetleń/film',avgViews)}
      ${statCard('🔥','Zaangażowanie',engagement+'%')}
      ${statCard('👎','Dislajki',totalDislikes)}
      ${statCard('💾','Zapisano',savedCount)}
      ${statCard('⏰','Obejrzę później',wlCount)}
    </div>

    <div style="margin-bottom:24px">
      <div style="font-size:13px;font-weight:700;margin-bottom:10px">📈 Wzrost subskrybentów (skumulowany)</div>
      ${svgLineChart(subPoints)}
    </div>

    <div style="margin-bottom:24px">
      <div style="font-size:13px;font-weight:700;margin-bottom:10px">🏆 Najpopularniejsze filmy</div>
      ${topVideos.length?hBarChart(topVideos):'<div style="color:var(--text-tertiary);font-size:12px">Brak filmów</div>'}
    </div>

    <div style="margin-bottom:24px">
      <div style="font-size:13px;font-weight:700;margin-bottom:10px">🎞️ Filmy vs Shorts</div>
      ${hBarChart([{label:`🎬 Filmy (${longCount})`,value:longViews},{label:`📱 Shorts (${shortsCount})`,value:shortsViews}],{color:'#a78bfa'})}
    </div>

    <div style="margin-bottom:24px">
      <div style="font-size:13px;font-weight:700;margin-bottom:10px">📂 Wyświetlenia wg kategorii</div>
      ${catData.length?hBarChart(catData,{color:'#3ea6ff'}):'<div style="color:var(--text-tertiary);font-size:12px">Brak danych</div>'}
    </div>

    <div style="margin-bottom:24px">
      <div style="font-size:13px;font-weight:700;margin-bottom:10px">🗓️ Publikacje wg miesiąca</div>
      ${uploadPoints.length?hBarChart(uploadPoints.map(p=>({label:p.label,value:p.y})),{color:'#4ade80'}):'<div style="color:var(--text-tertiary);font-size:12px">Brak danych</div>'}
    </div>

    <div style="padding-top:20px;border-top:1px solid var(--border)">
      <div style="font-size:13px;font-weight:700;margin-bottom:10px">📝 Posty</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:10px">
        ${statCard('📝','Posty',postCount)}
        ${statCard(likeIcon(),'Polubienia postów',postLikes)}
        ${statCard('💬','Komentarze pod postami',postComments)}
      </div>
    </div>
  `;
}

function closeStatsPanel(){
  document.getElementById('stats-modal').classList.remove('open');
}

function renderVipPanel(){
  const body=document.getElementById('vip-panel-body');
  const meta=currentUser.user_metadata;
  const myDisplayName=getMyDisplayName();
  const current=myNameColor||'#ffd700';
  body.innerHTML=`
    <div style="margin-bottom:24px;padding-bottom:20px;border-bottom:1px solid var(--border)">
      <div style="font-size:13px;font-weight:700;color:var(--text-primary);margin-bottom:4px">🏅 Kolor plakietki VIP</div>
      <p style="color:var(--text-secondary);font-size:12px;margin-bottom:12px">Wybierz kolor swojej plakietki widocznej obok nicku (niebieski zarezerwowany dla administratora).</p>
      <div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:10px">
        ${VIP_BADGE_COLORS.map(c=>`<div onclick="saveVipBadgeColor('${c}')" style="width:34px;height:34px;border-radius:50%;background:${c};cursor:pointer;border:3px solid ${vipBadgeColor===c?'#fff':'transparent'};display:flex;align-items:center;justify-content:center">${vipBadgeColor===c?'<svg viewBox="0 0 24 24" width="14" height="14" fill="#000"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>':''}</div>`).join('')}
      </div>
      <div style="display:flex;align-items:center;gap:8px;font-size:14px;font-weight:700">
        <span>${myDisplayName}</span>
        ${verifiedBadge(currentUser.email)}
      </div>
    </div>

    <div style="margin-bottom:24px;padding-bottom:20px;border-bottom:1px solid var(--border)">
      <div style="font-size:13px;font-weight:700;color:var(--text-primary);margin-bottom:4px">🎨 Kolor nicku</div>
      <p style="color:var(--text-secondary);font-size:12px;margin-bottom:14px">Kolor Twojej nazwy w komentarzach, na filmach i postach.</p>
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:16px">
        <input type="color" id="vip-color-inp" value="${current}" style="width:56px;height:56px;border:none;border-radius:10px;cursor:pointer;background:none;padding:0">
        <div id="vip-color-preview" style="font-size:16px;font-weight:700;color:${myNameColor||'#fff'};font-family:${fontCssFor(myNameFont)}">${myDisplayName}</div>
      </div>
      <div style="display:flex;gap:10px">
        <button onclick="saveVipColor()" style="background:#ffd700;border:none;color:#000;padding:10px 20px;border-radius:20px;cursor:pointer;font-size:13px;font-weight:700">Zapisz kolor</button>
        <button onclick="resetVipColor()" style="background:var(--border-soft);border:none;color:var(--text-primary);padding:10px 20px;border-radius:20px;cursor:pointer;font-size:13px">Resetuj</button>
      </div>
    </div>

    <div style="margin-bottom:24px;padding-bottom:20px;border-bottom:1px solid var(--border)">
      <div style="font-size:13px;font-weight:700;color:var(--text-primary);margin-bottom:4px">🖼️ Ramka avatara</div>
      <p style="color:var(--text-secondary);font-size:12px;margin-bottom:14px">Kolorowa obwódka wokół Twojego zdjęcia profilowego, widoczna na Twoim kanale.</p>
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:14px">
        <div class="${myAvatarParticles?'avatar-particle-wrap':''}" style="${myAvatarParticles?'margin-top:0':''}">
          <div style="width:64px;height:64px;border-radius:50%;padding:3px;${myAvatarFrame?`background:${myAvatarFrame}`:'background:transparent'}">
            <div style="width:100%;height:100%;border-radius:50%;overflow:hidden;background:var(--bg-sunken);display:flex;align-items:center;justify-content:center">
              ${meta?.avatar_url?`<img src="${meta.avatar_url}" style="width:100%;height:100%;object-fit:cover">`:`<span style="font-size:22px;font-weight:700">${(myDisplayName[0]||'?').toUpperCase()}</span>`}
            </div>
          </div>
          ${myAvatarParticles?`<span class="av-particle p1">${myAvatarParticleType}</span><span class="av-particle p2">${myAvatarParticleType}</span><span class="av-particle p3">${myAvatarParticleType}</span><span class="av-particle p4">${myAvatarParticleType}</span><span class="av-particle p5">${myAvatarParticleType}</span><span class="av-particle p6">${myAvatarParticleType}</span>`:''}
        </div>
        <div style="font-size:12px;color:var(--text-tertiary)">Podgląd</div>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:16px">
        <div onclick="resetAvatarFrame()" style="width:34px;height:34px;border-radius:50%;background:var(--bg-sunken);border:2px dashed var(--border);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:14px" title="Brak ramki">${!myAvatarFrame?'✓':'✕'}</div>
        ${AVATAR_FRAME_COLORS.map(c=>`<div onclick="saveAvatarFrame('${c}')" style="width:34px;height:34px;border-radius:50%;background:${c};cursor:pointer;border:3px solid ${myAvatarFrame===c?'#fff':'transparent'};display:flex;align-items:center;justify-content:center">${myAvatarFrame===c?'<svg viewBox="0 0 24 24" width="14" height="14"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="#fff" stroke="#000" stroke-width="1"/></svg>':''}</div>`).join('')}
      </div>
      <div onclick="toggleAvatarParticles()" style="display:flex;align-items:center;justify-content:space-between;cursor:pointer;background:var(--bg-sunken);border-radius:10px;padding:12px 14px">
        <div><div style="font-size:13px;font-weight:600">${myAvatarParticleType} Efekt cząsteczek</div><div style="font-size:11px;color:var(--text-tertiary)">Subtelne iskierki wokół avatara na Twoim kanale</div></div>
        <div style="width:40px;height:22px;border-radius:12px;background:${myAvatarParticles?'#3ea6ff':'var(--border)'};position:relative;flex-shrink:0;transition:background .2s">
          <div style="width:18px;height:18px;border-radius:50%;background:#fff;position:absolute;top:2px;left:${myAvatarParticles?'20px':'2px'};transition:left .2s"></div>
        </div>
      </div>
      ${myAvatarParticles?`<div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:12px">
        ${AVATAR_PARTICLE_TYPES.map(e=>`<div onclick="saveAvatarParticleType('${e}')" style="width:34px;height:34px;border-radius:8px;background:var(--bg-sunken);cursor:pointer;border:2px solid ${myAvatarParticleType===e?'#3ea6ff':'transparent'};display:flex;align-items:center;justify-content:center;font-size:16px">${e}</div>`).join('')}
      </div>`:''}
    </div>

    <div>
      <div style="font-size:13px;font-weight:700;color:var(--text-primary);margin-bottom:4px">🔤 Czcionka nicku</div>
      <p style="color:var(--text-secondary);font-size:12px;margin-bottom:14px">Wybierz styl czcionki dla swojego nicku.</p>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${FONT_OPTIONS.map(f=>`
          <div onclick="saveVipFont('${f.id}')" style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-radius:10px;cursor:pointer;background:${myNameFont===f.id?'rgba(255,215,0,.12)':'var(--bg-sunken)'};border:1px solid ${myNameFont===f.id?'#ffd700':'var(--border)'}">
            <span style="font-family:${f.css};font-size:16px;color:${myNameColor||'#fff'}">${myDisplayName||f.label}</span>
            <span style="font-size:11px;color:var(--text-tertiary)">${f.label}${myNameFont===f.id?' ✓':''}</span>
          </div>`).join('')}
      </div>
    </div>
    <p style="color:var(--text-tertiary);font-size:11px;margin-top:20px">Zmiany obejmą nowe komentarze, filmy i posty — starsze wpisy zachowają dotychczasowy wygląd.</p>
  `;
}

async function saveVipBadgeColor(color){
  if(!isVIP())return;
  const{error}=await sb.from('profiles').upsert([{id:currentUser.id,email:currentUser.email,vip_badge_color:color}],{onConflict:'id'});
  if(error){toast('Błąd: '+error.message);return;}
  vipBadgeColor=color;
  vipEmailsMap.set(currentUser.email,color);
  renderVipPanel();
  toast('Kolor plakietki zapisany! 🏅');
}

async function saveVipColor(){
  if(!isVIP())return;
  const hex=document.getElementById('vip-color-inp').value;
  const{error}=await sb.from('profiles').upsert([{id:currentUser.id,name_color:hex}],{onConflict:'id'});
  if(error){toast('Błąd: '+error.message);return;}
  myNameColor=hex;
  renderVipPanel();
  toast('Kolor nicku zapisany! 🎨');
}

async function resetVipColor(){
  if(!isVIP())return;
  await sb.from('profiles').upsert([{id:currentUser.id,name_color:''}],{onConflict:'id'});
  myNameColor='';
  renderVipPanel();
  toast('Kolor zresetowany');
}

async function saveAvatarFrame(color){
  if(!isVIP())return;
  const{error}=await sb.from('profiles').upsert([{id:currentUser.id,avatar_frame:color}],{onConflict:'id'});
  if(error){toast('Błąd: '+error.message);return;}
  myAvatarFrame=color;
  renderVipPanel();
  updateAuthUI();
  toast('Ramka avatara zapisana! 🖼️');
}

async function resetAvatarFrame(){
  if(!isVIP())return;
  await sb.from('profiles').upsert([{id:currentUser.id,avatar_frame:''}],{onConflict:'id'});
  myAvatarFrame='';
  renderVipPanel();
  updateAuthUI();
  toast('Ramka usunięta');
}

async function saveVipFont(fontId){
  if(!isVIP())return;
  const{error}=await sb.from('profiles').upsert([{id:currentUser.id,name_font:fontId}],{onConflict:'id'});
  if(error){toast('Błąd: '+error.message);return;}
  myNameFont=fontId;
  renderVipPanel();
  toast('Czcionka zapisana! 🔤');
}


// ── ADMIN ────────────────────────────────────────────────────────────────
const ADMIN_EMAIL='revx8199@gmail.com';

// ── KRAJ KANAŁU ───────────────────────────────────────────────────────────
const COUNTRIES=[
  ['PL','Polska','Польша'],['RU','Rosja','Россия'],['UA','Ukraina','Украина'],['BY','Białoruś','Беларусь'],
  ['DE','Niemcy','Германия'],['US','Stany Zjednoczone','США'],['GB','Wielka Brytania','Великобритания'],
  ['FR','Francja','Франция'],['ES','Hiszpania','Испания'],['IT','Włochy','Италия'],['CZ','Czechy','Чехия'],
  ['SK','Słowacja','Словакия'],['LT','Litwa','Литва'],['LV','Łotwa','Латвия'],['EE','Estonia','Эстония'],
  ['KZ','Kazachstan','Казахстан'],['CA','Kanada','Канада'],['AU','Australia','Австралия'],
  ['NL','Holandia','Нидерланды'],['SE','Szwecja','Швеция'],['NO','Norwegia','Норвегия'],['FI','Finlandia','Финляндия'],
  ['TR','Turcja','Турция'],['IN','Indie','Индия'],['CN','Chiny','Китай'],['JP','Japonia','Япония'],
  ['KR','Korea Południowa','Южная Корея'],['BR','Brazylia','Бразилия'],['MX','Meksyk','Мексика'],
  ['AR','Argentyna','Аргентина'],['ZA','RPA','ЮАР'],['EG','Egipt','Египет'],['IL','Izrael','Израиль'],
  ['AE','ZEA','ОАЭ'],['IE','Irlandia','Ирландия'],['PT','Portugalia','Португалия'],['GR','Grecja','Греция'],
  ['RO','Rumunia','Румыния'],['HU','Węgry','Венгрия'],['CH','Szwajcaria','Швейцария'],['AT','Austria','Австрия'],
  ['BE','Belgia','Бельгия']
];
function flagEmoji(code){
  if(!code)return'';
  return code.toUpperCase().replace(/./g,c=>String.fromCodePoint(127397+c.charCodeAt(0)));
}
function countryName(code){
  const c=COUNTRIES.find(x=>x[0]===code);
  if(!c)return code;
  return getLang()==='ru'?c[2]:c[1];
}
function isAdmin(){return!!(currentUser&&currentUser.email===ADMIN_EMAIL);}

let myNameColor='';
let myAvatarFrame='';
let myAvatarParticles=false;
let myAvatarParticleType='✨';
let myDisplayNick='';
let vipBadgeColor='';
let adminBadgeColor='';

async function loadVipEmails(){
  const{data}=await sb.from('profiles').select('email,vip_badge_color,vip_since').eq('is_vip',true);
  vipEmailsMap=new Map((data||[]).map(p=>[p.email,p.vip_badge_color||'#ffd700']));
  vipSinceMap=new Map((data||[]).map(p=>[p.email,p.vip_since]).filter(([,s])=>s));
  vipBadgeColor=currentUser?(vipEmailsMap.get(currentUser.email)||'#ffd700'):'';
  const vipItem=document.getElementById('vip-dropdown-item');
  if(vipItem)vipItem.style.display=isVIP()?'flex':'none';
}

async function loadAdminBadgeColor(){
  const{data}=await sb.from('profiles').select('vip_badge_color').eq('email',ADMIN_EMAIL).single();
  adminBadgeColor=data?.vip_badge_color||'#3ea6ff';
}

function getMyDisplayName(){
  if(!currentUser)return'';
  return myDisplayNick||(currentUser.user_metadata?.full_name||currentUser.email?.split('@')[0]||'Anonim').slice(0,30);
}
let myNameFont='';

const FONT_OPTIONS=[
  {id:'',label:'Domyślna',css:'inherit'},
  {id:'Bangers',label:'Bangers',css:"'Bangers', cursive"},
  {id:'Pacifico',label:'Pacifico',css:"'Pacifico', cursive"},
  {id:'Orbitron',label:'Orbitron',css:"'Orbitron', sans-serif"},
  {id:'Press Start 2P',label:'Press Start 2P',css:"'Press Start 2P', monospace"},
  {id:'Permanent Marker',label:'Permanent Marker',css:"'Permanent Marker', cursive"},
  {id:'Russo One',label:'Russo One',css:"'Russo One', sans-serif"},
  {id:'Lobster',label:'Lobster',css:"'Lobster', cursive"},
  {id:'Anton',label:'Anton',css:"'Anton', sans-serif"},
  {id:'Caveat',label:'Caveat',css:"'Caveat', cursive"},
  {id:'Fredoka',label:'Fredoka',css:"'Fredoka', sans-serif"},
  {id:'Righteous',label:'Righteous',css:"'Righteous', cursive"},
  {id:'VT323',label:'VT323',css:"'VT323', monospace"},
  {id:'Shadows Into Light',label:'Shadows Into Light',css:"'Shadows Into Light', cursive"},
  {id:'Bungee',label:'Bungee',css:"'Bungee', cursive"},
  {id:'Comfortaa',label:'Comfortaa',css:"'Comfortaa', sans-serif"},
  {id:'Rubik Mono One',label:'Rubik Mono One',css:"'Rubik Mono One', sans-serif"},
  {id:'Playfair Display',label:'Playfair Display',css:"'Playfair Display', serif"},
  {id:'Chewy',label:'Chewy',css:"'Chewy', cursive"},
  {id:'Great Vibes',label:'Great Vibes',css:"'Great Vibes', cursive"},
  {id:'Audiowide',label:'Audiowide',css:"'Audiowide', sans-serif"},
  {id:'Monoton',label:'Monoton',css:"'Monoton', cursive"},
  {id:'Bebas Neue',label:'Bebas Neue',css:"'Bebas Neue', sans-serif"},
  {id:'Creepster',label:'Creepster',css:"'Creepster', cursive"},
  {id:'Satisfy',label:'Satisfy',css:"'Satisfy', cursive"},
  {id:'Amatic SC',label:'Amatic SC',css:"'Amatic SC', cursive"},
  {id:'Black Ops One',label:'Black Ops One',css:"'Black Ops One', cursive"},
  {id:'Dancing Script',label:'Dancing Script',css:"'Dancing Script', cursive"},
  {id:'Kalam',label:'Kalam',css:"'Kalam', cursive"},
  {id:'Sigmar One',label:'Sigmar One',css:"'Sigmar One', cursive"},
  {id:'Fascinate',label:'Fascinate',css:"'Fascinate', cursive"},
  {id:'Silkscreen',label:'Silkscreen',css:"'Silkscreen', monospace"},
  {id:'Nosifer',label:'Nosifer',css:"'Nosifer', cursive"},
  {id:'Fjalla One',label:'Fjalla One',css:"'Fjalla One', sans-serif"},
  {id:'Abril Fatface',label:'Abril Fatface',css:"'Abril Fatface', serif"},
  {id:'Indie Flower',label:'Indie Flower',css:"'Indie Flower', cursive"},
  {id:'Luckiest Guy',label:'Luckiest Guy',css:"'Luckiest Guy', cursive"}
];

function fontCssFor(fontId){
  const f=FONT_OPTIONS.find(x=>x.id===fontId);
  return f?f.css:'inherit';
}

async function loadMyNameColor(){
  if(!currentUser){myNameColor='';myNameFont='';myDisplayNick='';myAvatarFrame='';myAvatarParticles=false;myAvatarParticleType='✨';return;}
  const{data}=await sb.from('profiles').select('name_color,name_font,name,avatar_frame,avatar_particles,avatar_particle_type').eq('id',currentUser.id).single();
  myNameColor=data?.name_color||'';
  myNameFont=data?.name_font||'';
  myDisplayNick=data?.name||'';
  myAvatarFrame=data?.avatar_frame||'';
  myAvatarParticles=!!data?.avatar_particles;
  myAvatarParticleType=data?.avatar_particle_type||'✨';
}

async function saveAvatarParticleType(emoji){
  if(!isVIP())return;
  myAvatarParticleType=emoji;
  const{error}=await sb.from('profiles').upsert([{id:currentUser.id,avatar_particle_type:emoji}],{onConflict:'id'});
  if(error){toast('Błąd: '+error.message);return;}
  renderVipPanel();
  updateAuthUI();
}

async function toggleAvatarParticles(){
  if(!isVIP())return;
  myAvatarParticles=!myAvatarParticles;
  const{error}=await sb.from('profiles').upsert([{id:currentUser.id,avatar_particles:myAvatarParticles}],{onConflict:'id'});
  if(error){toast('Błąd: '+error.message);myAvatarParticles=!myAvatarParticles;return;}
  renderVipPanel();
  updateAuthUI();
  toast(myAvatarParticles?'Cząsteczki włączone ✨':'Cząsteczki wyłączone');
}

async function saveMyNickname(){
  if(!isAdmin())return;
  const newNick=document.getElementById('admin-nick-inp').value.trim();
  if(!newNick){toast('Wpisz nick');return;}
  if(newNick.length>30){toast('Nick może mieć max 30 znaków!');return;}
  await sb.auth.updateUser({data:{full_name:newNick}});
  const{error}=await sb.from('profiles').upsert([{id:currentUser.id,name:newNick}],{onConflict:'id'});
  if(error){toast('Błąd zapisu nicku: '+error.message);return;}
  myDisplayNick=newNick;
  profileCache[currentUser.id]={...(profileCache[currentUser.id]||{id:currentUser.id,avatar:currentUser.user_metadata?.avatar_url||'',email:currentUser.email||''}),name:newNick};
  toast('Nick zmieniony! ✏️');
  renderAdminPanel();
}

async function saveMyFont(fontId){
  if(!isAdmin())return;
  const{error}=await sb.from('profiles').upsert([{id:currentUser.id,name_font:fontId}],{onConflict:'id'});
  if(error){toast('Błąd zapisu czcionki: '+error.message);return;}
  myNameFont=fontId;
  renderAdminPanel();
  toast('Czcionka zapisana! 🔤');
}

async function saveMyNameColor(){
  if(!isAdmin())return;
  const hex=document.getElementById('admin-color-inp').value;
  const{error}=await sb.from('profiles').upsert([{id:currentUser.id,name_color:hex}],{onConflict:'id'});
  if(error){toast('Błąd zapisu koloru: '+error.message);return;}
  myNameColor=hex;
  toast('Kolor nicku zapisany! 🎨');
  document.getElementById('admin-color-preview').style.color=hex;
}

async function resetMyNameColor(){
  if(!isAdmin())return;
  myNameColor='';
  await sb.from('profiles').upsert([{id:currentUser.id,name_color:''}],{onConflict:'id'});
  document.getElementById('admin-color-inp').value='#3ea6ff';
  document.getElementById('admin-color-preview').style.color='#fff';
  toast('Kolor zresetowany');
}

async function checkIfBanned(){
  if(!currentUser)return false;
  const{data}=await sb.from('banned_users').select('*').eq('user_id',currentUser.id);
  if(!data||!data.length)return false;
  const active=data.find(b=>!b.expires_at||new Date(b.expires_at)>new Date());
  if(active){
    await sb.auth.signOut();
    currentUser=null;
    updateAuthUI();
    showBanScreen(active);
    return true;
  }
  return false;
}

let banCountdownInterval=null;

function continueAsGuestFromBan(){
  if(banCountdownInterval){clearInterval(banCountdownInterval);banCountdownInterval=null;}
  document.getElementById('ban-screen').style.display='none';
  document.body.style.overflow='';
  toast('Przeglądasz jako gość — bez logowania nie możesz komentować ani lajkować');
}

function showBanScreen(ban){
  const screen=document.getElementById('ban-screen');
  const reasonText=document.getElementById('ban-reason-text');
  const countdownBox=document.getElementById('ban-countdown-box');
  const foreverBox=document.getElementById('ban-forever-box');
  const countdownEl=document.getElementById('ban-countdown');

  reasonText.textContent=ban.reason?`Powód: ${ban.reason}`:'Twoje konto narusza zasady WaveTube.';
  screen.style.display='flex';
  document.body.style.overflow='hidden';

  if(banCountdownInterval)clearInterval(banCountdownInterval);

  if(!ban.expires_at){
    foreverBox.style.display='block';
    countdownBox.style.display='none';
    return;
  }
  foreverBox.style.display='none';
  countdownBox.style.display='block';

  const updateCountdown=()=>{
    const diff=new Date(ban.expires_at)-new Date();
    if(diff<=0){
      clearInterval(banCountdownInterval);
      countdownEl.textContent='Możesz już spróbować się zalogować ponownie';
      return;
    }
    const days=Math.floor(diff/86400000);
    const hours=Math.floor((diff%86400000)/3600000);
    const mins=Math.floor((diff%3600000)/60000);
    const secs=Math.floor((diff%60000)/1000);
    countdownEl.textContent=days>0
      ?`${days}d ${String(hours).padStart(2,'0')}:${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`
      :`${String(hours).padStart(2,'0')}:${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
  };
  updateCountdown();
  banCountdownInterval=setInterval(updateCountdown,1000);
}


// ── KANAŁ ─────────────────────────────────────────────────────────────────────
async function showChannel(userId,nameIn,avatar,email){
  let name=nameIn;
  // Czasem przez pomyłkę wywołania trafia tu e-mail zamiast prawdziwego UUID usera —
  // wtedy próbujemy go odnaleźć w profiles, żeby dane (m.in. baner) ładowały się poprawnie.
  if(userId&&userId.includes('@')){
    if(!email)email=userId;
    userId=null;
  }
  if(!userId&&email){
    const{data:profByEmail}=await sb.from('profiles').select('id').eq('email',email).maybeSingle();
    if(profByEmail?.id)userId=profByEmail.id;
  }
  // Zawsze bierzemy aktualny nick/avatar z profiles (jeśli istnieje) —
  // przekazany nameIn to często "zamrożona" nazwa sprzed zmiany nicku (z filmu/komentarza).
  if(userId){
    const prof=await getProfile(userId);
    if(prof){
      if(prof.name)name=prof.name;
      if(prof.avatar)avatar=prof.avatar;
      if(!email)email=prof.email||email;
    }
  }
  document.getElementById('main-content').style.display='none';
  const cc=document.getElementById('channel-content');
  cc.classList.add('open');
  const userVideos=videos.filter(v=>(v.user_id===userId||(v.user_email===email&&email))&&isDiscoverable(v));
  const ucol=getUserColor(email);
  let avHtml=avatar?`<img src="${avatar}">`:`<span>${name[0]||'?'}</span>`;
  const isSub=subscribedSet.has(userId||email);
  // Clean up name if it's a UUID
  name=name&&!name.match(/^[0-9a-f-]{8,}$/i)?name:t('ch_default_name');
  currentChannelUser={userId,email,name};
  currentTab='home';
  const sbEl=document.getElementById('sidebar-left');
  if(sbEl)sbEl.style.display='none';
  document.getElementById('main-content').style.display='none';
  const mw=document.getElementById('main-wrapper');
  if(mw)mw.style.display='none';
  const isOwner=currentUser&&(currentUser.id===userId||currentUser.id===email||(currentUser.email===email&&email));
  const bannerKey=userId||email;
  let chBannerUrl=localStorage.getItem('banner_'+bannerKey)||'';
  const savedDescFallback=localStorage.getItem('desc_'+(userId||email))||'';
  const{count:subCount}=await sb.from('subscriptions').select('*',{count:'exact',head:true}).eq('channel_id',userId||email);
  let chNameColor='',chNameFont='',savedDesc=savedDescFallback,joinedAt='',country='',chAvatarFrame='',chAvatarParticles=false,chAvatarParticleType='✨';
  if(userId){
    const{data:profStyle}=await sb.from('profiles').select('name_color,name_font,description,created_at,country,banner_url,avatar_frame,avatar_particles,avatar_particle_type').eq('id',userId).single();
    chNameColor=profStyle?.name_color||'';
    chNameFont=profStyle?.name_font||'';
    if(profStyle&&profStyle.description)savedDesc=profStyle.description;
    if(profStyle&&profStyle.created_at)joinedAt=profStyle.created_at;
    if(profStyle&&profStyle.country)country=profStyle.country;
    if(profStyle&&profStyle.banner_url)chBannerUrl=profStyle.banner_url;
    chAvatarFrame=profStyle?.avatar_frame||'';
    chAvatarParticles=!!profStyle?.avatar_particles;
    chAvatarParticleType=profStyle?.avatar_particle_type||'✨';
  }
  const avFrameStyle=chAvatarFrame?`border:3px solid ${chAvatarFrame};box-sizing:border-box`:'';
  const avBlockHtml=chAvatarParticles
    ?`<div class="avatar-particle-wrap"><div class="channel-big-av" style="${avFrameStyle}">${avHtml}</div><span class="av-particle p1">${chAvatarParticleType}</span><span class="av-particle p2">${chAvatarParticleType}</span><span class="av-particle p3">${chAvatarParticleType}</span><span class="av-particle p4">${chAvatarParticleType}</span><span class="av-particle p5">${chAvatarParticleType}</span><span class="av-particle p6">${chAvatarParticleType}</span></div>`
    :`<div class="channel-big-av" style="${avFrameStyle}">${avHtml}</div>`;
  const bannerBg=chBannerUrl?(chBannerUrl.startsWith('url(')?chBannerUrl:'url('+chBannerUrl+')'):'linear-gradient(135deg,#1a1a2e,#16213e)';
  cc.innerHTML=`
    <div style="position:relative">
      <div id="channel-banner" style="height:230px;background:${bannerBg};background-size:cover;background-position:center;position:relative">
        ${isOwner?`
          <div style="position:absolute;bottom:0;left:0;right:0;background:rgba(0,0,0,0);display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .2s;height:100%" id="banner-hover-area" onmouseover="this.style.opacity=1;this.style.background='rgba(0,0,0,0.4)'" onmouseout="this.style.opacity=0;this.style.background='rgba(0,0,0,0)'">
            <label style="background:rgba(0,0,0,0.7);color:var(--text-primary);padding:10px 20px;border-radius:24px;cursor:pointer;font-size:14px;font-weight:600;display:flex;align-items:center;gap:8px;border:2px solid rgba(255,255,255,0.3)">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
              <span id="ch-banner-label">${t('ch_change_banner')}</span>
              <input type="file" accept="image/*" style="display:none" onchange="changeBanner(event,'${bannerKey}')" />
            </label>
          </div>`:''}
      </div>
    </div>
    <div class="channel-header">
      ${avBlockHtml}
      <div class="channel-big-info" style="flex:1">
        <h2 style="margin-bottom:2px;display:flex;align-items:center;${chNameColor?`color:${chNameColor};`:''}${chNameFont?`font-family:${fontCssFor(chNameFont)};`:''}">${esc(name)}${verifiedBadge(email)}</h2>
        <div style="font-size:12px;color:var(--text-secondary);margin-bottom:6px">${makeNick(name,email)}</div>
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:4px">
          <span style="font-size:13px;color:var(--text-secondary)"><span id="sub-count-big">${subCount}</span> ${t('subscribers_label')} · ${userVideos.length} ${t('videos_label')}</span>
          ${joinedAt?`<span style="font-size:12px;color:var(--text-tertiary)">· ${t('ch_joined')} ${new Date(joinedAt).toLocaleDateString(getLang()==='ru'?'ru-RU':'pl-PL',{day:'numeric',month:'long',year:'numeric'})}</span>`:''}
          ${country?`<span style="font-size:12px;color:var(--text-tertiary)">· ${flagEmoji(country)} ${countryName(country)}</span>`:(isOwner?`<span style="font-size:12px;color:var(--text-tertiary);cursor:pointer;text-decoration:underline" onclick="openSettingsModal()">· 🌍 ${t('ch_set_country')}</span>`:'')}
          ${!isOwner?`<button class="btn-sub-big${isSub?' subscribed':''}" onclick="toggleSub('${userId||email}','${jsesc(name)}')" id="sub-big-btn" style="margin-left:0">${isSub?'✓ '+t('btn_subscribed'):t('btn_subscribe')}</button>
          <button onclick="openMsg('${jsesc(name)}','${email}','${userId}')" style="background:var(--border-soft);border:none;color:var(--text-primary);padding:8px 16px;border-radius:20px;cursor:pointer;font-size:13px;display:flex;align-items:center;gap:6px">✉️ ${t('ch_message')}</button>`
          :`<button class="btn-sub-big subscribed" style="margin-left:0;cursor:default">${t('your_channel_label')}</button>
          <button onclick="openStatsPanel()" style="background:var(--border-soft);border:none;color:var(--text-primary);padding:8px 16px;border-radius:20px;cursor:pointer;font-size:13px;display:flex;align-items:center;gap:6px">📊 ${t('ch_stats')}</button>`}
        </div>
        <div id="ch-desc-wrap">
          ${isOwner
            ?`<div id="ch-desc-text" style="font-size:13px;color:var(--text-secondary);cursor:pointer" onclick="editDesc('${userId||email}')">${savedDesc||'<span style="color:#555">'+t('ch_add_desc')+'</span>'}</div>`
            :`<div style="font-size:13px;color:var(--text-secondary)">${esc(savedDesc)}</div>`
          }
        </div>
      </div>
    </div>
    <div class="channel-tabs">
      <div class="ch-tab active" id="tab-home" onclick="switchChannelTab('home')">${t('nav_home')}</div>
      <div class="ch-tab" id="tab-videos" onclick="switchChannelTab('videos')">${t('tab_videos')}</div>
      <div class="ch-tab" id="tab-shorts" onclick="switchChannelTab('shorts')">${t('tab_shorts')}</div>
      <div class="ch-tab" id="tab-posts" onclick="switchChannelTab('posts')">${t('tab_posts')}</div>
    </div>
    <div id="channel-home-container"></div>
    <div class="channel-grid" id="channel-grid" style="display:none"></div>
    <div id="channel-shorts-container" style="display:none"></div>
    <div id="posts-container" style="display:none"></div>
    <div style="padding:0 24px 20px"><button class="abtn" onclick="showHome()">← Wróć</button></div>`;

  renderChannelHome();
  const cg=document.getElementById('channel-grid');
  if(!userVideos.length){cg.innerHTML=`<div style="color:#555;font-size:14px">${t('ch_no_videos')}</div>`;return;}
  userVideos.forEach(v=>{
    const th=thumbFor(v);
    const el=document.createElement('div');
    el.className='card';
    el.innerHTML=`<div class="thumb">
      ${th?`<img src="${th}" alt="${esc(v.title)}" onerror="this.style.display='none'">`:'<div class="no-thumb">🎬</div>'}
      <div class="play-ov"><div class="pb">▶</div></div>
      ${v.dur?`<div class="dur">${v.dur}</div>`:''}
    </div>
    <div class="card-info" style="padding:10px 4px">
      <h3>${esc(v.title)}</h3>
      <p>${v.category?`<span style="color:var(--text-secondary);font-size:11px">${esc(v.category)} · </span>`:''} ${v.likes_enabled!==false?(v.likes||0)+' '+likeIcon()+' · ':''} ${v.comments_enabled!==false?(v.comments||[]).length+' '+t('ch_comments_suffix'):' 🔒 '+t('ch_comments_off')}</p>
      ${v.tags&&v.tags.length?`<div style="margin-top:4px;display:flex;flex-wrap:wrap;gap:4px">${v.tags.slice(0,3).map(t=>`<span style="background:var(--bg-card);color:var(--text-secondary);font-size:10px;padding:2px 6px;border-radius:8px">#${t}</span>`).join('')}</div>`:''
      }
      ${v.premiere&&new Date(v.premiere)>new Date()?`<div style="margin-top:4px;font-size:11px;color:#ff0000;font-weight:600">🔴 ${t('ch_premiere')}: ${new Date(v.premiere).toLocaleString('pl-PL',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</div>`:''
      }
    </div>`;
    el.onclick=()=>openP(v.id);
    cg.appendChild(el);
  });
}

function showMyChannel(){
  if(!currentUser)return;
  const meta=currentUser.user_metadata;
  showChannel(currentUser.id,getMyDisplayName(),meta?.avatar_url||'',currentUser.email);
  toggleDropdown(true);
}

async function toggleSub(key,name){
  if(!currentUser){toast('Zaloguj się żeby subskrybować!');return;}
  if(key&&key.includes('@')){
    const{data:profByEmail}=await sb.from('profiles').select('id').eq('email',key).maybeSingle();
    if(profByEmail?.id)key=profByEmail.id;
  }
  const isSub=subscribedSet.has(key);
  if(isSub){
    subscribedSet.delete(key);
    await sb.from('subscriptions').delete().match({subscriber_id:currentUser.id,channel_id:key});
    toast(`${t('toast_unsubscribed')}: ${name}`);
  } else {
    subscribedSet.add(key);
    const chVideos=videos.filter(v=>v.user_id===key);
    let chAvatar=chVideos[0]?.user_avatar||'';
    let chName=chVideos[0]?.user_name||chVideos[0]?.user_email?.split('@')[0]||'';
    if((!chAvatar||!chName)&&key&&!key.includes('@')){
      const prof=await getProfile(key);
      if(prof){
        if(!chAvatar&&prof.avatar)chAvatar=prof.avatar;
        if(!chName&&prof.name)chName=prof.name;
      }
    }
    if(!chName)chName=name;
    await sb.from('subscriptions').insert([{subscriber_id:currentUser.id,subscriber_email:currentUser.email,channel_id:key,channel_name:chName,channel_avatar:chAvatar}]);
    // send notification to channel owner
    await sb.from('notifications').insert([{user_id:key,message:`<b>${esc(getMyDisplayName())}</b> zasubskrybował Twój kanał 🔔`,avatar:currentUser.user_metadata?.avatar_url||'',sender_id:currentUser.id,sender_name:getMyDisplayName(),sender_avatar:currentUser.user_metadata?.avatar_url||'',sender_email:currentUser.email}]);
    toast(`${t('toast_subscribing')}: ${name} 🔔`);
  }
  const count=await getSubCount(key);
  const btn=document.getElementById('sub-big-btn');
  if(btn){btn.className='btn-sub-big'+(subscribedSet.has(key)?' subscribed':'');btn.textContent=subscribedSet.has(key)?'✓ '+t('btn_subscribed'):t('btn_subscribe');}
  const sc=document.getElementById('sub-count-big');
  if(sc)sc.textContent=count;
}

async function getSubCount(key){
  const{count}=await sb.from('subscriptions').select('*',{count:'exact',head:true}).eq('channel_id',key);
  return count||0;
}

async function loadSubscriptions(){
  if(!currentUser)return;
  const{data}=await sb.from('subscriptions').select('channel_id,channel_name,channel_avatar').eq('subscriber_id',currentUser.id);
  subscribedSet.clear();
  (data||[]).forEach(s=>subscribedSet.add(s.channel_id));
  // Save subs data for channels without videos
  localStorage.setItem('subs_data',JSON.stringify(data||[]));
  renderSidebarSubs(data||[]);
}

function renderSidebarSubs(subs){
  const section=document.getElementById('sb-subs-section');
  const list=document.getElementById('sb-subs-list');
  if(!subs.length){section.style.display='none';return;}
  section.style.display='block';
  list.innerHTML=subs.map(s=>{
    const vid=videos.find(v=>v.user_id===s.channel_id);
    // Prefer data from videos, fallback to saved subscription data
    // Clean up name - don't show UUID
    const rawName=vid?.user_name||vid?.user_email?.split('@')[0]||s.channel_name||'';
    const name=rawName&&!rawName.match(/^[0-9a-f-]{8,}$/i)?rawName:'Kanał';
    const avatar=vid?.user_avatar||s.channel_avatar||'';
    const email=vid?.user_email||'';
    return`<div class="sb-item" onclick="showChannel('${s.channel_id}','${jsesc(name)}','${avatar}','${email}')">
      ${avatar?`<img class="sb-av" src="${avatar}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`:''}
      <div class="sb-av" style="background:#cc0000;${avatar?'display:none':''}">${esc(name[0].toUpperCase())}</div>
      <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(name)}</span>
    </div>`;
  }).join('');
}

function showSubscriptions(){
  showHome();
  const ff=document.getElementById('feed-filters');
  if(ff)ff.style.display='none';
  const shortsSection3=document.getElementById('shorts-section');
  if(shortsSection3)shortsSection3.style.display='none';
  document.getElementById('slabel').textContent=t('page_my_subs');
  if(!currentUser){render();return;}
  const subIds=[...subscribedSet];
  const g=document.getElementById('grid');
  if(!subIds.length){
    g.innerHTML=emptyStateHtml('bell',t('subs_empty'),t('subs_empty_sub'));
    return;
  }
  // Show unique channels
  const seen=new Set();
  const channels=[];
  videos.forEach(v=>{
    if(subIds.includes(v.user_id)&&!seen.has(v.user_id)){
      seen.add(v.user_id);
      channels.push({userId:v.user_id,name:v.user_name||v.user_email?.split('@')[0]||'Anonim',avatar:v.user_avatar||'',email:v.user_email||''});
    }
  });
  // Also add channels from subscriptions that have no videos
  const subsData=JSON.parse(localStorage.getItem('subs_data')||'[]');
  subsData.forEach(s=>{
    if(!seen.has(s.channel_id)){
      seen.add(s.channel_id);
      const name=s.channel_name||'Kanał';
      const avatar=s.channel_avatar||'';
      const cleanName=name&&!name.match(/^[0-9a-f-]{8,}$/i)?name:'Kanał';
      channels.push({userId:s.channel_id,name:cleanName,avatar,email:''});
    }
  });
  if(!channels.length){
    g.innerHTML=emptyStateHtml('bell',t('subs_no_videos'));
    return;
  }
  // Show as channel cards
  g.style.gridTemplateColumns='repeat(auto-fill,minmax(200px,1fr))';
  g.innerHTML='';
  channels.forEach(ch=>{
    const el=document.createElement('div');
    el.className='card';
    el.style.cursor='pointer';
    const chVideos=videos.filter(v=>v.user_id===ch.userId&&isDiscoverable(v));
    el.innerHTML=`<div style="background:var(--bg-card);border-radius:10px;padding:24px;text-align:center;border:1px solid var(--border-soft)">
      ${ch.avatar
        ?`<img src="${ch.avatar}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;margin-bottom:12px">`
        :`<div style="width:80px;height:80px;border-radius:50%;background:#cc0000;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:700;color:var(--text-primary);margin:0 auto 12px">${ch.name[0].toUpperCase()}</div>`
      }
      <div style="font-size:15px;font-weight:600;margin-bottom:4px;display:flex;align-items:center;justify-content:center;gap:4px">${ch.name}${verifiedBadge(ch.email)}</div>
      <div style="font-size:12px;color:var(--text-secondary)">${chVideos.length} filmów</div>
      <button style="margin-top:12px;background:#cc0000;border:none;color:var(--text-primary);padding:6px 20px;border-radius:16px;cursor:pointer;font-size:13px;font-weight:600" onclick="event.stopPropagation();toggleSub('${ch.userId}','${ch.name}')">✓ Subskrybujesz</button>
    </div>`;
    el.onclick=()=>showChannel(ch.userId,ch.name,ch.avatar,ch.email);
    g.appendChild(el);
  });
}

let announcementsCache=[];

