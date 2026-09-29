
const AbstractionModule = {
  render(container, done){
    const cards = [
      ["Nama jalan", true],
      ["Panjang jalan", true],
      ["Jalan ditutup", true],
      ["Lokasi sekolah", true],
      ["Warna rumah", false],
      ["Nama pemilik toko", false],
      ["Jumlah pohon", false],
      ["Warna kendaraan", false]
    ];
    container.innerHTML = `
      <div class="activity-card">
        <div class="sticky-objective">🎯 Tujuan: Pilih informasi penting untuk mencari rute tercepat ke sekolah.</div>
        <h3>Informasi mana yang benar-benar dibutuhkan?</h3>
        <div class="option-grid" id="abstractionOptions">
          ${cards.map(([x])=>`<button class="select-card">${x}</button>`).join("")}
        </div>
        <div class="feedback" id="absFeedback">Pilih semua informasi yang relevan.</div>
      </div>`;
    const selected = new Set();
    const feedback = container.querySelector("#absFeedback");
    container.querySelectorAll(".select-card").forEach((btn,idx)=>{
      btn.addEventListener("click", ()=>{
        btn.classList.toggle("selected");
        if(btn.classList.contains("selected")) selected.add(idx); else selected.delete(idx);
        const chosenCorrect = [...selected].filter(i=>cards[i][1]).length;
        const chosenWrong = [...selected].filter(i=>!cards[i][1]).length;
        if(chosenCorrect === 4 && chosenWrong === 0){
          feedback.className="feedback success";
          feedback.innerHTML="✓ Tepat. Kamu mengambil informasi yang relevan dan mengabaikan detail yang tidak diperlukan. Strategi ini disebut <strong>abstraksi</strong>.";
          selected.forEach(i=>container.querySelectorAll(".select-card")[i].classList.add("correct"));
          done();
        }else if(chosenWrong > 0){
          feedback.className="feedback warn";
          feedback.textContent="Ada informasi yang tidak memengaruhi rute tercepat. Coba periksa kembali.";
        }else{
          feedback.className="feedback";
          feedback.textContent=`${chosenCorrect} informasi penting sudah dipilih.`;
        }
      });
    });
  }
};
