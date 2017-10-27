module.exports = {
  items: {
    cable_red: {
      id:"cable_red",
      name:"Cables",
      image:"items/item_cable_red.png",
      actions:["cable"],
      onUseFloor: "cable_red",
      sync: {number: 10}
    }
  },
  actions: {
    cable_red(world, tileX,tileY, user, item){
      var cable = world.spawnEntity("cable_red", tileX, tileY);
      switch (user.direction){
        case 0: a = "w"; break;
        case 1: a = "s"; break;
        case 2: a = "e"; break;
        case 3: a = "n"; break;
        default: a = "n"; break;
      }
      cable.sync[a] = true;
      cable.update();

      item.sync.content --;
    }
  },
  objects: {
    cable_red: {
      sync: {e: false, n: false, w: false, s: false},
      image: [{number: 4, source: "objects/cable_red.png", width:32, height: 32, visible: false}],
      onInit: function(){
        this.update();
      },
      onUpdate: function(){
        this.changeSprite(1, {layer: 1, number: 4, source: "objects/cable_red.png", width: 32, height: 32, index: 0, visible: this.sync.e});
        this.changeSprite(2, {layer: 1, number: 4, source: "objects/cable_red.png", width: 32, height: 32, index: 1, visible: this.sync.n});
        this.changeSprite(3, {layer: 1, number: 4, source: "objects/cable_red.png", width: 32, height: 32, index: 2, visible: this.sync.w});
        this.changeSprite(4, {layer: 1, number: 4, source: "objects/cable_red.png", width: 32, height: 32, index: 3, visible: this.sync.s});
      },
      actions: {
        cable(user, item){

          var a = null;
          switch (user.direction){
            case 0: a = "w"; break;
            case 1: a = "s"; break;
            case 2: a = "e"; break;
            case 3: a = "n"; break;
          }

          if (a != null){
            if (!this.sync[a]){
              this.sync[a] = true;
              item.sync.content --;
              this.update();
            }
          }
        }
      }
    }
  }
}