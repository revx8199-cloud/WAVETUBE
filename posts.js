// ============ posts.js — posty, ankiety, lightbox zdjęć ============

// ── POSTY ─────────────────────────────────────────────────────────────────────
async function getPosts(userId,email){
  const{data}=await sb.from('posts').select('*').or(`user_id.eq.${userId||'null'},user_email.eq.${email||'null'}`).is('deleted_at',null).order('created_at',{ascending:false});
  return data||[];
}

let currentChannelUser={userId:'',email:'',name:''};
let currentTab='videos';

function switchChannelTab(tab){
  currentTab=tab;
  ['home','videos','shorts','posts'].forEach(t=>{
    const el=document.getElementById('tab-'+t);
    if(el)el.className='ch-tab'+(t===tab?' active':'');
  });
  document.getElementById('channel-home-container').style.display=tab==='home'?'block':'none';
  document.getElementById('channel-grid').style.display=tab==='videos'?'grid':'none';
  document.getElementById('channel-shorts-container').style.display=tab==='shorts'?'block':'none';
  document.getElementById('posts-container').style.display=tab==='posts'?'block':'none';
  if(tab==='home') renderChannelHome();
  if(tab==='posts') renderPosts();
  if(tab==='shorts') renderChannelShorts();
}

function renderChannelHome(){
  const{userId,email}=currentChannelUser;
  const userVideos=videos.filter(v=>(v.user_id===userId||(v.user_email===email&&email))&&v.is_short!==true&&isDiscoverable(v));
  const userShorts=videos.filter(v=>(v.user_id===userId||(v.user_email===email&&email))&&v.is_short===true&&isDiscoverable(v));
  const cont=document.getElementById('channel-home-container');
  let html='<div style="padding:0 24px">';
  if(userShorts.length){
    html+=`<div style="font-size:15px;font-weight:600;margin-bottom:12px;display:flex;align-items:center;gap:8px"><span style="background:#ff0000;color:var(--text-primary);font-size:10px;padding:2px 6px;border-radius:4px;font-weight:700">SHORT</span> ${t('tab_shorts')}</div>
    <div style="display:flex;gap:12px;overflow-x:auto;padding-bottom:16px;margin-bottom:20px">`;
    userShorts.forEach(v=>{
      const th=thumbFor(v);
      html+=`<div onclick="openP(${v.id})" style="flex-shrink:0;width:130px;cursor:pointer">
        <div style="position:relative;width:130px;height:231px;background:var(--bg-card);border-radius:10px;overflow:hidden">
          ${th?`<img src="${th}" style="width:100%;height:100%;object-fit:cover">`:'<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#333;font-size:28px">📱</div>'}
        </div>
        <div style="font-size:12px;font-weight:500;margin-top:6px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${esc(v.title)}</div>
      </div>`;
    });
    html+='</div>';
  }
  if(userVideos.length){
    html+=`<div style="font-size:15px;font-weight:600;margin-bottom:12px">${t('tab_videos')}</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px;margin-bottom:24px">`;
    userVideos.slice(0,6).forEach(v=>{
      const th=thumbFor(v);
      html+=`<div onclick="openP(${v.id})" style="cursor:pointer">
        <div style="position:relative;aspect-ratio:16/9;background:var(--bg-card);border-radius:8px;overflow:hidden">
          ${th?`<img src="${th}" style="width:100%;height:100%;object-fit:cover">`:'<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#333;font-size:32px">🎬</div>'}
          ${v.dur?`<div style="position:absolute;bottom:5px;right:7px;background:rgba(0,0,0,.85);font-size:11px;padding:2px 6px;border-radius:4px">${v.dur}</div>`:''}
        </div>
        <div style="font-size:13px;font-weight:500;margin-top:7px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${esc(v.title)}</div>
        <div style="font-size:12px;color:var(--text-secondary)">${viewsLabel(v)}</div>
      </div>`;
    });
    html+='</div>';
  }
  if(!userVideos.length&&!userShorts.length) html+=`<div style="color:#555;font-size:14px;padding:20px 0">${t('ch_no_videos')}</div>`;
  html+='</div>';
  cont.innerHTML=html;
}

function renderChannelShorts(){
  const{userId,email}=currentChannelUser;
  const userShorts=videos.filter(v=>(v.user_id===userId||(v.user_email===email&&email))&&v.is_short===true&&isDiscoverable(v));
  const cont=document.getElementById('channel-shorts-container');
  if(!userShorts.length){cont.innerHTML=`<div style="padding:0 24px;color:#555;font-size:14px">${t('ch_no_shorts')}</div>`;return;}
  let html='<div style="display:flex;flex-wrap:wrap;gap:12px;padding:0 24px">';
  userShorts.forEach(v=>{
    const th=thumbFor(v);
    html+=`<div onclick="openP(${v.id})" style="width:160px;cursor:pointer">
      <div style="position:relative;width:160px;height:284px;background:var(--bg-card);border-radius:12px;overflow:hidden">
        ${th?`<img src="${th}" style="width:100%;height:100%;object-fit:cover">`:'<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#333;font-size:36px">📱</div>'}
        <div style="position:absolute;top:8px;left:8px;background:#ff0000;color:var(--text-primary);font-size:10px;font-weight:700;padding:2px 6px;border-radius:4px">SHORT</div>
        <div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(0,0,0,.85));padding:16px 10px 8px;font-size:11px;color:rgba(255,255,255,.85)">${viewsLabel(v)} · ${v.likes||0} ${likeIcon()}</div>
      </div>
      <div style="font-size:12px;font-weight:500;margin-top:6px">${esc(v.title)}</div>
    </div>`;
  });
  html+='</div>';
  cont.innerHTML=html;
}

let currentPostsCache=[];
async function renderPosts(){
  closeEmojiPicker();
  const{userId,email,name}=currentChannelUser;
  const isOwner=currentUser&&(currentUser.id===userId||currentUser.id===email||(currentUser.email===email&&email));
  const pc=document.getElementById('posts-container');
  if(!pc)return;
  pc.innerHTML=`<div style="padding:20px;color:#555;font-size:14px">${t('posts_loading')}</div>`;
  const posts=await getPosts(userId,email);
  currentPostsCache=posts;
  let html='<div class="posts-grid">';
  if(isOwner){
    html+=`<button class="add-post-btn" onclick="openAddPost()">${t('posts_add_btn')}</button>`;
  }
  if(!posts.length){
    html+=`<div style="color:#555;font-size:14px;padding:20px 0">${t('posts_none')}</div>`;
  } else {
    posts.forEach((p,i)=>{
      const likedPosts=new Set(JSON.parse(localStorage.getItem('liked_posts')||'[]'));
      const isLiked=likedPosts.has(String(p.id));
      const uname=p.user_name||p.user||t('anonim');const avHtml=p.user_avatar?`<img class="post-av" src="${p.user_avatar}" style="${p.user_avatar_frame?`border:2px solid ${p.user_avatar_frame};box-sizing:border-box`:''}">`:`<div class="post-av-ph" style="background:${getUserColor(p.user_email)}">${uname[0]}</div>`;
      html+=`<div class="post-card" id="post-${p.id}">
        <div class="post-header">
          ${avHtml}
          <div>
            <div class="post-user" style="${p.user_color?`color:${p.user_color};`:''}${p.user_font?`font-family:${fontCssFor(p.user_font)};`:''}">${esc(uname)}${verifiedBadge(p.user_email||'')}</div>
            <div class="post-time">${p.created_at?new Date(p.created_at).toLocaleString('pl-PL',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}):p.time||''}</div>
          </div>
          ${isOwner?`<button onclick="deletePost(${p.id})" style="margin-left:auto;background:none;border:none;color:#555;cursor:pointer;font-size:16px" title="${t('post_delete_title')}">🗑</button>`:''}
        </div>
        ${p.text?`<div class="post-text">${esc(p.text)}</div>`:''}
        ${renderPostImages(p)}
        ${p.poll?renderPoll(p):''}
        <div class="post-actions">
          <button class="post-btn${isLiked?' liked':''}" onclick="likePost(${p.id})">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/></svg>
            ${p.likes||0}
          </button>
          <button class="post-btn" onclick="togglePostComments('${p.id}')">
            💬 ${(p.comments||[]).length}
          </button>
        </div>
        <div id="pc-${p.id}" style="display:none;margin-top:12px;border-top:1px solid var(--border-soft);padding-top:12px">
          ${(p.comments||[]).map((c,ci)=>{
            const replies=c.replies||[];
            return`
            <div style="display:flex;gap:8px;margin-bottom:10px">
              ${c.avatar?`<img src="${c.avatar}" style="width:28px;height:28px;border-radius:50%;object-fit:cover;flex-shrink:0${c.avatar_frame?`;border:2px solid ${c.avatar_frame};box-sizing:border-box`:''}">`:`<div style="width:28px;height:28px;border-radius:50%;background:${c.col||'#cc0000'};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0">${(c.user||'?')[0]}</div>`}
              <div style="flex:1">
                <div style="font-size:12px;font-weight:600;display:flex;align-items:center">${esc(c.user)}${verifiedBadge(c.email||'')} <span style="color:var(--text-tertiary);font-weight:400;margin-left:6px">${c.time||''}</span></div>
                <div style="font-size:13px;color:var(--text-secondary)">${esc(c.text)}</div>
                ${currentUser?`<button onclick="togglePostReplyForm('${p.id}',${ci})" style="background:none;border:none;color:var(--text-secondary);cursor:pointer;font-size:11px;font-weight:600;padding:3px 0;margin-top:2px">${t('reply_btn')||'Odpowiedz'}</button>`:''}
                <div id="preply-form-${p.id}-${ci}" style="display:none;margin-top:6px;gap:6px;align-items:center">
                  <input id="preply-inp-${p.id}-${ci}" placeholder="${t('post_comment_ph')}" style="width:100%;background:transparent;border:none;border-bottom:1px solid #444;color:var(--text-primary);padding:5px 0;font-size:12px;outline:none">
                  <div style="display:flex;gap:6px;margin-top:4px">
                    <button onclick="togglePostReplyForm('${p.id}',${ci})" style="background:none;border:none;color:var(--text-secondary);padding:4px 10px;border-radius:16px;cursor:pointer;font-size:11px">Anuluj</button>
                    <button onclick="postPostReply('${p.id}',${ci})" style="background:#3ea6ff;border:none;color:#0f0f0f;padding:4px 12px;border-radius:16px;cursor:pointer;font-size:11px;font-weight:700">${t('btn_send')}</button>
                  </div>
                </div>
                ${replies.length?`<button onclick="togglePostReplies('${p.id}',${ci})" style="background:none;border:none;color:#3ea6ff;cursor:pointer;font-size:11px;font-weight:600;padding:4px 0;margin-top:4px;display:block">${replies.length} ${replies.length===1?'odpowiedź':'odpowiedzi'}</button>
                <div id="preplies-${p.id}-${ci}" style="display:none;margin-top:6px;padding-left:8px;border-left:2px solid var(--border-soft)">
                  ${replies.map((r,ri)=>`<div style="display:flex;gap:6px;margin-bottom:8px">
                    ${r.avatar?`<img src="${r.avatar}" style="width:22px;height:22px;border-radius:50%;object-fit:cover;flex-shrink:0">`:`<div style="width:22px;height:22px;border-radius:50%;background:#cc0000;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;flex-shrink:0">${(r.user||'?')[0]}</div>`}
                    <div><div style="font-size:11px;font-weight:600">${esc(r.user)}${verifiedBadge(r.email||'')}</div><div style="font-size:12px;color:var(--text-secondary)">${esc(r.text)}</div></div>
                  </div>`).join('')}
                </div>`:''}
              </div>
            </div>`;
          }).join('')}
          ${currentUser?`<div style="display:flex;gap:8px;margin-top:8px;align-items:center">
            ${currentUser.user_metadata?.avatar_url?`<img src="${currentUser.user_metadata.avatar_url}" style="width:28px;height:28px;border-radius:50%;object-fit:cover;flex-shrink:0">`:`<div style="width:28px;height:28px;border-radius:50%;background:#cc0000;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0">${(currentUser.user_metadata?.full_name||currentUser.email||'?')[0].toUpperCase()}</div>`}
            <input id="pci-${p.id}" placeholder="${t('post_comment_ph')}" style="flex:1;background:transparent;border:none;border-bottom:1px solid #444;color:var(--text-primary);padding:5px 0;font-size:13px;outline:none">
            <button onclick="toggleEmojiPicker('pci-${p.id}',this)" style="background:none;border:none;color:var(--text-secondary);cursor:pointer;font-size:16px" title="Emotki">😊</button>
            <button onclick="addPostComment(${p.id})" style="background:#cc0000;border:none;color:var(--text-primary);padding:5px 12px;border-radius:16px;cursor:pointer;font-size:12px">${t('btn_send')}</button>
          </div>`:`<div style="font-size:12px;color:#555">${t('post_login_comment')}</div>`}
        </div>
      </div>`;
    });
  }
  html+='</div>';
  pc.innerHTML=html;
}

function renderPostImages(p){
  const imgs=(p.images&&p.images.length?p.images:(p.image?[p.image]:[]));
  if(!imgs.length)return'';
  if(imgs.length===1)return`<div class="post-img-grid n1"><div class="pig-item" onclick="openPostLightbox('${p.id}',0)"><img src="${imgs[0]}" alt="post"></div></div>`;
  const cls=imgs.length===2?'n2':imgs.length===3?'n3':'n4plus';
  const shown=imgs.slice(0,4);
  return`<div class="post-img-grid ${cls}">${shown.map((src,i)=>{
    const isLastWithMore=cls==='n4plus'&&i===3&&imgs.length>4;
    return`<div class="pig-item" onclick="openPostLightbox('${p.id}',${i})">
      <img src="${src}" alt="post">
      ${isLastWithMore?`<div class="pig-more">+${imgs.length-4}</div>`:''}
    </div>`;
  }).join('')}</div>`;
}

let lightboxImgs=[],lightboxIdx=0;
function openPostLightbox(postId,idx){
  const post=(currentPostsCache||[]).find(p=>String(p.id)===String(postId));
  const imgs=post?(post.images&&post.images.length?post.images:(post.image?[post.image]:[])):[];
  if(!imgs.length)return;
  lightboxImgs=imgs;lightboxIdx=idx;
  renderLightbox();
  document.getElementById('post-img-lightbox').classList.add('open');
}
function renderLightbox(){
  document.getElementById('plb-img').src=lightboxImgs[lightboxIdx];
  document.getElementById('plb-count').textContent=lightboxImgs.length>1?`${lightboxIdx+1} / ${lightboxImgs.length}`:'';
  const multi=lightboxImgs.length>1;
  document.getElementById('plb-prev').style.display=multi?'flex':'none';
  document.getElementById('plb-next').style.display=multi?'flex':'none';
}
function lightboxNav(dir){
  lightboxIdx=(lightboxIdx+dir+lightboxImgs.length)%lightboxImgs.length;
  renderLightbox();
}
function closeLightbox(){
  document.getElementById('post-img-lightbox').classList.remove('open');
}
function openImgLightbox(url){
  lightboxImgs=[url];lightboxIdx=0;
  renderLightbox();
  document.getElementById('post-img-lightbox').classList.add('open');
}

function renderPoll(p){
  const poll=p.poll;
  if(!poll)return'';
  const totalVotes=poll.options.reduce((s,o)=>s+(o.votes||0),0);
  const myVote=currentUser?poll.voters?.[currentUser.id]:undefined;
  const hasVoted=myVote!==undefined;
  return`<div style="margin-top:10px;background:var(--bg-sunken);border:1px solid var(--border-soft);border-radius:10px;padding:14px">
    <div style="font-size:14px;font-weight:600;margin-bottom:12px">📊 ${esc(poll.question)}</div>
    ${poll.options.map((o,oi)=>{
      const pct=totalVotes?Math.round((o.votes||0)/totalVotes*100):0;
      const isMine=hasVoted&&myVote===oi;
      return`<div onclick="votePoll('${p.id}',${oi})" style="position:relative;margin-bottom:8px;cursor:pointer;border-radius:8px;overflow:hidden;background:var(--bg-sunken);border:1px solid ${isMine?'#3ea6ff':'var(--border)'}">
        ${hasVoted?`<div style="position:absolute;inset:0;width:${pct}%;background:${isMine?'rgba(62,166,255,.25)':'rgba(255,255,255,.08)'};transition:width .3s"></div>`:''}
        <div style="position:relative;display:flex;justify-content:space-between;align-items:center;padding:9px 12px;font-size:13px">
          <span style="display:flex;align-items:center;gap:6px">${isMine?'✓ ':''}${esc(o.text)}</span>
          ${hasVoted?`<span style="color:var(--text-secondary);font-size:12px">${pct}% (${o.votes||0})</span>`:''}
        </div>
      </div>`;
    }).join('')}
    <div style="font-size:11px;color:var(--text-tertiary);margin-top:4px">${totalVotes} ${totalVotes===1?t('vote_singular'):t('vote_plural')}${!currentUser?' · '+t('post_login_vote'):''}</div>
  </div>`;
}

async function votePoll(postId,optionIndex){
  if(!currentUser){toast(t('post_login_vote_toast'));return;}
  await sb.rpc('vote_post_poll',{p_id:postId,p_option:optionIndex});
  await renderPosts();
}

function togglePostComments(id){
  const el=document.getElementById('pc-'+id);
  if(el)el.style.display=el.style.display==='none'?'block':'none';
}

function togglePostReplyForm(postId,ci){
  const form=document.getElementById(`preply-form-${postId}-${ci}`);
  if(!form)return;
  const isHidden=form.style.display==='none';
  form.style.display=isHidden?'block':'none';
  if(isHidden)setTimeout(()=>{const inp=document.getElementById(`preply-inp-${postId}-${ci}`);if(inp)inp.focus();},50);
}

function togglePostReplies(postId,ci){
  const el=document.getElementById(`preplies-${postId}-${ci}`);
  if(el)el.style.display=el.style.display==='none'?'block':'none';
}

async function postPostReply(postId,ci){
  if(!currentUser){toast(t('toast_login_generic'));return;}
  if(isMutedNow()){toast(muteToastMsg());return;}
  if(!commentCooldownOk())return;
  const inp=document.getElementById(`preply-inp-${postId}-${ci}`);
  if(!inp||!inp.value.trim())return;
  const meta=currentUser.user_metadata;
  const now=new Date().toLocaleString('pl-PL',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
  const r={user:getMyDisplayName(),text:inp.value.trim(),time:now,ts:Date.now(),avatar:meta?.avatar_url||'',email:currentUser.email||'',user_id:currentUser.id};
  inp.value='';
  await sb.rpc('add_post_comment_reply',{p_id:postId,c_index:ci,r});
  await renderPosts();
  const el=document.getElementById('pc-'+postId);if(el)el.style.display='block';
  const rp=document.getElementById(`preplies-${postId}-${ci}`);if(rp)rp.style.display='block';
}

async function likePost(postId){
  const likedPosts=new Set(JSON.parse(localStorage.getItem('liked_posts')||'[]'));
  const delta=likedPosts.has(String(postId))?-1:1;
  if(delta<0)likedPosts.delete(String(postId));else likedPosts.add(String(postId));
  localStorage.setItem('liked_posts',JSON.stringify([...likedPosts]));
  await sb.rpc('toggle_post_like',{p_id:postId,p_delta:delta});
  renderPosts();
}

async function addPostComment(postId){
  if(!currentUser){toast(t('toast_login_generic'));return;}
  if(isMutedNow()){toast(muteToastMsg());return;}
  const inp=document.getElementById('pci-'+postId);
  if(!inp||!inp.value.trim())return;
  if(!commentCooldownOk())return;
  const meta=currentUser.user_metadata;
  const now=new Date().toLocaleString('pl-PL',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
  const c={user:getMyDisplayName(),text:inp.value.trim(),time:now,ts:Date.now(),col:'#cc0000',avatar:meta?.avatar_url||'',email:currentUser.email||'',user_id:currentUser.id,name_color:myNameColor||'',name_font:myNameFont||'',avatar_frame:myAvatarFrame||''};
  await sb.rpc('add_post_comment',{p_id:postId,c});
  renderPosts();
}

async function deletePost(postId){
  if(!await showConfirm(t('confirm_delete_post'),t('confirm_irreversible')))return;
  const p=currentPostsCache.find(x=>x.id===postId);
  await sb.from('posts').update({deleted_at:new Date().toISOString(),deleted_by:currentUser?.id||null}).eq('id',postId);
  renderPosts();
  if(p)logAdminAction('delete_post',`Przeniesiono post do kosza (${p.user_email||p.user_id})`);
}

let postImgFiles=[];

function previewPostImg(input){
  const files=[...input.files].slice(0,6);
  if(input.files.length>6)toast(t('toast_max_images'));
  postImgFiles=files;
  renderPostImgPreview();
}

function renderPostImgPreview(){
  const wrap=document.getElementById('post-img-preview');
  if(!postImgFiles.length){wrap.style.display='none';wrap.innerHTML='';return;}
  wrap.style.display='grid';
  wrap.innerHTML=postImgFiles.map((f,i)=>{
    const url=URL.createObjectURL(f);
    return`<div style="position:relative">
      <img src="${url}" style="width:100%;height:90px;object-fit:cover;border-radius:8px;display:block">
      <button onclick="removePostImgAt(${i})" style="position:absolute;top:4px;right:4px;background:rgba(0,0,0,.7);border:none;color:var(--text-primary);border-radius:50%;width:22px;height:22px;cursor:pointer;font-size:13px;display:flex;align-items:center;justify-content:center">✕</button>
    </div>`;
  }).join('');
}

function removePostImgAt(i){
  postImgFiles.splice(i,1);
  renderPostImgPreview();
}

function removePostImg(){
  postImgFiles=[];
  document.getElementById('post-img-inp').value='';
  const wrap=document.getElementById('post-img-preview');
  wrap.style.display='none';
  wrap.innerHTML='';
}

function togglePollFields(){
  const on=document.getElementById('poll-toggle').checked;
  document.getElementById('poll-fields').style.display=on?'block':'none';
  const list=document.getElementById('poll-options-list');
  if(on&&!list.children.length){
    addPollOption();addPollOption();
  }
}

function addPollOption(){
  const list=document.getElementById('poll-options-list');
  if(list.children.length>=4){toast(t('post_poll_max_options'));return;}
  const idx=list.children.length;
  const row=document.createElement('div');
  row.style.cssText='display:flex;gap:6px;margin-bottom:8px;align-items:center';
  row.innerHTML=`<input class="poll-opt-inp" placeholder="${t('post_poll_option_ph')} ${idx+1}" style="flex:1;background:var(--bg-sunken);border:1px solid var(--border);border-radius:8px;color:var(--text-primary);padding:8px 12px;font-size:13px;outline:none">
    <button type="button" onclick="this.parentElement.remove()" style="background:none;border:none;color:var(--text-tertiary);cursor:pointer;font-size:16px">✕</button>`;
  list.appendChild(row);
  if(list.children.length>=4)document.getElementById('poll-add-btn').style.display='none';
}

function resetPollForm(){
  document.getElementById('poll-toggle').checked=false;
  document.getElementById('poll-fields').style.display='none';
  document.getElementById('poll-question').value='';
  document.getElementById('poll-options-list').innerHTML='';
  document.getElementById('poll-add-btn').style.display='block';
}

function openAddPost(){
  if(!currentUser){toast(t('toast_login_generic'));return;}
  document.getElementById('add-post-modal').classList.add('open');
}

let isSubmittingPost=false;

function readFileAsDataUrl(file){
  return new Promise((resolve,reject)=>{
    const r=new FileReader();
    r.onload=e=>resolve(e.target.result);
    r.onerror=reject;
    r.readAsDataURL(file);
  });
}

async function submitPost(){
  if(isSubmittingPost)return;
  if(isMutedNow()){toast(muteToastMsg());return;}
  const text=document.getElementById('post-text-inp').value.trim();
  const pollOn=document.getElementById('poll-toggle').checked;
  let poll=null;
  if(pollOn){
    const question=document.getElementById('poll-question').value.trim();
    const opts=[...document.querySelectorAll('.poll-opt-inp')].map(i=>i.value.trim()).filter(Boolean);
    if(!question){toast(t('post_poll_question_missing'));return;}
    if(opts.length<2){toast(t('post_poll_min_options'));return;}
    poll={question,options:opts.map(text=>({text,votes:0})),voters:{}};
  }
  if(!text&&!postImgFiles.length&&!poll){toast(t('post_empty_error'));return;}
  isSubmittingPost=true;
  const btn=document.getElementById('post-submit-btn');
  const originalLabel=btn.textContent;
  btn.disabled=true;
  btn.style.opacity='.6';
  btn.style.cursor='not-allowed';
  btn.textContent=t('post_publishing');
  const meta=currentUser.user_metadata;
  try{
    let images=[];
    if(postImgFiles.length){
      images=await Promise.all(postImgFiles.map(readFileAsDataUrl));
    }
    const{error}=await sb.from('posts').insert([{
      user_id:currentUser.id,
      user_email:currentUser.email,
      user_name:getMyDisplayName(),
      user_avatar:meta?.avatar_url||'',
      user_color:myNameColor||'',
      user_font:myNameFont||'',
      user_avatar_frame:myAvatarFrame||'',
      text,image:images[0]||'',images:images,likes:0,comments:[],poll:poll
    }]);
    if(error){
      toast(error.message.includes('RATE_LIMIT')?t('post_rate_limit'):'Błąd: '+error.message);
      return;
    }
    // notify subscribers
    const{data:subs}=await sb.from('subscriptions').select('subscriber_id').eq('channel_id',currentUser.id);
    if(subs&&subs.length){
      const notifs=subs.map(s=>({user_id:s.subscriber_id,message:`<b>${esc(getMyDisplayName())}</b> ${t('post_new_notification')}`,avatar:meta?.avatar_url||'',sender_id:currentUser.id}));
      await sb.from('notifications').insert(notifs);
    }
    document.getElementById('post-text-inp').value='';
    removePostImg();
    resetPollForm();
    document.getElementById('add-post-modal').classList.remove('open');
    renderPosts();
    toast(t('post_published_toast'));
  }finally{
    isSubmittingPost=false;
    btn.disabled=false;
    btn.style.opacity='1';
    btn.style.cursor='pointer';
    btn.textContent=originalLabel;
  }
}

document.getElementById('pm').addEventListener('click',function(e){if(e.target===this)closeP();});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){closeP();closeForm();closeEditModal();closeMessages();document.getElementById('add-post-modal').classList.remove('open');closeLightbox();closeStatsPanel();}
  if(document.getElementById('post-img-lightbox').classList.contains('open')){
    if(e.key==='ArrowLeft')lightboxNav(-1);
    if(e.key==='ArrowRight')lightboxNav(1);
  }
  // ── skróty klawiszowe playera (jak na YouTube) — tylko gdy player otwarty i nie piszemy w polu ──
  const pmOpen=document.getElementById('pm').classList.contains('open');
  const typing=['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)||document.activeElement?.isContentEditable;
  if(pmOpen&&!typing){
    const vid=document.querySelector('#pw video');
    if(e.key===' '||e.key==='k'||e.key==='K'){
      if(vid){e.preventDefault();vid.paused?vid.play():vid.pause();}
    } else if(e.key==='ArrowLeft'){
      if(vid){e.preventDefault();vid.currentTime=Math.max(0,vid.currentTime-5);}
    } else if(e.key==='ArrowRight'){
      if(vid){e.preventDefault();vid.currentTime=Math.min(vid.duration||Infinity,vid.currentTime+5);}
    } else if(e.key==='ArrowUp'){
      if(vid){e.preventDefault();vid.volume=Math.min(1,vid.volume+0.05);}
    } else if(e.key==='ArrowDown'){
      if(vid){e.preventDefault();vid.volume=Math.max(0,vid.volume-0.05);}
    } else if(e.key==='m'||e.key==='M'){
      if(vid)vid.muted=!vid.muted;
    } else if(e.key==='f'||e.key==='F'){
      const wrap=document.getElementById('pw');
      if(wrap){
        if(document.fullscreenElement)document.exitFullscreen();
        else wrap.requestFullscreen?.();
      }
    }
  }
});

(async()=>{
  const isBot=await checkBotGuard();
  if(isBot)return;
  const{data:{session}}=await sb.auth.getSession();
  if(session)currentUser=session.user;
  updateAuthUI();
  applyTranslations();
  checkNewAnnouncements();
  checkDiscoState();
  setInterval(checkDiscoState,4000);
  loadVipEmails();
  loadAdminEmail().then(loadAdminBadgeColor);
  if(currentUser){
    const banned=await checkIfBanned();
    if(!banned){
      await saveProfile(currentUser);
      await loadSubscriptions();
      await loadNotifications();
      await loadMyNameColor();
      await checkIfMuted();
      await loadSavedVideos();
      await loadWatchLater();
      subscribeRealtime();
      subscribePresence();
      subscribeCallChannel();
      startHeartbeat();
      checkIncomingCallFromUrl();
    }
  }
  await loadVideos();
  sb.auth.onAuthStateChange(async(_,session)=>{
    currentUser=session?.user||null;
    updateAuthUI();
    if(currentUser){
      const banned=await checkIfBanned();
      if(!banned){
        await saveProfile(currentUser);
        await loadSubscriptions();
        await loadNotifications();
        await loadMyNameColor();
      await checkIfMuted();
      await loadSavedVideos();
      await loadWatchLater();
      await loadVipEmails();
      subscribeRealtime();
      subscribePresence();
      subscribeCallChannel();
      startHeartbeat();
      }
    }else{
      unsubscribeRealtime();
      unsubscribePresence();
      unsubscribeCallChannel();
      stopHeartbeat();
    }
  });
})();
