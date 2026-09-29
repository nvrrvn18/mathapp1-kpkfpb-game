(() => {
  let initialized=false,bank=[],session=null;
  const $=id=>document.getElementById(id);
  const fallback=[
    {id:'konsep-1',category:'Konsep Kelipatan',type:'mcq',question:'Manakah yang merupakan kelipatan 6?',options:['14','18','25','32'],answer:'18',hint:'Kelipatan 6 diperoleh dari 6 × 1, 6 × 2, 6 × 3, dan seterusnya.',explanation:'18 = 6 × 3, sehingga 18 merupakan kelipatan 6.'},
    {id:'konsep-2',category:'Konsep Kelipatan',type:'truefalse',question:'Bilangan 24 merupakan kelipatan dari 8.',answer:true,hint:'Coba cari hasil perkalian 8 dengan bilangan bulat positif.',explanation:'24 = 8 × 3.'},
    {id:'konsep-3',category:'Konsep Kelipatan',type:'drag',question:'Susun tiga kelipatan positif pertama dari 4 dari yang terkecil.',options:[12,4,8],answer:[4,8,12],hint:'Mulai dari 4 × 1, lalu 4 × 2, lalu 4 × 3.',explanation:'Tiga kelipatan positif pertama 4 adalah 4, 8, dan 12.'},
    {id:'kpk-1',category:'KPK',type:'number',question:'KPK dari 6 dan 8 adalah ...',answer:24,hint:'Bandingkan kelipatan 6 dan 8 sampai menemukan angka pertama yang sama.',explanation:'Kelipatan persekutuan terkecil 6 dan 8 adalah 24.'},
    {id:'kpk-2',category:'KPK',type:'mcq',question:'Jika 12 = 2² × 3 dan 18 = 2 × 3², bentuk faktorisasi prima KPK(12,18) adalah ...',options:['2 × 3','2² × 3','2 × 3²','2² × 3²'],answer:'2² × 3²',hint:'Untuk KPK, ambil setiap faktor prima dengan pangkat terbesar.',explanation:'Pangkat terbesar untuk 2 adalah 2 dan untuk 3 adalah 2.'},
    {id:'kpk-3',category:'KPK',type:'number',question:'KPK dari 9 dan 12 adalah ...',answer:36,hint:'Kelipatan 9: 9, 18, 27, 36, ... Bandingkan dengan kelipatan 12.',explanation:'36 adalah kelipatan pertama yang sama dari 9 dan 12.'},
    {id:'fpb-1',category:'FPB',type:'number',question:'FPB dari 24 dan 36 adalah ...',answer:12,hint:'Cari faktor terbesar yang dapat membagi 24 dan 36 tanpa sisa.',explanation:'12 membagi 24 dan 36, dan tidak ada faktor persekutuan yang lebih besar.'},
    {id:'fpb-2',category:'FPB',type:'mcq',question:'Untuk mencari FPB dengan faktorisasi prima, pangkat yang dipilih adalah ...',options:['Pangkat terbesar dari semua faktor','Pangkat terkecil dari faktor prima yang sama','Semua pangkat dijumlahkan','Hanya faktor prima terbesar'],answer:'Pangkat terkecil dari faktor prima yang sama',hint:'Bandingkan kembali dengan contoh 12 dan 18.',explanation:'FPB memakai faktor prima yang sama dengan pangkat terkecil.'},
    {id:'fpb-3',category:'FPB',type:'truefalse',question:'FPB dari 18 dan 30 adalah 6.',answer:true,hint:'Faktor persekutuan 18 dan 30 antara lain 1, 2, 3, dan 6.',explanation:'Faktor persekutuan terbesar dari 18 dan 30 adalah 6.'},
    {id:'pilih-1',category:'Pilih Strategi',type:'mcq',question:'Dua alarm berbunyi setiap 5 menit dan 8 menit. Untuk mencari kapan keduanya berbunyi bersama lagi, gunakan ...',options:['KPK','FPB'],answer:'KPK',hint:'Masalah menanyakan dua kejadian berulang yang bertemu kembali.',explanation:'KPK digunakan untuk mencari waktu pertemuan kejadian berulang.'},
    {id:'pilih-2',category:'Pilih Strategi',type:'mcq',question:'20 kue dan 30 permen akan dibagi ke paket sama banyak sebanyak mungkin. Gunakan ...',options:['KPK','FPB'],answer:'FPB',hint:'Masalah menanyakan pembagian ke kelompok sama banyak sebanyak mungkin.',explanation:'FPB digunakan untuk menentukan jumlah kelompok sama banyak yang paling banyak.'},
    {id:'pilih-3',category:'Pilih Strategi',type:'truefalse',question:'Masalah jadwal dua bus yang ingin diketahui kapan datang bersama lagi biasanya diselesaikan dengan FPB.',answer:false,hint:'Pikirkan apakah masalah ini tentang membagi benda atau kejadian berulang.',explanation:'Jadwal berulang yang bertemu lagi menggunakan KPK, bukan FPB.'},
    {id:'cerita-1',category:'Soal Cerita',type:'number',question:'Bus A datang setiap 8 menit dan Bus B setiap 12 menit. Jika sekarang datang bersama, berapa menit lagi keduanya datang bersama?',answer:24,hint:'Cari KPK dari 8 dan 12.',explanation:'KPK(8,12) = 24 menit.'},
    {id:'cerita-2',category:'Soal Cerita',type:'number',question:'Tersedia 24 botol minum dan 36 kotak makanan. Semuanya dibuat menjadi paket sama banyak. Berapa paket terbanyak yang dapat dibuat?',answer:12,hint:'Cari FPB dari 24 dan 36.',explanation:'FPB(24,36) = 12 paket.'},
    {id:'cerita-3',category:'Soal Cerita',type:'mcq',question:'Dua kegiatan berlangsung setiap 6 hari dan 9 hari. Jika hari ini bersamaan, setelah berapa hari keduanya bersamaan lagi?',options:['3 hari','9 hari','18 hari','54 hari'],answer:'18 hari',hint:'Cari KPK dari 6 dan 9.',explanation:'KPK(6,9) = 18 hari.'}
  ];
  const shuffle=a=>{const out=[...a];for(let i=out.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out};
  function numberChoices(answer){const a=Number(answer);const candidates=[a,Math.max(1,Math.round(a/2)),Math.max(1,a-6),a+6,a*2,a+12];const unique=[...new Set(candidates)].filter(n=>n>0);return shuffle(unique).slice(0,4).includes(a)?shuffle(unique.slice(0,4)):shuffle([a,...unique.filter(n=>n!==a).slice(0,3)]);}
  function chooseQuestions(){const categories=['Konsep Kelipatan','KPK','FPB','Pilih Strategi','Soal Cerita'];return shuffle(categories.flatMap(c=>shuffle(bank.filter(q=>q.category===c)).slice(0,2)));}
  async function loadBank(){try{const r=await fetch('data/questions.json',{cache:'no-store'});if(!r.ok)throw new Error();bank=await r.json();}catch{bank=fallback;}}
  function start(){if(!bank.length)bank=fallback;session={questions:chooseQuestions(),index:0,correct:0,answered:false,selected:null,dragOrder:[],category:{}};render();}
  function current(){return session.questions[session.index];}
  function render(){
    const q=current();session.answered=false;session.selected=null;session.dragOrder=[];
    $('quizCounter').textContent=`Soal ${session.index+1} dari ${session.questions.length}`;$('quizCategory').textContent=q.category;$('quizLiveScore').textContent=`${session.correct} benar`;$('quizProgressFill').style.width=`${session.index/session.questions.length*100}%`;
    const area=$('quizQuestionArea');let input='';
    if(q.type==='mcq') input=`<div class="quiz-option-list">${q.options.map(o=>`<button type="button" class="quiz-option" data-quiz-value="${String(o).replace(/"/g,'&quot;')}">${o}</button>`).join('')}</div>`;
    if(q.type==='truefalse') input=`<div class="true-false"><button type="button" class="quiz-option" data-quiz-value="true">Benar</button><button type="button" class="quiz-option" data-quiz-value="false">Salah</button></div>`;
    if(q.type==='number') input=`<p class="tap-instruction">Ketuk jawaban angka yang tepat.</p><div class="quiz-number-grid">${numberChoices(q.answer).map(o=>`<button type="button" class="quiz-option number-option" data-quiz-value="${o}">${o}</button>`).join('')}</div>`;
    if(q.type==='drag') input=`<p>Seret atau ketuk angka sesuai urutan:</p><div class="sort-bank" id="sortBank">${q.options.map((o,i)=>`<button type="button" class="sort-chip" draggable="true" data-sort-value="${o}" data-sort-id="${i}">${o}</button>`).join('')}</div><p><strong>Urutanmu:</strong></p><div class="sort-target" id="sortTarget"></div><button type="button" class="text-btn" id="resetSort">Reset urutan</button>`;
    area.innerHTML=`<div class="quiz-question"><span class="eyebrow">${q.category}</span><h2>${q.question}</h2>${input}</div>`;
    $('quizFeedback').className='feedback';$('quizFeedback').textContent='';$('quizSubmit').classList.remove('hidden');$('quizNext').classList.add('hidden');bindQuestionControls();
  }
  function bindQuestionControls(){
    document.querySelectorAll('[data-quiz-value]').forEach(btn=>btn.addEventListener('click',()=>{if(session.answered)return;document.querySelectorAll('[data-quiz-value]').forEach(b=>b.classList.remove('selected'));btn.classList.add('selected');session.selected=btn.dataset.quizValue;}));
    document.querySelectorAll('.sort-chip').forEach(btn=>{btn.addEventListener('click',()=>moveSort(btn));btn.addEventListener('dragstart',e=>e.dataTransfer.setData('text/plain',btn.dataset.sortId));});
    const target=$('sortTarget');if(target){target.addEventListener('dragover',e=>e.preventDefault());target.addEventListener('drop',e=>{e.preventDefault();const id=e.dataTransfer.getData('text/plain');const chip=document.querySelector(`.sort-chip[data-sort-id="${id}"]`);if(chip)moveSort(chip);});}
    $('resetSort')?.addEventListener('click',()=>{session.dragOrder=[];render();});
  }
  function moveSort(btn){if(session.answered||btn.disabled)return;session.dragOrder.push(Number(btn.dataset.sortValue));btn.disabled=true;const clone=btn.cloneNode(true);clone.disabled=true;clone.classList.add('active');$('sortTarget').appendChild(clone);}
  function readAnswer(q){if(q.type==='number')return session.selected===null?null:Number(session.selected);if(q.type==='truefalse')return session.selected==='true'?true:session.selected==='false'?false:null;if(q.type==='drag')return session.dragOrder;return session.selected;}
  function isCorrect(q,answer){if(q.type==='drag')return Array.isArray(answer)&&answer.length===q.answer.length&&answer.every((v,i)=>v===q.answer[i]);return answer===q.answer;}
  function submit(){if(session.answered)return;const q=current(),answer=readAnswer(q);if(answer===null||answer===''||(Array.isArray(answer)&&answer.length!==q.answer.length)||Number.isNaN(answer)){Navigation.toast('Isi atau pilih jawaban terlebih dahulu.');return;}session.answered=true;const ok=isCorrect(q,answer);if(ok)session.correct++;session.category[q.category]??={correct:0,total:0};session.category[q.category].total++;if(ok)session.category[q.category].correct++;
    const fb=$('quizFeedback');fb.className='feedback '+(ok?'correct':'wrong');fb.textContent=(ok?'✓ Benar. ':'Belum tepat. ')+q.explanation;
    document.querySelectorAll('[data-quiz-value]').forEach(b=>{b.disabled=true;if(String(q.answer)===b.dataset.quizValue)b.classList.add('correct');else if(b.classList.contains('selected'))b.classList.add('wrong')});$('quizSubmit').classList.add('hidden');$('quizNext').classList.remove('hidden');$('quizNext').textContent=session.index===session.questions.length-1?'Lihat Hasil →':'Soal Berikutnya →';$('quizLiveScore').textContent=`${session.correct} benar`;
  }
  function next(){if(!session.answered)return;if(session.index<session.questions.length-1){session.index++;render();}else finish();}
  function finish(){const score=session.correct*10,categoryScores={};for(const [k,v] of Object.entries(session.category))categoryScores[k]=Math.round(v.correct/v.total*100);LearnProgress.updateQuiz({score,categoryScores});renderResult(score,categoryScores);Navigation.navigateTo('result',true);if(score>=80)AppUtilities?.confetti?.();}
  function renderResult(score,cs){$('finalScore').textContent=score;document.querySelector('.score-circle')?.style.setProperty('--score-angle',`${score*3.6}deg`);let title,desc;if(score>=80){title='Sangat Baik';desc='Pemahamanmu sudah kuat. Periksa kembali bagian yang masih belum penuh agar konsep semakin mantap.';}else if(score>=70){title='Baik, sedikit lagi!';desc='Sebagian besar konsep sudah dipahami. Ulangi bagian yang nilainya paling rendah sebelum mencoba lagi.';}else{title='Ayo pelajari kembali';desc='Beberapa konsep masih perlu latihan. Kembali ke materi, amati visualisasi, lalu ulangi evaluasi.';}$('scoreMessage').textContent=title;$('scoreDescription').textContent=desc;
    const groups=[['KPK',cs.KPK??0],['FPB',cs.FPB??0],['Soal Cerita',cs['Soal Cerita']??0]];$('masteryGrid').innerHTML=groups.map(([name,val])=>`<div class="mastery-item"><strong>${name}</strong><small>${val>=80?'✓ Dikuasai':val>=60?'△ Perlu latihan':'○ Pelajari kembali'} • ${val}%</small></div>`).join('');
  }
  function showStoredResult(){const s=LearnProgress.get().quiz;if(s.completed&&s.lastScore!==null)renderResult(s.lastScore,s.categoryScores||{});}
  function bind(){
    $('quizSubmit')?.addEventListener('click',submit);$('quizNext')?.addEventListener('click',next);$('quizHint')?.addEventListener('click',()=>{if(session)Navigation.toast(current().hint)});$('retryQuizBtn')?.addEventListener('click',()=>{start();Navigation.navigateTo('quiz',true)});$('reviewMaterialBtn')?.addEventListener('click',()=>Navigation.navigateTo('meeting1',true));
    window.addEventListener('screen-changed',e=>{if(e.detail.screen==='quiz'&&!session)start();if(e.detail.screen==='result')showStoredResult();});
  }
  async function init(){if(initialized)return;initialized=true;await loadBank();bind();showStoredResult();}
  window.QuizModule={init,start};
})();
