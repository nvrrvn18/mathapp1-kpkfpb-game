(() => {
  const labels = {factorIntro:'Misi 1',meeting1:'Misi 2',activity1:'Misi 3',meeting2:'Misi 4',activity2:'Misi 5',quiz:'Final'};
  function toast(message){
    const el=document.getElementById('toast'); if(!el) return;
    el.textContent=message; el.classList.add('show'); clearTimeout(toast.t); toast.t=setTimeout(()=>el.classList.remove('show'),2600);
  }
  function navigateTo(screen, force=false){
    if(!force && !window.LearnProgress.isUnlocked(screen)){ toast('Selesaikan tahap sebelumnya untuk membuka bagian ini.'); return false; }
    document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('active',s.dataset.screen===screen));
    document.querySelectorAll('.bottom-nav [data-go]').forEach(b=>b.classList.toggle('active',b.dataset.go===screen));
    window.LearnProgress.setLastScreen(screen);
    window.scrollTo({top:0,behavior:'smooth'});
    setTimeout(()=>document.querySelector(`[data-screen="${screen}"]`)?.focus?.({preventScroll:true}),50);
    window.dispatchEvent(new CustomEvent('screen-changed',{detail:{screen}}));
    return true;
  }
  function updateTopProgress(){
    const state=window.LearnProgress.get(); const order=['factorIntro','meeting1','activity1','meeting2','activity2','quiz'];
    const stepper=document.getElementById('topStepper');
    if(stepper){stepper.innerHTML=order.map(k=>`<span class="step-chip ${((k==='quiz'?state.quiz.completed:state[k].completed)?'complete':(!(k==='quiz'?state.quiz.completed:state[k].completed)&&window.LearnProgress.isUnlocked(k)?'current':''))}"><span>${labels[k]}</span></span>`).join('');}
    const pct=window.LearnProgress.overallPercent();
    const fill=document.getElementById('topProgressFill'); if(fill) fill.style.width=pct+'%';
    const text=document.getElementById('progressPercent'); if(text) text.textContent=pct+'%';
    updateDashboard();
  }
  function updateDashboard(){
    const root=document.getElementById('dashboardProgress'); if(!root) return;
    const items=[['factorIntro','Misi 1','Bengkel Faktor'],['meeting1','Misi 2','Kota Lampu'],['activity1','Misi 3','Laboratorium Kelipatan'],['meeting2','Misi 4','Pusat Pembagian'],['activity2','Misi 5','Gudang Paket'],['quiz','Misi Akhir','Dewan Kota Bilangan']];
    root.innerHTML=items.map(([key,title,sub])=>{
      const pct=key==='quiz'?(window.LearnProgress.get().quiz.completed?100:0):window.LearnProgress.percentFor(key); const unlocked=window.LearnProgress.isUnlocked(key);
      return `<div class="dash-item"><strong>${title}</strong><small>${sub}</small><div class="dash-meter"><span style="width:${unlocked?pct:0}%"></span></div><small>${!unlocked?'Terkunci':pct===100?'100% ✓':pct?`${pct}%`:'Belum dimulai'}</small></div>`;
    }).join('');
  }
  function bindNavigation(){
    document.addEventListener('click',e=>{
      const trigger=e.target.closest('[data-go], [data-nav]');
      if(trigger){ e.preventDefault(); navigateTo(trigger.dataset.go || trigger.dataset.nav); }
    });
    document.getElementById('startBtn')?.addEventListener('click',()=>navigateTo('factorIntro'));
    document.getElementById('resumeBtn')?.addEventListener('click',()=>navigateTo(window.LearnProgress.nextIncomplete()));
    document.getElementById('mobileProgressBtn')?.addEventListener('click',()=>{navigateTo('landing',true); setTimeout(()=>document.querySelector('.dashboard-card')?.scrollIntoView({behavior:'smooth'}),220);});
  }
  function setupRevealObserver(){
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.12});
    document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
  }
  window.addEventListener('learning-progress-changed',updateTopProgress);
  window.Navigation={navigateTo,toast,updateTopProgress,updateDashboard,bindNavigation,setupRevealObserver};
})();
