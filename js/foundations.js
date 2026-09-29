
const FoundationsModule = {
  render(container, done){
    const items = [
      {
        key:"decomposition",
        icon:"🧩",
        title:"Dekomposisi",
        short:"Memecah masalah besar menjadi bagian-bagian yang lebih kecil agar lebih mudah diselesaikan.",
        question:"Apa yang bisa dipecah menjadi bagian yang lebih kecil?",
        example:"Menyiapkan majalah kelas dibagi menjadi menulis, menggambar, mengedit, dan mencetak."
      },
      {
        key:"pattern",
        icon:"🔍",
        title:"Pengenalan Pola",
        short:"Menemukan kesamaan, keteraturan, atau kecenderungan dari beberapa kejadian atau masalah.",
        question:"Apa yang sama, berulang, atau memiliki cara penyelesaian serupa?",
        example:"Menyadari bahwa setiap Senin jalan menuju sekolah biasanya lebih ramai."
      },
      {
        key:"abstraction",
        icon:"🎯",
        title:"Abstraksi",
        short:"Memilih informasi yang penting dan mengabaikan detail yang tidak diperlukan untuk menyelesaikan masalah.",
        question:"Informasi mana yang benar-benar dibutuhkan?",
        example:"Saat mencari alamat sekolah, cukup memperhatikan nama jalan dan lokasi penting, bukan warna setiap rumah."
      },
      {
        key:"algorithm",
        icon:"🧭",
        title:"Algoritma",
        short:"Urutan langkah yang logis, jelas, dan teratur untuk menyelesaikan suatu tugas atau masalah.",
        question:"Langkah apa yang harus dilakukan dan bagaimana urutannya?",
        example:"Menuliskan langkah membuat mi instan dari menyiapkan air hingga makanan siap disajikan."
      }
    ];
    let opened = new Set();
    container.innerHTML = `
      <div class="activity-card">
        <div class="sticky-objective">🎯 Tujuan: Kenali empat fondasi berpikir komputasional melalui definisi singkat dan contoh.</div>
        <p>Tekan setiap kartu. Setelah semua kartu dibuka, lanjutkan ke latihan.</p>
        <div class="foundation-grid" id="foundationGrid">
          ${items.map((x,i)=>`
            <button class="foundation-card" data-i="${i}">
              <span class="foundation-icon">${x.icon}</span>
              <strong>${x.title}</strong>
              <span class="foundation-prompt">${x.question}</span>
              <div class="foundation-detail hidden">
                <p>${x.short}</p>
                <div class="mini-example"><strong>Contoh:</strong> ${x.example}</div>
              </div>
            </button>`).join("")}
        </div>
        <div id="foundationFeedback" class="feedback">Buka keempat fondasi satu per satu.</div>
      </div>`;
    const feedback = container.querySelector("#foundationFeedback");
    container.querySelectorAll(".foundation-card").forEach(card=>{
      card.addEventListener("click",()=>{
        const i = Number(card.dataset.i);
        opened.add(i);
        card.classList.add("selected");
        card.querySelector(".foundation-detail").classList.remove("hidden");
        if(opened.size===items.length){
          feedback.className="feedback success";
          feedback.textContent="✓ Empat fondasi sudah kamu buka. Sekarang gunakan fondasi tersebut untuk mengenali berbagai situasi.";
          done();
        } else {
          feedback.className="feedback";
          feedback.textContent=`${opened.size} dari ${items.length} fondasi sudah dibuka.`;
        }
      });
    });
  }
};
