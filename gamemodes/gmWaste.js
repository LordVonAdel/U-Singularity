var GM = function(game, gmConfig){
  console.log("Started Waste gamemode!");

  this.gmConfig = gmConfig;
  this.game = game;
  this.name = "Waste"

  this.score = 0;
  this.leakTimer = 5000;
}

GM.prototype.onAllWorldsLoaded = function(){

}

GM.prototype.start = function(){
  var w0 = this.game.worlds[0];

  var spawners = w0.getEntsByType("waste_spawn");
  spawners.forEach(spawner => {
    spawner.fire("spawnWaste");
  });
}

GM.prototype.getAPIData = function(){
  return {
    score: this.score
  }
}

GM.prototype.step = function(delta){
  this.leakTimer -= delta;
  if (this.leakTimer <= 0){
    this.leakTimer = 5000;
    var wastes = this.game.worlds[0].getEntsByType("waste_level1");
    if (wastes.length > 0){
      var index = Math.floor((Math.random()-0.01) * wastes.length);
      wastes[index].sync.leaked = true;
      wastes[index].update();
    }
  }
}

module.exports = GM;