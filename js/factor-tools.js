(() => {
  let initialized = false;
  let activeTarget = null;
  let dragToken = null;
  let treeNumber = null;
  let treeTarget = null;
  let treeRoot = null;
  let nodeId = 0;

  const $ = id => document.getElementById(id);
  const isPrime = n => {
    if (n < 2) return false;
    for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
    return true;
  };
  const superscript = exp => String(exp).split('').map(d => ({'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'}[d] || d)).join('');
  const tokenLabel = token => {
    const [base, exp='1'] = token.split('^');
    return Number(exp) === 1 ? base : `${base}${superscript(exp)}`;
  };
  const tokenProduct = token => {
    const [base, exp='1'] = token.split('^').map(Number);
    return Math.pow(base, exp);
  };
  const factorsFromTokens = tokens => tokens.flatMap(token => {
    const [base, exp='1'] = token.split('^').map(Number);
    return Array.from({length: exp}, () => base);
  });
  const compactFactors = factors => {
    const counts = new Map();
    factors.slice().sort((a,b)=>a-b).forEach(p => counts.set(p, (counts.get(p) || 0) + 1));
    return [...counts.entries()].map(([p,e]) => e === 1 ? String(p) : `${p}^${e}`);
  };
  const prettyExpression = tokens => tokens.length ? tokens.map(tokenLabel).join(' × ') : 'Belum disusun';

  function getTokens(target) {
    const zone = document.querySelector(`[data-factor-drop="${target}"]`);
    if (!zone) return [];
    try { return JSON.parse(zone.dataset.tokens || '[]'); } catch { return []; }
  }
  function setTokens(target, tokens) {
    const zone = document.querySelector(`[data-factor-drop="${target}"]`);
    const input = $(target);
    const builder = zone?.closest('.factor-builder');
    const expected = Number(builder?.dataset.number || 0);
    if (!zone || !input) return;
    zone.dataset.tokens = JSON.stringify(tokens);
    input.value = tokens.join('*');
    renderZone(target, expected);
    input.dispatchEvent(new Event('change', {bubbles:true}));
  }
  function renderZone(target, expected) {
    const zone = document.querySelector(`[data-factor-drop="${target}"]`);
    const status = document.querySelector(`[data-factor-product="${target}"]`);
    if (!zone) return;
    const tokens = getTokens(target);
    zone.innerHTML = '';
    const treeOnly = zone.classList.contains('tree-only-result');
    if (!tokens.length) {
      zone.innerHTML = `<span class="drop-placeholder">${treeOnly ? 'Selesaikan pohon faktor' : 'Ketuk kartu untuk mengisi'}</span>`;
    } else {
      tokens.forEach((token, index) => {
        const chip = document.createElement(treeOnly ? 'span' : 'button');
        if (!treeOnly) chip.type = 'button';
        chip.className = 'dropped-factor' + (treeOnly ? ' readonly-factor' : '');
        if (!treeOnly) {
          chip.dataset.removeFactor = target;
          chip.dataset.factorIndex = String(index);
          chip.setAttribute('aria-label', `Hapus faktor ${tokenLabel(token)}`);
        }
        chip.innerHTML = treeOnly ? `<span>${tokenLabel(token)}</span>` : `<span>${tokenLabel(token)}</span><small aria-hidden="true">×</small>`;
        zone.appendChild(chip);
      });
    }
    const product = factorsFromTokens(tokens).reduce((a,b)=>a*b,1);
    zone.classList.toggle('factor-correct', tokens.length > 0 && product === expected);
    zone.classList.toggle('factor-incomplete', tokens.length > 0 && product !== expected);
    if (status) {
      if (!tokens.length) status.textContent = 'Belum disusun';
      else if (product === expected) status.innerHTML = `✓ ${prettyExpression(tokens)} = <strong>${expected}</strong>`;
      else status.innerHTML = `${prettyExpression(tokens)} = <strong>${product}</strong> • target ${expected}`;
    }
  }
  function selectTarget(target) {
    activeTarget = target;
    document.querySelectorAll('.factor-dropzone').forEach(z => z.classList.toggle('active-dropzone', z.dataset.factorDrop === target));
  }
  function addToken(target, token) {
    if (!target || !token) return;
    const tokens = getTokens(target);
    tokens.push(token);
    setTokens(target, tokens);
    selectTarget(target);
    window.AppUtilities?.beep?.(520,.035);
  }
  function removeToken(target, index) {
    const tokens = getTokens(target);
    tokens.splice(index, 1);
    setTokens(target, tokens);
  }

  function factorPairs(n) {
    const pairs = [];
    for (let a = 2; a <= Math.sqrt(n); a++) if (n % a === 0) pairs.push([a, n/a]);
    return pairs;
  }
  function makeNode(value) { return { id: ++nodeId, value, children: null }; }
  function leaves(node, out=[]) {
    if (!node.children) out.push(node.value);
    else node.children.forEach(c => leaves(c,out));
    return out;
  }
  function findNode(node, id) {
    if (node.id === id) return node;
    if (!node.children) return null;
    return findNode(node.children[0],id) || findNode(node.children[1],id);
  }
  function factorExpressionFromLeaves(vals) {
    return compactFactors(vals).map(tokenLabel).join(' × ');
  }
  function openTree(number, target) {
    treeNumber = Number(number); treeTarget = target; nodeId = 0; treeRoot = makeNode(treeNumber);
    const modal = $('factorTreeModal');
    $('factorTreeTitle').textContent = `Pohon faktor untuk ${treeNumber}`;
    modal?.classList.remove('hidden');
    document.body.classList.add('modal-open');
    renderTree();
    setTimeout(()=>$('closeFactorTree')?.focus(),0);
  }
  function closeTree() {
    $('factorTreeModal')?.classList.add('hidden');
    document.body.classList.remove('modal-open');
  }
  function renderTreeNode(node) {
    const prime = isPrime(node.value);
    const wrapper = document.createElement('div');
    wrapper.className = `tree-node-wrap${prime?' prime-leaf':''}`;
    const box = document.createElement('div');
    box.className = `tree-number${prime?' prime':''}`;
    box.innerHTML = `<strong>${node.value}</strong>${prime?'<small>prima ✓</small>':node.children?'<small>sudah dipecah</small>':'<small>komposit</small>'}`;
    wrapper.appendChild(box);
    if (!prime && !node.children) {
      const pairs = factorPairs(node.value);
      const choices = document.createElement('div');
      choices.className = 'tree-pair-choices';
      if (pairs.length) {
        const caption = document.createElement('span'); caption.textContent = 'Pilih pasangan:'; choices.appendChild(caption);
        pairs.forEach(([a,b]) => {
          const btn = document.createElement('button'); btn.type='button'; btn.className='tree-pair-btn';
          btn.dataset.treeNode = String(node.id); btn.dataset.a=String(a); btn.dataset.b=String(b); btn.textContent=`${a} × ${b}`;
          choices.appendChild(btn);
        });
      }
      wrapper.appendChild(choices);
    }
    if (node.children) {
      const branches = document.createElement('div'); branches.className='tree-branches';
      node.children.forEach(child => branches.appendChild(renderTreeNode(child)));
      wrapper.appendChild(branches);
    }
    return wrapper;
  }
  function renderTree() {
    const workspace = $('factorTreeWorkspace'); const summary = $('factorTreeSummary'); const useBtn = $('useFactorTreeResult');
    if (!workspace || !treeRoot) return;
    workspace.innerHTML=''; workspace.appendChild(renderTreeNode(treeRoot));
    const vals = leaves(treeRoot); const complete = vals.every(isPrime);
    if (complete) {
      summary.className='factor-tree-summary complete';
      summary.innerHTML=`<strong>Semua ujung sudah prima.</strong><span>${treeNumber} = ${factorExpressionFromLeaves(vals)}</span>`;
      useBtn.disabled=false;
      window.AppUtilities?.beep?.(660,.05);
    } else {
      summary.className='factor-tree-summary';
      summary.innerHTML='<strong>Lanjutkan memecah bilangan komposit.</strong><span>Bilangan prima tidak perlu dipecah lagi.</span>';
      useBtn.disabled=true;
    }
  }
  function splitNode(id,a,b) {
    const node=findNode(treeRoot,Number(id)); if(!node || node.children || a*b!==node.value) return;
    node.children=[makeNode(a),makeNode(b)]; renderTree();
  }
  function useTreeResult() {
    if (!treeRoot || !treeTarget) return;
    const vals=leaves(treeRoot); if(!vals.every(isPrime)) return;
    setTokens(treeTarget, compactFactors(vals));
    selectTarget(treeTarget); closeTree();
    Navigation?.toast?.(`Faktorisasi ${treeNumber} dimasukkan ke jawaban.`);
  }

  function bind() {
    document.addEventListener('click', e => {
      const zone=e.target.closest('[data-factor-drop]');
      if(zone && !e.target.closest('[data-remove-factor]')) selectTarget(zone.dataset.factorDrop);
      const card=e.target.closest('.factor-drag-card');
      if(card){
        const activeZone=activeTarget ? document.querySelector(`[data-factor-drop="${activeTarget}"]`) : null;
        if(!activeZone || activeZone.closest('.screen') !== card.closest('.screen')){
          activeTarget=null;
          document.querySelectorAll('.factor-dropzone').forEach(z=>z.classList.remove('active-dropzone'));
          Navigation?.toast?.('Ketuk kotak jawaban terlebih dahulu, lalu pilih kartu faktor.');
          return;
        }
        addToken(activeTarget,card.dataset.factor);
      }
      const remove=e.target.closest('[data-remove-factor]');
      if(remove) removeToken(remove.dataset.removeFactor,Number(remove.dataset.factorIndex));
      const clear=e.target.closest('[data-factor-clear]');
      if(clear) setTokens(clear.dataset.factorClear,[]);
      const treeBtn=e.target.closest('[data-factor-tree-number]');
      if(treeBtn) openTree(treeBtn.dataset.factorTreeNumber,treeBtn.dataset.factorTreeTarget);
      const pair=e.target.closest('[data-tree-node]');
      if(pair) splitNode(pair.dataset.treeNode,Number(pair.dataset.a),Number(pair.dataset.b));
    });
    document.addEventListener('dragstart', e => {
      const card=e.target.closest('.factor-drag-card'); if(!card)return;
      dragToken=card.dataset.factor; card.classList.add('dragging');
      e.dataTransfer?.setData('text/plain',dragToken); if(e.dataTransfer)e.dataTransfer.effectAllowed='copy';
    });
    document.addEventListener('dragend', e => {e.target.closest('.factor-drag-card')?.classList.remove('dragging');dragToken=null;document.querySelectorAll('.factor-dropzone').forEach(z=>z.classList.remove('drag-over'));});
    document.addEventListener('dragover', e => {const zone=e.target.closest('[data-factor-drop]');if(!zone)return;e.preventDefault();zone.classList.add('drag-over');if(e.dataTransfer)e.dataTransfer.dropEffect='copy';});
    document.addEventListener('dragleave', e => {const zone=e.target.closest('[data-factor-drop]');zone?.classList.remove('drag-over');});
    document.addEventListener('drop', e => {const zone=e.target.closest('[data-factor-drop]');if(!zone)return;e.preventDefault();zone.classList.remove('drag-over');const token=e.dataTransfer?.getData('text/plain')||dragToken;if(token)addToken(zone.dataset.factorDrop,token);});
    document.addEventListener('keydown', e => {const zone=e.target.closest?.('[data-factor-drop]');if(zone&&(e.key==='Enter'||e.key===' ')){e.preventDefault();selectTarget(zone.dataset.factorDrop);Navigation?.toast?.('Kotak dipilih. Ketuk kartu faktor yang ingin dimasukkan.');}if(e.key==='Escape'&&!$('factorTreeModal')?.classList.contains('hidden'))closeTree();});
    $('closeFactorTree')?.addEventListener('click',closeTree);
    $('resetFactorTree')?.addEventListener('click',()=>{nodeId=0;treeRoot=makeNode(treeNumber);renderTree();});
    $('useFactorTreeResult')?.addEventListener('click',useTreeResult);
    $('factorTreeModal')?.addEventListener('click',e=>{if(e.target.id==='factorTreeModal')closeTree();});
    document.querySelectorAll('[data-factor-drop]').forEach(z=>renderZone(z.dataset.factorDrop,Number(z.closest('.factor-builder')?.dataset.number||0)));
  }
  function init(){if(initialized)return;initialized=true;bind();}
  window.FactorTools={init,setTokens,getTokens,openTree};
})();
