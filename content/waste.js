module.exports = {
  objects: {
    waste_level1: {
      image: [{source: "objects/waste_level1.png", width: 32, height: 32}],
      draggable: true,
      collision: true,
      sync: {
        leaked: false
      },
      onUpdate(){
        if (this.sync.leaked) {
          this.changeSprite(0, {source: "objects/waste_level1_leaked.png"})
        } else {
          this.changeSprite(0, {source: "objects/waste_level1.png"})
        }
      },
      actions: {
        weld(){
          if (this.sync.leaked == true) {
            this.sync.leaked = false;
            this.update();
          }
        }
      }
    },
    waste_spawn: {
      image: [{source: "objects/waste_spawn.png", width: 32, height: 32}],
      draggable: false,
      collision: false,
      spawnWaste(){
        this.world.spawnEntity("waste_level1", this.tx, this.ty);
      }
    }
  }
}