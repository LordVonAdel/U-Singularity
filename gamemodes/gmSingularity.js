var GM  = function(game, gmConfig){
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
  this.elevatorRemainTime = gmConfig.elevatorTime || 30;
  this.timerHasSendThisInterval = true;
  this.gmConfig = gmConfig;
}

//will be executed when the game starts. Currently only executable via "/start" command
GM.prototype.start = function(){
  if (this.stage == "lobby"){
    this.countdown = 5;
    this.stage = "countdown";
    this.game.sendChatMessage("Starting countdown...");
  }
}

//Will be called every step (60 times per second)
GM.prototype.step = function(delta){
  this.second += delta/1000;
  if (this.stage == "countdown"){
    this.countdown -= delta/1000;
    if (this.countdown <= 0){
      this.stage = "survive";
      this.roundStartTime = Date.now();
      this.game.showGlobalPopup("countdown", "");
      this.game.sendChatMessage("Experiment starts!");
      this.game.sendChatMessage("Emergency elevator arrives in "+this.elevatorRemainTime+" seconds");
      this.game.showGlobalPopupFromFile("info", "./html/info.html", {info: "Wait for the elevator!"});
      var lamps = this.game.worlds[0].getEntsByType("wall_lamp_warning");
      lamps.forEach(function(lamp){
        lamp.sync.isOn = true;
        lamp.update();
      });
      var controlDoors = this.game.worlds[0].getEntsByType("door_control_room");
      controlDoors.forEach(function(door){
        door.sync.isLocked = false;
      });
    }else{
      if (this.second >= 1){
        this.game.showGlobalPopupFromFile("countdown", "./html/countdown.html", {time: Math.floor(this.countdown)});
      }
    }
  }
  if (this.stage == "survive"){
    this.elevatorRemainTime -= delta/1000;
    if (Math.floor(this.elevatorRemainTime) % 30 == 0){
      if (this.timerHasSendThisInterval == false){
        this.game.sendChatMessage(Math.floor(this.elevatorRemainTime)+" seconds remain!");
        this.timerHasSendThisInterval = true;
      }
    }else{
      this.timerHasSendThisInterval = false;
    }
    if (this.elevatorRemainTime <= 0){
      this.stage = "escape";
      this.game.worlds[0].swapRegion(this.gmConfig.world1LiftX, this.gmConfig.world1LiftY, this.gmConfig.liftWidth, this.gmConfig.liftHeight, this.game.worlds[1], this.gmConfig.world2LiftX, this.gmConfig.world2LiftY);
      this.game.sendChatMessage("The elevatore has arrived!");
    }
  }
  if (this.stage == "escape"){

  }
  this.second %= 1;
}

//Will be executed when a player joins
GM.prototype.playerJoined = function(player){
  if (this.stage == "ingame"){
    player.popup("info","./html/info.html", {info: "Wait for the elevator!"});
  }
}

//return data for the API
GM.prototype.getAPIData = function(){
  return {
    roundTime: this.roundStartTime != null ? (Date.now() - this.roundStartTime) : 0,
    stage: this.stage,
    category: "survival"
  }
}

module.exports = GM;