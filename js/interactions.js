(() => {
  let initialized = false;
  let dragValue = null;

  const $ = id => document.getElementById(id);

  function selectSingle(button) {
    const group = button.closest('.tap-choice-group');
    if (!group) return;
    group.querySelectorAll('.tap-choice').forEach(btn => {
      btn.classList.toggle('selected', btn === button);
      btn.setAttribute('aria-pressed', btn === button ? 'true' : 'false');
    });
    group.dataset.selected = button.dataset.value ?? button.textContent.trim();
    window.AppUtilities?.beep?.(500, .03);
  }

  function toggleMulti(button) {
    const selected = !button.classList.contains('selected');
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', selected ? 'true' : 'false');
    window.AppUtilities?.beep?.(selected ? 520 : 360, .025);
  }

  function selectedValue(id) {
    return $(id)?.dataset.selected ?? '';
  }

  function selectedValues(id) {
    const root = $(id);
    if (!root) return [];
    return [...root.querySelectorAll('.select-chip.selected')]
      .map(btn => Number(btn.dataset.value))
      .filter(Number.isFinite)
      .sort((a,b) => a-b);
  }

  function sameValues(id, expected) {
    const actual = selectedValues(id);
    const target = [...expected].sort((a,b) => a-b);
    return actual.length === target.length && actual.every((v, i) => v === target[i]);
  }

  function activeSlot(board) {
    return board?.querySelector('.number-slot.active-slot') || null;
  }

  function activateSlot(slot) {
    const board = slot.closest('.match-board');
    if (!board) return;
    board.querySelectorAll('.number-slot').forEach(s => s.classList.toggle('active-slot', s === slot));
  }

  function restorePreviousCard(board, value) {
    if (!value) return;
    const card = [...board.querySelectorAll('.number-card')].find(c => c.dataset.value === String(value));
    if (card) {
      card.disabled = false;
      card.classList.remove('used');
    }
  }

  function placeNumber(slot, value) {
    const board = slot.closest('.match-board');
    if (!board || !value) return;
    restorePreviousCard(board, slot.dataset.value);
    slot.dataset.value = String(value);
    slot.textContent = String(value);
    slot.classList.add('filled');
    activateSlot(slot);
    const card = [...board.querySelectorAll('.number-card')].find(c => c.dataset.value === String(value) && !c.disabled);
    if (card) {
      card.disabled = true;
      card.classList.add('used');
    }
    const slots = [...board.querySelectorAll('.number-slot')];
    const next = slots.find(s => !s.dataset.value);
    if (next) activateSlot(next);
    else slots.forEach(s => s.classList.remove('active-slot'));
    window.AppUtilities?.beep?.(540, .03);
  }

  function useNumberCard(card) {
    const board = card.closest('.match-board');
    if (!board || card.disabled) return;
    let slot = activeSlot(board);
    if (!slot) slot = [...board.querySelectorAll('.number-slot')].find(s => !s.dataset.value);
    if (!slot) {
      window.Navigation?.toast?.('Ketuk salah satu kotak angka untuk menggantinya.');
      return;
    }
    placeNumber(slot, card.dataset.value);
  }

  function resetMatching(board) {
    board.querySelectorAll('.number-slot').forEach((slot, i) => {
      delete slot.dataset.value;
      slot.textContent = '?';
      slot.classList.remove('filled','valid','invalid','active-slot');
      if (i === 0) slot.classList.add('active-slot');
    });
    board.querySelectorAll('.number-card').forEach(card => {
      card.disabled = false;
      card.classList.remove('used');
    });
  }

  function initMatchingDefaults() {
    document.querySelectorAll('.match-board').forEach(board => {
      const first = board.querySelector('.number-slot');
      if (first) first.classList.add('active-slot');
    });
  }

  function bind() {
    document.addEventListener('click', e => {
      const single = e.target.closest('.tap-choice');
      if (single) selectSingle(single);

      const multi = e.target.closest('.select-chip');
      if (multi) toggleMulti(multi);

      const slot = e.target.closest('.number-slot');
      if (slot) activateSlot(slot);

      const card = e.target.closest('.number-card');
      if (card) useNumberCard(card);

      const reset = e.target.closest('[data-reset-match]');
      if (reset) {
        const board = reset.closest('.match-board');
        if (board) resetMatching(board);
      }
    });

    document.addEventListener('dragstart', e => {
      const card = e.target.closest('.number-card');
      if (!card || card.disabled) return;
      dragValue = card.dataset.value;
      e.dataTransfer?.setData('text/plain', dragValue);
      if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
      card.classList.add('dragging');
    });
    document.addEventListener('dragend', e => {
      e.target.closest('.number-card')?.classList.remove('dragging');
      dragValue = null;
      document.querySelectorAll('.number-slot').forEach(slot => slot.classList.remove('drag-over'));
    });
    document.addEventListener('dragover', e => {
      const slot = e.target.closest('.number-slot');
      if (!slot) return;
      e.preventDefault();
      slot.classList.add('drag-over');
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
    });
    document.addEventListener('dragleave', e => {
      e.target.closest('.number-slot')?.classList.remove('drag-over');
    });
    document.addEventListener('drop', e => {
      const slot = e.target.closest('.number-slot');
      if (!slot) return;
      e.preventDefault();
      slot.classList.remove('drag-over');
      const value = e.dataTransfer?.getData('text/plain') || dragValue;
      if (value) placeNumber(slot, value);
    });
  }

  function init() {
    if (initialized) return;
    initialized = true;
    initMatchingDefaults();
    bind();
  }

  window.ChoiceUI = { init, selectedValue, selectedValues, sameValues, resetMatching };
})();
