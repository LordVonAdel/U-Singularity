var gm  = function(game){
  this.game = game;
  this.name = "Singularity";
  this.apiData = {};
  this.stage = "lobby";
  this.roundStartTime = null;
  this.countdown = null;
}
gm.prototype.start = function(){
  if (this.stage == "lobby"){
    this.countdown = 5;
    this.stage = "countdown";
  }
}
gm.prototype.step = function(delta){
  if (this.stage == "countdown"){
    this.countdown -= delta;
    if (this.countdown <= 0){
      this.stage = "ingame";
      this.roundStartTime = Date.now();
      this.game.showGlobalPopup("countdown", "");
    }else{
      this.game.showGlobalPopupFromFile("countdown", "./html/countdown.html", {time: Math.floor(this.countdown)});
    }
  }
}
gm.prototype.getAPIData = function(){
  return {
    roundTime: this.roundStartTime != null ? (Date.now() - this.roundStartTime) : 0,
    stage: this.stage
  }
}

module.exports = gm;