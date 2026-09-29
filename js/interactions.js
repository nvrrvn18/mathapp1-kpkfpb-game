
const InteractionUtils = {
  setFeedback(el, type, text){
    el.className = `feedback ${type || ""}`.trim();
    el.textContent = text;
  }
};
