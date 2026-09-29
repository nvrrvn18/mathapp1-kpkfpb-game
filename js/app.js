(() => {
  let audioCtx=null;
  function beep(freq=520,duration=.05){if(!LearnProgress.get().sound)return;try{audioCtx??=new (window.AudioContext||window.webkitAudioContext)();const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.frequency.value=freq;o.type='sine';g.gain.value=.045;o.connect(g);g.connect(audioCtx.destination);o.start();g.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+duration);o.stop(audioCtx.currentTime+duration);}catch{}}
  function confetti(){const root=document.getElementById('confettiLayer');if(!root)return;for(let i=0;i<34;i++){const p=document.createElement('i');p.className='confetti-piece';p.style.left=Math.random()*100+'%';p.style.animationDelay=Math.random()*.45+'s';p.style.transform=`rotate(${Math.random()*180}deg)`;p.style.background=['#5ea8ff','#73c7a1','#ffb45c','#9e86d7'][i%4];root.appendChild(p);setTimeout(()=>p.remove(),3400);}}
  window.AppUtilities={beep,confetti};

  function updateLocks(){const s=LearnProgress.get();const map=[['factorIntroNext',s.factorIntro.completed],['meeting1Next',s.meeting1.completed],['activity1Next',s.activity1.completed],['meeting2Next',s.meeting2.completed],['activity2Next',s.activity2.completed]];map.forEach(([id,enabled])=>{const el=document.getElementById(id);if(el)el.disabled=!enabled});document.getElementById('factorIntroCompletion')?.classList.toggle('hidden',!s.factorIntro.completed);Navigation.updateTopProgress();KPKModule?.updateA1Flow?.();FPBModule?.updateA2Flow?.();}
  function setupTabs(){document.querySelectorAll('.tab').forEach(tab=>tab.addEventListener('click',()=>{const parent=tab.closest('.learning-card');parent.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));parent.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));tab.classList.add('active');document.getElementById(tab.dataset.tabTarget)?.classList.add('active');beep(440,.035);}));}
  function setupUtilities(){
    const sound=document.getElementById('soundToggle');const refreshSound=()=>{sound.textContent=LearnProgress.get().sound?'🔊':'🔇';sound.title=LearnProgress.get().sound?'Nonaktifkan suara':'Aktifkan suara'};refreshSound();sound?.addEventListener('click',()=>{LearnProgress.setSound(!LearnProgress.get().sound);refreshSound();if(LearnProgress.get().sound)beep(600,.06)});
    document.getElementById('fullscreenBtn')?.addEventListener('click',async()=>{try{if(!document.fullscreenElement)await document.documentElement.requestFullscreen();else await document.exitFullscreen();}catch{Navigation.toast('Mode layar penuh tidak didukung browser ini.')}});
    document.getElementById('resetProgressBtn')?.addEventListener('click',()=>{if(confirm('Reset seluruh progress, jawaban tersimpan, dan hasil evaluasi?')){LearnProgress.reset();updateLocks();Navigation.navigateTo('landing',true);Navigation.toast('Progress sudah direset.')}});
  }
  async function init(){
    Navigation.bindNavigation();Navigation.setupRevealObserver();ChoiceUI.init();FactorTools.init();KPKModule.init();FPBModule.init();await QuizModule.init();setupTabs();setupUtilities();updateLocks();
    window.addEventListener('learning-progress-changed',updateLocks);
    document.querySelectorAll('.screen.active .reveal').forEach(x=>x.classList.add('visible'));
  }
  document.addEventListener('DOMContentLoaded',init);
})();
