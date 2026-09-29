
const ProgressStore = (() => {
  const KEY = "ctGrade7_state_v1";
  const defaultState = {
    currentModule: 0,
    completed: [],
    unlocked: [0],
    score: null,
    quizBreakdown: {},
    reflections: {}
  };

  function load(){
    try{
      const raw = localStorage.getItem(KEY);
      if(!raw) return structuredClone(defaultState);
      const parsed = JSON.parse(raw);
      return {...structuredClone(defaultState), ...parsed};
    }catch(err){
      console.warn("Progress rusak, menggunakan state awal.", err);
      return structuredClone(defaultState);
    }
  }

  let state = load();

  function save(){
    localStorage.setItem(KEY, JSON.stringify(state));
  }

  function completeModule(index){
    if(!state.completed.includes(index)) state.completed.push(index);
    const next = index + 1;
    if(next < AppData.modules.length && !state.unlocked.includes(next)) state.unlocked.push(next);
    state.currentModule = Math.min(next, AppData.modules.length - 1);
    save();
  }

  function setCurrent(index){
    state.currentModule = index;
    save();
  }

  function isUnlocked(index){ return state.unlocked.includes(index); }
  function isCompleted(index){ return state.completed.includes(index); }

  function percent(){
    const total = AppData.modules.length;
    return Math.round((state.completed.length / total) * 100);
  }

  function setQuiz(score, breakdown){
    state.score = score;
    state.quizBreakdown = breakdown;
    if(!state.completed.includes(AppData.modules.length-1)){
      state.completed.push(AppData.modules.length-1);
    }
    save();
  }

  function reset(){
    state = structuredClone(defaultState);
    save();
  }

  return {get state(){return state}, save, completeModule, setCurrent, isUnlocked, isCompleted, percent, setQuiz, reset};
})();
