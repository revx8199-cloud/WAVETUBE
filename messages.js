// ============ messages.js — czat/wiadomości prywatne ============

// ── ZEZWALAJ NA WIADOMOŚCI ───────────────────────────────────────────────
async function loadAllowMsgIntoSettings(){
  const el=document.getElementById('allowmsg-toggle');
  if(!el||!currentUser)return;
  const{data}=await sb.from('profiles').select('allow_messages').eq('id',currentUser.id).single();
  el.classList.toggle('on',data?.allow_messages!==false);
}
async function toggleAllowMessages(){
  if(!currentUser)return;
  const el=document.getElementById('allowmsg-toggle');
  const{data}=await sb.from('profiles').select('allow_messages').eq('id',currentUser.id).single();
  const newVal=!(data?.allow_messages!==false);
  await sb.from('profiles').upsert([{id:currentUser.id,allow_messages:newVal}],{onConflict:'id'});
  if(el)el.classList.toggle('on',newVal);
}

function getNextVideoId(currentId){
  const pool=videos.filter(v=>v.is_short!==true&&isDiscoverable(v)&&(!v.premiere||new Date(v.premiere)<=new Date()));
  if(pool.length<2)return null;
  const sorted=[...pool].sort((a,b)=>new Date(b.created_at||0)-new Date(a.created_at||0));
  const idx=sorted.findIndex(v=>String(v.id)===String(currentId));
  if(idx===-1)return sorted[0].id;
  return sorted[(idx+1)%sorted.length].id;
}

let autoplayTimer=null,autoplayTicksLeft=0;
function cancelAutoplayCountdown(){
  if(autoplayTimer){clearInterval(autoplayTimer);autoplayTimer=null;}
  const ov=document.getElementById('autoplay-overlay');
  if(ov)ov.remove();
}

function triggerAutoplayNext(){
  if(!getAutoplayNext()||!cur)return;
  const nextId=getNextVideoId(cur.id);
  if(!nextId)return;
  const nextV=videos.find(v=>v.id===nextId);
  if(!nextV)return;
  showAutoplayOverlay(nextV);
}

function showAutoplayOverlay(nextV){
  cancelAutoplayCountdown();
  const pw=document.getElementById('pw');
  if(!pw)return;
  autoplayTicksLeft=5;
  const CIRC=150.8;
  const ov=document.createElement('div');
  ov.id='autoplay-overlay';
  ov.className='autoplay-overlay';
  ov.innerHTML=`
    <div style="font-size:13px;color:#aaa">${t('autoplay_next_video')}</div>
    <img src="${thumbFor(nextV)||''}" alt="">
    <div style="font-weight:600;max-width:80%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(nextV.title||'')}</div>
    <div class="autoplay-ring">
      <svg width="56" height="56"><circle class="bg" cx="28" cy="28" r="24"/><circle class="fg" id="autoplay-ring-fg" cx="28" cy="28" r="24" stroke-dashoffset="0"/></svg>
      <span id="autoplay-ring-num">5</span>
    </div>
    <div style="display:flex;gap:10px">
      <button onclick="cancelAutoplayCountdown()" style="background:rgba(255,255,255,.15);border:none;color:#fff;padding:8px 18px;border-radius:20px;cursor:pointer;font-size:13px">${t('btn_cancel')}</button>
      <button onclick="cancelAutoplayCountdown();openP(${JSON.stringify(nextV.id)})" style="background:#cc0000;border:none;color:#fff;padding:8px 18px;border-radius:20px;cursor:pointer;font-size:13px;font-weight:600">${t('autoplay_play_now')}</button>
    </div>`;
  pw.appendChild(ov);
  autoplayTimer=setInterval(()=>{
    autoplayTicksLeft--;
    const numEl=document.getElementById('autoplay-ring-num');
    const ringEl=document.getElementById('autoplay-ring-fg');
    if(numEl)numEl.textContent=autoplayTicksLeft;
    if(ringEl)ringEl.style.strokeDashoffset=(CIRC*(5-autoplayTicksLeft)/5);
    if(autoplayTicksLeft<=0){
      cancelAutoplayCountdown();
      openP(nextV.id);
    }
  },1000);
}

// Natywny <video> (mp4) - wykrywamy koniec wprost
// (podłączane w setupNativePlayer poniżej)

// YouTube - oficjalne IFrame API, żeby wykryć koniec filmu
let ytApiLoading=false;
function ensureYtApi(cb){
  if(window.YT&&window.YT.Player){cb();return;}
  window._ytApiCallbacks=window._ytApiCallbacks||[];
  window._ytApiCallbacks.push(cb);
  if(ytApiLoading)return;
  ytApiLoading=true;
  window.onYouTubeIframeAPIReady=function(){
    (window._ytApiCallbacks||[]).forEach(f=>f());
    window._ytApiCallbacks=[];
  };
  const tag=document.createElement('script');
  tag.src='https://www.youtube.com/iframe_api';
  document.head.appendChild(tag);
}
let ytPlayerInstance=null;
function setupYtAutoplayWatcher(v){
  if(!getAutoplayNext())return;
  ensureYtApi(()=>{
    const iframeEl=document.getElementById('yt-player-iframe');
    if(!iframeEl)return;
    try{
      ytPlayerInstance=new YT.Player('yt-player-iframe',{
        events:{onStateChange:e=>{if(e.data===YT.PlayerState.ENDED)triggerAutoplayNext();}}
      });
    }catch(err){}
  });
}

let lastBroadcastText='';
function syncBroadcastText(text,byName){
  const key=text+'|'+(byName||'');
  if(key===lastBroadcastText)return;
  lastBroadcastText=key;
  let bar=document.getElementById('broadcast-bar');
  if(!text){
    if(bar)bar.remove();
    return;
  }
  if(bar)bar.remove(); // usuń stary, zbuduj nowy - żeby animacja wejścia zagrała przy każdej zmianie tekstu
  bar=document.createElement('div');
  bar.id='broadcast-bar';
  bar.style.cssText='position:fixed;top:66px;left:50%;transform:translateX(-50%);z-index:9000;background:var(--bg-card);color:var(--text-primary);border:1px solid var(--border);border-left:4px solid #cc0000;border-radius:12px;padding:12px 16px;font-size:13px;display:flex;align-items:center;gap:12px;max-width:min(560px,90vw);box-shadow:0 4px 20px rgba(0,0,0,.35);animation:broadcastSlideIn .3s ease-out';
  bar.innerHTML=`<span style="font-size:20px;flex-shrink:0">📢</span>
    <span style="line-height:1.4"><b style="color:#cc0000">${esc(byName||'Admin')}</b>${verifiedBadge(ADMIN_EMAIL)}<span style="color:var(--text-tertiary)">:</span> ${esc(text)}</span>
    <button onclick="dismissBroadcastText()" style="background:var(--border-soft);border:none;color:var(--text-secondary);width:22px;height:22px;border-radius:50%;cursor:pointer;font-size:12px;line-height:1;flex-shrink:0;margin-left:4px">✕</button>`;
  document.body.appendChild(bar);
}

function dismissBroadcastText(){
  const bar=document.getElementById('broadcast-bar');
  if(bar)bar.remove();
}


// ── CHAT SYSTEM (Supabase) ────────────────────────────────────────────────────
let currentConvId=null;
let currentOtherUser=null;
let msgRealtimeChannel=null;
let notifRealtimeChannel=null;

// Realtime zamiast pollingu — jeden kanał na wiadomości, jeden na powiadomienia,
// nasłuchują tylko zdarzeń dotyczących zalogowanego użytkownika.
function subscribeRealtime(){
  unsubscribeRealtime();
  if(!currentUser)return;
  const uid=currentUser.id;
  msgRealtimeChannel=sb.channel('messages-'+uid)
    .on('postgres_changes',{event:'*',schema:'public',table:'messages',filter:`receiver_id=eq.${uid}`},handleMessageRealtimeEvent)
    .on('postgres_changes',{event:'*',schema:'public',table:'messages',filter:`sender_id=eq.${uid}`},handleMessageRealtimeEvent)
    .subscribe();
  notifRealtimeChannel=sb.channel('notifications-'+uid)
    .on('postgres_changes',{event:'*',schema:'public',table:'notifications',filter:`user_id=eq.${uid}`},handleNotificationRealtimeEvent)
    .subscribe();
}

function unsubscribeRealtime(){
  if(msgRealtimeChannel){sb.removeChannel(msgRealtimeChannel);msgRealtimeChannel=null;}
  if(notifRealtimeChannel){sb.removeChannel(notifRealtimeChannel);notifRealtimeChannel=null;}
}


function showMessages(){
  if(!currentUser){toast('Zaloguj się żeby korzystać z wiadomości!');return;}
  document.getElementById('messages-page').classList.add('open');
  document.body.style.overflow='hidden';
  loadBlockedUsers().then(loadConvList);
}

let blockedUsers={};

async function loadBlockedUsers(){
  if(!currentUser)return;
  const{data}=await sb.from('blocked_users').select('*').eq('blocker_id',currentUser.id);
  blockedUsers={};
  if(data)data.forEach(b=>{
    if(!b.expires_at||new Date(b.expires_at)>new Date())blockedUsers[b.blocked_id]=b.expires_at;
  });
}

function blockTimeLeft(expiresAt){
  if(!expiresAt)return'na zawsze';
  const ms=new Date(expiresAt)-new Date();
  if(ms<=0)return'';
  const h=Math.ceil(ms/3600000);
  if(h<24)return`jeszcze ${h} godz.`;
  const d=Math.ceil(h/24);
  return`jeszcze ${d} dni`;
}

function closeMessages(){
  document.getElementById('messages-page').classList.remove('open');
  document.body.style.overflow='';
  currentConvId=null;
  currentOtherUser=null;
  showHome();
}

async function loadConvList(){
  const list=document.getElementById('conv-list');
  list.innerHTML='<div style="padding:20px;text-align:center;color:#555;font-size:13px">⏳ Ładowanie...</div>';
  const{data}=await sb.from('messages').select('*')
    .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
    .order('created_at',{ascending:false});
  // Preload profiles for all conversation partners
  if(data){
    const otherIds=[...new Set(data.map(m=>m.sender_id===currentUser.id?m.receiver_id:m.sender_id))];
    await Promise.all(otherIds.map(id=>getProfile(id)));
  }
  if(!data||!data.length){
    list.innerHTML=`<div style="padding:20px;text-align:center;color:#555;font-size:13px">${t('msg_no_convs')}<br>${t('msg_no_convs_sub')}</div>`;
    return;
  }
  // Group by conv_id
  const convMap={};
  data.forEach(m=>{
    if(!convMap[m.conv_id])convMap[m.conv_id]={lastMsg:m,unread:0};
    if(m.receiver_id===currentUser.id&&!m.read)convMap[m.conv_id].unread++;
  });
  list.innerHTML=Object.values(convMap).map(c=>{
    const m=c.lastMsg;
    const otherId=m.sender_id===currentUser.id?m.receiver_id:m.sender_id;
    const theirVideo=videos.find(v=>v.user_id===otherId);
    // Get name/avatar from message data (sender_name/sender_avatar saved when sending)
    const otherIsReceiver=m.sender_id===currentUser.id;
    const nameFromMsg=otherIsReceiver?(m.receiver_name||''):(m.sender_name||'');
    const avatarFromMsg=otherIsReceiver?(m.receiver_avatar||''):(m.sender_avatar||'');
    const name=theirVideo?.user_name||theirVideo?.user_email?.split('@')[0]||nameFromMsg||'Użytkownik';
    const avatar=theirVideo?.user_avatar||avatarFromMsg||'';
    const email=theirVideo?.user_email||'';
    const time=new Date(m.created_at).toLocaleString('pl-PL',{hour:'2-digit',minute:'2-digit'});
    const isBlocked=!!blockedUsers[otherId];
    return`<div class="msg-conv-item${currentConvId===m.conv_id?' active':''}" onclick="openConv('${m.conv_id}','${otherId}','${jsesc(name)}','${avatar}','${email}')" style="${isBlocked?'opacity:.5':''}">
      ${avatar?`<img class="msg-conv-av" src="${avatar}" style="cursor:pointer" onclick="event.stopPropagation();closeMessages();showChannel('${otherId}','${jsesc(name)}','${avatar}','${email}')" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`:''}
      <div class="msg-conv-av-ph" style="background:#cc0000;cursor:pointer;${avatar?'display:none':''}" onclick="event.stopPropagation();closeMessages();showChannel('${otherId}','${jsesc(name)}','${avatar}','${email}')">${(name||'?')[0].toUpperCase()}</div>
      <div class="msg-conv-info">
        <div class="msg-conv-name" style="cursor:pointer" onclick="event.stopPropagation();closeMessages();showChannel('${otherId}','${jsesc(name)}','${avatar}','${email}')">${esc(name)}${verifiedBadge(email)}${isBlocked?' <span style="color:#cc0000;font-size:11px">🚫 zablokowany</span>':''}</div>
        <div class="msg-conv-last">${m.image_url?'📷 Zdjęcie':m.audio_url?'🎤 Wiadomość głosowa':m.text.substring(0,40)}</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">
        <div class="msg-conv-time">${time}</div>
        ${c.unread>0&&!isBlocked?`<div class="msg-unread"></div>`:''}
      </div>
    </div>`;
  }).join('');
}

async function openConv(convId,otherId,otherName,otherAvatar,otherEmail){
  currentConvId=convId;
  currentOtherUser={id:otherId,name:otherName,avatar:otherAvatar,email:otherEmail};
  // Mark as read
  await sb.from('messages').update({read:true}).eq('conv_id',convId).eq('receiver_id',currentUser.id);
  renderChatHeader();
  if(!blockedUsers[otherId]){
    await loadMessages();
  }
  loadConvList();
}

function renderChatHeader(){
  closeEmojiPicker();
  const area=document.getElementById('msg-chat-area');
  const o=currentOtherUser;
  const vid=videos.find(v=>v.user_id===o.id);
  const prof=profileCache[o.id];
  const name=prof?.name||vid?.user_name||vid?.user_email?.split('@')[0]||o.name||'Użytkownik';
  const avatar=prof?.avatar||vid?.user_avatar||o.avatar||'';
  const email=prof?.email||vid?.user_email||o.email||'';
  const isBlocked=!!blockedUsers[o.id];
  const expiresAt=blockedUsers[o.id];
  area.innerHTML=`
    <div class="msg-chat-header" style="position:relative">
      ${avatar?`<img class="msg-conv-av" src="${avatar}" style="width:36px;height:36px;cursor:pointer" onclick="closeMessages();showChannel('${o.id}','${jsesc(name)}','${avatar}','${email}')" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`:''}
      <div class="msg-conv-av-ph" style="background:#cc0000;width:36px;height:36px;font-size:14px;cursor:pointer;${avatar?'display:none':''}" onclick="closeMessages();showChannel('${o.id}','${jsesc(name)}','${avatar}','${email}')">${(name||'?')[0].toUpperCase()}</div>
      <div class="msg-chat-name" style="flex:1;cursor:pointer" onclick="closeMessages();showChannel('${o.id}','${jsesc(name)}','${avatar}','${email}')">${esc(name)}${verifiedBadge(email)}</div>
      <button onclick="startCall('${o.id}','${jsesc(name)}','${avatar}')" title="Zadzwoń" style="background:none;border:none;color:var(--text-secondary);cursor:pointer;font-size:19px;padding:6px 10px;border-radius:50%" onmouseover="this.style.background='var(--border-soft)'" onmouseout="this.style.background='none'">📞</button>
      <button onclick="toggleChatMenu()" style="background:none;border:none;color:var(--text-primary);cursor:pointer;font-size:20px;padding:4px 10px;border-radius:50%" onmouseover="this.style.background='var(--border-soft)'" onmouseout="this.style.background='none'">⋮</button>
      <div id="chat-menu" style="display:none;position:absolute;top:44px;right:0;background:var(--bg-panel);border:1px solid var(--border);border-radius:10px;min-width:210px;z-index:80;overflow:hidden">
        <div onclick="deleteConversation()" style="padding:12px 16px;cursor:pointer;font-size:13px;display:flex;align-items:center;gap:10px;color:#ff6b6b" onmouseover="this.style.background='var(--border)'" onmouseout="this.style.background='none'">🗑 Usuń czat</div>
        <div class="dropdown-divider"></div>
        ${isBlocked?
          `<div onclick="unblockUser()" style="padding:12px 16px;cursor:pointer;font-size:13px;display:flex;align-items:center;gap:10px" onmouseover="this.style.background='var(--border)'" onmouseout="this.style.background='none'">✅ Odblokuj użytkownika</div>`
          :`<div style="padding:10px 16px 4px;font-size:11px;color:var(--text-tertiary);text-transform:uppercase">Zablokuj na</div>
          <div onclick="blockUser(24)" style="padding:11px 16px;cursor:pointer;font-size:13px" onmouseover="this.style.background='var(--border)'" onmouseout="this.style.background='none'">24 godziny</div>
          <div onclick="blockUser(168)" style="padding:11px 16px;cursor:pointer;font-size:13px" onmouseover="this.style.background='var(--border)'" onmouseout="this.style.background='none'">7 dni</div>
          <div onclick="blockUser(720)" style="padding:11px 16px;cursor:pointer;font-size:13px" onmouseover="this.style.background='var(--border)'" onmouseout="this.style.background='none'">30 dni</div>
          <div onclick="blockUser(null)" style="padding:11px 16px;cursor:pointer;font-size:13px;color:#ff6b6b" onmouseover="this.style.background='var(--border)'" onmouseout="this.style.background='none'">Na zawsze</div>`
        }
      </div>
    </div>
    ${isBlocked?`<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;flex:1;padding:30px;text-align:center;color:var(--text-tertiary);gap:10px">
        <div style="font-size:32px">🚫</div>
        <div>Zablokowałeś tego użytkownika<br><span style="font-size:12px;color:var(--text-tertiary)">${blockTimeLeft(expiresAt)}</span></div>
        <button onclick="unblockUser()" style="margin-top:6px;background:var(--border-soft);border:none;color:var(--text-primary);padding:8px 18px;border-radius:20px;cursor:pointer;font-size:13px">Odblokuj</button>
      </div>`
      :`<div class="msg-chat-messages" id="msg-msgs-list"></div>
    <div class="msg-input-area" style="position:relative">
      <button onclick="toggleEmojiPicker('msg-inp',this)" style="background:none;border:none;color:var(--text-secondary);cursor:pointer;font-size:20px;padding:6px;flex-shrink:0" title="Emotki">😊</button>
      <button onclick="document.getElementById('chat-img-inp').click()" style="background:none;border:none;color:var(--text-secondary);cursor:pointer;font-size:20px;padding:6px;flex-shrink:0" title="Wyślij zdjęcie">📷</button>
      <input type="file" id="chat-img-inp" accept="image/*" style="display:none" onchange="sendChatImage(this.files[0]);this.value=''">
      <button id="chat-mic-btn" onclick="toggleVoiceRecording()" style="background:none;border:none;color:var(--text-secondary);cursor:pointer;font-size:20px;padding:6px;flex-shrink:0" title="Wiadomość głosowa">🎤</button>
      <span id="chat-rec-timer" style="display:none;color:#cc0000;font-size:12px;font-weight:600;align-self:center;flex-shrink:0">0:00</span>
      <textarea class="msg-input" id="msg-inp" placeholder="${t('msg_placeholder')}" rows="1" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendChatMsg();}"></textarea>
      <button class="msg-send-btn" onclick="sendChatMsg()">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="white"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
      </button>
    </div>`}`;
}

function toggleChatMenu(){
  const el=document.getElementById('chat-menu');
  if(!el)return;
  el.style.display=el.style.display==='none'||!el.style.display?'block':'none';
}

async function deleteConversation(){
  if(!currentConvId)return;
  if(!await showConfirm(t('confirm_delete_conv'),t('confirm_delete_conv_sub')))return;
  await sb.from('messages').delete().eq('conv_id',currentConvId);
  currentConvId=null;
  currentOtherUser=null;
  document.getElementById('msg-chat-area').innerHTML=`<div class="msg-no-conv">
    <svg viewBox="0 0 24 24" width="64" height="64" fill="#555"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>
    <p>${t('msg_pick_conv')}</p>
  </div>`;
  loadConvList();
  toast(t('toast_chat_deleted'));
}

async function blockUser(hours){
  if(!currentOtherUser||!currentUser)return;
  const expires_at=hours?new Date(Date.now()+hours*3600*1000).toISOString():null;
  await sb.from('blocked_users').delete().eq('blocker_id',currentUser.id).eq('blocked_id',currentOtherUser.id);
  await sb.from('blocked_users').insert([{blocker_id:currentUser.id,blocked_id:currentOtherUser.id,expires_at}]);
  await loadBlockedUsers();
  renderChatHeader();
  loadConvList();
  toast('Użytkownik zablokowany 🚫');
}

async function unblockUser(){
  if(!currentOtherUser||!currentUser)return;
  await sb.from('blocked_users').delete().eq('blocker_id',currentUser.id).eq('blocked_id',currentOtherUser.id);
  await loadBlockedUsers();
  renderChatHeader();
  await loadMessages();
  loadConvList();
  toast('Użytkownik odblokowany ✅');
}

async function loadMessages(){
  if(!currentConvId)return;
  const{data}=await sb.from('messages').select('*').eq('conv_id',currentConvId).order('created_at',{ascending:true});
  const list=document.getElementById('msg-msgs-list');
  if(!list)return;
  if(!data||!data.length){
    list.innerHTML='<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#555;font-size:13px">Brak wiadomości. Przywitaj się! 👋</div>';
    return;
  }
  const wasAtBottom=list.scrollHeight-list.scrollTop-list.clientHeight<60;
  list.innerHTML=data.map(m=>{
    const isSent=m.sender_id===currentUser.id;
    const time=new Date(m.created_at).toLocaleString('pl-PL',{hour:'2-digit',minute:'2-digit'});
    const imgHtml=m.image_url?`<img class="msg-bubble-img" src="${m.image_url}" onclick="openImgLightbox('${m.image_url}')">`:'';
    const audioHtml=m.audio_url?`<audio class="msg-bubble-audio" controls src="${m.audio_url}" style="max-width:240px;display:block"></audio>`:'';
    const txtHtml=m.text?`<div class="msg-bubble ${isSent?'sent':'received'}">${esc(m.text)}</div>`:'';
    return`<div class="msg-bubble-wrap ${isSent?'sent':'received'}">
      ${imgHtml}${audioHtml}${txtHtml}
      <div class="msg-bubble-time">${time}</div>
    </div>`;
  }).join('');
  if(wasAtBottom||data[data.length-1]?.sender_id===currentUser.id){
    setTimeout(()=>{list.scrollTop=list.scrollHeight;},50);
  }
}

async function sendChatMsg(){
  if(!currentUser||!currentConvId||!currentOtherUser)return;
  if(isMutedNow()){toast(muteToastMsg());return;}
  if(blockedUsers[currentOtherUser.id]){toast('Odblokuj użytkownika żeby wysłać wiadomość');return;}
  const inp=document.getElementById('msg-inp');
  const txt=inp?.value.trim();
  if(!txt)return;
  inp.value='';
  const meta=currentUser.user_metadata;
  const{error}=await sb.from('messages').insert([{
    conv_id:currentConvId,
    sender_id:currentUser.id,
    sender_name:getMyDisplayName(),
    sender_avatar:meta?.avatar_url||'',
    receiver_id:currentOtherUser.id,
    receiver_name:currentOtherUser.name||'',
    receiver_avatar:currentOtherUser.avatar||'',
    text:txt,
    read:false
  }]);
  if(error){
    inp.value=txt;
    toast(error.message.includes('RATE_LIMIT')?'Zwolnij trochę — wysyłasz za szybko 🐢':'Błąd: '+error.message);
    return;
  }
  await loadMessages();
  loadConvList();
}

function compressChatImage(file){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onload=e=>{
      const img=new Image();
      img.onload=()=>{
        const maxW=1280;
        const scale=Math.min(1,maxW/img.width);
        const canvas=document.createElement('canvas');
        canvas.width=img.width*scale;
        canvas.height=img.height*scale;
        canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);
        resolve(canvas.toDataURL('image/jpeg',0.7));
      };
      img.onerror=reject;
      img.src=e.target.result;
    };
    reader.onerror=reject;
    reader.readAsDataURL(file);
  });
}

async function sendChatImage(file){
  if(!file)return;
  if(!currentUser||!currentConvId||!currentOtherUser)return;
  if(isMutedNow()){toast(muteToastMsg());return;}
  if(blockedUsers[currentOtherUser.id]){toast('Odblokuj użytkownika żeby wysłać wiadomość');return;}
  if(file.size>20*1024*1024){toast('Zdjęcie za duże (max 20MB)');return;}
  const dataUrl=await readFileAsDataUrl(file);
  const meta=currentUser.user_metadata;
  const{error}=await sb.from('messages').insert([{
    conv_id:currentConvId,
    sender_id:currentUser.id,
    sender_name:getMyDisplayName(),
    sender_avatar:meta?.avatar_url||'',
    receiver_id:currentOtherUser.id,
    receiver_name:currentOtherUser.name||'',
    receiver_avatar:currentOtherUser.avatar||'',
    text:'',
    image_url:dataUrl,
    read:false
  }]);
  if(error){
    toast(error.message.includes('RATE_LIMIT')?'Zwolnij trochę — wysyłasz za szybko 🐢':'Błąd: '+error.message);
    return;
  }
  await loadMessages();
  loadConvList();
}

let voiceRecorder=null,voiceChunks=[],voiceStream=null,voiceTimerInt=null,voiceStartTs=0;
const VOICE_MAX_SECONDS=120;

async function toggleVoiceRecording(){
  if(!currentUser||!currentConvId||!currentOtherUser)return;
  if(voiceRecorder&&voiceRecorder.state==='recording'){stopVoiceRecording();return;}
  if(isMutedNow()){toast(muteToastMsg());return;}
  if(blockedUsers[currentOtherUser.id]){toast('Odblokuj użytkownika żeby wysłać wiadomość');return;}
  try{
    voiceStream=await navigator.mediaDevices.getUserMedia({audio:true});
  }catch(e){toast('Brak dostępu do mikrofonu');return;}
  const mime=MediaRecorder.isTypeSupported('audio/webm')?'audio/webm':(MediaRecorder.isTypeSupported('audio/mp4')?'audio/mp4':'');
  voiceRecorder=mime?new MediaRecorder(voiceStream,{mimeType:mime}):new MediaRecorder(voiceStream);
  voiceChunks=[];
  voiceRecorder.ondataavailable=e=>{if(e.data.size>0)voiceChunks.push(e.data);};
  voiceRecorder.onstop=onVoiceRecordingStop;
  voiceRecorder.start();
  voiceStartTs=Date.now();
  const btn=document.getElementById('chat-mic-btn');
  if(btn){btn.textContent='⏹';btn.style.color='#cc0000';}
  const timerEl=document.getElementById('chat-rec-timer');
  if(timerEl)timerEl.style.display='inline';
  voiceTimerInt=setInterval(()=>{
    const secs=Math.floor((Date.now()-voiceStartTs)/1000);
    if(timerEl)timerEl.textContent=`${Math.floor(secs/60)}:${String(secs%60).padStart(2,'0')}`;
    if(secs>=VOICE_MAX_SECONDS)stopVoiceRecording();
  },250);
}

function stopVoiceRecording(){
  if(voiceRecorder&&voiceRecorder.state==='recording')voiceRecorder.stop();
  if(voiceStream){voiceStream.getTracks().forEach(tr=>tr.stop());voiceStream=null;}
  clearInterval(voiceTimerInt);
  const btn=document.getElementById('chat-mic-btn');
  if(btn){btn.textContent='🎤';btn.style.color='';}
  const timerEl=document.getElementById('chat-rec-timer');
  if(timerEl){timerEl.style.display='none';timerEl.textContent='0:00';}
}

async function onVoiceRecordingStop(){
  if(!voiceChunks.length)return;
  const blob=new Blob(voiceChunks,{type:voiceRecorder.mimeType||'audio/webm'});
  voiceChunks=[];
  if(blob.size<500){toast('Nagranie za krótkie');return;}
  if(blob.size>20*1024*1024){toast('Nagranie za duże (max 20MB)');return;}
  const dataUrl=await new Promise((res,rej)=>{
    const reader=new FileReader();
    reader.onload=()=>res(reader.result);
    reader.onerror=rej;
    reader.readAsDataURL(blob);
  });
  const meta=currentUser.user_metadata;
  const{error}=await sb.from('messages').insert([{
    conv_id:currentConvId,
    sender_id:currentUser.id,
    sender_name:getMyDisplayName(),
    sender_avatar:meta?.avatar_url||'',
    receiver_id:currentOtherUser.id,
    receiver_name:currentOtherUser.name||'',
    receiver_avatar:currentOtherUser.avatar||'',
    text:'',
    audio_url:dataUrl,
    read:false
  }]);
  if(error){
    toast(error.message.includes('RATE_LIMIT')?'Zwolnij trochę — wysyłasz za szybko 🐢':'Błąd: '+error.message);
    return;
  }
  await loadMessages();
  loadConvList();
}

function showNewMsgForm(){
  toast('Wejdź na czyjś kanał i kliknij ✉️ Wiadomość żeby zacząć rozmowę!');
}

async function openMsg(name,email,userId){
  if(!currentUser){toast('Zaloguj się żeby wysyłać wiadomości!');return;}
  if(!userId){toast('Nie można znaleźć tego użytkownika');return;}
  if(userId!==currentUser.id){
    const{data:targetProf}=await sb.from('profiles').select('allow_messages').eq('id',userId).single();
    if(targetProf?.allow_messages===false){toast(t('toast_msg_disabled'));return;}
  }
  const convId=getConvId(currentUser.id,userId);
  const theirVideo=videos.find(v=>v.user_id===userId);
  const avatar=theirVideo?.user_avatar||'';
  const realName=theirVideo?.user_name||theirVideo?.user_email?.split('@')[0]||name||'Użytkownik';
  showMessages();
  openConv(convId,userId,realName,avatar,email);
}

async function sendMsg(){
  sendChatMsg();
}


// ── POŁĄCZENIA GŁOSOWE (WebRTC + Supabase Realtime jako sygnalizacja) ──────
const CALL_ICE_SERVERS=[{urls:'stun:stun.l.google.com:19302'},{urls:'stun:stun1.l.google.com:19302'}];
let callPC=null;
let callLocalStream=null;
let callSignalChannel=null;   // mój własny "numer" - nasłuch przychodzących połączeń
let callPeerChannel=null;     // kanał do wysyłania do drugiej strony podczas aktywnego połączenia
let callState='idle';         // idle | calling | ringing | active
let callOtherUser=null;       // {id,name,avatar}
let callIncomingOffer=null;
let callPendingCandidates=[];
let callStartTs=0;
let callTimerInt=null;
let callMuted=false;
let ringtoneInt=null,ringCtx=null;

function subscribeCallChannel(){
  if(!currentUser||callSignalChannel)return;
  callSignalChannel=sb.channel('call-'+currentUser.id,{config:{broadcast:{self:false}}});
  callSignalChannel.on('broadcast',{event:'signal'},({payload})=>handleCallSignal(payload));
  callSignalChannel.subscribe();
  if(window.Notification&&Notification.permission==='default'){
    Notification.requestPermission();
  }
}
function unsubscribeCallChannel(){
  if(callSignalChannel){sb.removeChannel(callSignalChannel);callSignalChannel=null;}
  endCallCleanup();
}

function createCallPC(){
  const pc=new RTCPeerConnection({iceServers:CALL_ICE_SERVERS});
  pc.onicecandidate=e=>{
    if(e.candidate&&callPeerChannel){
      callPeerChannel.send({type:'broadcast',event:'signal',payload:{type:'ice',candidate:e.candidate}});
    }
  };
  pc.ontrack=e=>{
    const el=document.getElementById('call-remote-audio');
    if(el)el.srcObject=e.streams[0];
  };
  pc.onconnectionstatechange=()=>{
    if(pc.connectionState==='connected'&&callState==='calling'){
      callState='active';callStartTs=Date.now();updateCallUI();startCallTimer();
    }
    if(['failed','disconnected','closed'].includes(pc.connectionState)&&callState!=='idle'){
      endCallCleanup();
    }
  };
  return pc;
}

async function startCall(otherId,otherName,otherAvatar){
  if(!currentUser)return;
  if(callState!=='idle'){toast(t('call_busy_self_toast'));return;}
  try{
    callLocalStream=await navigator.mediaDevices.getUserMedia({audio:true});
  }catch(e){toast(t('call_mic_denied_toast'));return;}
  callOtherUser={id:otherId,name:otherName,avatar:otherAvatar};
  callState='calling';
  showCallUI();
  callPC=createCallPC();
  callLocalStream.getTracks().forEach(tr=>callPC.addTrack(tr,callLocalStream));
  callPeerChannel=sb.channel('call-'+otherId,{config:{broadcast:{self:false}}});
  await callPeerChannel.subscribe();
  const offer=await callPC.createOffer();
  await callPC.setLocalDescription(offer);
  callPeerChannel.send({type:'broadcast',event:'signal',payload:{type:'offer',sdp:offer,from:currentUser.id,fromName:getMyDisplayName(),fromAvatar:currentUser.user_metadata?.avatar_url||''}});
}

async function handleCallSignal(payload){
  if(payload.type==='offer'){
    if(callState!=='idle'){
      sendQuickSignal(payload.from,{type:'busy'});
      return;
    }
    callOtherUser={id:payload.from,name:payload.fromName,avatar:payload.fromAvatar};
    callIncomingOffer=payload.sdp;
    callState='ringing';
    showCallUI();
    playRingtone();
    notifyIncomingCall(payload.fromName);
    startTitleFlash(`📞 ${payload.fromName} ${t('call_status_incoming')}`);
  } else if(payload.type==='answer'){
    if(callPC){
      await callPC.setRemoteDescription(new RTCSessionDescription(payload.sdp));
      await flushPendingCandidates();
    }
  } else if(payload.type==='ice'){
    if(callPC&&callPC.remoteDescription&&callPC.remoteDescription.type){
      try{await callPC.addIceCandidate(payload.candidate);}catch(e){}
    }else{
      callPendingCandidates.push(payload.candidate);
    }
  } else if(payload.type==='reject'){
    toast(t('call_rejected_toast'));
    endCallCleanup();
  } else if(payload.type==='busy'){
    toast(t('call_busy_toast'));
    endCallCleanup();
  } else if(payload.type==='end'){
    toast(t('call_ended_toast'));
    endCallCleanup();
  }
}

function sendQuickSignal(toUserId,payload){
  const tmp=sb.channel('call-'+toUserId,{config:{broadcast:{self:false}}});
  tmp.subscribe().then(()=>{
    tmp.send({type:'broadcast',event:'signal',payload:{...payload,from:currentUser.id}});
    setTimeout(()=>sb.removeChannel(tmp),1200);
  });
}

async function flushPendingCandidates(){
  for(const c of callPendingCandidates){
    try{await callPC.addIceCandidate(c);}catch(e){}
  }
  callPendingCandidates=[];
}

async function acceptCall(){
  if(callState!=='ringing'||!callOtherUser)return;
  stopRingtone();
  stopTitleFlash();
  try{
    callLocalStream=await navigator.mediaDevices.getUserMedia({audio:true});
  }catch(e){toast(t('call_mic_denied_toast'));rejectCall();return;}
  callPC=createCallPC();
  callLocalStream.getTracks().forEach(tr=>callPC.addTrack(tr,callLocalStream));
  await callPC.setRemoteDescription(new RTCSessionDescription(callIncomingOffer));
  await flushPendingCandidates();
  const answer=await callPC.createAnswer();
  await callPC.setLocalDescription(answer);
  callPeerChannel=sb.channel('call-'+callOtherUser.id,{config:{broadcast:{self:false}}});
  await callPeerChannel.subscribe();
  callPeerChannel.send({type:'broadcast',event:'signal',payload:{type:'answer',sdp:answer}});
  callState='active';
  callStartTs=Date.now();
  updateCallUI();
  startCallTimer();
}

function rejectCall(){
  if(callOtherUser)sendQuickSignal(callOtherUser.id,{type:'reject'});
  endCallCleanup();
}

function hangupCall(){
  if(callPeerChannel&&callOtherUser){
    callPeerChannel.send({type:'broadcast',event:'signal',payload:{type:'end'}});
  }
  endCallCleanup();
}

function toggleCallMute(){
  if(!callLocalStream)return;
  callMuted=!callMuted;
  callLocalStream.getAudioTracks().forEach(tr=>tr.enabled=!callMuted);
  updateCallUI();
}

function endCallCleanup(){
  stopRingtone();
  stopTitleFlash();
  clearInterval(callTimerInt);callTimerInt=null;
  if(callPC){callPC.close();callPC=null;}
  if(callLocalStream){callLocalStream.getTracks().forEach(tr=>tr.stop());callLocalStream=null;}
  if(callPeerChannel){sb.removeChannel(callPeerChannel);callPeerChannel=null;}
  callPendingCandidates=[];
  callIncomingOffer=null;
  callState='idle';
  callOtherUser=null;
  callMuted=false;
  hideCallUI();
}

function startCallTimer(){
  clearInterval(callTimerInt);
  callTimerInt=setInterval(()=>{
    const el=document.getElementById('call-status');
    if(!el)return;
    const s=Math.floor((Date.now()-callStartTs)/1000);
    el.textContent=`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
  },1000);
}

function playRingtone(){
  try{
    ringCtx=new(window.AudioContext||window.webkitAudioContext)();
    const beep=()=>{
      if(!ringCtx)return;
      const o=ringCtx.createOscillator(),g=ringCtx.createGain();
      o.frequency.value=880;o.connect(g);g.connect(ringCtx.destination);
      g.gain.setValueAtTime(.15,ringCtx.currentTime);
      o.start();o.stop(ringCtx.currentTime+.3);
    };
    beep();
    ringtoneInt=setInterval(beep,1500);
  }catch(e){}
}
function stopRingtone(){
  clearInterval(ringtoneInt);ringtoneInt=null;
  if(ringCtx){ringCtx.close();ringCtx=null;}
}

function callAvatarHtml(){
  const u=callOtherUser;
  if(!u)return'';
  return u.avatar?`<img src="${u.avatar}" style="width:100%;height:100%;object-fit:cover">`:esc((u.name||'?')[0].toUpperCase());
}

function callBtnHtml(bg,onclick,icon,label){
  return`<button onclick="${onclick}" title="${label}" style="width:54px;height:54px;border-radius:50%;background:${bg};border:none;color:#fff;font-size:22px;cursor:pointer;display:flex;align-items:center;justify-content:center">${icon}</button>`;
}

function updateCallUI(){
  const wrap=document.getElementById('call-avatar-wrap');
  const nameEl=document.getElementById('call-name');
  const statusEl=document.getElementById('call-status');
  const ctrlEl=document.getElementById('call-controls');
  if(!wrap||!callOtherUser)return;
  wrap.innerHTML=callAvatarHtml();
  nameEl.textContent=callOtherUser.name||'';
  if(callState==='calling'){
    statusEl.textContent=t('call_status_calling');
    ctrlEl.innerHTML=callBtnHtml('#cc0000','hangupCall()','📵',t('call_hangup'));
  }else if(callState==='ringing'){
    statusEl.textContent=t('call_status_incoming');
    ctrlEl.innerHTML=callBtnHtml('#cc0000','rejectCall()','📵',t('call_reject'))+callBtnHtml('#2ecc71','acceptCall()','📞',t('call_accept'));
  }else if(callState==='active'){
    statusEl.textContent='0:00';
    ctrlEl.innerHTML=callBtnHtml(callMuted?'#3ea6ff':'var(--border-soft)','toggleCallMute()',callMuted?'🔇':'🎤',t('call_mute'))+callBtnHtml('#cc0000','hangupCall()','📵',t('call_hangup'));
  }
}

function showCallUI(){
  updateCallUI();
  const el=document.getElementById('call-overlay');
  if(el)el.style.display='flex';
}
function hideCallUI(){
  const el=document.getElementById('call-overlay');
  if(el)el.style.display='none';
}

// ── POWIADOMIENIE O POŁĄCZENIU (widoczne nawet na innej karcie) ────────────
let titleFlashInt=null,originalTitle=null;

function notifyIncomingCall(fromName){
  if(!window.Notification||Notification.permission!=='granted')return;
  try{
    const n=new Notification(`📞 ${fromName}`,{
      body:t('call_status_incoming'),
      tag:'wavetube-call',
      requireInteraction:true
    });
    n.onclick=()=>{
      window.focus();
      n.close();
    };
  }catch(e){}
}

function startTitleFlash(text){
  if(titleFlashInt)return;
  originalTitle=document.title;
  let toggle=false;
  titleFlashInt=setInterval(()=>{
    document.title=toggle?text:originalTitle;
    toggle=!toggle;
  },1000);
}
function stopTitleFlash(){
  if(titleFlashInt){
    clearInterval(titleFlashInt);
    titleFlashInt=null;
    if(originalTitle)document.title=originalTitle;
    originalTitle=null;
  }
}
