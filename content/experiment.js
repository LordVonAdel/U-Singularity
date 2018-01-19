module.exports = {
  objects: {
    singularity: {
      image: [{number: 1, source: "objects/singularity.png", width: 96, height: 96, visible: false}],
      sync: {
        nextMoveIn: 1
      },
      start(){
        this.changeSprite(0, {visible: true});
        this.update();
      },
      step(delta){
        this.sync.nextMoveIn -= delta;
        if (this.sync.nextMoveIn <= 0){
          this.sync.nextMoveIn = 5;
          var dir = Math.floor(Math.random()*4);
          this.moveDir(dir, 10);
        }
      }
    }
  }
}