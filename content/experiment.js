module.exports = {
  objects: {
    singularity: {
      image: [{number: 1, source: "objects/singularity.png", width: 96, x: -32, y: -32, height: 96, visible: false}],
      sync: {
        active: false,
        nextMoveIn: 1000
      },
      start(){
        this.changeSprite(0, {visible: true});
        this.update();
        this.sync.active = true;
      },
      onStep(delta){
        if (!this.sync.active) return;

        this.sync.nextMoveIn -= delta;
        if (this.sync.nextMoveIn <= 0){
          this.sync.nextMoveIn = 200;
          var dir = Math.floor(Math.random()*4);
          this.moveDir(dir, 1);
  
          for (var i = 0; i < 3; i++){
            for (var j = 0; j < 3; j++){
              var x = this.tx + i - 1;
              var y = this.ty + j - 1;
              var tile = this.world.cellGet(x, y);
              //this.world.cellSet(x, y, 1);
              if (["1", "2", "3", "7"].includes(tile)){
                this.world.cellSet(x, y, 5);
              }else if (["4", "6", "8"].includes(tile)){
                this.world.cellSet(x, y, 10);
              }
            }
          }
        }
      }
    }
  }
}