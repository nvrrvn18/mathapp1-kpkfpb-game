(() => {
  const GAME_KEY='kpkFpbGameLayerV1';

  const missions=[
    {screen:'factorIntro',no:'Misi 1',name:'Bengkel Faktor',icon:'▦',desc:'Temukan pasangan faktor dan rahasia bilangan prima.',module:'factorIntro'},
    {screen:'meeting1',no:'Misi 2',name:'Kota Lampu',icon:'💡',desc:'Temukan kapan dua pola berulang bertemu kembali.',module:'meeting1'},
    {screen:'activity1',no:'Misi 3',name:'Laboratorium Kelipatan',icon:'🧩',desc:'Rakit KPK dari kelipatan dan faktor prima.',module:'activity1'},
    {screen:'meeting2',no:'Misi 4',name:'Pusat Pembagian',icon:'📦',desc:'Temukan cara membagi benda sama banyak sebanyak mungkin.',module:'meeting2'},
    {screen:'activity2',no:'Misi 5',name:'Gudang Paket',icon:'🧠',desc:'Pilih KPK atau FPB untuk menyelesaikan masalah nyata.',module:'activity2'},
    {screen:'quiz',no:'Misi Akhir',name:'Dewan Kota Bilangan',icon:'🏆',desc:'Buktikan kamu dapat memilih strategi tanpa bantuan.',module:'quiz'}
  ];

  const discoveries=[
    {id:'factorPairs',icon:'▦',title:'Pasangan Faktor',desc:'Susunan baris × kolom menunjukkan pasangan faktor suatu bilangan.',when:s=>s.factorIntro.four},
    {id:'primeNumbers',icon:'💎',title:'Bilangan Prima',desc:'Bilangan prima hanya memiliki dua faktor positif: 1 dan bilangan itu sendiri.',when:s=>s.factorIntro.primes},
    {id:'repeatMeeting',icon:'💡',title:'Pola Berulang',desc:'Dua kejadian dengan periode berbeda dapat bertemu kembali pada waktu tertentu.',when:s=>s.meeting1.simulation},
    {id:'lcm',icon:'🔁',title:'KPK',desc:'KPK adalah kelipatan persekutuan yang paling kecil.',when:s=>s.meeting1.pattern},
    {id:'largestPower',icon:'🌳',title:'Pangkat Terbesar',desc:'Untuk KPK dengan faktorisasi prima, pilih setiap faktor prima dengan pangkat terbesar.',when:s=>s.activity1.prime},
    {id:'commonFactors',icon:'🔗',title:'Faktor Persekutuan',desc:'Faktor persekutuan adalah faktor yang dimiliki bersama oleh dua bilangan.',when:s=>s.meeting2.factors},
    {id:'gcf',icon:'📦',title:'FPB',desc:'FPB adalah faktor persekutuan yang paling besar.',when:s=>s.meeting2.challenge},
    {id:'smallestPower',icon:'🔬',title:'Pangkat Terkecil',desc:'Untuk FPB dengan faktorisasi prima, gunakan faktor prima yang sama dengan pangkat terkecil.',when:s=>s.activity2.factors},
    {id:'strategyMaster',icon:'🧭',title:'Strategi KPK atau FPB',desc:'KPK dipakai untuk pertemuan berulang; FPB untuk pembagian sama banyak sebanyak mungkin.',when:s=>s.quiz.completed}
  ];

  let gameState={announced:[]};
  let discoveryQueue=[];
  let showingDiscovery=false;

  function readGame(){
    try{return {...gameState,...JSON.parse(localStorage.getItem(GAME_KEY)||'{}')}}catch{return {...gameState}}
  }
  function writeGame(){try{localStorage.setItem(GAME_KEY,JSON.stringify(gameState))}catch{}}
  function progress(){return window.LearnProgress?.get?.()||{};}
  function earnedDiscoveries(s=progress()){return discoveries.filter(d=>{try{return !!d.when(s)}catch{return false}})}

  function missionPercent(m,s=progress()){
    if(m.screen==='quiz') return s.quiz?.completed?100:0;
    return window.LearnProgress?.percentFor?.(m.module)||0;
  }
  function starsFor(m,s=progress()){
    if(m.screen==='quiz'){
      if(!s.quiz?.completed)return 0;
      const score=Number(s.quiz.lastScore||0);
      if(score>=90)return 3;if(score>=80)return 2;return 1;
    }
    const x=s[m.module]||{};
    if(m.module==='factorIntro') return x.completed?3:(x.composites&&x.primes?2:(x.four?1:0));
    if(m.module==='meeting1') return x.completed?3:(x.pattern?2:(x.simulation?1:0));
    if(m.module==='activity1') return x.completed?3:((x.prime||x.application)?2:((x.jump||x.multiples)?1:0));
    if(m.module==='meeting2') return x.completed?3:(x.factors?2:(x.grouped?1:0));
    if(m.module==='activity2') return x.completed?3:((x.factors||x.strategy)?2:(x.grouping?1:0));
    return 0;
  }
  function starHTML(n){return [0,1,2].map(i=>`<span class="${i<n?'earned':''}">★</span>`).join('');}
  function isComplete(m,s=progress()){return m.screen==='quiz'?!!s.quiz?.completed:!!s[m.module]?.completed;}

  function renderMap(){
    const root=document.getElementById('gameMap');if(!root)return;
    const s=progress();const current=window.LearnProgress?.nextIncomplete?.();
    root.innerHTML=missions.map((m,i)=>{
      const unlocked=window.LearnProgress?.isUnlocked?.(m.screen);
      const done=isComplete(m,s);const currentClass=!done&&unlocked&&current===m.screen;
      const status=!unlocked?'Terkunci':done?'Selesai ✓':currentClass?'Misi aktif':'Terbuka';
      return `<button class="game-map-node ${done?'complete':''} ${currentClass?'current':''} ${!unlocked?'locked':''}" type="button" data-game-screen="${m.screen}" ${!unlocked?'disabled':''} aria-label="${m.no}: ${m.name}. ${status}">
        <span class="game-node-icon">${!unlocked?'🔒':m.icon}</span>
        <span class="game-node-copy"><small>${m.no}</small><strong>${m.name}</strong><span>${m.desc}</span></span>
        <span class="game-node-meta"><span class="game-stars">${starHTML(starsFor(m,s))}</span><span class="game-node-status">${status}</span></span>
      </button>`;
    }).join('');
  }

  function renderCollection(){
    const root=document.getElementById('gameCollection');if(!root)return;
    const earned=new Set(earnedDiscoveries().map(d=>d.id));
    root.innerHTML=discoveries.map(d=>{
      const unlocked=earned.has(d.id);
      return `<article class="collection-item ${unlocked?'unlocked':''}">
        <span class="collection-item-icon">${unlocked?d.icon:'?'}</span>
        <span><strong>${unlocked?d.title:'Belum ditemukan'}</strong>${unlocked?`<small>${d.desc}</small>`:`<small class="collection-lock">Selesaikan eksplorasi untuk membuka.</small>`}</span>
      </article>`;
    }).join('');
    const count=document.getElementById('collectionCount');if(count)count.textContent=`${earned.size}/${discoveries.length}`;
    const shortcut=document.getElementById('gameCollectionShortcutCount');if(shortcut)shortcut.textContent=earned.size;
  }

  function renderMissionHUDs(){
    const s=progress();
    missions.forEach(m=>{
      const screen=document.querySelector(`[data-screen="${m.screen}"]`);if(!screen)return;
      const banner=screen.querySelector('.module-banner');if(!banner)return;
      let hud=screen.querySelector('.game-mission-hud');
      if(!hud){
        hud=document.createElement('div');hud.className='game-mission-hud';banner.insertAdjacentElement('afterend',hud);
      }
      const pct=missionPercent(m,s), stars=starsFor(m,s);
      hud.innerHTML=`<div class="mission-hud-title"><span class="mission-hud-icon">${m.icon}</span><span><small>Misi saat ini</small><strong>${m.no} · ${m.name}</strong><span>${m.desc}</span></span></div>
        <div class="mission-hud-meta"><span class="game-stars" aria-label="${stars} dari 3 bintang">${starHTML(stars)}</span><div class="mission-hud-progress"><span style="width:${pct}%"></span></div><span class="mission-hud-percent">${pct}% misi</span></div>`;
      screen.querySelectorAll('.completion-card').forEach(c=>c.classList.toggle('game-cleared',isComplete(m,s)));
    });
  }

  function syncDiscoveries(announce=true){
    const earned=earnedDiscoveries();
    if(!earned.length && gameState.announced.length){gameState.announced=[];writeGame();}
    const newOnes=earned.filter(d=>!gameState.announced.includes(d.id));
    if(!announce){
      if(newOnes.length){gameState.announced.push(...newOnes.map(d=>d.id));writeGame();}
      return;
    }
    if(newOnes.length){
      newOnes.forEach(d=>{gameState.announced.push(d.id);discoveryQueue.push(d)});writeGame();showNextDiscovery();
    }
  }

  function showNextDiscovery(){
    if(showingDiscovery||!discoveryQueue.length)return;
    const d=discoveryQueue.shift();const overlay=document.getElementById('gameDiscoveryOverlay');if(!overlay)return;
    showingDiscovery=true;
    document.getElementById('gameDiscoveryIcon').textContent=d.icon;
    document.getElementById('gameDiscoveryTitle').textContent=d.title;
    document.getElementById('gameDiscoveryDescription').textContent=d.desc;
    overlay.classList.remove('hidden');
    setTimeout(()=>document.getElementById('saveDiscoveryBtn')?.focus(),80);
  }
  function closeDiscovery(){
    const overlay=document.getElementById('gameDiscoveryOverlay');overlay?.classList.add('hidden');showingDiscovery=false;
    window.AppUtilities?.beep?.(720,.07);window.AppUtilities?.confetti?.();renderCollection();
    setTimeout(showNextDiscovery,220);
  }

  function refresh(announce=true){renderMap();renderCollection();renderMissionHUDs();syncDiscoveries(announce);}

  function setupTopShortcut(){
    const actions=document.querySelector('.top-actions');if(!actions||document.getElementById('gameCollectionShortcut'))return;
    const btn=document.createElement('button');btn.id='gameCollectionShortcut';btn.className='game-collection-shortcut';btn.type='button';btn.title='Buka koleksi penemuan';btn.innerHTML='🏅 <span class="shortcut-label">Koleksi</span> <span id="gameCollectionShortcutCount">0</span>';
    actions.insertBefore(btn,actions.firstChild);
    btn.addEventListener('click',()=>{window.Navigation?.navigateTo?.('landing',true);setTimeout(()=>document.getElementById('gameCollectionCard')?.scrollIntoView({behavior:'smooth',block:'start'}),180)});
  }

  function setupEvents(){
    document.getElementById('gameMap')?.addEventListener('click',e=>{
      const node=e.target.closest('[data-game-screen]');if(!node||node.disabled)return;
      window.Navigation?.navigateTo?.(node.dataset.gameScreen);
    });
    document.getElementById('saveDiscoveryBtn')?.addEventListener('click',closeDiscovery);
    window.addEventListener('learning-progress-changed',()=>refresh(true));
    window.addEventListener('screen-changed',()=>renderMissionHUDs());
  }

  function init(){
    gameState=readGame();
    // First install on an already-used V7 app: sync old discoveries silently.
    const hadGameSave=!!localStorage.getItem(GAME_KEY);
    setupTopShortcut();renderMap();renderCollection();renderMissionHUDs();setupEvents();syncDiscoveries(hadGameSave);
    // If there was no game-layer save, existing learning progress should not trigger a stack of old popups.
    if(!hadGameSave){gameState.announced=earnedDiscoveries().map(d=>d.id);writeGame();renderCollection();}
  }

  document.addEventListener('DOMContentLoaded',init);
  window.GameLayer={refresh,renderMap,renderCollection};
})();
