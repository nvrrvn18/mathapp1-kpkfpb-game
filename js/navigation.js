
const Navigation = {
  show(id){
    document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
    const target=document.getElementById(id);
    if(target) target.classList.add("active");
    document.querySelectorAll(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.nav===id));
    window.scrollTo({top:0,behavior:"smooth"});
  },
  bind(){
    document.querySelectorAll(".nav-btn").forEach(btn=>btn.addEventListener("click",()=>{
      const id=btn.dataset.nav;
      if(id==="learning") App.openModule(ProgressStore.state.currentModule);
      else {
        if(id==="progressScreen") App.renderProgress();
        this.show(id);
      }
    }));
    document.querySelectorAll(".nav-home").forEach(btn=>btn.addEventListener("click",()=>this.show("home")));
  }
};
