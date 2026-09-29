(() => {
  const KEY = 'kpkFpbLearningStateV1';
  const freshState = () => ({
    version: 2,
    sound: true,
    lastScreen: 'landing',
    factorIntro: { four:false, composites:false, primes:false, finish:false, completed:false },
    meeting1: { simulation:false, pattern:false, challenge:false, completed:false },
    activity1: { jump:false, multiples:false, prime:false, application:false, reflection:false, completed:false },
    meeting2: { grouped:false, factors:false, concepts:false, challenge:false, completed:false },
    activity2: { grouping:false, factors:false, strategy:false, stories:false, reflection:false, completed:false },
    quiz: { completed:false, lastScore:null, bestScore:null, categoryScores:{} }
  });

  const requirements = {
    factorIntro:['four','composites','primes','finish'],
    meeting1:['simulation','pattern','challenge'],
    activity1:['jump','multiples','prime','application','reflection'],
    meeting2:['grouped','factors','concepts','challenge'],
    activity2:['grouping','factors','strategy','stories','reflection']
  };

  function deepMerge(base, incoming){
    if (!incoming || typeof incoming !== 'object') return base;
    for (const [k,v] of Object.entries(incoming)) {
      if (v && typeof v === 'object' && !Array.isArray(v) && base[k] && typeof base[k] === 'object') deepMerge(base[k], v);
      else base[k] = v;
    }
    return base;
  }

  function load(){
    try { return deepMerge(freshState(), JSON.parse(localStorage.getItem(KEY) || '{}')); }
    catch { return freshState(); }
  }
  let state = load();
  function save(){
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch(e) { console.warn('Progress tidak dapat disimpan', e); }
    window.dispatchEvent(new CustomEvent('learning-progress-changed', {detail: state}));
  }
  function reset(){ state = freshState(); try{localStorage.removeItem(KEY)}catch{} save(); return state; }
  function get(){ return state; }
  function setFlag(module, key, value=true){ if(state[module] && key in state[module]){ state[module][key]=value; recompute(module); save(); } }
  function recompute(module){
    if(requirements[module]) state[module].completed = requirements[module].every(k => state[module][k]);
  }
  function percentFor(module){
    const keys = requirements[module] || [];
    if(!keys.length) return 0;
    return Math.round(keys.filter(k=>state[module][k]).length/keys.length*100);
  }
  function overallPercent(){
    const stages=['factorIntro','meeting1','activity1','meeting2','activity2'];
    const complete=stages.filter(m=>state[m].completed).length + (state.quiz.completed ? 1 : 0);
    return Math.round(complete/6*100);
  }
  function isUnlocked(screen){
    if(screen==='landing' || screen==='factorIntro') return true;
    if(screen==='meeting1') return state.factorIntro.completed;
    if(screen==='activity1') return state.meeting1.completed;
    if(screen==='meeting2') return state.activity1.completed;
    if(screen==='activity2') return state.meeting2.completed;
    if(screen==='quiz') return state.activity2.completed;
    if(screen==='result') return state.quiz.completed;
    return false;
  }
  function nextIncomplete(){
    for(const s of ['factorIntro','meeting1','activity1','meeting2','activity2']) if(isUnlocked(s) && !state[s].completed) return s;
    if(isUnlocked('quiz') && !state.quiz.completed) return 'quiz';
    return state.quiz.completed ? 'result' : 'factorIntro';
  }
  function updateQuiz(data){
    state.quiz.completed = true;
    state.quiz.lastScore = data.score;
    state.quiz.bestScore = Math.max(state.quiz.bestScore ?? 0, data.score);
    state.quiz.categoryScores = data.categoryScores || {};
    save();
  }
  function setLastScreen(screen){ state.lastScreen=screen; save(); }
  function setSound(value){ state.sound=!!value; save(); }

  window.LearnProgress = {get, save, reset, setFlag, recompute, percentFor, overallPercent, isUnlocked, nextIncomplete, updateQuiz, setLastScreen, setSound};
})();
