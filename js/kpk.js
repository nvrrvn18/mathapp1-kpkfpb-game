(() => {
  let initialized = false;
  const $ = id => document.getElementById(id);
  const feedback = (id, ok, msg) => {
    const el = $(id);
    if (!el) return;
    el.className = 'feedback ' + (ok ? 'correct' : 'wrong');
    el.textContent = msg;
  };


  function selectedNumbers(id) {
    const root = $(id);
    if (!root) return [];
    return [...root.querySelectorAll('.select-chip.selected')]
      .map(btn => Number(btn.dataset.value))
      .filter(Number.isFinite)
      .sort((a, b) => a - b);
  }

  function selectedSingleNumber(id) {
    const root = $(id);
    const selected = root?.querySelector('.tap-choice.selected');
    return selected ? Number(selected.dataset.value) : NaN;
  }

  function sameNumberSet(id, expected) {
    const actual = selectedNumbers(id);
    const target = [...expected].sort((a, b) => a - b);
    return actual.length === target.length && actual.every((value, index) => value === target[index]);
  }

  function updatePrimeTray(gridId, trayId) {
    const grid = $(gridId);
    const tray = $(trayId);
    if (!grid || !tray) return;
    const labels = [...grid.querySelectorAll('.select-chip.selected')].map(btn => btn.dataset.label || btn.textContent.trim());
    tray.innerHTML = labels.length
      ? `<span>Dipilih:</span> ${labels.map(label => `<b>${label}</b>`).join('<i aria-hidden="true">×</i>')}`
      : 'Belum ada faktor yang dipilih.';
  }

  function parseProduct(text) {
    if (!text) return NaN;
    const s = String(text).toLowerCase().replace(/\s/g, '').replace(/×|x/g, '*').replace(/²/g, '^2').replace(/³/g, '^3');
    const parts = s.split('*').filter(Boolean);
    let product = 1;
    for (const p of parts) {
      const m = p.match(/^(\d+)(?:\^(\d+))?$/);
      if (!m) return NaN;
      product *= Math.pow(Number(m[1]), Number(m[2] || 1));
    }
    return product;
  }

  function renderNumberLine(id, step, max = 24) {
    const root = $(id);
    if (!root) return;
    root.innerHTML = '';
    for (let n = 0; n <= max; n += step) {
      const p = document.createElement('span');
      p.className = 'number-point' + ([12, 24].includes(n) ? ' common' : '');
      p.textContent = n;
      root.appendChild(p);
    }
  }

  function updateA1Flow() {
    const state = LearnProgress.get().activity1;
    const keys = ['jump', 'multiples', 'prime', 'application'];
    document.querySelectorAll('#activity1Flow span').forEach((el, i) => {
      if (i === 0 || state[keys[i - 1]]) el.classList.add('done');
      else el.classList.remove('done');
    });
    if (state.completed) {
      $('activity1Complete')?.classList.remove('hidden');
      $('activity1Next').disabled = false;
    }
  }

  function startLampSimulation() {
    const btn = $('startLampSimulation');
    if (!btn || btn.disabled) return;
    btn.disabled = true;
    $('lampResult')?.classList.add('hidden');
    let t = 0;
    let timer = null;
    const step = () => {
      $('lampTimer').textContent = t;
      const a = t % 4 === 0;
      const b = t % 6 === 0;
      $('lampA').classList.toggle('on', a);
      $('lampB').classList.toggle('on', b);
      if (a && b) {
        $('lampStatus').textContent = t === 0 ? 'Keduanya mulai bersama.' : `Keduanya menyala bersama pada detik ke-${t}!`;
      } else {
        $('lampStatus').textContent = a ? 'Lampu A menyala.' : b ? 'Lampu B menyala.' : 'Amati kelipatannya...';
      }
      if ((a || b) && window.AppUtilities?.beep) AppUtilities.beep(a && b ? 660 : 460, .055);
      if (t === 12) document.getElementById('lampSimulationCard')?.classList.add('first-meeting-flash');
      if (t === 24) {
        clearInterval(timer);
        setTimeout(() => {
          $('lampResult')?.classList.remove('hidden');
          LearnProgress.setFlag('meeting1', 'simulation');
          btn.disabled = false;
          btn.textContent = '↻ Ulangi Simulasi';
          document.getElementById('lampSimulationCard')?.classList.remove('first-meeting-flash');
        }, 300);
      }
      t += 1;
    };
    step();
    timer = setInterval(step, 300);
  }

  function animateLines() {
    const pts = [...document.querySelectorAll('#lineFour .number-point,#lineSix .number-point')];
    pts.forEach(p => p.classList.remove('visible'));
    pts.forEach((p, i) => setTimeout(() => p.classList.add('visible'), i * 120));
    setTimeout(() => LearnProgress.setFlag('meeting1', 'pattern'), Math.min(1800, pts.length * 120));
  }

  function checkMeeting1PrimeConcept() {
    updatePrimeTray('m1PrimePick', 'm1PrimePicked');
    const ok = sameNumberSet('m1PrimePick', [4, 9]);
    feedback('meeting1PrimeFeedback', ok, ok ? '✓ Tepat. Faktor yang dipakai adalah 2² dan 3² karena keduanya memiliki pangkat terbesar untuk faktor prima yang muncul.' : 'Belum tepat. Dari 2² dan 2¹ pilih 2². Dari 3¹ dan 3² pilih 3².');
    $('meeting1PrimeResult')?.classList.toggle('hidden', !ok);
  }

  function checkJump() {
    const ok = sameNumberSet('a1Continue4', [12, 16, 20, 24]) && sameNumberSet('a1Continue6', [18, 24, 30]);
    feedback('jumpFeedback', ok, ok ? '✓ Benar. Kelipatan diteruskan dengan menambah bilangan yang sama secara teratur.' : 'Belum tepat. Untuk kelipatan 4 tambah 4 setiap langkah, dan untuk kelipatan 6 tambah 6 setiap langkah.');
    if (ok) {
      LearnProgress.setFlag('activity1', 'jump');
      updateA1Flow();
    }
  }

  function checkMultiples() {
    const m3Ok = sameNumberSet('a1m3', [3, 6, 9, 12, 15]);
    const m5Ok = sameNumberSet('a1m5', [5, 10, 15]);
    const kpk = selectedSingleNumber('a1kpk35');
    const ok = m3Ok && m5Ok && kpk === 15;
    let message = 'Periksa lagi pilihanmu.';
    if (!m3Ok) message = 'Kelipatan 3 yang tersedia adalah 3, 6, 9, 12, dan 15.';
    else if (!m5Ok) message = 'Kelipatan 5 yang tersedia adalah 5, 10, dan 15.';
    else if (kpk !== 15) message = 'Daftar kelipatan sudah benar. Sekarang pilih kelipatan pertama yang sama, yaitu 15.';
    feedback('a1MultiplesFeedback', ok, ok ? '✓ Benar. Kelipatan persekutuan terkecil dari 3 dan 5 adalah 15.' : message);
    if (ok) {
      LearnProgress.setFlag('activity1', 'multiples');
      updateA1Flow();
    }
  }

  function treesReady(ids) {
    return ids.every(id => parseProduct($(id)?.value) === Number($(id)?.closest('.factor-builder')?.dataset.number));
  }

  function refreshPrimeTreeStage() {
    const ready = treesReady(['a1f8', 'a1f12']);
    const stage = $('a1PrimeSelectionStage');
    stage?.classList.toggle('hidden', !ready);
    stage?.classList.toggle('ready-stage', ready);
    if (ready && !stage?.dataset.announced) {
      stage.dataset.announced = '1';
      Navigation?.toast?.('Kedua pohon selesai. Pilihan faktor prima sudah muncul.');
    }
    if (ready) validatePrimeSelection();
  }

  function validatePrimeSelection() {
    if (!treesReady(['a1f8', 'a1f12'])) return;
    updatePrimeTray('a1PrimeSelect', 'a1PrimePicked');
    const selected = selectedNumbers('a1PrimeSelect');
    const ok = selected.length === 2 && selected.includes(8) && selected.includes(3);
    $('a1PrimeAutoResult')?.classList.toggle('hidden', !ok);
    if (selected.length) feedback('a1PrimeFeedback', ok, ok ? '✓ Tepat. 2³ dan 3 langsung membentuk KPK = 24.' : 'Belum tepat. Pilih 2³ sebagai pangkat terbesar untuk faktor 2, lalu pilih faktor prima 3.');
    if (ok) {
      LearnProgress.setFlag('activity1', 'prime');
      updateA1Flow();
    }
  }

  function refreshBusTreeStage() {
    const ready = treesReady(['a1bus6', 'a1bus8']);
    const stage = $('a1BusPrimeStage');
    stage?.classList.toggle('hidden', !ready);
    stage?.classList.toggle('ready-stage', ready);
    if (ready && !stage?.dataset.announced) {
      stage.dataset.announced = '1';
      Navigation?.toast?.('Pohon faktor selesai. Pilihan faktor prima sudah muncul.');
    }
    if (ready) validateBusPrimeSelection();
  }

  function validateBusPrimeSelection() {
    if (!treesReady(['a1bus6', 'a1bus8'])) return;
    updatePrimeTray('a1BusPrimeSelect', 'a1BusPrimePicked');
    const selected = selectedNumbers('a1BusPrimeSelect');
    const ok = selected.length === 2 && selected.includes(8) && selected.includes(3);
    $('a1BusAutoResult')?.classList.toggle('hidden', !ok);
    if (selected.length) feedback('a1BusFeedback', ok, ok ? '✓ Benar. 2³ × 3 = 24, jadi kedua bus datang bersama lagi setelah 24 menit.' : 'Belum tepat. Dari faktor 2 pilih 2³, lalu sertakan faktor prima 3.');
    if (ok) {
      LearnProgress.setFlag('activity1', 'application');
      updateA1Flow();
    }
  }

  function saveReflection() {
    const ok = !!ChoiceUI.selectedValue('a1Reflection');
    feedback('a1ReflectionFeedback', ok, ok ? '✓ Pilihan refleksimu tersimpan.' : 'Pilih satu cara yang paling membantumu memahami KPK.');
    if (ok) {
      LearnProgress.setFlag('activity1', 'reflection');
      updateA1Flow();
      if (LearnProgress.get().activity1.completed) AppUtilities?.confetti?.();
    }
  }

  function bindMeeting1() {
    renderNumberLine('lineFour', 4, 24);
    renderNumberLine('lineSix', 6, 24);
    $('startLampSimulation')?.addEventListener('click', startLampSimulation);
    $('animateNumberLines')?.addEventListener('click', animateLines);
    $('checkMeeting1PrimeConcept')?.addEventListener('click', checkMeeting1PrimeConcept);
    $('m1PrimePick')?.addEventListener('click', () => setTimeout(() => updatePrimeTray('m1PrimePick', 'm1PrimePicked'), 0));
    $('checkAlarmAnswer')?.addEventListener('click', () => {
      const ok = Number(ChoiceUI.selectedValue('alarmChoices')) === 40;
      feedback('alarmFeedback', ok, ok ? '✓ Benar! Kelipatan pertama yang sama dari 5 dan 8 adalah 40.' : 'Belum tepat. Gunakan petunjuk untuk membandingkan kelipatan 5 dan 8.');
      if (ok) LearnProgress.setFlag('meeting1', 'challenge');
    });
    $('alarmHintBtn')?.addEventListener('click', () => feedback('alarmFeedback', false, 'Petunjuk: bayangkan urutan 5, 10, 15, ... dan 8, 16, 24, ... lalu cari pertemuan pertamanya.'));
  }

  function bindActivity1() {
    document.querySelector('[data-check-group="jump"]')?.addEventListener('click', checkJump);
    $('checkA1Multiples')?.addEventListener('click', checkMultiples);
    $('saveA1Reflection')?.addEventListener('click', saveReflection);
    ['a1f8', 'a1f12'].forEach(id => $(id)?.addEventListener('change', refreshPrimeTreeStage));
    ['a1bus6', 'a1bus8'].forEach(id => $(id)?.addEventListener('change', refreshBusTreeStage));
    $('a1PrimeSelect')?.addEventListener('click', () => setTimeout(validatePrimeSelection, 0));
    $('a1BusPrimeSelect')?.addEventListener('click', () => setTimeout(validateBusPrimeSelection, 0));
    refreshPrimeTreeStage();
    refreshBusTreeStage();
    updateA1Flow();
  }

  function init() {
    if (initialized) return;
    initialized = true;
    bindMeeting1();
    bindActivity1();
  }

  window.KPKModule = { init, updateA1Flow, parseProduct };
})();
