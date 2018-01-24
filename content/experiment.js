module.exports = {
  objects: {
    singularity: {
      image: [{number: 1, source: "objects/singularity.png", width: 96, x: -32, y: -32, height: 96, visible: false}],
      layer: 7,
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

          for (var i = 0; i < 9; i++){
            for (var j = 0; j < 9; j++){
              var x = this.tx + i - 4;
              var y = this.ty + j - 4;
              var colls = this.world.collisionsGet(x, y);
              for (var k = 0; k < colls.length; k++){
                colls[k].impulse(this.tx - colls[k].tx, this.ty - colls[k].ty, 2 / this.world.dist(this.tx, this.ty, colls[k].tx, colls[k].ty));
              }
            }
          }

        }
      }
    }
  }
}