
const GameLayer = (() => {
  const KEY = "ctGrade7_game_v1";

  const defaultGame = {
    avatar: null,
    xp: 0,
    acquiredSkills: [],
    missionStars: {},
    seenRewards: []
  };

  function load(){
    try{
      const raw=localStorage.getItem(KEY);
      return raw ? {...structuredClone(defaultGame), ...JSON.parse(raw)} : structuredClone(defaultGame);
    }catch(e){
      console.warn("Game state rusak. Menggunakan default.", e);
      return structuredClone(defaultGame);
    }
  }

  let state=load();

  function save(){
    localStorage.setItem(KEY, JSON.stringify(state));
  }

  function setAvatar(id){
    state.avatar=id;
    save();
  }

  function addXP(amount){
    state.xp=Math.max(0,(state.xp||0)+amount);
    save();
  }

  function acquireSkill(skill){
    if(!state.acquiredSkills.includes(skill)){
      state.acquiredSkills.push(skill);
      addXP(20);
      save();
      return true;
    }
    return false;
  }

  function setStars(missionId,stars){
    const prev=state.missionStars[missionId]||0;
    state.missionStars[missionId]=Math.max(prev,stars);
    save();
  }

  function markRewardSeen(id){
    if(!state.seenRewards.includes(id)){
      state.seenRewards.push(id);
      save();
    }
  }

  function reset(){
    state=structuredClone(defaultGame);
    save();
  }

  const skills = {
    decomposition:{icon:"🧩",title:"Pecah Masalah",formal:"Dekomposisi",desc:"Memecah masalah besar menjadi bagian-bagian kecil."},
    pattern:{icon:"🔍",title:"Deteksi Pola",formal:"Pengenalan Pola",desc:"Menemukan kesamaan, keteraturan, atau kecenderungan."},
    abstraction:{icon:"🎯",title:"Filter Informasi",formal:"Abstraksi",desc:"Memilih informasi penting dan mengabaikan detail yang tidak diperlukan."},
    algorithm:{icon:"🧭",title:"Susun Langkah",formal:"Algoritma",desc:"Menyusun langkah yang jelas, logis, dan berurutan."}
  };

  function avatarIcon(){
    const map={robot:"🤖",explorer:"🧑‍🚀",detective:"🕵️",builder:"🧑‍🔧"};
    return map[state.avatar]||"🧠";
  }

  return {
    get state(){return state},
    skills,
    save,setAvatar,addXP,acquireSkill,setStars,markRewardSeen,reset,avatarIcon
  };
})();
