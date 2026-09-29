
const FoundationFlowModule = {
  render(container, done){
    const stages = [
      {
        title:"Dekomposisi",
        icon:"🧩",
        accent:"indigo",
        prompt:"Pecah masalah besar menjadi bagian kecil.",
        explain:"Kita tidak langsung menyelesaikan semuanya sekaligus. Masalah dibagi menjadi bagian yang lebih mudah ditangani.",
        visual:`
          <div class="mobile-demo-stack">
            <div class="demo-main">Festival Kelas</div>
            <div class="demo-down">↓</div>
            <div class="demo-grid">
              <span>Tempat</span><span>Jadwal</span><span>Perlengkapan</span><span>Pembagian Tugas</span>
            </div>
          </div>`
      },
      {
        title:"Pengenalan Pola",
        icon:"🔍",
        accent:"cyan",
        prompt:"Cari kesamaan atau hal yang berulang.",
        explain:"Kita membandingkan bagian-bagian masalah dan mencari kebutuhan, bentuk, atau cara penyelesaian yang sama.",
        visual:`
          <div class="mobile-pattern-list">
            <div><strong>Stan A</strong><span>meja + kursi</span></div>
            <div><strong>Stan B</strong><span>meja + kursi</span></div>
            <div><strong>Stan C</strong><span>meja + kursi</span></div>
          </div>
          <div class="pattern-result">🔎 Pola ditemukan: beberapa stan membutuhkan perlengkapan yang sama.</div>`
      },
      {
        title:"Abstraksi",
        icon:"🎯",
        accent:"yellow",
        prompt:"Ambil informasi penting, sisihkan detail yang tidak diperlukan.",
        explain:"Kita menyederhanakan masalah dengan mempertahankan informasi yang membantu mencapai tujuan.",
        visual:`
          <div class="mobile-filter">
            <div class="filter-good"><span>✓ Lokasi stan</span><span>✓ Ukuran ruang</span></div>
            <div class="filter-skip"><span>✕ Warna sepatu panitia</span><span>✕ Merek tas siswa</span></div>
          </div>`
      },
      {
        title:"Algoritma",
        icon:"🧭",
        accent:"teal",
        prompt:"Susun langkah yang jelas dan teratur.",
        explain:"Setelah informasi penting tersedia, kita menyusun tindakan dalam urutan yang dapat dijalankan.",
        visual:`
          <div class="mobile-algo">
            <div><b>1</b><span>Tentukan tempat</span></div>
            <div><b>2</b><span>Susun denah</span></div>
            <div><b>3</b><span>Siapkan perlengkapan</span></div>
            <div><b>4</b><span>Jalankan kegiatan</span></div>
          </div>`
      }
    ];

    let current=0;
    const viewed=new Set([0]);

    container.innerHTML=`
      <div class="activity-card foundation-flow-shell">
        <div class="sticky-objective">🎯 Tujuan: Lihat bagaimana empat fondasi membantu menyelesaikan satu masalah.</div>

        <div class="flow-mobile-header">
          <div class="flow-step-label">Tahap <span id="flowStepNumber">1</span> dari 4</div>
          <div class="flow-step-dots">
            ${stages.map((_,i)=>`<button class="flow-tab ${i===0?"active":""}" data-i="${i}" aria-label="Buka tahap ${i+1}">${i+1}</button>`).join("")}
          </div>
        </div>

        <div id="flowSingleStage" class="flow-single-stage"></div>

        <div class="flow-controls flow-controls-mobile">
          <button id="flowPrev" class="ghost-btn" disabled>← Sebelumnya</button>
          <button id="flowNext" class="primary-btn">Berikutnya →</button>
        </div>

        <div id="flowFeedback" class="feedback">Amati perubahan masalah pada setiap tahap.</div>

        <details class="flow-summary">
          <summary>Lihat ringkasan 4 fondasi</summary>
          <div class="summary-grid">
            ${stages.map((s,i)=>`
              <button class="summary-card" data-i="${i}">
                <span>${s.icon}</span>
                <strong>${s.title}</strong>
                <small>${s.prompt}</small>
              </button>`).join("")}
          </div>
        </details>
      </div>`;

    const stageEl=container.querySelector("#flowSingleStage");
    const feedback=container.querySelector("#flowFeedback");
    const prev=container.querySelector("#flowPrev");
    const next=container.querySelector("#flowNext");
    const number=container.querySelector("#flowStepNumber");

    function renderStage(){
      const s=stages[current];
      viewed.add(current);

      number.textContent=current+1;
      container.querySelectorAll(".flow-tab").forEach((b,i)=>b.classList.toggle("active",i===current));

      stageEl.innerHTML=`
        <div class="single-foundation-card ${s.accent}">
          <div class="single-foundation-head">
            <span class="single-icon">${s.icon}</span>
            <div>
              <span class="eyebrow">Fondasi ${current+1}</span>
              <h3>${s.title}</h3>
            </div>
          </div>

          <div class="single-prompt">${s.prompt}</div>
          <p>${s.explain}</p>

          <div class="single-visual">
            ${s.visual}
          </div>
        </div>`;

      prev.disabled=current===0;
      next.textContent=current===stages.length-1?"Ulangi ↻":"Berikutnya →";

      if(viewed.size===stages.length){
        feedback.className="feedback success";
        feedback.innerHTML="✓ Keempat fondasi sudah diamati. Dalam masalah nyata, fondasi ini tidak harus selalu digunakan dalam urutan yang kaku.";
        done();
      }else{
        feedback.className="feedback";
        feedback.textContent=`${viewed.size} dari ${stages.length} fondasi sudah diamati.`;
      }
    }

    container.querySelectorAll(".flow-tab,.summary-card").forEach(btn=>{
      btn.addEventListener("click",()=>{
        current=Number(btn.dataset.i);
        renderStage();
      });
    });

    prev.addEventListener("click",()=>{
      if(current>0){current--;renderStage();}
    });

    next.addEventListener("click",()=>{
      if(current<stages.length-1) current++;
      else current=0;
      renderStage();
    });

    renderStage();
  }
};
