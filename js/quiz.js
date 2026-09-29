
const QuizModule = {
  questions: [],
  current: 0,
  correct: 0,
  answers: [],

  shuffle(arr){
    const a=[...arr];
    for(let i=a.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [a[i],a[j]]=[a[j],a[i]];
    }
    return a;
  },

  async load(){
    try{
      const res = await fetch("data/questions.json");
      if(!res.ok) throw new Error("Gagal memuat JSON");
      this.questions = await res.json();
    }catch(err){
      console.warn(err);
      this.questions = [
        {id:"fallback1",type:"mc",competency:"decomposition",question:"Memecah masalah besar menjadi bagian kecil disebut...",options:["Dekomposisi","Abstraksi","Pola","Algoritma"],answer:0},
        {id:"fallback2",type:"mc",competency:"algorithm",question:"Urutan langkah yang jelas untuk menyelesaikan masalah disebut...",options:["Pola","Algoritma","Data","Dekomposisi"],answer:1}
      ];
    }
  },

  render(container, done){
    this.current=0;
    this.correct=0;
    this.answers=[];

    const selected=this.shuffle(this.questions).slice(0,Math.min(10,this.questions.length));

    // Prepare each question with shuffled options while preserving correctness.
    this.session=selected.map(q=>{
      const paired=q.options.map((text,index)=>({text,correct:index===q.answer}));
      return {...q,shuffledOptions:this.shuffle(paired)};
    });

    const show=()=>{
      const q=this.session[this.current];

      if(!q){
        const score=Math.round((this.correct/this.session.length)*100);
        const breakdown={};
        this.answers.forEach(a=>{
          if(!breakdown[a.competency]) breakdown[a.competency]={correct:0,total:0};
          breakdown[a.competency].total++;
          if(a.correct) breakdown[a.competency].correct++;
        });

        ProgressStore.setQuiz(score,breakdown);

        container.innerHTML=`
          <div class="score-card">
            <span class="eyebrow">Final Level Selesai</span>
            <div class="score-number">${score}</div>
            <p>Kamu menyelesaikan ${this.session.length} tantangan.</p>
            <button id="viewResultsBtn" class="primary-btn">Lihat Hasil Belajar</button>
          </div>`;

        container.querySelector("#viewResultsBtn").addEventListener("click",()=>{
          done();
          App.showResults();
        });
        return;
      }

      container.innerHTML=`
        <div class="quiz-card">
          <div class="quiz-meta">
            <strong>Tantangan ${this.current+1} dari ${this.session.length}</strong>
            <span>${Math.round((this.current/this.session.length)*100)}%</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" style="width:${(this.current/this.session.length)*100}%"></div>
          </div>
          <h3 style="margin-top:20px">${q.question}</h3>
          <div class="option-grid" id="quizOptions">
            ${q.shuffledOptions.map((o,i)=>`
              <button class="select-card" data-correct="${o.correct ? "1" : "0"}">
                <strong>${String.fromCharCode(65+i)}.</strong> ${o.text}
              </button>`).join("")}
          </div>
          <div class="feedback" id="quizFeedback">Pilih satu jawaban.</div>
        </div>`;

      container.querySelectorAll("#quizOptions .select-card").forEach(btn=>{
        btn.addEventListener("click",()=>{
          const ok=btn.dataset.correct==="1";
          container.querySelectorAll("#quizOptions .select-card").forEach(x=>x.disabled=true);
          btn.classList.add(ok?"correct":"incorrect");

          if(ok) this.correct++;
          this.answers.push({competency:q.competency,correct:ok});

          const fb=container.querySelector("#quizFeedback");
          fb.className=ok?"feedback success":"feedback warn";
          fb.textContent=ok?"✓ Benar!":(q.feedback || "Belum tepat. Perhatikan kembali konsep yang digunakan.");

          setTimeout(()=>{
            this.current++;
            show();
          },850);
        });
      });
    };

    show();
  }
};
