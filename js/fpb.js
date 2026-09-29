(() => {
  let initialized = false;
  const $ = id => document.getElementById(id);
  const feedback = (id, ok, msg) => {
    const el = $(id);
    if (!el) return;
    el.className = 'feedback ' + (ok ? 'correct' : 'wrong');
    el.textContent = msg;
  };

  const pairState = new Map();
  let draggedPair = null;
  let selectedObject = null;
  let draggedObject = null;

  function renderFruit() {
    if ($('oranges')) $('oranges').innerHTML = '🍊'.repeat(12);
    if ($('apples')) $('apples').innerHTML = '🍎'.repeat(18);
    renderPackageDemo();
  }

  function renderPackageDemo() {
    const root = $('packageDemo');
    if (!root) return;
    root.innerHTML = Array.from({length: 6}, (_, i) => `<div class="demo-package" style="animation-delay:${i * .07}s">📦<span>🍊🍊</span><span>🍎🍎🍎</span></div>`).join('');
  }

  function groupFruit() {
    const root = $('fruitPackages');
    if (!root) return;
    root.classList.remove('hidden');
    root.innerHTML = Array.from({length: 6}, (_, i) => `<div class="fruit-package" style="animation-delay:${i * .08}s"><strong>Paket ${i + 1}</strong><span>🍊🍊</span><span>🍎🍎🍎</span></div>`).join('');
    $('fruitGroupResult')?.classList.remove('hidden');
    LearnProgress.setFlag('meeting2', 'grouped');
  }

  function pairKey(group, left, right) {
    return `${group}:${left}:${right}`;
  }

  function useFactorPair(button) {
    if (!button || button.dataset.used === '1') return;
    const group = button.dataset.pairGroup;
    const left = button.dataset.left;
    const right = button.dataset.right;
    const drop = document.querySelector(`[data-pair-drop="${group}"]`);
    if (!group || !left || !right || !drop) return;
    const key = pairKey(group, left, right);
    if (pairState.has(key)) return;

    pairState.set(key, true);
    button.dataset.used = '1';
    button.setAttribute('aria-pressed', 'true');
    button.classList.add('used');

    if (drop.dataset.hasPairs !== '1') {
      drop.innerHTML = '';
      drop.dataset.hasPairs = '1';
    }

    const pair = document.createElement('div');
    pair.className = 'revealed-factor-pair';
    pair.dataset.pairKey = key;
    const total = group.replace('a2-', '');
    pair.innerHTML = `<span>${left}</span><i aria-hidden="true">→</i><span>${right}</span><small>${left} × ${right} = ${total}</small>`;
    drop.appendChild(pair);
    drop.classList.add('pair-has-result');
    window.AppUtilities?.beep?.(530, .03);
    updatePairStages(group);
  }

  function groupComplete(group) {
    const buttons = [...document.querySelectorAll(`[data-pair-group="${group}"]`)];
    return buttons.length > 0 && buttons.every(btn => btn.dataset.used === '1');
  }

  function updatePairStages(group) {
    if (['12', '18'].includes(group) && groupComplete('12') && groupComplete('18')) {
      $('factorCommon')?.classList.remove('hidden');
      LearnProgress.setFlag('meeting2', 'factors');
    }
    if (['a2-24', 'a2-36'].includes(group) && groupComplete('a2-24') && groupComplete('a2-36')) {
      $('a2FpbChoiceStage')?.classList.remove('hidden');
      $('a2FpbChoiceStage')?.classList.add('ready-stage');
      Navigation?.toast?.('Pasangan faktor lengkap. Pilih faktor persekutuan yang paling besar.');
    }
  }

  const conceptItems = [
    {q: 'Dua alarm berbunyi setiap 4 dan 10 menit. Kapan bersama lagi?', a: 'kpk'},
    {q: '24 buku dibagi ke kelompok sama besar sebanyak mungkin.', a: 'fpb'},
    {q: 'Dua jadwal kegiatan berulang setiap 6 dan 9 hari. Kapan bertemu lagi?', a: 'kpk'}
  ];
  const conceptAnswers = {};

  function renderConceptQuiz() {
    const root = $('conceptCards');
    if (!root) return;
    root.innerHTML = conceptItems.map((it, i) => `<div class="concept-question"><span>${it.q}</span><div class="choice-row"><button class="choice-btn" data-concept-index="${i}" data-value="kpk" type="button">KPK</button><button class="choice-btn" data-concept-index="${i}" data-value="fpb" type="button">FPB</button></div></div>`).join('');
  }

  function handleConceptChoice(btn) {
    const i = Number(btn.dataset.conceptIndex), value = btn.dataset.value;
    conceptAnswers[i] = value;
    document.querySelectorAll(`[data-concept-index="${i}"]`).forEach(b => {
      b.classList.remove('selected', 'correct', 'wrong');
      if (b === btn) b.classList.add(value === conceptItems[i].a ? 'correct' : 'wrong');
    });
    if (Object.keys(conceptAnswers).length === conceptItems.length && conceptItems.every((it, j) => conceptAnswers[j] === it.a)) LearnProgress.setFlag('meeting2', 'concepts');
  }

  function breadChoice() {
    document.querySelectorAll('#breadChoice .choice-btn').forEach(btn => btn.addEventListener('click', () => {
      document.querySelectorAll('#breadChoice .choice-btn').forEach(b => b.classList.toggle('selected', b === btn));
      $('breadChoice').dataset.selected = btn.dataset.value;
    }));
    $('checkBreadChoice')?.addEventListener('click', () => {
      const value = $('breadChoice').dataset.selected, reason = ChoiceUI.selectedValue('breadReason');
      if (!value) {
        feedback('breadFeedback', false, 'Pilih KPK atau FPB terlebih dahulu.');
        return;
      }
      const ok = value === 'fpb' && reason === 'groups';
      feedback('breadFeedback', ok, ok ? '✓ Tepat. FPB digunakan karena kita mencari jumlah paket sama banyak yang paling banyak.' : value !== 'fpb' ? 'Masalah ini tentang membagi benda menjadi paket yang sama, bukan mencari waktu pertemuan.' : 'Pilihan FPB sudah tepat. Sekarang pilih alasan yang sesuai.');
      if (ok) LearnProgress.setFlag('meeting2', 'challenge');
    });
  }

  function updateA2Flow() {
    const s = LearnProgress.get().activity2, keys = ['grouping', 'factors', 'strategy', 'stories'];
    document.querySelectorAll('#activity2Flow span').forEach((el, i) => {
      if (i === 0 || s[keys[i - 1]]) el.classList.add('done');
      else el.classList.remove('done');
    });
    if (s.completed) {
      $('activity2Complete')?.classList.remove('hidden');
      $('activity2Next').disabled = false;
    }
  }

  function objectMarkup(kind, id) {
    if (kind === 'pencil') return `<button class="move-object pencil-object" draggable="true" data-object-id="${id}" data-kind="pencil" type="button" aria-label="Pensil"><span aria-hidden="true">✏️</span></button>`;
    return `<button class="move-object eraser-object" draggable="true" data-object-id="${id}" data-kind="eraser" type="button" aria-label="Penghapus"><span class="eraser-shape" aria-hidden="true"></span></button>`;
  }

  function renderMoveObjects() {
    const source = $('moveObjectSource');
    if (!source) return;
    if (!source.querySelector('.move-object')) {
      source.insertAdjacentHTML('beforeend', Array.from({length: 4}, (_, i) => objectMarkup('pencil', `p${i + 1}`)).join('') + Array.from({length: 6}, (_, i) => objectMarkup('eraser', `e${i + 1}`)).join(''));
    }
    source.classList.add('objects-ready');
    selectedObject = null;
    updateObjectBins();
  }

  function selectMoveObject(obj) {
    if (!obj) return;
    selectedObject = obj;
    document.querySelectorAll('.move-object').forEach(el => el.classList.toggle('selected-object', el === obj));
  }

  function moveObjectToBin(obj, bin) {
    if (!obj || !bin) return;
    bin.querySelector('.bin-objects')?.appendChild(obj);
    selectedObject = null;
    document.querySelectorAll('.move-object').forEach(el => el.classList.remove('selected-object'));
    obj.classList.add('object-moved');
    setTimeout(() => obj.classList.remove('object-moved'), 350);
    updateObjectBins();
    window.AppUtilities?.beep?.(500, .025);
  }

  function updateObjectBins() {
    document.querySelectorAll('.move-package-bin').forEach(bin => {
      const pencils = bin.querySelectorAll('.move-object[data-kind="pencil"]').length;
      const erasers = bin.querySelectorAll('.move-object[data-kind="eraser"]').length;
      let badge = bin.querySelector('.bin-count');
      if (!badge) {
        badge = document.createElement('small');
        badge.className = 'bin-count';
        bin.appendChild(badge);
      }
      badge.textContent = `✏️ ${pencils}  •  Penghapus ${erasers}`;
    });
  }

  function checkGrouping() {
    const bins = [...document.querySelectorAll('.move-package-bin')];
    const sourceLeft = $('moveObjectSource')?.querySelectorAll('.move-object').length || 0;
    const ok = sourceLeft === 0 && bins.length === 2 && bins.every(bin => bin.querySelectorAll('.move-object[data-kind="pencil"]').length === 2 && bin.querySelectorAll('.move-object[data-kind="eraser"]').length === 3);
    feedback('a2GroupingFeedback', ok, ok ? '✓ Benar. Semua benda terbagi rata: tiap paket berisi 2 pensil dan 3 penghapus.' : 'Belum rata. Setiap paket harus berisi 2 pensil dan 3 penghapus, dan tidak boleh ada benda tersisa.');
    $('a2GroupingResult')?.classList.toggle('hidden', !ok);
    if (ok) {
      LearnProgress.setFlag('activity2', 'grouping');
      updateA2Flow();
    }
  }

  function treesReady(ids) {
    const p = KPKModule.parseProduct;
    return ids.every(id => p($(id)?.value) === Number($(id)?.closest('.factor-builder')?.dataset.number));
  }

  function refreshA2TreeStage() {
    const ready = treesReady(['a2f24', 'a2f36']);
    const stage = $('a2PairStage');
    stage?.classList.toggle('hidden', !ready);
    stage?.classList.toggle('ready-stage', ready);
    if (ready && !stage?.dataset.announced) {
      stage.dataset.announced = '1';
      Navigation?.toast?.('Pohon faktor selesai. Pasangan faktor sudah bisa dipilih.');
    }
  }

  function validateA2FpbChoice() {
    if (!groupComplete('a2-24') || !groupComplete('a2-36')) return;
    const selected = $('a2fpb2436')?.querySelector('.tap-choice.selected');
    const value = selected ? Number(selected.dataset.value) : NaN;
    if (!Number.isFinite(value)) return;
    const ok = value === 12;
    feedback('a2FactorsFeedback', ok, ok ? '✓ Benar. 12 adalah faktor persekutuan terbesar. Dari faktorisasi prima, 2² dan 3 adalah pangkat terkecil yang sama.' : 'Belum tepat. Bandingkan semua faktor yang muncul pada 24 dan 36, lalu pilih yang sama dan paling besar.');
    $('a2PrimeMinimum')?.classList.toggle('hidden', !ok);
    if (ok) {
      LearnProgress.setFlag('activity2', 'factors');
      updateA2Flow();
    }
  }

  const strategies = [
    {q: 'Dua alarm berbunyi setiap 4 menit dan 10 menit. Kapan berbunyi bersama lagi?', a: 'KPK'},
    {q: '20 kue dan 30 permen dibagi ke paket yang sama banyak.', a: 'FPB'},
    {q: 'Dua petugas bekerja setiap 6 hari dan 9 hari. Kapan bekerja bersama lagi?', a: 'KPK'}
  ];
  const strategyAnswers = {};

  function renderStrategyQuiz() {
    const root = $('strategyQuiz');
    if (!root) return;
    root.innerHTML = strategies.map((s, i) => `<div class="strategy-row"><span>${s.q}</span><div class="choice-row"><button class="choice-btn" data-strategy="${i}" data-value="KPK" type="button">KPK</button><button class="choice-btn" data-strategy="${i}" data-value="FPB" type="button">FPB</button></div></div>`).join('');
  }

  function strategyClick(btn) {
    const i = Number(btn.dataset.strategy), v = btn.dataset.value;
    strategyAnswers[i] = v;
    document.querySelectorAll(`[data-strategy="${i}"]`).forEach(b => {
      b.classList.remove('correct', 'wrong', 'selected');
      if (b === btn) b.classList.add(v === strategies[i].a ? 'correct' : 'wrong');
    });
    const all = strategies.every((s, j) => strategyAnswers[j] === s.a);
    feedback('strategyFeedback', all, all ? '✓ Ketiga strategi sudah tepat.' : 'Gunakan KPK untuk kejadian berulang yang bertemu lagi, FPB untuk membagi sama banyak sebanyak mungkin.');
    if (all) {
      LearnProgress.setFlag('activity2', 'strategy');
      updateA2Flow();
    }
  }

  function checkStories() {
    const bus = Number(ChoiceUI.selectedValue('a2BusAnswer')), pack = Number(ChoiceUI.selectedValue('a2PackAnswer'));
    const s1 = ChoiceUI.selectedValue('a2BusStrategy'), s2 = ChoiceUI.selectedValue('a2PackStrategy');
    const ok = bus === 24 && pack === 12 && s1 === 'KPK' && s2 === 'FPB';
    feedback('a2StoriesFeedback', ok, ok ? '✓ Kedua masalah sudah dipasangkan dengan strategi dan hasil yang tepat.' : 'Cocokkan dulu jenis masalahnya: kejadian berulang memakai KPK, pembagian paket terbanyak memakai FPB.');
    if (ok) {
      LearnProgress.setFlag('activity2', 'stories');
      updateA2Flow();
    }
  }

  function saveReflection() {
    const rows = [...document.querySelectorAll('#a2Reflection [data-reflection-row]')];
    const answered = rows.every(row => row.querySelector('.tap-choice-group')?.dataset.selected);
    const ok = answered && rows.every(row => row.querySelector('.tap-choice-group')?.dataset.selected === row.dataset.answer);
    rows.forEach(row => {
      const group = row.querySelector('.tap-choice-group');
      const pass = group?.dataset.selected === row.dataset.answer;
      row.classList.toggle('match-correct', !!group?.dataset.selected && pass);
      row.classList.toggle('match-wrong', !!group?.dataset.selected && !pass);
    });
    feedback('a2ReflectionFeedback', ok, ok ? '✓ Semua pasangan tepat. Ringkasan konsep ditampilkan di bawah.' : answered ? 'Masih ada pasangan yang tertukar. Ingat: KPK untuk bertemu kembali, FPB untuk membagi sama banyak.' : 'Lengkapi semua pasangan KPK atau FPB.');
    if (ok) {
      $('reflectionSummary').classList.remove('hidden');
      LearnProgress.setFlag('activity2', 'reflection');
      updateA2Flow();
      if (LearnProgress.get().activity2.completed) AppUtilities?.confetti?.();
    }
  }

  function bindPairInteractions() {
    document.querySelectorAll('.factor-pair-source').forEach(source => {
      source.addEventListener('click', () => useFactorPair(source));
      source.addEventListener('dragstart', e => {
        if (source.dataset.used === '1') {
          e.preventDefault();
          return;
        }
        draggedPair = source;
        e.dataTransfer?.setData('text/plain', source.dataset.pairGroup || '');
        if (e.dataTransfer) e.dataTransfer.effectAllowed = 'copy';
        source.classList.add('dragging');
      });
      source.addEventListener('dragend', () => {
        source.classList.remove('dragging');
        draggedPair = null;
        document.querySelectorAll('.factor-pair-drop').forEach(zone => zone.classList.remove('drag-over'));
      });
    });

    document.querySelectorAll('.factor-pair-drop').forEach(zone => {
      zone.addEventListener('dragover', e => {
        if (!draggedPair || zone.dataset.pairDrop !== draggedPair.dataset.pairGroup) return;
        e.preventDefault();
        zone.classList.add('drag-over');
        if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
      });
      zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
      zone.addEventListener('drop', e => {
        if (!draggedPair || zone.dataset.pairDrop !== draggedPair.dataset.pairGroup) return;
        e.preventDefault();
        zone.classList.remove('drag-over');
        useFactorPair(draggedPair);
      });
    });
  }

  function bindObjectInteractions() {
    document.querySelectorAll('.move-object').forEach(obj => {
      obj.addEventListener('click', () => selectMoveObject(obj));
      obj.addEventListener('dragstart', e => {
        draggedObject = obj;
        obj.classList.add('dragging');
        e.dataTransfer?.setData('text/plain', obj.dataset.objectId || '');
        if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
      });
      obj.addEventListener('dragend', () => {
        obj.classList.remove('dragging');
        draggedObject = null;
        document.querySelectorAll('.move-package-bin').forEach(bin => bin.classList.remove('drag-over'));
      });
    });

    document.querySelectorAll('.move-package-bin').forEach(bin => {
      bin.addEventListener('click', e => {
        if (e.target.closest('.move-object')) return;
        if (selectedObject) moveObjectToBin(selectedObject, bin);
      });
      bin.addEventListener('keydown', e => {
        if ((e.key === 'Enter' || e.key === ' ') && selectedObject) {
          e.preventDefault();
          moveObjectToBin(selectedObject, bin);
        }
      });
      bin.addEventListener('dragover', e => {
        if (!draggedObject) return;
        e.preventDefault();
        bin.classList.add('drag-over');
        if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
      });
      bin.addEventListener('dragleave', () => bin.classList.remove('drag-over'));
      bin.addEventListener('drop', e => {
        if (!draggedObject) return;
        e.preventDefault();
        bin.classList.remove('drag-over');
        moveObjectToBin(draggedObject, bin);
      });
    });
  }

  function bind() {
    renderFruit();
    renderConceptQuiz();
    renderStrategyQuiz();
    renderMoveObjects();
    breadChoice();
    bindPairInteractions();
    bindObjectInteractions();

    $('groupFruitBtn')?.addEventListener('click', groupFruit);
    document.addEventListener('click', e => {
      const c = e.target.closest('[data-concept-index]');
      if (c) handleConceptChoice(c);
      const s = e.target.closest('[data-strategy]');
      if (s) strategyClick(s);
    });
    $('checkA2Grouping')?.addEventListener('click', checkGrouping);
    $('a2f24')?.addEventListener('change', refreshA2TreeStage);
    $('a2f36')?.addEventListener('change', refreshA2TreeStage);
    $('a2fpb2436')?.addEventListener('click', () => setTimeout(validateA2FpbChoice, 0));
    $('checkA2Stories')?.addEventListener('click', checkStories);
    $('saveA2Reflection')?.addEventListener('click', saveReflection);
    refreshA2TreeStage();
    updateA2Flow();
  }

  function init() {
    if (initialized) return;
    initialized = true;
    bind();
  }

  window.FPBModule = {init, updateA2Flow};
})();
