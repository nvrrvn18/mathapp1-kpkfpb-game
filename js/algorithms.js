
const AlgorithmModule = {
  render(container, done){
    let steps = [
      "Masukkan mi ke air mendidih",
      "Rebus air",
      "Masukkan bumbu ke mangkuk",
      "Tuang mi yang sudah matang",
      "Sajikan"
    ];
    const target = [
      "Rebus air",
      "Masukkan mi ke air mendidih",
      "Masukkan bumbu ke mangkuk",
      "Tuang mi yang sudah matang",
      "Sajikan"
    ];
    function renderList(){
      const list = container.querySelector("#sequenceList");
      list.innerHTML = steps.map((s,i)=>`
        <div class="sequence-item">
          <button class="step-card">${i+1}. ${s}</button>
          <div class="sequence-controls">
            <button data-dir="-1" data-i="${i}" aria-label="Naikkan langkah">↑</button>
            <button data-dir="1" data-i="${i}" aria-label="Turunkan langkah">↓</button>
          </div>
        </div>`).join("");
      list.querySelectorAll(".sequence-controls button").forEach(btn=>{
        btn.addEventListener("click", ()=>{
          const i = Number(btn.dataset.i), d = Number(btn.dataset.dir), j = i + d;
          if(j < 0 || j >= steps.length) return;
          [steps[i],steps[j]] = [steps[j],steps[i]];
          renderList();
        });
      });
    }
    container.innerHTML = `
      <div class="activity-card">
        <div class="sticky-objective">🎯 Tujuan: Susun langkah agar proses dapat dijalankan dengan masuk akal.</div>
        <h3>Susun langkah membuat mi instan</h3>
        <p>Gunakan tombol ↑ dan ↓ agar nyaman di HP.</p>
        <div id="sequenceList" class="sequence-list"></div>
        <button id="checkSequence" class="primary-btn" style="margin-top:14px">Jalankan Langkah</button>
        <div class="feedback" id="sequenceFeedback">Urutan langkah belum diperiksa.</div>
      </div>`;
    renderList();
    container.querySelector("#checkSequence").addEventListener("click", ()=>{
      const ok = steps.every((x,i)=>x===target[i]);
      const fb = container.querySelector("#sequenceFeedback");
      if(ok){
        fb.className="feedback success";
        fb.innerHTML="✓ Urutan dapat dijalankan dengan baik. Rangkaian langkah yang jelas dan teratur untuk menyelesaikan masalah disebut <strong>algoritma</strong>.";
        done();
      }else{
        fb.className="feedback warn";
        fb.textContent="Urutannya belum tepat. Perhatikan langkah yang harus terjadi sebelum mi dimasak.";
      }
    });
  }
};
