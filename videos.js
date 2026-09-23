// ============ videos.js — formularz dodawania filmu, player, edycja, usuwanie, zgłaszanie, menu karty filmu ============

// ── WESPRZYJ AUTORA (Steam trade) ───────────────────────────────────────
const STEAM_TRADE_LINK='https://steamcommunity.com/tradeoffer/new/?partner=808507248&token=RWxhzZeE';

function openPremiumModal(){
  closeCardMenu();
  const el=document.getElementById('premium-modal');
  if(el)el.classList.add('open');
}

function closePremiumModal(){
  const el=document.getElementById('premium-modal');
  if(el)el.classList.remove('open');
}

function goToSupportAuthor(){
  toast('Otwieranie Steam... to może chwilę potrwać ⏳');
  window.open(STEAM_TRADE_LINK,'_blank');
}


// ── MENU NA KARCIE FILMU (⋮) ─────────────────────────────────────────────
let cardMenuOpenId=null;
let cardMenuOutsideListener=null;

function closeCardMenu(){
  const el=document.getElementById('card-menu-popup');
  if(el)el.remove();
  if(cardMenuOutsideListener){document.removeEventListener('click',cardMenuOutsideListener);cardMenuOutsideListener=null;}
  cardMenuOpenId=null;
}

function toggleCardMenu(videoId,btnEl){
  if(cardMenuOpenId===videoId){closeCardMenu();return;}
  closeCardMenu();
  cardMenuOpenId=videoId;
  const rect=btnEl.getBoundingClientRect();
  const menu=document.createElement('div');
  menu.id='card-menu-popup';
  const top=rect.bottom+6+180>window.innerHeight?rect.top-186:rect.bottom+6;
  menu.style.cssText=`position:fixed;top:${top}px;left:${Math.min(rect.left,window.innerWidth-210)}px;background:var(--bg-panel);border:1px solid var(--border);border-radius:10px;min-width:190px;z-index:1000;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.6)`;
  menu.innerHTML=`
    <div onclick="event.stopPropagation();closeCardMenu();openPlaylistPicker('${videoId}')" style="padding:12px 16px;cursor:pointer;font-size:13px;display:flex;align-items:center;gap:10px" onmouseover="this.style.background='var(--border)'" onmouseout="this.style.background='none'"><span>➕ ${t('playlist_add_label')}</span></div>
    <div onclick="event.stopPropagation();closeCardMenu();toggleSaveVideo('${videoId}')" style="padding:12px 16px;cursor:pointer;font-size:13px;display:flex;align-items:center;gap:10px" onmouseover="this.style.background='var(--border)'" onmouseout="this.style.background='none'"><span id="save-menu-label-${videoId}">${savedVideoIds.has(String(videoId))?'✅ '+t('save_added_label'):'💾 '+t('save_label')}</span></div>
    <div onclick="event.stopPropagation();closeCardMenu();toggleWatchLater('${videoId}')" style="padding:12px 16px;cursor:pointer;font-size:13px;display:flex;align-items:center;gap:10px" onmouseover="this.style.background='var(--border)'" onmouseout="this.style.background='none'"><span id="wl-menu-label-${videoId}">${watchLaterIds.has(String(videoId))?'✅ '+t('wl_added_label'):'⏰ '+t('wl_label')}</span></div>
    <div onclick="event.stopPropagation();closeCardMenu();downloadVideo('${videoId}')" style="padding:12px 16px;cursor:pointer;font-size:13px;display:flex;align-items:center;gap:10px" onmouseover="this.style.background='var(--border)'" onmouseout="this.style.background='none'">⬇️ Pobierz</div>
    <div onclick="event.stopPropagation();closeCardMenu();shareVideoCard('${videoId}')" style="padding:12px 16px;cursor:pointer;font-size:13px;display:flex;align-items:center;gap:10px" onmouseover="this.style.background='var(--border)'" onmouseout="this.style.background='none'">🔗 Udostępnij</div>
    <div style="border-top:1px solid var(--border)"></div>
    <div onclick="event.stopPropagation();closeCardMenu();openPremiumModal()" style="padding:12px 16px;cursor:pointer;font-size:13px;display:flex;align-items:center;gap:10px;color:#7fd3ff" onmouseover="this.style.background='var(--border)'" onmouseout="this.style.background='none'">💙 Wesprzyj autora</div>
    <div style="border-top:1px solid var(--border)"></div>
    <div onclick="event.stopPropagation();closeCardMenu();openReportModal('${videoId}')" style="padding:12px 16px;cursor:pointer;font-size:13px;display:flex;align-items:center;gap:10px;color:#ff6b6b" onmouseover="this.style.background='var(--border)'" onmouseout="this.style.background='none'">🚩 Zgłoś</div>
  `;
  document.body.appendChild(menu);
  setTimeout(()=>{
    cardMenuOutsideListener=function(e){
      if(!menu.contains(e.target)&&e.target!==btnEl){closeCardMenu();}
    };
    document.addEventListener('click',cardMenuOutsideListener);
  },0);
}

function shareVideoCard(videoId){
  const v=videos.find(x=>String(x.id)===String(videoId));
  if(!v)return;
  navigator.clipboard?navigator.clipboard.writeText(v.url).then(()=>toast('Link skopiowany! 🔗')):prompt('Skopiuj:',v.url);
}

async function downloadVideo(videoId){
  if(!currentUser){toast('Zaloguj się żeby pobierać filmy!');return;}
  const v=videos.find(x=>String(x.id)===String(videoId));
  if(!v||!v.url){toast('Brak pliku do pobrania');return;}
  toast('Pobieranie rozpoczęte ⬇️');
  try{
    const res=await fetch(v.url);
    const blob=await res.blob();
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download=(v.title||'wavetube-video').replace(/[^\w\s-]/g,'')+'.mp4';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }catch(e){
    window.open(v.url,'_blank');
  }
}


// ── ZGŁASZANIE FILMÓW ─────────────────────────────────────────────────────
const REPORT_EMAIL='wavetubebuisness@gmail.com';
let reportingVideoId=null;

function openReportModal(videoId){
  reportingVideoId=videoId;
  const el=document.getElementById('report-modal');
  if(el)el.classList.add('open');
}

function closeReportModal(){
  reportingVideoId=null;
  const el=document.getElementById('report-modal');
  if(el)el.classList.remove('open');
  const r=document.querySelector('input[name="report-reason"]:checked');
  if(r)r.checked=false;
  document.getElementById('report-details').value='';
}

async function submitReport(){
  if(!currentUser){toast('Zaloguj się żeby zgłosić!');return;}
  const reasonEl=document.querySelector('input[name="report-reason"]:checked');
  if(!reasonEl){toast('Wybierz powód zgłoszenia');return;}
  const reason=reasonEl.value;
  const details=document.getElementById('report-details').value.trim();
  const v=videos.find(x=>String(x.id)===String(reportingVideoId));
  const{error}=await sb.from('reports').insert([{
    video_id:reportingVideoId,
    video_title:v?.title||'',
    video_url:v?.url||'',
    reason,
    details,
    reporter_id:currentUser.id,
    reporter_email:currentUser.email||''
  }]);
  if(error){
    toast(error.message.includes('RATE_LIMIT')?'Za dużo zgłoszeń naraz — odczekaj chwilę 🐢':'Błąd: '+error.message);
    return;
  }
  const subject=encodeURIComponent(`Zgłoszenie WaveTube: ${v?.title||reportingVideoId}`);
  const body=encodeURIComponent(`Film: ${v?.title||''}\nURL: ${v?.url||''}\nPowód: ${reason}\nSzczegóły: ${details}\nZgłaszający: ${currentUser.email||''}`);
  window.open(`mailto:${REPORT_EMAIL}?subject=${subject}&body=${body}`,'_blank');
  closeReportModal();
  toast('Zgłoszenie wysłane. Dziękujemy!');
}

async function getProfile(userId){
  if(!userId)return null;
  if(profileCache[userId])return profileCache[userId];
  // Tabela profiles jest źródłem prawdy (aktualny nick/avatar) — sprawdzamy ją najpierw,
  // żeby zmiana nicku od razu było widać wszędzie, a nie tylko na starych, "zamrożonych" wpisach.
  const{data}=await sb.from('profiles').select('*').eq('id',userId).single();
  if(data&&(data.avatar||data.name)){profileCache[userId]=data;return data;}
  // Fallback dla userów bez wiersza w profiles: dane z ich filmu (najszybsze)
  const vid=videos.find(v=>v.user_id===userId);
  if(vid&&(vid.user_avatar||vid.user_name)){
    const p={id:userId,name:vid.user_name||vid.user_email?.split('@')[0]||'Użytkownik',avatar:vid.user_avatar||'',email:vid.user_email||''};
    profileCache[userId]=p;
    return p;
  }
  // Try subscriptions table - someone might have subscribed and their name is saved
  const{data:subData}=await sb.from('subscriptions').select('channel_id,channel_name,channel_avatar').eq('channel_id',userId).limit(1);
  if(subData&&subData.length&&subData[0].channel_name){
    const p={id:userId,name:subData[0].channel_name,avatar:subData[0].channel_avatar||'',email:''};
    profileCache[userId]=p;
    return p;
  }
  // Try messages - sender info
  const{data:msgData}=await sb.from('messages').select('sender_id,sender_name,sender_avatar').eq('sender_id',userId).limit(1);
  if(msgData&&msgData.length&&msgData[0].sender_name){
    const p={id:userId,name:msgData[0].sender_name,avatar:msgData[0].sender_avatar||'',email:''};
    profileCache[userId]=p;
    return p;
  }
  return null;
}

async function loadVideos(){
  const{data,error}=await sb.from('videos').select('*').is('deleted_at',null).order('created_at',{ascending:false});
  if(error){document.getElementById('grid').innerHTML='<div class="loading" style="color:#cc0000">Błąd połączenia :(</div>';return;}
  videos=data||[];
  // Preload profiles for all video authors
  const authorIds=[...new Set((data||[]).map(v=>v.user_id).filter(Boolean))];
  await Promise.all(authorIds.map(id=>getProfile(id)));
  render();
}

async function addVideo(v){
  const{error}=await sb.from('videos').insert([v]);
  if(error){toast(error.message.includes('RATE_LIMIT')?'Za dużo filmów naraz — odczekaj chwilę 🐢':'Błąd: '+error.message);return false;}
  // Notify subscribers
  if(currentUser){
    const meta=currentUser.user_metadata;
    const{data:subs}=await sb.from('subscriptions').select('subscriber_id').eq('channel_id',currentUser.id);
    if(subs&&subs.length){
      const notifs=subs.map(s=>({user_id:s.subscriber_id,message:`<b>${esc(getMyDisplayName())}</b> dodał nowy film 🎬`,avatar:meta?.avatar_url||''}));
      await sb.from('notifications').insert(notifs);
    }
  }
  await loadVideos();return true;
}

async function deleteVideo(id){
  await sb.from('videos').update({deleted_at:new Date().toISOString(),deleted_by:currentUser?.id||null}).eq('id',id);
  videos=videos.filter(v=>v.id!==id);render();
}

async function updateVideo(id,data){
  await sb.from('videos').update(data).eq('id',id);
}


// ── PLAYER ────────────────────────────────────────────────────────────────────
function layoutActsForShorts(isShort){
  const acts=document.querySelector('#pm .acts');
  const pw=document.getElementById('pw');
  const hr=document.querySelector('#pm hr');
  const vinfo=document.querySelector('#pm .vinfo');
  const chRow=document.getElementById('channel-row');
  if(!acts||!pw||!hr||!vinfo||!chRow)return;
  if(isShort){
    pw.style.position='relative';
    pw.appendChild(acts);
    acts.classList.add('shorts-acts');
    let overlay=document.getElementById('shorts-info-overlay');
    if(!overlay){
      overlay=document.createElement('div');
      overlay.id='shorts-info-overlay';
      overlay.className='shorts-info-overlay';
    }
    pw.appendChild(overlay);
    overlay.appendChild(chRow);
    overlay.appendChild(vinfo);
    chRow.classList.add('shorts-channel-row');
    vinfo.classList.add('shorts-vinfo');
    document.getElementById('pm').classList.add('shorts-open');
  } else {
    pw.style.position='';
    acts.classList.remove('shorts-acts');
    chRow.classList.remove('shorts-channel-row');
    vinfo.classList.remove('shorts-vinfo');
    document.getElementById('pm').classList.remove('shorts-open');
    hr.parentNode.insertBefore(vinfo,hr);
    hr.parentNode.insertBefore(chRow,hr);
    hr.parentNode.insertBefore(acts,hr);
  }
}

async function openP(id){
  const v=videos.find(x=>x.id===id);if(!v)return;
  if(!canViewVideo(v)){toast('Ten film jest prywatny 🔒');return;}
  if(v.age_restricted&&sessionStorage.getItem('age_ok_'+v.id)!=='1'){
    const ok=await showConfirm('Ten film ma ograniczenie wiekowe (18+)','Potwierdź, że masz ukończone 18 lat, żeby go obejrzeć.','Mam 18+, obejrzyj');
    if(!ok)return;
    sessionStorage.setItem('age_ok_'+v.id,'1');
  }
  const isUpcoming=v.premiere&&new Date(v.premiere)>new Date();
  cur=v;
  if(!isUpcoming){
    updateVideo(v.id,{views:(v.views||0)+1});v.views=(v.views||0)+1;
    updateSaveButtonUI(v.id);
    updateWatchLaterButtonUI(v.id);
    addToWatchHistory(v);
  }
  const isShort=v.is_short===true;
  if(isShort){
    document.getElementById('pw').style.aspectRatio='9/16';
    document.getElementById('pw').style.maxHeight='80vh';
    document.getElementById('pw').style.maxWidth='360px';
    document.getElementById('pw').style.margin='0 auto';
    document.getElementById('pw').style.overflow='visible';
  } else {
    document.getElementById('pw').style.aspectRatio='16/9';
    document.getElementById('pw').style.maxHeight='';
    document.getElementById('pw').style.maxWidth='';
    document.getElementById('pw').style.margin='';
    document.getElementById('pw').style.overflow='';
  }
  let html='';
  if(isUpcoming){
    const premDate=new Date(v.premiere).toLocaleString('pl-PL',{day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'});
    html=`<div style="display:flex;align-items:center;justify-content:center;height:100%;flex-direction:column;gap:12px;color:var(--text-secondary);padding:20px;text-align:center;background:#000">
      <div style="font-size:48px">🔴</div>
      <p style="font-size:16px;font-weight:600">Premiera jeszcze się nie odbyła</p>
      <p style="font-size:14px;color:var(--text-tertiary)">Ten film będzie dostępny od:<br><b style="color:var(--text-primary)">${premDate}</b></p>
    </div>`;
  } else {
    const{type,src}=getPlayer(v.url);
    if(type==='yt'||type==='gd'||type==='od')html=`<iframe id="${type==='yt'?'yt-player-iframe':''}" src="${src}" allow="autoplay;encrypted-media;fullscreen" allowfullscreen></iframe>`;
    else if(type==='tt')html=`<iframe src="${src}" allow="encrypted-media" allowfullscreen style="border:none;width:100%;height:100%"></iframe>`;
    else if(type==='mp4')html=`<video src="${src}" controls autoplay preload="metadata" poster="${v.thumb||''}"></video>`;
    else html=`<div style="display:flex;align-items:center;justify-content:center;height:100%;flex-direction:column;gap:12px;color:#555;padding:20px;text-align:center"><div style="font-size:48px">⚠️</div><p>Nie można odtworzyć</p><a href="${src}" target="_blank" style="color:#3ea6ff;font-size:13px">Otwórz zewnętrznie ↗</a></div>`;
  }
  document.getElementById('pw').innerHTML=html;
  cancelAutoplayCountdown();
  if(!isUpcoming){
    const{type}=getPlayer(v.url);
    if(type==='mp4')setupNativePlayer(v);
    if(type==='yt')setupYtAutoplayWatcher(v);
  }
  layoutActsForShorts(isShort);
  document.getElementById('vt').textContent=v.title;
  document.getElementById('vm').innerHTML=`${viewsLabel(v,' wyświetleń')} · ${relativeDate(v.created_at)}${v.category?' · <span style="background:var(--border-soft);padding:2px 8px;border-radius:10px;font-size:11px">'+esc(v.category)+'</span>':''}${v.age_restricted?' · <span style="background:#3a1414;color:#ff6b6b;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600">18+</span>':''}${v.made_for_kids?' · <span style="background:#142a3a;color:#3ea6ff;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600">👶 Dla dzieci</span>':''}${v.description?'<div style="margin-top:8px;color:var(--text-secondary);font-size:13px;line-height:1.5">'+esc(v.description)+'</div>':''}`;
  // handle comments enabled
  const commSec=document.getElementById('comments-section');
  if(commSec)commSec.style.display=v.comments_enabled===false?'none':'block';
  document.getElementById('lc').textContent=v.likes||0;
  document.getElementById('lbtn').className='like-btn'+(likedSet.has(v.id)?' liked':'');
  document.getElementById('dbtn').className='dislike-btn'+(dislikedSet.has(v.id)?' liked':'');

  // channel row
  const uname=getUserName(v);
  const ucol=getUserColor(v.user_email);
  const isSub=subscribedSet.has(v.user_id||v.user_email);
  const avHtml=v.user_avatar?`<img src="${v.user_avatar}" style="width:40px;height:40px;border-radius:50%;object-fit:cover">`:`<div class="ch-av" style="background:${ucol}">${uname[0].toUpperCase()}</div>`;
  document.getElementById('channel-row').innerHTML=`
    ${avHtml}
    <div class="ch-info">
      <div class="ch-name" onclick="closeP();showChannel('${v.user_id||''}','${jsesc(uname)}','${v.user_avatar||''}','${v.user_email||''}')">${esc(uname)}</div>
    </div>
    <button class="btn-sub${isSub?' subscribed':''}" id="sub-btn" onclick="toggleSubInPlayer('${v.user_id||v.user_email||''}','${jsesc(uname)}')">${isSub?'✓ '+t('btn_subscribed'):t('btn_subscribe')}</button>`;

  renderC();
  document.getElementById('pm').classList.add('open');
  document.body.style.overflow='hidden';
}

function setupNativePlayer(v){
  const vid=document.querySelector('#pw video');
  if(!vid)return;

  // Zapamiętana głośność / wyciszenie (jak w prawdziwym YouTube - między filmami)
  const savedVol=localStorage.getItem('player_volume');
  const savedMuted=localStorage.getItem('player_muted');
  if(savedVol!==null)vid.volume=parseFloat(savedVol);
  if(savedMuted==='1')vid.muted=true;
  vid.addEventListener('volumechange',()=>{
    localStorage.setItem('player_volume',vid.volume);
    localStorage.setItem('player_muted',vid.muted?'1':'0');
  });

  // Wznów odtwarzanie od miejsca, w którym skończyłeś ostatnim razem
  const posKey='player_pos_'+v.id;
  const savedPos=parseFloat(localStorage.getItem(posKey)||'0');
  vid.addEventListener('loadedmetadata',()=>{
    if(savedPos>5&&savedPos<vid.duration*0.95)vid.currentTime=savedPos;
  });
  let lastSaved=0;
  vid.addEventListener('timeupdate',()=>{
    if(vid.currentTime-lastSaved>3){
      lastSaved=vid.currentTime;
      localStorage.setItem(posKey,vid.currentTime);
    }
  });
  vid.addEventListener('ended',()=>{
    localStorage.removeItem(posKey);
    triggerAutoplayNext();
  });

  // Czytelny błąd zamiast pustego czarnego ekranu przy zepsutym/martwym linku
  vid.addEventListener('error',()=>{
    document.getElementById('pw').innerHTML=`<div style="display:flex;align-items:center;justify-content:center;height:100%;flex-direction:column;gap:12px;color:var(--text-secondary);padding:20px;text-align:center;background:#000">
      <div style="font-size:48px">⚠️</div>
      <p style="font-size:15px;font-weight:600">Nie udało się załadować filmu</p>
      <p style="font-size:12px;color:var(--text-tertiary)">Link może być uszkodzony albo plik został usunięty</p>
      <a href="${esc(v.url)}" target="_blank" style="color:#3ea6ff;font-size:13px">Spróbuj otworzyć bezpośrednio ↗</a>
    </div>`;
  });
}

async function toggleSubInPlayer(key,name){
  if(!currentUser){toast('Zaloguj się żeby subskrybować!');return;}
  if(key&&key.includes('@')){
    const{data:profByEmail}=await sb.from('profiles').select('id').eq('email',key).maybeSingle();
    if(profByEmail?.id)key=profByEmail.id;
  }
  const isSub=subscribedSet.has(key);
  if(isSub){
    subscribedSet.delete(key);
    await sb.from('subscriptions').delete().match({subscriber_id:currentUser.id,channel_id:key});
    toast(`Anulowano subskrypcję`);
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
    await sb.from('notifications').insert([{user_id:key,message:`<b>${esc(getMyDisplayName())}</b> zasubskrybował Twój kanał 🔔`,avatar:currentUser.user_metadata?.avatar_url||'',sender_id:currentUser.id,sender_name:getMyDisplayName(),sender_avatar:currentUser.user_metadata?.avatar_url||'',sender_email:currentUser.email}]);
    toast(`${t('toast_subscribing')}: ${name} 🔔`);
  }
  const btn=document.getElementById('sub-btn');
  if(btn){btn.className='btn-sub'+(subscribedSet.has(key)?' subscribed':'');btn.textContent=subscribedSet.has(key)?'✓ '+t('btn_subscribed'):t('btn_subscribe');}
}

function closeP(){
  layoutActsForShorts(false); // przywróć pasek akcji na miejsce, zanim wyczyścimy zawartość playera
  cancelAutoplayCountdown();
  document.getElementById('pm').classList.remove('open');
  document.getElementById('pw').innerHTML='';
  document.body.style.overflow='';cur=null;
}

function toggleLike(){
  if(!cur)return;
  const liked=likedSet.has(cur.id);
  if(liked){likedSet.delete(cur.id);cur.likes=Math.max(0,(cur.likes||0)-1);}
  else{likedSet.add(cur.id);cur.likes=(cur.likes||0)+1;if(dislikedSet.has(cur.id)){dislikedSet.delete(cur.id);cur.dislikes=Math.max(0,(cur.dislikes||0)-1);}}
  saveLiked();saveDisliked();
  updateVideo(cur.id,{likes:cur.likes,dislikes:cur.dislikes||0});
  document.getElementById('lc').textContent=cur.likes;
  document.getElementById('lbtn').className='like-btn'+(likedSet.has(cur.id)?' liked':'');
  document.getElementById('dbtn').className='dislike-btn'+(dislikedSet.has(cur.id)?' liked':'');
  if(!liked)popEffect('lbtn','lc');
  const v=videos.find(x=>x.id===cur.id);if(v){v.likes=cur.likes;v.dislikes=cur.dislikes||0;}render();
}

function popEffect(btnId,countId){
  const btn=document.getElementById(btnId);
  const count=countId?document.getElementById(countId):null;
  if(btn){btn.classList.remove('pop');void btn.offsetWidth;btn.classList.add('pop');setTimeout(()=>btn.classList.remove('pop'),320);}
  if(count){count.classList.remove('pop');void count.offsetWidth;count.classList.add('pop');setTimeout(()=>count.classList.remove('pop'),300);}
}

function toggleDislike(){
  if(!cur)return;
  const disliked=dislikedSet.has(cur.id);
  if(disliked){dislikedSet.delete(cur.id);cur.dislikes=Math.max(0,(cur.dislikes||0)-1);}
  else{dislikedSet.add(cur.id);cur.dislikes=(cur.dislikes||0)+1;if(likedSet.has(cur.id)){likedSet.delete(cur.id);cur.likes=Math.max(0,(cur.likes||0)-1);}}
  saveLiked();saveDisliked();
  updateVideo(cur.id,{likes:cur.likes||0,dislikes:cur.dislikes});
  document.getElementById('lc').textContent=cur.likes||0;
  document.getElementById('lbtn').className='like-btn'+(likedSet.has(cur.id)?' liked':'');
  document.getElementById('dbtn').className='dislike-btn'+(dislikedSet.has(cur.id)?' liked':'');
  if(!disliked)popEffect('dbtn',null);
  const v=videos.find(x=>x.id===cur.id);if(v){v.likes=cur.likes||0;v.dislikes=cur.dislikes;}render();
}

function shareV(){
  if(!cur)return;
  navigator.clipboard?navigator.clipboard.writeText(cur.url).then(()=>toast('Link skopiowany! 🔗')):prompt('Skopiuj:',cur.url);
}


// ── FORM ──────────────────────────────────────────────────────────────────────
function detectMp4Duration(url){
  return new Promise((res,rej)=>{
    const v=document.createElement('video');
    v.preload='metadata';
    v.onloadedmetadata=()=>{
      const s=Math.round(v.duration);
      if(!isFinite(s)||s<=0){rej();return;}
      const mm=Math.floor(s/60),ss=s%60;
      res(`${mm}:${String(ss).padStart(2,'0')}`);
    };
    v.onerror=rej;
    setTimeout(rej,6000); // nie blokuj publikacji jeśli plik długo się nie wczyta
    v.src=url;
  });
}

function openForm(){
  if(!currentUser){toast('Zaloguj się żeby dodawać filmy!');return;}
  selectVisibility(document.getElementById('fvis')?.value||'public');
  document.getElementById('fm').classList.add('open');
}
function closeForm(){document.getElementById('fm').classList.remove('open');}

async function submitForm(){
  const title=document.getElementById('ftitle').value.trim();
  const url=document.getElementById('furl').value.trim();
  if(!title||!url){alert(t('form_need_title_url'));return;}
  const meta=currentUser?.user_metadata;
  const btn=document.querySelector('.fsubmit');
  btn.textContent=t('form_publishing_btn');btn.disabled=true;

  // Handle thumbnail
  let thumb=document.getElementById('fthumb')?.value.trim()||'';
  const thumbFile=document.getElementById('fthumb-file')?.files[0];
  const getThumb=()=>new Promise(res=>{
    if(thumbFile){const r=new FileReader();r.onload=e=>res(e.target.result);r.readAsDataURL(thumbFile);}
    else res(thumb);
  });
  thumb=await getThumb();

  // Jeśli pole "czas trwania" puste i to bezpośredni plik mp4 - wykryj automatycznie
  let dur=document.getElementById('fdur').value.trim();
  if(!dur&&getPlayer(url).type==='mp4'){
    dur=await detectMp4Duration(url).catch(()=>'');
  }

  const ok=await addVideo({
    title,url,thumb,
    description:document.getElementById('fdesc').value.trim(),
    dur,
    category:document.getElementById('fcat').value,
    visibility:document.getElementById('fvis').value,
    comments_enabled:document.getElementById('fcomments').checked,
    likes_enabled:document.getElementById('flikes').checked,
    is_short:document.getElementById('fshort').checked,
    tags:document.getElementById('ftags').value.trim().split(',').map(t=>t.trim()).filter(Boolean),
    premiere:document.getElementById('fpremiere').value||null,
    language:document.getElementById('flang').value,
    license:document.getElementById('flicense').value,
    hide_views:document.getElementById('fhideviews').checked,
    made_for_kids:document.getElementById('fkids').checked,
    age_restricted:document.getElementById('fage').checked,
    likes:0,dislikes:0,views:0,
    date:new Date().toLocaleDateString('pl-PL'),
    comments:[],
    user_id:currentUser?.id||'',
    user_email:currentUser?.email||'',
    user_name:getMyDisplayName()||'Anonim',
    user_avatar:meta?.avatar_url||'',
    user_color:myNameColor||'',
    user_font:myNameFont||''
  });
  btn.textContent=t('form_submit_btn');btn.disabled=false;
  if(ok){
    ['ftitle','furl','fdesc','fdur','ftags'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
    delete document.getElementById('fdur').dataset.userEdited;
    ['fcomments','flikes'].forEach(id=>document.getElementById(id).checked=true);
    ['fhideviews','fkids','fage','fshort'].forEach(id=>document.getElementById(id).checked=false);
    document.getElementById('fcat').value='';
    document.getElementById('flang').value='pl';
    document.getElementById('flicense').value='standard';
    document.getElementById('fpremiere').value='';
    selectVisibility('public');
    closeForm();
  }
}


// ── DELETE ────────────────────────────────────────────────────────────────────
async function askDelete(id){
  const v=videos.find(x=>x.id===id);
  if(!currentUser){toast('Zaloguj się!');return;}
  if(!v||(currentUser.id!==v.user_id&&!isAdmin())){toast('Możesz usuwać tylko swoje filmy');return;}
  if(!await showConfirm('Usunąć ten film?','Tej czynności nie można cofnąć.'))return;
  if(isAdmin()&&currentUser.id!==v.user_id)logAdminAction('delete_video',`Przeniesiono do kosza: "${v.title}" (${v.user_email||v.user_id})`);
  await deleteVideo(id);
  toast('Film usunięty');
}


// ── EDYCJA FILMU ──────────────────────────────────────────────────────────────
function openEditModal(id){
  const v=videos.find(x=>x.id===id);if(!v)return;
  if(!currentUser||(currentUser.id!==v.user_id&&!isAdmin())){toast('Możesz edytować tylko swoje filmy!');return;}
  document.getElementById('edit-id').value=id;
  document.getElementById('edit-title').value=v.title||'';
  document.getElementById('edit-desc').value=v.description||'';
  document.getElementById('edit-thumb').value=v.thumb||'';
  document.getElementById('edit-dur').value=v.dur||'';
  document.getElementById('edit-cat').value=v.category||'';
  document.getElementById('edit-tags').value=(v.tags||[]).join(', ');
  document.getElementById('edit-comments').checked=v.comments_enabled!==false;
  document.getElementById('edit-likes').checked=v.likes_enabled!==false;
  document.getElementById('edit-modal').classList.add('open');
}

function closeEditModal(){document.getElementById('edit-modal').classList.remove('open');}

async function submitEdit(){
  const id=parseInt(document.getElementById('edit-id').value);
  const title=document.getElementById('edit-title').value.trim();
  if(!title){alert('Podaj tytuł!');return;}
  const updates={
    title,
    description:document.getElementById('edit-desc').value.trim(),
    thumb:document.getElementById('edit-thumb').value.trim(),
    dur:document.getElementById('edit-dur').value.trim(),
    category:document.getElementById('edit-cat').value,
    tags:document.getElementById('edit-tags').value.trim().split(',').map(t=>t.trim()).filter(Boolean),
    comments_enabled:document.getElementById('edit-comments').checked,
    likes_enabled:document.getElementById('edit-likes').checked,
  };
  const btn=document.querySelector('#edit-modal .fsubmit');
  btn.textContent='Zapisywanie...';btn.disabled=true;
  await updateVideo(id,updates);
  const v=videos.find(x=>x.id===id);
  if(v)Object.assign(v,updates);
  btn.textContent='Zapisz zmiany';btn.disabled=false;
  closeEditModal();
  render();
  toast('Film zaktualizowany! ✅');
}

