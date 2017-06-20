var inLobby = 0;
var countdown = -1;
var counter = null;
var time = 0;
var stage = 0;
var progress = 0;
changeStage(0);
console.log("[GameMode]Current Gamemode is survival")

function startCountdown(time){
  countdown = time;
  changeStage(1);
  if (counter == null){
    counter = setInterval(function(){
      countdown -= 1;
      playerlist.forEach(function(pl){
        pl.popup("countdown","html/countdown.html");
        pl.socket.emit("gm",{countdown:countdown})
      });
      if (countdown <= 0){
        clearInterval(counter);
        counter = null;
        changeStage(2);
        progress = 0;
      }
    },1000);
  }else{
    countdown = time;
  }
}
function changeStage(st){
  stage = st;
  console.log("[GameMode]Stage is now "+st);
}

function loop(delta){
  if (stage == 0){ //lobby

  }
  if (stage == 1){ //countdown
    progress = 0;
  }
  if (stage == 2){ //elevator
    if (progress < 1){
      playerlist.forEach(function(pl){
        pl.popup("info","html/infoElevator.html");
      });
      progress += 0.0001;
      handy.broadcast("gm",{elevator: progress})
    }
  }
}

module.exports.startCountdown = startCountdown;
module.exports.loop = loop;
module.exports.stage = stage;