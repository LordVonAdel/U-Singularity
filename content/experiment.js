module.exports = {
  objects: {
    singularity: {
      image: [{number: 1, source: "objects/singularity.png", width: 96, height: 96, visible: false}],
      start(){
        this.changeSprite(0, {visible: true});
        this.update();
      }
    }
  }
}