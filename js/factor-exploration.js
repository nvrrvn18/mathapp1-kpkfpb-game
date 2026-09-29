(() => {
  'use strict';

  const q = (sel, root = document) => root.querySelector(sel);
  const qa = (sel, root = document) => [...root.querySelectorAll(sel)];
  const card = q('#factorExplorationCard');
  if (!card) return;

  const factorSets = {
    6:  { pairs: [[1,6],[2,3],[3,2],[6,1]], factors: '1, 2, 3, dan 6' },
    8:  { pairs: [[1,8],[2,4],[4,2],[8,1]], factors: '1, 2, 4, dan 8' },
    10: { pairs: [[1,10],[2,5],[5,2],[10,1]], factors: '1, 2, 5, dan 10' },
    12: { pairs: [[1,12],[2,6],[3,4],[4,3],[6,2],[12,1]], factors: '1, 2, 3, 4, 6, dan 12' }
  };

  const primeSets = {
    3: [[1,3],[3,1]],
    5: [[1,5],[5,1]]
  };

  let step = 0;
  let compositeNumber = 6;
  let primeNumber = 3;
  const seenFour = new Set();
  const seenComposite = new Set();
  const seenPrime = new Set();

  const steps = qa('[data-factor-step]', card);
  const dots = qa('[data-factor-step-dot]', card);
  const prevBtn = q('#factorExplorePrev');
  const nextBtn = q('#factorExploreNext');
  const complete = q('#factorExploreComplete');

  function state() { return window.LearnProgress?.get?.().factorIntro || {}; }

  function renderGrid(target, rows, cols, number) {
    const el = q(target);
    if (!el) return;
    el.innerHTML = '';
    el.classList.toggle('compact-array', Math.max(rows, cols) >= 10);
    el.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;
    el.style.gridTemplateRows = `repeat(${rows}, auto)`;
    el.dataset.rows = rows;
    el.dataset.cols = cols;
    for (let i = 0; i < number; i++) {
      const cell = document.createElement('span');
      cell.className = 'factor-cell';
      cell.style.animationDelay = `${Math.min(i * 35, 280)}ms`;
      el.appendChild(cell);
    }
  }

  function setCaption(target, rows, cols, number) {
    const cap = q(target);
    if (!cap) return;
    cap.innerHTML = `<strong>${rows} × ${cols} = ${number}</strong> &nbsp;•&nbsp; ${number} kotak tersusun tanpa sisa.`;
  }

  function markFlag(key) {
    if (!state()[key]) window.LearnProgress?.setFlag?.('factorIntro', key, true);
  }

  function updateFourProgress() {
    if (seenFour.has('1x4') && seenFour.has('2x2')) markFlag('four');
    updateStepGate();
  }

  function updateCompositeProgress() {
    const required = [6,8,10,12];
    const missing = required.filter(n => !seenComposite.has(n));
    const text = q('#factorCompositeProgressText');
    if (text) {
      text.textContent = missing.length
        ? `Sudah diamati: ${required.filter(n=>seenComposite.has(n)).join(', ') || 'belum ada'}. Coba juga bilangan ${missing.join(', ')}.`
        : '✓ Kamu sudah mengamati 6, 8, 10, dan 12. Sekarang bandingkan pasangan faktornya.';
      text.classList.toggle('done', !missing.length);
    }
    if (!missing.length) markFlag('composites');
    updateStepGate();
  }

  function updatePrimeProgress() {
    const text = q('#factorPrimeProgressText');
    const done = seenPrime.has(3) && seenPrime.has(5);
    if (text) {
      text.textContent = done
        ? '✓ Bilangan 3 dan 5 sudah diamati. Keduanya hanya memiliki faktor 1 dan bilangan itu sendiri.'
        : 'Setelah mengamati 3, ketuk bilangan 5 untuk menyelesaikan bagian ini.';
      text.classList.toggle('done', done);
    }
    if (done) markFlag('primes');
    updateStepGate();
  }

  function renderFour(rows = 1, cols = 4, countAsSeen = false) {
    renderGrid('#factorFourGrid', rows, cols, 4);
    setCaption('#factorFourCaption', rows, cols, 4);
    if (countAsSeen) {
      seenFour.add(`${rows}x${cols}`);
      updateFourProgress();
    }
  }

  function renderCompositeChoices(number, countAsSeen = false) {
    compositeNumber = number;
    const holder = q('#factorCompositeChoices');
    const badge = q('#factorExploreNumberBadge');
    const info = factorSets[number];
    if (!holder || !info) return;
    badge.textContent = number;
    holder.innerHTML = info.pairs.map(([r,c], i) => `<button class="factor-arrangement-btn${i === 0 ? ' active' : ''}" type="button" data-composite-pair data-rows="${r}" data-cols="${c}">${r} × ${c}</button>`).join('');
    q('#factorCompositeFactors').innerHTML = `<strong>Faktor dari ${number}:</strong> ${info.factors}.`;
    const [r,c] = info.pairs[0];
    renderGrid('#factorCompositeGrid', r, c, number);
    setCaption('#factorCompositeCaption', r, c, number);
    if (countAsSeen) {
      seenComposite.add(number);
      updateCompositeProgress();
    }
  }

  function renderPrimeChoices(number, countAsSeen = false) {
    primeNumber = number;
    const holder = q('#primeArrangementChoices');
    const pairs = primeSets[number];
    if (!holder || !pairs) return;
    holder.innerHTML = pairs.map(([r,c], i) => `<button class="factor-arrangement-btn${i === 0 ? ' active' : ''}" type="button" data-prime-pair data-rows="${r}" data-cols="${c}">${r} × ${c}</button>`).join('');
    const [r,c] = pairs[0];
    renderGrid('#primeFactorGrid', r, c, number);
    setCaption('#primeFactorCaption', r, c, number);
    q('#primeConclusion').innerHTML = `<span>⭐</span><div><strong>${number} adalah bilangan prima.</strong><p>Susunan yang mungkin hanya memakai faktor positif <strong>1 dan ${number}</strong>. Jadi ${number} hanya memiliki dua faktor positif.</p></div>`;
    if (countAsSeen) {
      seenPrime.add(number);
      updatePrimeProgress();
    }
  }

  function updateStepGate() {
    if (!nextBtn) return;
    const s = state();
    const labels = ['Mulai Contoh →','Lanjut Eksplorasi →','Lihat Bilangan Prima →','Selesaikan Materi Awal ✓'];
    nextBtn.textContent = labels[step];
    if (s.completed) {
      nextBtn.textContent = 'Materi Awal Selesai ✓';
      nextBtn.disabled = true;
      complete?.classList.remove('hidden');
      return;
    }
    complete?.classList.add('hidden');
    if (step === 0) nextBtn.disabled = false;
    if (step === 1) nextBtn.disabled = !s.four;
    if (step === 2) nextBtn.disabled = !s.composites;
    if (step === 3) nextBtn.disabled = !s.primes;
  }

  function showStep(next, scroll = true) {
    step = Math.max(0, Math.min(steps.length - 1, next));
    steps.forEach((el, i) => el.classList.toggle('active', i === step));
    dots.forEach((el, i) => {
      el.classList.toggle('active', i === step && !state().completed);
      el.classList.toggle('done', i < step || state().completed);
    });
    prevBtn.disabled = step === 0;

    if (step === 1) {
      seenFour.add('1x4');
      renderFour(1,4,false);
      updateFourProgress();
    }
    if (step === 2) {
      seenComposite.add(6);
      renderCompositeChoices(compositeNumber, false);
      updateCompositeProgress();
    }
    if (step === 3) {
      seenPrime.add(3);
      renderPrimeChoices(primeNumber, false);
      updatePrimeProgress();
    }
    updateStepGate();
    if (scroll) card.scrollIntoView({behavior:'smooth', block:'start'});
  }

  q('#factorFourChoices')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-factor-number="4"]');
    if (!btn) return;
    qa('.factor-arrangement-btn', q('#factorFourChoices')).forEach(b => b.classList.toggle('active', b === btn));
    const rows = Number(btn.dataset.rows), cols = Number(btn.dataset.cols);
    renderFour(rows, cols, true);
  });

  q('#factorNumberSwitch')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-explore-number]');
    if (!btn) return;
    qa('button', q('#factorNumberSwitch')).forEach(b => b.classList.toggle('active', b === btn));
    renderCompositeChoices(Number(btn.dataset.exploreNumber), true);
  });

  q('#factorCompositeChoices')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-composite-pair]');
    if (!btn) return;
    qa('.factor-arrangement-btn', q('#factorCompositeChoices')).forEach(b => b.classList.toggle('active', b === btn));
    const rows = Number(btn.dataset.rows), cols = Number(btn.dataset.cols);
    renderGrid('#factorCompositeGrid', rows, cols, compositeNumber);
    setCaption('#factorCompositeCaption', rows, cols, compositeNumber);
  });

  q('#primeNumberSwitch')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-prime-number]');
    if (!btn) return;
    qa('button', q('#primeNumberSwitch')).forEach(b => b.classList.toggle('active', b === btn));
    renderPrimeChoices(Number(btn.dataset.primeNumber), true);
  });

  q('#primeArrangementChoices')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-prime-pair]');
    if (!btn) return;
    qa('.factor-arrangement-btn', q('#primeArrangementChoices')).forEach(b => b.classList.toggle('active', b === btn));
    const rows = Number(btn.dataset.rows), cols = Number(btn.dataset.cols);
    renderGrid('#primeFactorGrid', rows, cols, primeNumber);
    setCaption('#primeFactorCaption', rows, cols, primeNumber);
  });

  prevBtn?.addEventListener('click', () => showStep(step - 1));
  nextBtn?.addEventListener('click', () => {
    const s = state();
    if (step === 0) return showStep(1);
    if (step === 1 && s.four) return showStep(2);
    if (step === 2 && s.composites) return showStep(3);
    if (step === 3 && s.primes) {
      window.LearnProgress?.setFlag?.('factorIntro', 'finish', true);
      dots.forEach(d => { d.classList.remove('active'); d.classList.add('done'); });
      complete?.classList.remove('hidden');
      nextBtn.textContent = 'Materi Awal Selesai ✓';
      nextBtn.disabled = true;
      window.AppUtilities?.confetti?.();
    }
  });

  function initialiseFromProgress() {
    const s = state();
    seenFour.clear(); seenComposite.clear(); seenPrime.clear();
    if (s.four) ['1x4','2x2'].forEach(x=>seenFour.add(x));
    if (s.composites) [6,8,10,12].forEach(x=>seenComposite.add(x));
    if (s.primes) [3,5].forEach(x=>seenPrime.add(x));

    if (s.completed || s.primes) step = 3;
    else if (s.composites) step = 3;
    else if (s.four) step = 2;
    else step = 0;

    compositeNumber = 6;
    primeNumber = 3;
    renderFour();
    renderCompositeChoices(6, false);
    renderPrimeChoices(3, false);
    showStep(step, false);
    if (s.completed) {
      complete?.classList.remove('hidden');
      dots.forEach(d => { d.classList.remove('active'); d.classList.add('done'); });
    }
  }

  window.addEventListener('learning-progress-changed', () => {
    const s = state();
    if (!s.four && !s.composites && !s.primes && !s.finish && (seenFour.size || seenComposite.size || seenPrime.size)) {
      initialiseFromProgress();
    } else {
      updateStepGate();
    }
  });

  window.addEventListener('screen-changed', e => {
    if (e.detail?.screen === 'factorIntro') updateStepGate();
  });

  initialiseFromProgress();
})();
