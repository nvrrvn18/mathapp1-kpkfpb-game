
const FoundationActivitiesModule = {
  render(container, done){
    const state = {stage:0, completed:new Set()};
    const totalStages = 3;

    const foundations = [
      {key:"decomposition",label:"Dekomposisi"},
      {key:"pattern",label:"Pengenalan Pola"},
      {key:"abstraction",label:"Abstraksi"},
      {key:"algorithm",label:"Algoritma"}
    ];

    const matchingPool = [
      ["Memecah tugas membuat majalah kelas menjadi menulis, menggambar, mengedit, dan mencetak.","decomposition"],
      ["Menyadari bahwa setiap hari Senin jalan menuju sekolah lebih ramai daripada hari lainnya.","pattern"],
      ["Saat mencari alamat sekolah, cukup memperhatikan nama jalan dan lokasi penting, bukan warna setiap rumah.","abstraction"],
      ["Menuliskan langkah membuat mi instan dari menyiapkan air hingga makanan siap disajikan.","algorithm"],
      ["Membagi kegiatan membersihkan kelas menjadi menyapu, mengepel, menghapus papan tulis, dan membuang sampah.","decomposition"],
      ["Menemukan bahwa beberapa soal matematika dapat diselesaikan menggunakan cara yang sama.","pattern"],
      ["Memilih jadwal keberangkatan dan tujuan ketika naik bus serta mengabaikan informasi yang tidak diperlukan.","abstraction"],
      ["Menentukan urutan langkah untuk menghidupkan komputer dengan benar.","algorithm"]
    ];

    const quickPool = [
      {
        q:"Berpikir komputasional adalah cara berpikir yang digunakan untuk ...",
        options:[
          ["menghafalkan semua informasi",false],
          ["menyelesaikan masalah secara logis dan sistematis",true],
          ["menggunakan komputer sepanjang waktu",false],
          ["mempelajari bahasa pemrograman saja",false]
        ]
      },
      {
        q:"Memecah masalah besar menjadi bagian yang lebih kecil disebut ...",
        options:[
          ["algoritma",false],["abstraksi",false],["dekomposisi",true],["pengenalan pola",false]
        ]
      },
      {
        q:"Kemampuan menemukan kesamaan dari beberapa masalah disebut ...",
        options:[
          ["dekomposisi",false],["pengenalan pola",true],["abstraksi",false],["algoritma",false]
        ]
      },
      {
        q:"Memilih informasi penting dan mengabaikan informasi yang tidak diperlukan disebut ...",
        options:[
          ["abstraksi",true],["algoritma",false],["pengenalan pola",false],["dekomposisi",false]
        ]
      },
      {
        q:"Langkah-langkah yang tersusun secara logis dan berurutan disebut ...",
        options:[
          ["pola",false],["informasi",false],["algoritma",true],["dekomposisi",false]
        ]
      },
      {
        q:"Sinta mengetahui jalan utama selalu macet pada pukul 07.00 lalu memilih jalan lain. Strategi yang paling terkait adalah ...",
        options:[
          ["pengenalan pola",true],["dekomposisi",false],["abstraksi",false],["algoritma",false]
        ]
      },
      {
        q:"Untuk menentukan apakah perlu membawa payung, informasi yang paling penting adalah ...",
        options:[
          ["warna payung",false],["ramalan hujan",true],["nama presenter TV",false],["merek telepon genggam",false]
        ]
      }
    ];

    const tfPool = [
      ["Berpikir komputasional hanya dapat digunakan ketika menggunakan komputer.",false],
      ["Dekomposisi berarti memecah masalah menjadi beberapa bagian kecil.",true],
      ["Pengenalan pola digunakan untuk menemukan persamaan atau kecenderungan.",true],
      ["Abstraksi berarti menggunakan semua informasi yang tersedia.",false],
      ["Algoritma merupakan langkah-langkah yang disusun secara berurutan.",true],
      ["Berpikir komputasional dapat diterapkan dalam kegiatan sehari-hari.",true],
      ["Langkah dalam algoritma boleh disusun secara acak.",false]
    ];

    function shuffle(arr){
      const a=[...arr];
      for(let i=a.length-1;i>0;i--){
        const j=Math.floor(Math.random()*(i+1));
        [a[i],a[j]]=[a[j],a[i]];
      }
      return a;
    }

    function sample(arr,n){ return shuffle(arr).slice(0,Math.min(n,arr.length)); }

    const matching = sample(matchingPool,4);
    const quick = sample(quickPool,4);
    const tf = sample(tfPool,4);

    const app = document.createElement("div");
    app.className = "activity-card";
    container.innerHTML = "";
    container.appendChild(app);

    function top(title, subtitle){
      return `
        <div class="sticky-objective">🎯 Latihan Singkat ${state.stage+1} dari ${totalStages}: ${title}</div>
        <p>${subtitle}</p>
        <div class="progress-track"><div class="progress-fill" style="width:${(state.stage/totalStages)*100}%"></div></div>`;
    }

    function stageDone(){
      state.completed.add(state.stage);
      if(state.stage === totalStages-1) done();
      const btn=app.querySelector("#activityNext");
      if(btn) btn.disabled=false;
    }

    function nextButton(){
      return `<div class="substage-actions"><button id="activityNext" class="primary-btn" disabled>${state.stage===totalStages-1?"Selesai":"Lanjut →"}</button></div>`;
    }

    function bindNext(){
      const btn=app.querySelector("#activityNext");
      if(!btn) return;
      btn.addEventListener("click",()=>{
        if(!state.completed.has(state.stage)) return;
        if(state.stage < totalStages-1){
          state.stage++;
          renderStage();
        }
      });
    }

    function shuffledFoundationButtons(){
      const ordered=shuffle(foundations);
      return ordered.map((f,i)=>`
        <button class="answer-chip" data-key="${f.key}">
          <span>${String.fromCharCode(65+i)}</span>${f.label}
        </button>`).join("");
    }

    function renderMatching(){
      let current=0, correct=0;
      app.innerHTML = top(
        "Cocokkan Situasi",
        "Hanya 4 pernyataan. Pilihan fondasi berubah urutan setiap kali soal tampil."
      ) + `
        <div class="question-counter" id="matchCounter"></div>
        <div class="statement-card" id="matchStatement"></div>
        <div class="answer-bank" id="matchAnswers"></div>
        <div id="matchFeedback" class="feedback">Pilih fondasi yang paling sesuai.</div>
        ${nextButton()}`;

      const statement=app.querySelector("#matchStatement");
      const counter=app.querySelector("#matchCounter");
      const feedback=app.querySelector("#matchFeedback");
      const answers=app.querySelector("#matchAnswers");

      function show(){
        counter.textContent=`Pernyataan ${current+1} dari ${matching.length}`;
        statement.textContent=matching[current][0];
        answers.innerHTML=shuffledFoundationButtons();
        answers.querySelectorAll(".answer-chip").forEach(btn=>{
          btn.addEventListener("click",()=>{
            const ok=btn.dataset.key===matching[current][1];
            if(ok){
              correct++;
              btn.classList.add("correct");
              answers.querySelectorAll(".answer-chip").forEach(x=>x.disabled=true);
              feedback.className="feedback success";
              feedback.textContent="✓ Tepat.";
              setTimeout(()=>{
                current++;
                if(current>=matching.length){
                  statement.classList.add("hidden");
                  answers.classList.add("hidden");
                  counter.textContent="Aktivitas selesai.";
                  feedback.textContent=`✓ ${correct} dari ${matching.length} tepat.`;
                  stageDone();
                }else show();
              },420);
            }else{
              btn.classList.add("incorrect");
              feedback.className="feedback warn";
              feedback.textContent="Belum tepat. Fokus pada tindakan utama dalam situasi.";
            }
          });
        });
      }
      show();
      bindNext();
    }

    function renderQuick(){
      let current=0, correct=0;
      app.innerHTML = top(
        "Cek Pemahaman",
        "Empat soal singkat dipilih secara acak. Posisi jawaban benar juga diacak."
      ) + `
        <div id="quickArea"></div>
        ${nextButton()}`;

      const area=app.querySelector("#quickArea");

      function show(){
        const item=quick[current];
        const options=shuffle(item.options);
        area.innerHTML=`
          <div class="question-counter">Soal ${current+1} dari ${quick.length}</div>
          <h3>${item.q}</h3>
          <div class="option-grid">
            ${options.map((o,i)=>`
              <button class="select-card" data-correct="${o[1] ? "1" : "0"}">
                <strong>${String.fromCharCode(65+i)}.</strong> ${o[0]}
              </button>`).join("")}
          </div>
          <div class="feedback">Pilih satu jawaban.</div>`;

        const fb=area.querySelector(".feedback");
        area.querySelectorAll(".select-card").forEach(btn=>{
          btn.addEventListener("click",()=>{
            const ok=btn.dataset.correct==="1";
            if(ok){
              correct++;
              btn.classList.add("correct");
              area.querySelectorAll(".select-card").forEach(x=>x.disabled=true);
              fb.className="feedback success";
              fb.textContent="✓ Benar!";
              setTimeout(()=>{
                current++;
                if(current>=quick.length){
                  area.innerHTML=`<div class="feedback success">✓ Cek pemahaman selesai. ${correct} dari ${quick.length} tepat.</div>`;
                  stageDone();
                }else show();
              },420);
            }else{
              btn.classList.add("incorrect");
              fb.className="feedback warn";
              fb.textContent="Belum tepat. Coba hubungkan pilihan dengan definisi fondasinya.";
            }
          });
        });
      }
      show();
      bindNext();
    }

    function renderTF(){
      const answers=new Map();
      const items=shuffle(tf);
      app.innerHTML = top(
        "Benar atau Salah",
        "Empat pernyataan terakhir. Urutannya berubah setiap kali aktivitas dibuka."
      ) + `
        <div class="tf-list">
          ${items.map(([q],i)=>`
            <div class="tf-row" data-i="${i}">
              <span><strong>${i+1}.</strong> ${q}</span>
              <div class="tf-actions">
                <button class="tf-btn" data-v="true">✓ Benar</button>
                <button class="tf-btn" data-v="false">✕ Salah</button>
              </div>
            </div>`).join("")}
        </div>
        <button id="checkTF" class="primary-btn" style="margin-top:16px">Periksa Semua</button>
        <div id="tfFeedback" class="feedback">Jawab semua pernyataan.</div>
        ${nextButton()}`;

      app.querySelectorAll(".tf-row").forEach(row=>{
        row.querySelectorAll(".tf-btn").forEach(btn=>{
          btn.addEventListener("click",()=>{
            row.querySelectorAll(".tf-btn").forEach(x=>x.classList.remove("selected"));
            btn.classList.add("selected");
            answers.set(Number(row.dataset.i),btn.dataset.v==="true");
          });
        });
      });

      app.querySelector("#checkTF").addEventListener("click",()=>{
        const fb=app.querySelector("#tfFeedback");
        if(answers.size<items.length){
          fb.className="feedback warn";
          fb.textContent=`Masih ada ${items.length-answers.size} pernyataan yang belum dijawab.`;
          return;
        }
        let correct=0;
        app.querySelectorAll(".tf-row").forEach(row=>{
          const i=Number(row.dataset.i);
          const ok=answers.get(i)===items[i][1];
          if(ok) correct++;
          row.classList.toggle("correct-row",ok);
          row.classList.toggle("incorrect-row",!ok);
        });

        if(correct===items.length){
          fb.className="feedback success";
          fb.textContent=`✓ Semua tepat. ${correct} dari ${items.length} benar.`;
        }else{
          fb.className="feedback warn";
          fb.textContent=`${correct} dari ${items.length} tepat. Tinjau baris yang ditandai.`;
        }
        stageDone();
      });

      bindNext();
    }

    function renderStage(){
      window.scrollTo({top:0,behavior:"smooth"});
      if(state.stage===0) renderMatching();
      if(state.stage===1) renderQuick();
      if(state.stage===2) renderTF();
    }

    renderStage();
  }
};
