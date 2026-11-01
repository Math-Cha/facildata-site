
(function(){
 const L=window.FD_CHAT;if(!L)return;const EP=window.FD_CHAT_ENDPOINT||'';const R=L.rdvFlow;
 const spark='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 17l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/></svg>';
 const btn=document.createElement('button');btn.id='fd-chat-btn';btn.setAttribute('aria-label',L.cta);btn.innerHTML='<span class="av">'+spark+'</span><span class="lbl">'+L.cta+'</span>';document.body.appendChild(btn);
 const box=document.createElement('div');box.id='fd-chat';box.setAttribute('role','dialog');
 box.innerHTML='<div class="top"><span class="av">'+spark+'</span><div><b>'+L.title+'</b><span>'+L.sub+'</span></div><button aria-label="close">×</button></div><div class="msgs" aria-live="polite"></div><form class="in"><input placeholder="'+L.placeholder+'" autocomplete="off"><button type="submit" aria-label="'+L.send+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button></form>';
 document.body.appendChild(box);
 const msgs=box.querySelector('.msgs'),form=box.querySelector('form.in'),inp=form.querySelector('input');
 const esc=t=>String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;');
 const hist=[];let opened=false,n=0,flow=null;
 function scroll(){msgs.scrollTop=msgs.scrollHeight}
 function add(t,who){const d=document.createElement('div');d.className='bubble '+who;d.innerHTML=esc(t).replace(/\n/g,'<br>');msgs.appendChild(d);scroll();return d}
 function typing(){const d=document.createElement('div');d.className='bubble ai typing';d.innerHTML='<span></span><span></span><span></span>';msgs.appendChild(d);scroll();return d}
 const wait=ms=>new Promise(r=>setTimeout(r,ms));
 async function say(t){const ty=typing();await wait(450+Math.min(900,t.length*6));ty.remove();return add(t,'ai')}
 function chips(opts,cb){const w=document.createElement('div');w.className='chips-q';opts.forEach(([k,l])=>{const c=document.createElement('button');c.type='button';c.textContent=l;c.onclick=()=>{w.remove();cb(k,l)};w.appendChild(c)});msgs.appendChild(w);scroll();return w}
 function cta(label,onclick){const a=document.createElement('button');a.type='button';a.className='rdv';a.innerHTML=label+' →';a.onclick=onclick;const d=document.createElement('div');d.className='bubble ai';d.appendChild(a);msgs.appendChild(d);scroll()}
 function open(){box.classList.add('open');document.body.classList.add('chat-open');if(!opened){opened=true;add(L.hello,'ai');cta(L.rdv,startRdv)}setTimeout(()=>inp.focus(),50)}
 function close(){box.classList.remove('open');document.body.classList.remove('chat-open')}
 btn.addEventListener('click',()=>box.classList.contains('open')?close():open());
 box.querySelector('.top button').addEventListener('click',close);
 document.querySelectorAll('[data-chat]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();open()}));
 document.querySelectorAll('[data-rdv]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();if(!opened){opened=true;box.classList.add('open');document.body.classList.add('chat-open')}else open();startRdv()}));
 // ---------- qualification
 async function startRdv(){if(flow&&!flow.done)return;flow={i:0,a:{},done:false};box.querySelectorAll('.chips-q').forEach(x=>x.remove());await say(R.intro);ask()}
 async function ask(){const st=R.steps[flow.i];await say(st.q);flow.chips=chips(st.opts,(k,l)=>answer(k,l))}
 function match(text){const st=R.steps[flow.i];const t=text.toLowerCase();let best=null;for(const [k,l] of st.opts){const words=l.toLowerCase().split(/[\s,/()…]+/).filter(w=>w.length>3);if(words.some(w=>t.includes(w))){best=[k,l];break}}return best}
 async function answer(k,l,shown){add(shown||l,'me');flow.a[R.steps[flow.i].key]=[k,l];flow.i++;
  const a=flow.a;
  if((a.role&&a.role[0]==='autre')||(a.secteur&&a.secteur[0]==='aucun')){flow.done=true;await say(R.no);send('Hors cible');return}
  if(flow.i<R.steps.length)return ask();
  flow.done=true;
  if(a.horizon[0]==='info'&&a.taille[0]==='s'){await say(R.nurture);leadForm(true);return}
  await say(R.ok);leadForm(false)}
 function score(){const a=flow.a,v={dir:3,resp:3,expl:2,gest:2,presta:2,s:1,m:2,l:3,xl:3,now:3,mid:2,info:1};return Math.min(10,(v[a.role[0]]||0)+(v[a.taille[0]]||0)+(v[a.horizon[0]]||0)+1)}
 function leadForm(light){const F=R.form;const f=document.createElement('form');f.className='lead';
  f.innerHTML=(light?'':'<input name="nom" required placeholder="'+F.name+'"><input name="organisation" required placeholder="'+F.org+'">')+'<input name="email" type="email" required placeholder="'+F.email+'">'+(light?'':'<input name="telephone" type="tel" placeholder="'+F.phone+'">')+'<button type="submit">'+F.send+'</button>';
  const d=document.createElement('div');d.className='bubble ai formb';d.appendChild(f);msgs.appendChild(d);scroll();f.querySelector('input').focus();
  f.addEventListener('submit',async e=>{e.preventDefault();const data=Object.fromEntries(new FormData(f));f.querySelectorAll('input,button').forEach(x=>x.disabled=true);
   const ok=await send(light?'A recontacter (en réflexion)':'RDV qualifié',data);
   if(!ok){await say(R.err);return}
   if(light){await say(R.nurture_sent);return}
   await say(R.booked);
   const nm=(data.nom||'').trim().split(/\s+/);const url=L.bookUrl+(L.bookUrl.includes('?')?'&':'?')+'email='+encodeURIComponent(data.email||'')+'&firstName='+encodeURIComponent(nm[0]||'')+'&lastName='+encodeURIComponent(nm.slice(1).join(' '))+'&company='+encodeURIComponent(data.organisation||'');
   const fr=document.createElement('div');fr.className='bubble ai cal';fr.innerHTML='<iframe title="agenda" loading="lazy" src="'+url+'&embed=true"></iframe><a href="'+url+'" target="_blank" rel="noopener">'+R.slot+' ↗</a>';msgs.appendChild(fr);scroll();box.classList.add('wide')})}
 async function send(statut,data){const a=flow?flow.a:{};const body={_subject:'[Facilia] '+statut+' — '+(data&&data.organisation||'site facildata.com'),_template:'table',statut,score:flow&&flow.a.horizon?score()+'/10':'-',role:a.role?a.role[1]:'',secteur:a.secteur?a.secteur[1]:'',taille:a.taille?a.taille[1]:'',priorite:a.enjeu?a.enjeu[1]:'',horizon:a.horizon?a.horizon[1]:'',langue:L.lang,page:location.pathname,...(data||{}),conversation:hist.map(m=>m.role+': '+m.content).join(' | ').slice(0,1500)};
  if(statut==='Hors cible')return true;
  try{const r=await fetch('https://formsubmit.co/ajax/'+L.formTo,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(body)});return r.ok}catch(e){return false}}
 // ---------- free conversation
 function demo(q){q=q.toLowerCase();for(const [keys,ans] of L.demo){if(keys.some(k=>q.includes(k)))return ans}return L.fallback}
 const wantsRdv=q=>/rendez|rdv|démo|demo|meeting|appel|rappel|book|call/i.test(q);
 form.addEventListener('submit',async e=>{e.preventDefault();const q=inp.value.trim();if(!q)return;inp.value='';
  if(flow&&!flow.done&&flow.chips&&document.body.contains(flow.chips)){const m=match(q);if(m){flow.chips.remove();return answer(m[0],m[1],q)}}
  add(q,'me');hist.push({role:'user',content:q});n++;
  if(wantsRdv(q)&&!(flow&&flow.done)){return startRdv()}
  const t=typing();
  if(EP){try{const r=await fetch(EP,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({lang:L.lang,messages:hist.slice(-12)})});const j=await r.json();t.remove();const a=j.reply||L.offline;hist.push({role:'assistant',content:a});add(a,'ai');if((j.rdv||n>=3)&&!flow)cta(L.rdv,startRdv)}catch(err){t.remove();add(L.offline,'ai');if(!flow)cta(L.rdv,startRdv)}}
  else{await wait(700+Math.random()*600);t.remove();const a=demo(q);hist.push({role:'assistant',content:a});add(a,'ai');if(n>=2&&!flow)cta(L.rdv,startRdv)}
 });
 if(location.hash==='#rdv'){setTimeout(()=>{opened=true;box.classList.add('open');document.body.classList.add('chat-open');startRdv()},400)}
})();
