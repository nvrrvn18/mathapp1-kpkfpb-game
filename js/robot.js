const RobotModule = {
  render(container, done){
    const levels = [
      {
        title:"Contoh 1: Cari Jalan ke Sekolah",
        subtitle:"Kenali cara memberi perintah satu langkah demi satu langkah.",
        rows:4, cols:4,
        start:{r:0,c:0}, goal:{r:3,c:3},
        blocks:new Set(["0,2","1,2","2,0"]),
        maxCommands:12,
        hint:"Coba bergerak ke kanan lebih dahulu, lalu cari jalan turun."
      },
      {
        title:"Contoh 2: Jalur Berliku",
        subtitle:"Rute kali ini berbeda. Uji urutan, lihat hasilnya, lalu perbaiki jika perlu.",
        rows:5, cols:4,
        start:{r:4,c:0}, goal:{r:0,c:3},
        blocks:new Set(["3,1","2,1","1,1","1,3"]),
        maxCommands:14,
        hint:"Jangan memaksakan satu arah. Perhatikan celah di antara rintangan."
      }
    ];

    let currentLevel=0;
    const completed=new Set();

    container.innerHTML=`
      <div class="activity-card robot-mission-shell">
        <div class="sticky-objective">🎯 Misi Robo: Selesaikan dua jalur tanpa mengetik.</div>
        <div class="robot-level-tabs">
          <button class="robot-level-tab active" data-i="0"><span>1</span><strong>Jalur A</strong></button>
          <button class="robot-level-tab" data-i="1"><span>2</span><strong>Jalur B</strong></button>
        </div>
        <div id="robotLevelArea"></div>
      </div>`;

    const area=container.querySelector("#robotLevelArea");

    function renderLevel(){
      const level=levels[currentLevel];
      let pos={...level.start}, queue=[], running=false, attempts=0;

      container.querySelectorAll(".robot-level-tab").forEach((b,i)=>{
        b.classList.toggle("active",i===currentLevel);
        b.classList.toggle("done",completed.has(i));
      });

      area.innerHTML=`
        <div class="robot-level-card">
          <div class="robot-level-head">
            <span class="eyebrow">Jalur ${currentLevel+1} dari ${levels.length}</span>
            <h3>${level.title}</h3>
            <p>${level.subtitle}</p>
          </div>

          <div class="robot-game-layout">
            <div class="robot-board-panel">
              <div id="robotGrid" class="robot-grid robot-grid-mobile" style="--robot-cols:${level.cols}"></div>
              <div class="robot-legend">
                <span>🤖 Robo</span><span>🏫 Tujuan</span><span>■ Rintangan</span>
              </div>
            </div>

            <div class="robot-controls-panel">
              <div class="robot-control-section">
                <strong>1. Tambahkan perintah</strong>
                <div class="mobile-dpad">
                  <button class="command-btn up" data-cmd="U" aria-label="Atas">↑</button>
                  <button class="command-btn left" data-cmd="L" aria-label="Kiri">←</button>
                  <button class="command-btn down" data-cmd="D" aria-label="Bawah">↓</button>
                  <button class="command-btn right" data-cmd="R" aria-label="Kanan">→</button>
                </div>
              </div>

              <div class="robot-control-section">
                <div class="robot-queue-head">
                  <strong>2. Urutan Robo</strong><span id="commandCount">0 / ${level.maxCommands}</span>
                </div>
                <div id="commandQueue" class="command-queue mobile-command-queue"></div>
              </div>

              <div class="robot-action-row">
                <button id="runRobot" class="primary-btn">▶ Jalankan</button>
                <button id="undoRobot" class="ghost-btn">↶ Hapus 1</button>
                <button id="clearRobot" class="ghost-btn">Reset</button>
              </div>

              <button id="robotHintBtn" class="small-btn robot-hint-btn">💡 Petunjuk</button>
              <div id="robotHint" class="hint-box hidden">${level.hint}</div>
              <div id="robotFeedback" class="feedback">Susun beberapa perintah lalu tekan Jalankan.</div>
            </div>
          </div>
        </div>`;

      const grid=area.querySelector("#robotGrid");
      const queueEl=area.querySelector("#commandQueue");
      const feedback=area.querySelector("#robotFeedback");
      const countEl=area.querySelector("#commandCount");

      function draw(){
        grid.innerHTML="";
        for(let r=0;r<level.rows;r++){
          for(let c=0;c<level.cols;c++){
            const key=`${r},${c}`;
            const cell=document.createElement("div");
            cell.className="cell";
            if(level.blocks.has(key)){cell.classList.add("block");cell.textContent="■";}
            if(r===level.goal.r&&c===level.goal.c){cell.classList.add("goal");cell.textContent="🏫";}
            if(r===pos.r&&c===pos.c){cell.classList.add("robot");cell.textContent="🤖";}
            grid.appendChild(cell);
          }
        }
        queueEl.innerHTML=queue.length
          ? queue.map((q,i)=>`<span class="command-chip" data-i="${i}">${({U:"↑",D:"↓",L:"←",R:"→"})[q]}</span>`).join("")
          : `<span class="queue-empty">Belum ada perintah</span>`;
        countEl.textContent=`${queue.length} / ${level.maxCommands}`;
      }

      function resetPos(){pos={...level.start};draw();}
      function move(cmd){
        const next={...pos};
        if(cmd==="U") next.r--;
        if(cmd==="D") next.r++;
        if(cmd==="L") next.c--;
        if(cmd==="R") next.c++;
        const key=`${next.r},${next.c}`;
        if(next.r<0||next.r>=level.rows||next.c<0||next.c>=level.cols||level.blocks.has(key)) return false;
        pos=next; return true;
      }

      area.querySelectorAll(".command-btn").forEach(btn=>btn.addEventListener("click",()=>{
        if(running) return;
        if(queue.length>=level.maxCommands){
          feedback.className="feedback warn";
          feedback.textContent="Batas perintah tercapai. Hapus langkah yang tidak diperlukan.";
          return;
        }
        queue.push(btn.dataset.cmd); draw();
      }));

      area.querySelector("#undoRobot").addEventListener("click",()=>{
        if(running) return;
        queue.pop(); resetPos();
        feedback.className="feedback"; feedback.textContent="Satu perintah terakhir dihapus.";
      });

      area.querySelector("#clearRobot").addEventListener("click",()=>{
        if(running) return;
        queue=[]; resetPos();
        feedback.className="feedback"; feedback.textContent="Urutan direset. Susun strategi baru.";
      });

      area.querySelector("#robotHintBtn").addEventListener("click",()=>{
        area.querySelector("#robotHint").classList.toggle("hidden");
      });

      area.querySelector("#runRobot").addEventListener("click",async()=>{
        if(running||queue.length===0) return;
        attempts++; running=true; pos={...level.start}; draw();
        feedback.className="feedback";
        feedback.textContent=`Percobaan ${attempts}: Robo sedang menjalankan perintah...`;

        for(let i=0;i<queue.length;i++){
          queueEl.querySelectorAll(".command-chip").forEach(x=>x.classList.remove("active"));
          const chip=queueEl.querySelector(`[data-i="${i}"]`);
          if(chip) chip.classList.add("active");

          const ok=move(queue[i]);
          draw();
          const chip2=queueEl.querySelector(`[data-i="${i}"]`);
          if(chip2) chip2.classList.add("active");
          await new Promise(r=>setTimeout(r,430));

          if(!ok){
            feedback.className="feedback warn";
            feedback.textContent=`Robo tertahan pada langkah ke-${i+1}. Periksa arah itu lalu coba lagi.`;
            grid.classList.add("shake");
            setTimeout(()=>grid.classList.remove("shake"),500);
            running=false; return;
          }
        }

        if(pos.r===level.goal.r&&pos.c===level.goal.c){
          completed.add(currentLevel);
          if(typeof GameLayer!=="undefined") GameLayer.setStars(`robot-${currentLevel}`,attempts===1?3:attempts<=3?2:1);
          feedback.className="feedback success";
          feedback.textContent=`✓ Jalur ${currentLevel===0?"A":"B"} selesai dalam ${attempts} percobaan.`;
          container.querySelectorAll(".robot-level-tab")[currentLevel].classList.add("done");

          if(completed.size===levels.length){
            done();
            setTimeout(()=>feedback.innerHTML=`✓ Kedua jalur selesai. Kamu sudah mencoba pola <strong>susun → jalankan → amati → perbaiki</strong>.`,250);
          }else{
            setTimeout(()=>{currentLevel=1;renderLevel();},650);
          }
        }else{
          feedback.className="feedback warn";
          feedback.textContent="Robo belum sampai tujuan. Tambahkan atau perbaiki perintah.";
        }
        running=false;
      });

      draw();
    }

    container.querySelectorAll(".robot-level-tab").forEach(btn=>btn.addEventListener("click",()=>{
      const i=Number(btn.dataset.i);
      if(i===1&&!completed.has(0)){
        const fb=area.querySelector("#robotFeedback");
        if(fb){fb.className="feedback warn";fb.textContent="Selesaikan Jalur A terlebih dahulu.";}
        return;
      }
      currentLevel=i; renderLevel();
    }));

    renderLevel();
  }
};
