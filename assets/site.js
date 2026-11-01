
(function(){if('scrollRestoration' in history)history.scrollRestoration='manual';
 function top(){if(location.hash&&location.hash!=='#rdv')return;var t=document.getElementById('top');window.scrollTo(0,0);if(t&&t.scrollIntoView){try{t.scrollIntoView({block:'start',inline:'nearest',behavior:'instant'})}catch(e){t.scrollIntoView(true)}}}
 top();document.addEventListener('DOMContentLoaded',top);window.addEventListener('load',function(){top();setTimeout(top,60)});window.addEventListener('pageshow',top);})();
document.addEventListener('DOMContentLoaded',()=>{
 const b=document.querySelector('.burger'),n=document.querySelector('nav');if(b){b.addEventListener('click',()=>n.classList.toggle('open'))}
 const h=document.querySelector('header');const onS=()=>{h.classList.toggle('solid',window.scrollY>40||document.body.classList.contains('light-top'))};onS();window.addEventListener('scroll',onS,{passive:true});
 const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12});
 document.querySelectorAll('.rv').forEach(el=>io.observe(el));
});
