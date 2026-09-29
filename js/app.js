
const AppData = {
  modules: [
    {id:"mission0",title:"Robo Tersesat",subtitle:"Eksplorasi Awal",eyebrow:"Misi 0",kind:"robot",icon:"🤖",reward:null,xp:10},
    {id:"skillIntro",title:"Temukan 4 Skill",subtitle:"Empat Fondasi",eyebrow:"Misi 1",kind:"foundations",icon:"🧠",reward:null,xp:10},
    {id:"decomposition",title:"Pecah Masalah",subtitle:"Dekomposisi",eyebrow:"Misi 2",kind:"decomposition",icon:"🧩",reward:"decomposition",xp:20},
    {id:"pattern",title:"Detektif Pola",subtitle:"Pengenalan Pola",eyebrow:"Misi 3",kind:"pattern",icon:"🔍",reward:"pattern",xp:20},
    {id:"abstraction",title:"Filter Informasi",subtitle:"Abstraksi",eyebrow:"Misi 4",kind:"abstraction",icon:"🎯",reward:"abstraction",xp:20},
    {id:"algorithm",title:"Susun Perintah",subtitle:"Algoritma",eyebrow:"Misi 5",kind:"algorithm",icon:"🧭",reward:"algorithm",xp:20},
    {id:"arena",title:"Arena Latihan",subtitle:"3 Mini-game",eyebrow:"Misi 6",kind:"foundationActivities",icon:"🎮",reward:null,xp:20},
    {id:"flow",title:"Cara Kerja 4 Skill",subtitle:"Visualisasi",eyebrow:"Misi 7",kind:"foundationFlow",icon:"✨",reward:null,xp:15},
    {id:"finalMission",title:"Festival Kelas VII",subtitle:"Final Mission",eyebrow:"Misi 8",kind:"finalMission",icon:"🏆",reward:null,xp:40},
    {id:"quiz",title:"Final Level",subtitle:"10 Tantangan",eyebrow:"Misi 9",kind:"quiz",icon:"🎯",reward:null,xp:30}
  ]
};

const App = {
  activeDone:false,
  pendingReward:null,

  init(){
    Navigation.bind();
    this.bindGlobal();
    this.renderHome();
    this.updateProgressUI();
    QuizModule.load();
    this.ensureAvatar();
  },

  bindGlobal(){
    document.getElementById("startBtn").addEventListener("click",()=>{
      if(!GameLayer.state.avatar){this.openAvatarPicker();return;}
      this.openModule(ProgressStore.state.currentModule);
    });

    document.getElementById("backHomeBtn").addEventListener("click",()=>Navigation.show("home"));

    document.getElementById("prevModuleBtn").addEventListener("click",()=>{
      this.openModule(Math.max(0,ProgressStore.state.currentModule-1));
    });

    document.getElementById("nextModuleBtn").addEventListener("click",()=>{
      const cur=ProgressStore.state.currentModule;
      if(!(this.activeDone || ProgressStore.isCompleted(cur))) return;

      if(!ProgressStore.isCompleted(cur)){
        const mod=AppData.modules[cur];
        ProgressStore.completeModule(cur);
        if(mod.xp) GameLayer.addXP(mod.xp);
        if(mod.reward && GameLayer.acquireSkill(mod.reward)){
          this.pendingReward=mod.reward;
        }
      }

      this.updateProgressUI();

      if(this.pendingReward){
        const skill=this.pendingReward;
        this.pendingReward=null;
        this.showSkillReward(skill,()=>{
          if(cur<AppData.modules.length-1) this.openModule(cur+1);
          else this.showResults();
        });
      }else{
        if(cur<AppData.modules.length-1) this.openModule(cur+1);
        else this.showResults();
      }
    });

    document.getElementById("resetProgressBtn").addEventListener("click",()=>{
      if(confirm("Hapus seluruh progress, XP, bintang, dan skill yang sudah diperoleh?")){
        ProgressStore.reset();
        GameLayer.reset();
        this.renderHome();
        this.renderProgress();
        this.updateProgressUI();
        Navigation.show("home");
        this.ensureAvatar();
      }
    });

    document.getElementById("fullscreenBtn").addEventListener("click",async()=>{
      try{
        if(!document.fullscreenElement) await document.documentElement.requestFullscreen();
        else await document.exitFullscreen();
      }catch(e){console.warn(e);}
    });
  },

  ensureAvatar(){
    if(!GameLayer.state.avatar) this.openAvatarPicker();
  },

  openAvatarPicker(){
    let overlay=document.getElementById("avatarOverlay");
    if(!overlay){
      overlay=document.createElement("div");
      overlay.id="avatarOverlay";
      overlay.className="game-overlay";
      document.body.appendChild(overlay);
    }
    const avatars=[
      ["robot","🤖","Robo"],
      ["explorer","🧑‍🚀","Penjelajah"],
      ["detective","🕵️","Detektif"],
      ["builder","🧑‍🔧","Perakit"]
    ];
    overlay.innerHTML=`
      <div class="game-modal">
        <span class="eyebrow">Mulai Petualangan</span>
        <h2>Pilih Karaktermu</h2>
        <p>Tidak perlu mengetik nama. Pilih satu karakter untuk menemani perjalanan.</p>
        <div class="avatar-grid">
          ${avatars.map(a=>`<button class="avatar-card" data-id="${a[0]}"><span>${a[1]}</span><strong>${a[2]}</strong></button>`).join("")}
        </div>
      </div>`;
    overlay.classList.add("show");
    overlay.querySelectorAll(".avatar-card").forEach(btn=>{
      btn.addEventListener("click",()=>{
        GameLayer.setAvatar(btn.dataset.id);
        overlay.classList.remove("show");
        this.renderHome();
        this.updateGameHUD();
      });
    });
  },

  renderHome(){
    const grid=document.getElementById("journeyGrid");
    grid.className="mission-map";
    grid.innerHTML=AppData.modules.map((m,i)=>{
      const unlocked=ProgressStore.isUnlocked(i);
      const done=ProgressStore.isCompleted(i);
      const stars=GameLayer.state.missionStars[m.id]||0;
      return `
        <div class="mission-node-wrap">
          <button class="mission-node ${!unlocked?"locked":""} ${done?"done":""}" data-i="${i}" ${!unlocked?"disabled":""}>
            <span class="mission-icon">${m.icon}</span>
            <span class="mission-kicker">${m.eyebrow}</span>
            <strong>${m.title}</strong>
            <small>${m.subtitle}</small>
            <span class="mission-status">${done?"✓ Selesai":unlocked?"Mainkan":"🔒 Terkunci"}</span>
            ${stars?`<span class="mission-stars">${"⭐".repeat(stars)}</span>`:""}
          </button>
          ${i<AppData.modules.length-1?'<div class="mission-path">↓</div>':""}
        </div>`;
    }).join("");

    grid.querySelectorAll(".mission-node:not([disabled])").forEach(btn=>{
      btn.addEventListener("click",()=>this.openModule(Number(btn.dataset.i)));
    });

    document.getElementById("startBtn").textContent=ProgressStore.state.completed.length?"Lanjutkan Misi":"Mulai Misi";
    this.renderSkillShelf();
    this.updateGameHUD();
  },

  renderSkillShelf(){
    let shelf=document.getElementById("skillShelf");
    if(!shelf){
      const panel=document.createElement("section");
      panel.className="panel";
      panel.innerHTML=`
        <div class="section-heading">
          <div><span class="eyebrow">Koleksi Skill</span><h2>Skill yang Sudah Kamu Peroleh</h2></div>
        </div>
        <div id="skillShelf" class="skill-shelf"></div>`;
      document.getElementById("journeyGrid").parentElement.after(panel);
      shelf=panel.querySelector("#skillShelf");
    }

    shelf.innerHTML=Object.entries(GameLayer.skills).map(([key,s])=>{
      const got=GameLayer.state.acquiredSkills.includes(key);
      return `
        <div class="skill-card ${got?"acquired":"locked-skill"}">
          <span>${got?s.icon:"🔒"}</span>
          <strong>${got?s.title:"Skill Terkunci"}</strong>
          <small>${got?s.formal:"Selesaikan misi untuk membuka"}</small>
        </div>`;
    }).join("");
  },

  updateGameHUD(){
    let hud=document.getElementById("gameHud");
    if(!hud){
      hud=document.createElement("div");
      hud.id="gameHud";
      hud.className="game-hud";
      document.querySelector(".topbar").insertBefore(hud,document.querySelector(".top-progress"));
    }
    hud.innerHTML=`<span>${GameLayer.avatarIcon()}</span><strong>${GameLayer.state.xp} XP</strong>`;
  },

  openModule(index){
    if(!ProgressStore.isUnlocked(index)) return;
    ProgressStore.setCurrent(index);
    this.activeDone=ProgressStore.isCompleted(index);
    const m=AppData.modules[index];

    document.getElementById("moduleEyebrow").textContent=m.eyebrow;
    document.getElementById("moduleTitle").textContent=m.title;
    document.getElementById("prevModuleBtn").disabled=index===0;

    const next=document.getElementById("nextModuleBtn");
    next.disabled=!this.activeDone;
    next.textContent=index===AppData.modules.length-1?"Selesai":"Lanjut →";

    const container=document.getElementById("moduleContent");
    const done=()=>{
      this.activeDone=true;
      next.disabled=false;
    };

    if(m.kind==="foundations") FoundationsModule.render(container,done);
    else if(m.kind==="foundationActivities") FoundationActivitiesModule.render(container,done);
    else if(m.kind==="foundationFlow") FoundationFlowModule.render(container,done);
    else if(m.kind==="finalMission") FinalMissionModule.render(container,done);
    else if(m.kind==="decomposition") DecompositionModule.render(container,done);
    else if(m.kind==="pattern") PatternModule.render(container,done);
    else if(m.kind==="abstraction") AbstractionModule.render(container,done);
    else if(m.kind==="algorithm") AlgorithmModule.render(container,done);
    else if(m.kind==="robot") RobotModule.render(container,done);
    else if(m.kind==="quiz") QuizModule.render(container,done);

    Navigation.show("learning");
  },

  showSkillReward(skillKey,callback){
    const s=GameLayer.skills[skillKey];
    let overlay=document.getElementById("rewardOverlay");
    if(!overlay){
      overlay=document.createElement("div");
      overlay.id="rewardOverlay";
      overlay.className="game-overlay";
      document.body.appendChild(overlay);
    }
    overlay.innerHTML=`
      <div class="game-modal reward-modal">
        <div class="reward-pop">${s.icon}</div>
        <span class="eyebrow">Kemampuan Baru Terbuka!</span>
        <h2>${s.title}</h2>
        <strong>${s.formal}</strong>
        <p>${s.desc}</p>
        <div class="xp-reward">+20 XP</div>
        <button id="claimReward" class="primary-btn">Ambil Skill →</button>
      </div>`;
    overlay.classList.add("show");
    overlay.querySelector("#claimReward").addEventListener("click",()=>{
      overlay.classList.remove("show");
      this.renderHome();
      this.updateGameHUD();
      callback?.();
    });
  },

  renderProgress(){
    const list=document.getElementById("progressList");
    list.innerHTML=AppData.modules.map((m,i)=>`
      <div class="progress-item">
        <span>${m.icon} ${m.title}</span>
        <strong>${ProgressStore.isCompleted(i)?"100% ✓":ProgressStore.isUnlocked(i)?"Belum selesai":"Terkunci"}</strong>
      </div>`).join("");

    const xp=document.createElement("div");
    xp.className="progress-item";
    xp.innerHTML=`<span>⚡ Total XP</span><strong>${GameLayer.state.xp}</strong>`;
    list.prepend(xp);
  },

  updateProgressUI(){
    const p=ProgressStore.percent();
    document.getElementById("topProgressBar").style.width=p+"%";
    document.getElementById("topProgressText").textContent=p+"%";
    this.renderHome();
    this.updateGameHUD();
  },

  showResults(){
    const state=ProgressStore.state;
    const labels={
      decomposition:"Dekomposisi",
      pattern:"Pengenalan Pola",
      abstraction:"Abstraksi",
      algorithm:"Algoritma",
      integrated:"Penerapan Terpadu"
    };

    const breakdown=Object.entries(state.quizBreakdown||{}).map(([k,v])=>{
      const pct=v.total?Math.round((v.correct/v.total)*100):0;
      return `<div class="breakdown-card"><strong>${labels[k]||k}</strong><p>${pct>=70?"✓ Dikuasai":"△ Perlu latihan"} (${pct}%)</p></div>`;
    }).join("") || `<div class="breakdown-card"><p>Belum ada hasil evaluasi.</p></div>`;

    const skillCollection=Object.entries(GameLayer.skills).map(([key,s])=>{
      const got=GameLayer.state.acquiredSkills.includes(key);
      return `<div class="result-skill ${got?"got":""}"><span>${got?s.icon:"🔒"}</span><strong>${got?s.title:"Terkunci"}</strong></div>`;
    }).join("");

    document.getElementById("resultsContent").innerHTML=`
      <div class="score-card">
        <div class="big-reward">🏁</div>
        <span class="eyebrow">Petualangan Selesai</span>
        <h2>Hasil Final Level</h2>
        <div class="score-number">${state.score ?? "-"}</div>
        <p>${state.score==null?"Selesaikan Final Level terlebih dahulu.":state.score>=80?"Penguasaan kuat.":state.score>=70?"Penguasaan cukup, beberapa bagian masih bisa diperkuat.":"Beberapa skill perlu dimainkan kembali."}</p>

        <div class="xp-summary">⚡ ${GameLayer.state.xp} XP</div>

        <div class="breakdown-grid">${breakdown}</div>

        <h3 style="margin-top:22px">Koleksi Skill</h3>
        <div class="result-skill-grid">${skillCollection}</div>

        <div class="token-row" style="justify-content:center">
          <button id="retryQuiz" class="primary-btn">Mainkan Final Level Lagi</button>
          <button id="resultHome" class="ghost-btn">Kembali ke Peta Misi</button>
        </div>
      </div>`;

    document.getElementById("retryQuiz").addEventListener("click",()=>this.openModule(AppData.modules.length-1));
    document.getElementById("resultHome").addEventListener("click",()=>Navigation.show("home"));
    this.updateProgressUI();
    Navigation.show("resultsScreen");
  }
};

document.addEventListener("DOMContentLoaded",()=>App.init());
