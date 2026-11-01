
(function(){
 const L=window.FD_CHAT;if(!L)return;const EP=window.FD_CHAT_ENDPOINT||'';const R=L.rdvFlow;
 const spark='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 17l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/></svg>';
 const micI='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>';
 const btn=document.createElement('button');btn.id='fd-chat-btn';btn.setAttribute('aria-label',L.cta);btn.innerHTML='<span class="av">'+spark+'</span><span class="lbl">'+L.cta+'</span>';document.body.appendChild(btn);
 const box=document.createElement('div');box.id='fd-chat';box.setAttribute('role','dialog');
 box.innerHTML='<div class="top"><span class="av">'+spark+'</span><div><b>'+L.title+'</b><span>'+L.sub+'</span></div><button class="x" aria-label="close">×</button></div><div class="msgs" aria-live="polite"></div><form class="in"><button type="button" class="mic" aria-label="'+L.mic+'" title="'+L.mic+'">'+micI+'</button><input placeholder="'+L.placeholder+'" autocomplete="off" maxlength="600"><button type="submit" class="go" aria-label="'+L.send+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button></form>';
 document.body.appendChild(box);
 const msgs=box.querySelector('.msgs'),form=box.querySelector('form.in'),inp=form.querySelector('input'),mic=form.querySelector('.mic');
 const esc=t=>String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;');
 const hist=[];let opened=false,n=0,flow=null,busy=false;
 function scroll(){msgs.scrollTop=msgs.scrollHeight}
 function add(t,who){const d=document.createElement('div');d.className='bubble '+who;d.innerHTML=esc(t).replace(/\n/g,'<br>');msgs.appendChild(d);scroll();return d}
 function typing(){const d=document.createElement('div');d.className='bubble ai typing';d.innerHTML='<span></span><span></span><span></span>';msgs.appendChild(d);scroll();return d}
 const wait=ms=>new Promise(r=>setTimeout(r,ms));
 async function say(t){const ty=typing();await wait(400+Math.min(800,t.length*5));ty.remove();hist.push({role:'assistant',content:t});return add(t,'ai')}
 function chips(opts,cb){const w=document.createElement('div');w.className='chips-q';opts.forEach(([k,l])=>{const c=document.createElement('button');c.type='button';c.textContent=l;c.onclick=()=>{w.remove();cb(k,l)};w.appendChild(c)});msgs.appendChild(w);scroll();return w}
 function cta(label,onclick){const a=document.createElement('button');a.type='button';a.className='rdv';a.innerHTML=label+' →';a.onclick=onclick;const d=document.createElement('div');d.className='bubble ai';d.appendChild(a);msgs.appendChild(d);scroll()}
 function show(){box.classList.add('open');document.body.classList.add('chat-open')}
 function open(){show();if(!opened){opened=true;add(L.hello,'ai');hist.push({role:'assistant',content:L.hello});cta(L.rdv,startRdv)}setTimeout(()=>inp.focus(),50)}
 function close(){box.classList.remove('open');document.body.classList.remove('chat-open');stopMic()}
 btn.addEventListener('click',()=>box.classList.contains('open')?close():open());
 box.querySelector('.x').addEventListener('click',close);
 document.querySelectorAll('[data-chat]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();open()}));
 document.querySelectorAll('[data-rdv]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();if(!opened){opened=true;show()}else open();startRdv()}));

 // ---------- micro (dictée vocale du navigateur)
 const SR=window.SpeechRecognition||window.webkitSpeechRecognition;let rec=null,listening=false;
 function stopMic(){if(rec&&listening){try{rec.stop()}catch(e){}}}
 mic.addEventListener('click',()=>{
  if(!SR){add(L.mic_na,'ai');return}
  if(listening){stopMic();return}
  rec=new SR();rec.lang=L.lang==='en'?'en-GB':'fr-FR';rec.interimResults=true;rec.continuous=false;rec.maxAlternatives=1;
  let finalText='';const before=inp.value;
  rec.onstart=()=>{listening=true;mic.classList.add('on');inp.placeholder=L.mic_on};
  rec.onresult=e=>{let t='';for(let i=e.resultIndex;i<e.results.length;i++){const r=e.results[i];if(r.isFinal)finalText+=r[0].transcript;else t+=r[0].transcript}inp.value=(before?before+' ':'')+finalText+t};
  rec.onerror=e=>{if(e.error==='not-allowed'||e.error==='service-not-allowed')add(L.mic_denied,'ai')};
  rec.onend=()=>{listening=false;mic.classList.remove('on');inp.placeholder=L.placeholder;if(finalText.trim()){inp.value=(before?before+' ':'')+finalText.trim();form.requestSubmit?form.requestSubmit():form.dispatchEvent(new Event('submit',{cancelable:true}))}};
  try{rec.start()}catch(e){}
 });

 // ---------- IA (serveur Facilia) ou mode démo
 function demo(q){q=q.toLowerCase();for(const [keys,ans] of L.demo){if(keys.some(k=>q.includes(k)))return ans}return L.fallback}
 async function ai(stage){
  const t=typing();
  try{
   if(!EP){await wait(700+Math.random()*500);t.remove();const a=demo(hist[hist.length-1].content);hist.push({role:'assistant',content:a});add(a,'ai');return {}}
   const r=await fetch(EP,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({lang:L.lang,stage:stage||'',messages:hist.slice(-12)})});
   const j=await r.json();t.remove();const a=(j.reply||L.offline).trim();hist.push({role:'assistant',content:a});add(a,'ai');return j
  }catch(e){t.remove();add(L.offline,'ai');return {}}
 }

 // ---------- qualification
 async function startRdv(){if(flow&&!flow.done)return;flow={i:0,a:{},done:false};box.querySelectorAll('.chips-q').forEach(x=>x.remove());await say(R.intro);ask()}
 async function ask(again){const st=R.steps[flow.i];if(again){add(L.back,'ai')}await say(st.q);flow.chips=chips(st.opts,(k,l)=>answer(k,l))}
 function match(text){const st=R.steps[flow.i];const t=text.toLowerCase();for(const [k,l] of st.opts){const words=l.toLowerCase().split(/[\s,/()…]+/).filter(w=>w.length>3);if(words.some(w=>t.includes(w)))return [k,l]}return null}
 async function answer(k,l,shown){add(shown||l,'me');hist.push({role:'user',content:shown||l});flow.a[R.steps[flow.i].key]=[k,l];flow.i++;
  const a=flow.a;
  if((a.role&&a.role[0]==='autre')||(a.secteur&&a.secteur[0]==='aucun')){flow.done=true;await say(R.no);return}
  if(flow.i<R.steps.length)return ask();
  flow.done=true;
  if(a.horizon[0]==='info'&&a.taille[0]==='s'){await say(R.nurture);leadForm(true);return}
  await say(R.ok);leadForm(false)}
 function score(){const a=flow.a,v={dir:3,resp:3,expl:2,gest:2,presta:2,s:1,m:2,l:3,xl:3,now:3,mid:2,info:1};return Math.min(10,(v[a.role[0]]||0)+(v[a.taille[0]]||0)+(v[a.horizon[0]]||0)+1)}
 function leadForm(light){const F=R.form;const f=document.createElement('form');f.className='lead';
  f.innerHTML=(light?'':'<input name="nom" required maxlength="80" placeholder="'+F.name+'"><input name="organisation" required maxlength="120" placeholder="'+F.org+'">')+'<input name="email" type="email" required maxlength="120" placeholder="'+F.email+'">'+(light?'':'<input name="telephone" type="tel" maxlength="30" placeholder="'+F.phone+'">')+'<button type="submit">'+F.send+'</button>';
  const d=document.createElement('div');d.className='bubble ai formb';d.appendChild(f);msgs.appendChild(d);scroll();f.querySelector('input').focus();
  f.addEventListener('submit',async e=>{e.preventDefault();const data=Object.fromEntries(new FormData(f));f.querySelectorAll('input,button').forEach(x=>x.disabled=true);
   const ok=await send(light?'A recontacter (en réflexion)':'RDV qualifié',data);
   if(!ok){await say(R.err);return}
   if(light){await say(R.nurture_sent);return}
   await say(R.booked);
   const nm=(data.nom||'').trim().split(/\s+/);const url=L.bookUrl+(L.bookUrl.includes('?')?'&':'?')+'email='+encodeURIComponent(data.email||'')+'&firstName='+encodeURIComponent(nm[0]||'')+'&lastName='+encodeURIComponent(nm.slice(1).join(' '))+'&company='+encodeURIComponent(data.organisation||'');
   const fr=document.createElement('div');fr.className='bubble ai cal';fr.innerHTML='<iframe title="agenda" loading="lazy" src="'+url+'&embed=true"></iframe><a href="'+url+'" target="_blank" rel="noopener">'+R.slot+' ↗</a>';msgs.appendChild(fr);scroll();box.classList.add('wide')})}
 async function send(statut,data){const a=flow?flow.a:{};const body={_subject:'[Facilia] '+statut+' — '+(data&&data.organisation||'site facildata.com'),_template:'table',statut,score:flow&&flow.a.horizon?score()+'/10':'-',role:a.role?a.role[1]:'',secteur:a.secteur?a.secteur[1]:'',taille:a.taille?a.taille[1]:'',priorite:a.enjeu?a.enjeu[1]:'',horizon:a.horizon?a.horizon[1]:'',langue:L.lang,page:location.pathname,...(data||{}),conversation:hist.map(m=>(m.role==='user'?'Visiteur':'Facilia')+' : '+m.content).join('\n').slice(0,3000)};
  try{const r=await fetch('https://formsubmit.co/ajax/'+L.formTo,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(body)});return r.ok}catch(e){return false}}

 // ---------- saisie libre (clavier ou voix)
 const wantsRdv=q=>/rendez|rdv|d[ée]mo\b|meeting|rappel|book|call me|appelez/i.test(q);
 form.addEventListener('submit',async e=>{e.preventDefault();const q=inp.value.trim().slice(0,600);if(!q||busy)return;inp.value='';busy=true;
  try{
   const inFlow=flow&&!flow.done&&flow.chips&&document.body.contains(flow.chips);
   if(inFlow){const m=match(q);if(m){flow.chips.remove();return await answer(m[0],m[1],q)}
     // réponse hors des choix : l'IA répond, puis on revient à la question
     flow.chips.remove();add(q,'me');hist.push({role:'user',content:q});
     await ai('qualification:'+R.steps[flow.i].key);return await ask(true)}
   add(q,'me');hist.push({role:'user',content:q});n++;
   if(wantsRdv(q)&&!(flow&&flow.done))return await startRdv();
   const j=await ai('');
   if((j.rdv||n>=3)&&!flow)cta(L.rdv,startRdv);
  }finally{busy=false}
 });
 if(location.hash==='#rdv'){setTimeout(()=>{opened=true;show();startRdv()},400)}
})();
