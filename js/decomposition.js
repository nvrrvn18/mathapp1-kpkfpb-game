
const DecompositionModule = {
  render(container, done){
    const tasks = [
      ["Menentukan tempat", true],
      ["Membagi tugas", true],
      ["Menyiapkan perlengkapan", true],
      ["Menentukan jadwal", true],
      ["Mencari nama planet", false],
      ["Memilih warna sepatu ketua kelas", false]
    ];
    container.innerHTML = `
      <div class="activity-card">
        <div class="sticky-objective">🎯 Tujuan: Pecah masalah “kegiatan kelas” menjadi bagian yang lebih kecil.</div>
        <h3>Masalah Besar: Kelas VII akan mengadakan kegiatan kelas</h3>
        <p>Pilih tugas yang benar-benar membantu menyelesaikan masalah tersebut.</p>
        <div class="option-grid" id="decompOptions">
          ${tasks.map(([t])=>`<button class="select-card" data-task="${t}">${t}</button>`).join("")}
        </div>
        <div class="feedback" id="decompFeedback">Pilih beberapa bagian masalah.</div>
        <div id="decompTree" class="tree hidden">
          <div class="tree-root">Kegiatan Kelas</div>
          <div class="tree-branches" id="decompBranches"></div>
        </div>
      </div>`;
    const selected = new Set();
    const feedback = container.querySelector("#decompFeedback");
    const branches = container.querySelector("#decompBranches");
    const tree = container.querySelector("#decompTree");
    container.querySelectorAll(".select-card").forEach((btn, idx)=>{
      btn.addEventListener("click", ()=>{
        const correct = tasks[idx][1];
        if(!correct){
          btn.classList.add("incorrect");
          feedback.className = "feedback warn";
          feedback.textContent = "Belum tepat. Apakah informasi itu benar-benar diperlukan untuk menyiapkan kegiatan kelas?";
          return;
        }
        btn.classList.toggle("selected");
        if(btn.classList.contains("selected")) selected.add(tasks[idx][0]); else selected.delete(tasks[idx][0]);
        branches.innerHTML = [...selected].map(x=>`<div class="tree-branch">${x}</div>`).join("");
        tree.classList.toggle("hidden", selected.size === 0);
        if(selected.size >= 4){
          feedback.className = "feedback success";
          feedback.innerHTML = "✓ Kamu memecah satu masalah besar menjadi beberapa bagian yang lebih kecil. Strategi ini disebut <strong>dekomposisi</strong>.";
          container.querySelectorAll(".select-card").forEach((b,i)=>{if(tasks[i][1]) b.classList.add("correct")});
          done();
        } else {
          feedback.className = "feedback";
          feedback.textContent = `Sudah menemukan ${selected.size} bagian. Cari bagian penting lainnya.`;
        }
      });
    });
  }
};
