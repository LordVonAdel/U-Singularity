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
  this.elevatorDepartRemainTime = gmConfig.elevatorDepartTime || 30;
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

  switch (this.stage){
    case "countdown":
      this.countdown -= delta/1000;
      if (this.countdown <= 0){
        this.stage = "survive";
        this.roundStartTime = Date.now();
        this.game.showGlobalPopup("countdown", "");
        this.game.sendChatMessage("Experiment starts!");
        this.game.sendChatMessage("Emergency elevator arrives in "+this.elevatorRemainTime+" seconds");
        this.game.showGlobalPopupFromFile("info", "./html/info.html", {info: "Wait for the lift!"});
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
    break;
    case "survive":
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
        this.stage = "lift";
        this.game.worlds[0].swapRegion(this.gmConfig.world1LiftX, this.gmConfig.world1LiftY, this.gmConfig.liftWidth, this.gmConfig.liftHeight, this.game.worlds[1], this.gmConfig.world2LiftX, this.gmConfig.world2LiftY);
        this.game.sendChatMessage("The lift has arrived!");
        this.game.sendChatMessage("It will depart in "+this.elevatorDepartRemainTime+"seconds!");
        this.game.showGlobalPopupFromFile("info", "./html/info.html", {info: "Get into the lift!"});
      }
    break;
    case "lift":
      this.elevatorDepartRemainTime -= 1 / delta;
      if (this.elevatorDepartRemainTime <= 0){
        this.game.sendChatMessage("Going up!");
        this.game.showGlobalPopupFromFile("info", "./html/info.html", {info: "Wait in the lift!"});
        this.stage = "escape";
        this.game.worlds[0].swapRegion(this.gmConfig.world1LiftX, this.gmConfig.world1LiftY, this.gmConfig.liftWidth, this.gmConfig.liftHeight, this.game.worlds[1], this.gmConfig.world2LiftX, this.gmConfig.world2LiftY);
        this.elevatorRemainTime = this.gmConfig.elevatorEscapeTime;
      }
    break;
    case "escape":
      this.elevatorRemainTime -= 1/delta;
      if (this.elevatorRemainTime <= 0){
        this.stage = "won";
        this.game.sendChatMessage("End of round!");
        this.game.showGlobalPopupFromFile("info", "./html/info.html", {info: "Round end"});

        this.game.worlds[1].swapRegion(this.gmConfig.world2LiftX, this.gmConfig.world2LiftY, this.gmConfig.liftWidth, this.gmConfig.liftHeight, this.game.worlds[2], this.gmConfig.world3LiftX, this.gmConfig.world3LiftY);

        var names = this.game.worlds[1].getEntsByRegion().filter((ent)=>{return ent.type == "player"}).map((ent)=>{return ent.client.name});
        this.game.sendChatMessage("Following players survived the game: "+names.join(', '));
      }
    break;
    case "won":

    break;
  }
  this.second %= 1;
}

//Will be executed when a player joins
GM.prototype.playerJoined = function(player){
  if (this.stage == "survive"){
    player.popup("info", "./html/info.html", {info: "Wait for the lift!"});
  }else if(this.stage == "lift"){
    player.popup("info", "./html/info.html", {info: "Get into the lift!"});
  }else if(this.stage == "escape"){
    player.popup("info", "./html/info.html", {info: "Wait in the lift!"});
  }else if(this.stage == "won"){
    player.popup("info", "./html/info.html", {info: "Round end"});
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