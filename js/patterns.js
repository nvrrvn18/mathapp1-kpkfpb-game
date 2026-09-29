
const PatternModule = {
  render(container, done){
    container.innerHTML = `
      <div class="activity-card">
        <div class="sticky-objective">🎯 Tujuan: Temukan kesamaan dari beberapa masalah.</div>
        <h3>Apa kesamaan ketiga situasi ini?</h3>
        <div class="tree-branches">
          <div class="tree-branch">📚 Menyusun buku berdasarkan ukuran</div>
          <div class="tree-branch">🧍 Menyusun siswa berdasarkan tinggi badan</div>
          <div class="tree-branch">🔢 Menyusun bilangan dari kecil ke besar</div>
        </div>
        <p>Pilih pola yang sama.</p>
        <div class="option-grid" id="patternOptions">
          <button class="select-card" data-correct="1">Semuanya perlu diurutkan</button>
          <button class="select-card">Semuanya tentang sekolah</button>
          <button class="select-card">Semuanya menggunakan warna</button>
          <button class="select-card">Semuanya memiliki jumlah objek sama</button>
        </div>
        <div class="feedback" id="patternFeedback">Bandingkan struktur masalah, bukan hanya bendanya.</div>
      </div>`;
    const feedback = container.querySelector("#patternFeedback");
    container.querySelectorAll(".select-card").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        container.querySelectorAll(".select-card").forEach(x=>x.classList.remove("selected"));
        btn.classList.add("selected");
        if(btn.dataset.correct){
          btn.classList.add("correct");
          feedback.className="feedback success";
          feedback.innerHTML="✓ Tepat. Walaupun objeknya berbeda, cara menyelesaikannya memiliki pola yang sama, yaitu <strong>mengurutkan</strong>. Ini contoh pengenalan pola.";
          done();
        }else{
          btn.classList.add("incorrect");
          feedback.className="feedback warn";
          feedback.textContent="Belum tepat. Fokus pada cara masalah diselesaikan.";
        }
      });
    });
  }
};
