const is = require('../code/item.js'); //itemSystem

module.exports = {
  items: {
    cable_red: {
      id:"cable_red",
      name:"Cables",
      image:"items/item_cable_red.png",
      actions:["cable"],
      onUseFloor: "cable_red",
      sync: {content: 10},
      on: {
        cable(other){
          other.sync.content += this.sync.content;
          is.destroy(this);
        }
      },
      onUpdate(){
        if (this.sync.content <= 0){
          is.destroy(this);
        }
      }
    },
    wirecutter: {
      id: "wirecutter",
      name: "Wirecutter",
      image: "items/item_wirecutter.png",
      actions: ["cut"]
    },
    debug_power: {
      id: "debug_power",
      name: "Power debugger",
      image: "items/item_debug_power.png",
      actions: ["debug_power"]
    }
  },
  commands: {
    power: {
      fun(sender, args){
        var power = sender.world.systems.power;
        if (power){
          sender.msg("Power networks: " + power.networks.length);
        }else{
          sender.msg("This world does not use the power system!");
        }
      }
    },
    power_reload: {
      fun(sender, args){
        var cables = sender.world.getEntsByType("cable_red");
        for (var i = 0; i < cables.length; i++) {
          var cable = cables[i];
          if (cable.power_nw){
            cable.power_nw.removeMember(cable);
            cable.power_nw = null;
          }
        }
        for (var i = 0; i < cables.length; i++) {
          var cable = cables[i];
          cable.update();
        }
      }
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
      is.update(item);
    }
  },
  objects: {
    battery: {
      sync: {
        mode: 0,
        energy: 1000,
        voltage: 300
      },
      image: [{number: 1, source: "objects/battery.png", width: 32, height: 32}],
      collision: true,
      onInit(){
        this.capacity = 1000;
      }
    },
    cable_red: {
      sync: {e: false, n: false, w: false, s: false},
      image: [{number: 4, source: "objects/cable_red.png", width:32, height: 32, visible: false}],
      onInit(){
        var power = this.world.systems.power;
        if (power){
          this.power_nw = power.createNetwork(this);
        }
        this.update();
      },
      onUpdate(){
        this.changeSprite(1, {layer: 1, number: 4, source: "objects/cable_red.png", width: 32, height: 32, index: 0, visible: this.sync.e});
        this.changeSprite(2, {layer: 1, number: 4, source: "objects/cable_red.png", width: 32, height: 32, index: 1, visible: this.sync.n});
        this.changeSprite(3, {layer: 1, number: 4, source: "objects/cable_red.png", width: 32, height: 32, index: 2, visible: this.sync.w});
        this.changeSprite(4, {layer: 1, number: 4, source: "objects/cable_red.png", width: 32, height: 32, index: 3, visible: this.sync.s});

        if (!this.power_nw){
          if (this.world.systems.power){
            this.power_nw = this.world.systems.power.createNetwork(this);
          }
        }

        if (this.power_nw){
          var l = [];
          if (this.sync.n)
            l = l.concat(this.world.getEntsByPosition(this.tx, this.ty - 1).filter(function(ent){return (ent.sync.s)}));
          if (this.sync.e)
            l = l.concat(this.world.getEntsByPosition(this.tx + 1, this.ty).filter(function(ent){return (ent.sync.w)}));
          if (this.sync.s)
            l = l.concat(this.world.getEntsByPosition(this.tx, this.ty + 1).filter(function(ent){return (ent.sync.n)}));
          if (this.sync.w)
            l = l.concat(this.world.getEntsByPosition(this.tx - 1, this.ty).filter(function(ent){return (ent.sync.e)}));
          for (var i = 0; i < l.length; i++){
            var element = l[i];
            if (element.power_nw){
              this.world.systems.power.connectNetworks(this.power_nw, element.power_nw);
            }
          }
        }
      },
      actions: {
        debug_power(user){
          if (this.power_nw){
            user.msg("I am member of network: " + this.power_nw.id + "<br>That contains " + this.power_nw.members.length + " members");
          }else{
            user.msg("I am not part of a power network!");
          }
        },
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
              is.update(item);
              this.update();
            }
          }
        },
        cut(user, item){
          var a = null;
          switch (user.direction){
            case 0: a = "w"; break;
            case 1: a = "s"; break;
            case 2: a = "e"; break;
            case 3: a = "n"; break;
          }

          if (a != null){
            if (this.sync[a]){
              this.sync[a] = false;
              this.update();
              var itm = this.world.spawnItem(this.tx, this.ty, is.create("cable_red")).sync.item;
              itm.sync.content = 1;
              is.update(itm);
            }
            if (this.power_nw){
              this.power_nw.removeMember(this);
              //this entity will automatically get a new network
            } 
          }

          if (!this.sync.e && !this.sync.n && !this.sync.w && !this.sync.s){
            this.destroy();
          }
        }
      }
    }
  }
}