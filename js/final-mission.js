
const FinalMissionModule = {
  render(container, done){
    const stages = [
      {
        title:"Masalah Terlalu Besar",
        story:"Festival Kelas VII akan dilaksanakan. Banyak pekerjaan harus disiapkan sekaligus.",
        prompt:"Skill mana yang paling membantu sebagai langkah awal?",
        answer:"decomposition",
        hint1:"Masalah besar biasanya lebih mudah ditangani jika dibagi.",
        hint2:"Coba pikirkan cara mengubah satu pekerjaan besar menjadi beberapa pekerjaan kecil."
      },
      {
        title:"Ada Kebutuhan yang Sama",
        story:"Setelah tugas dibagi, beberapa stan ternyata membutuhkan meja, kursi, dan papan nama yang sama.",
        prompt:"Skill mana yang membantu menemukan kesamaan tersebut?",
        answer:"pattern",
        hint1:"Bandingkan kebutuhan setiap stan.",
        hint2:"Carilah hal yang berulang atau sama."
      },
      {
        title:"Informasi Terlalu Banyak",
        story:"Untuk membuat denah, panitia memiliki data lokasi stan, ukuran ruang, warna sepatu panitia, dan merek tas siswa.",
        prompt:"Skill mana yang membantu memilih informasi yang benar-benar diperlukan?",
        answer:"abstraction",
        hint1:"Tidak semua informasi memengaruhi denah.",
        hint2:"Pilih strategi yang menyisihkan detail tidak relevan."
      },
      {
        title:"Saatnya Menjalankan",
        story:"Semua informasi penting sudah tersedia. Panitia perlu menentukan urutan kerja dari persiapan hingga kegiatan dimulai.",
        prompt:"Skill mana yang digunakan sekarang?",
        answer:"algorithm",
        hint1:"Fokus pada urutan tindakan.",
        hint2:"Pilih strategi yang menyusun langkah secara jelas dan teratur."
      }
    ];

    let current=0;
    let attempts=0;
    let totalAttempts=0;
    let hintsUsed=0;

    container.innerHTML=`
      <div class="activity-card mission-stage-card">
        <div class="mission-banner">
          <div class="mission-badge">🏆 FINAL MISSION</div>
          <h3>Festival Kelas VII</h3>
          <p>Pilih skill yang tepat untuk setiap situasi. Tidak ada nyawa yang hilang. Jika belum berhasil, perbaiki strategi.</p>
        </div>
        <div id="finalMissionArea"></div>
      </div>`;

    const area=container.querySelector("#finalMissionArea");

    function buttons(){
      return Object.entries(GameLayer.skills).map(([key,s])=>`
        <button class="skill-choice" data-key="${key}">
          <span>${s.icon}</span>
          <strong>${s.title}</strong>
          <small>${s.formal}</small>
        </button>`).join("");
    }

    function show(){
      const s=stages[current];
      attempts=0;
      area.innerHTML=`
        <div class="mission-progress">
          ${stages.map((_,i)=>`<span class="${i<current?"done":i===current?"active":""}">${i<current?"✓":i+1}</span>`).join("")}
        </div>
        <div class="story-card">
          <span class="eyebrow">Tahap ${current+1} dari ${stages.length}</span>
          <h3>${s.title}</h3>
          <p>${s.story}</p>
          <div class="mission-question">${s.prompt}</div>
        </div>
        <div class="skill-choice-grid">${buttons()}</div>
        <div class="hint-row">
          <button id="hint1" class="small-btn">💡 Petunjuk 1</button>
          <button id="hint2" class="small-btn">💡 Petunjuk 2</button>
        </div>
        <div id="missionHint" class="hint-box hidden"></div>
        <div id="missionFeedback" class="feedback">Pilih satu skill.</div>`;

      const feedback=area.querySelector("#missionFeedback");
      const hintBox=area.querySelector("#missionHint");

      area.querySelector("#hint1").addEventListener("click",()=>{
        hintsUsed++;
        hintBox.classList.remove("hidden");
        hintBox.textContent=s.hint1;
      });
      area.querySelector("#hint2").addEventListener("click",()=>{
        hintsUsed++;
        hintBox.classList.remove("hidden");
        hintBox.textContent=s.hint2;
      });

      area.querySelectorAll(".skill-choice").forEach(btn=>{
        btn.addEventListener("click",()=>{
          attempts++;
          totalAttempts++;
          const ok=btn.dataset.key===s.answer;
          if(ok){
            btn.classList.add("correct");
            area.querySelectorAll(".skill-choice").forEach(x=>x.disabled=true);
            feedback.className="feedback success";
            feedback.textContent="✓ Skill tepat. Lanjut ke situasi berikutnya.";
            setTimeout(()=>{
              current++;
              if(current>=stages.length){
                const stars = hintsUsed===0 && totalAttempts===4 ? 3 : totalAttempts<=6 ? 2 : 1;
                GameLayer.setStars("finalMission",stars);
                GameLayer.addXP(40);
                area.innerHTML=`
                  <div class="mission-complete">
                    <div class="big-reward">🏆</div>
                    <h3>Final Mission Selesai</h3>
                    <p>Kamu berhasil memilih skill berdasarkan kebutuhan masalah, bukan hanya menghafal definisinya.</p>
                    <div class="star-row">${"⭐".repeat(stars)}${"☆".repeat(3-stars)}</div>
                    <p><strong>+40 XP</strong></p>
                    <button id="finishFinalMission" class="primary-btn">Lanjut ke Final Level →</button>
                  </div>`;
                area.querySelector("#finishFinalMission").addEventListener("click",()=>done());
              }else show();
            },520);
          }else{
            btn.classList.add("incorrect");
            feedback.className="feedback warn";
            feedback.textContent=`Percobaan ${attempts}. Belum cocok. Gunakan petunjuk atau coba skill lain.`;
            setTimeout(()=>btn.classList.remove("incorrect"),420);
          }
        });
      });
    }

    show();
  }
};
