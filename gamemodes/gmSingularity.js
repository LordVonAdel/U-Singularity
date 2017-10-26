var gm  = function(game){
  this.game = game;
  this.name = "Singularity";
  this.apiData = {};
  this.stage = "lobby";
  this.roundStartTime = null;
  this.countdown = null;
  this.classes = [
    "chemist", "physicist", "engineer"
  ]
  this.second = 0; //Used to send things only every second and not every tick!
}

//will be executed when the game starts. Currently only executable via "/start" command
gm.prototype.start = function(){
  if (this.stage == "lobby"){
    this.countdown = 5;
    this.stage = "countdown";
    this.game.sendChatMessage("Starting countdown...");
  }
}

//Will be called every step (60 times per second)
gm.prototype.step = function(delta){
  this.second += delta/1000;
  if (this.stage == "countdown"){
    this.countdown -= delta/1000;
    if (this.countdown <= 0){
      this.stage = "ingame";
      this.roundStartTime = Date.now();
      this.game.showGlobalPopup("countdown", "");
      this.game.sendChatMessage("Experiment starts!");
      this.game.showGlobalPopupFromFile("info", "./html/info.html", {info: "Wait for the elevator!"});
      var lamps = this.game.worlds[0].getEntsByType("wall_lamp_warning");
      lamps.forEach(function(lamp){
        lamp.sync.isOn = true;
        lamp.update();
      });
      var controlDoors = this.game.worlds[0].getEntsByType("door_control_room");
      controlDoors.forEach(function(door){
        door.sync.locked = false;
      });
    }else{
      if (this.second >= 1){
        this.game.showGlobalPopupFromFile("countdown", "./html/countdown.html", {time: Math.floor(this.countdown)});
      }
    }
  }
  if (this.second >= 1){
    this.second = 0;
  }
}

//Will be executed when a player joins
gm.prototype.playerJoined = function(player){
  if (this.stage == "ingame"){
    player.popup("info","./html/info.html", {info: "Wait for the elevator!"});
  }
}

//return data for the API
gm.prototype.getAPIData = function(){
  return {
    roundTime: this.roundStartTime != null ? (Date.now() - this.roundStartTime) : 0,
    stage: this.stage,
    category: "survival"
  }
}

module.exports = gm;