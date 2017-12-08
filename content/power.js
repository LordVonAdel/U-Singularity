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
      actions: ["debug_power"],
      onUseEnt: "debug_power"
    }
  },
  commands: {
    power: {
      permission: "admin.power.debug",
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
      permission: "admin.power.reload",
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
    cable_red(world, tileX, tileY, user, item){
      var cables = this.world.getEntsByPosition(tileX, tileY).filter(function(ent){return (ent.type == "cable_red")});
      var cable = cables.length > 0 ? cables[0] : world.spawnEntity("cable_red", tileX, tileY);

      switch (user.direction){
        case 0: a = "w"; break;
        case 1: a = "s"; break;
        case 2: a = "e"; break;
        default: a = "n"; break;
      }
      if (!cable.sync[a]){
        cable.sync[a] = true;
        cable.update();

        item.sync.content --;
        is.update(item);
      }
    },
    debug_power(ent, item, user){
      if (ent.power_nw){
        user.msg("I am member of network: " + ent.power_nw.id 
                +"<br>It contains "+ent.power_nw.members.length+" members"
                +"<br>Voltage: "+ent.power_nw.voltage
                +"<br>Resistance: "+ent.power_nw.resistance
                +"<br>Flow: "+ent.power_nw.flow
                +"<br>Use: "+ent.power_nw.use);
      }else{
        user.msg("I am not part of a power network!");
      }
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
        this.power_nw = null;
        this.power_voltage = this.sync.voltage;
        this.power_give = 40;
        this.capacity = 1000;
      },
      onStep(delta){
        //TODO make battery work
      },
      onUpdate(){
        var cables = this.world.getEntsByPosition(this.tx, this.ty).filter(function(ent){return (ent.power_nw)});
        for (var i = 0; i < cables.length; i++){
          var cable = cables[i];
          if (cable != this && cable.power_nw){
            cable.power_nw.addMember(this);
            this.power_nw = cable.power_nw;
          }
        }
        this.power_voltage = this.sync.voltage;
      },
      onStep(delta){
        if (this.power_nw){

        }
      }
    },
    cable_red: {
      layer: 1,
      sync: {e: false, n: false, w: false, s: false, u: false}, //u = is Underground?
      image: [{number: 4, source: "objects/cable_red.png", width: 32, height: 32, visible: false}],
      power_resistance: 0.1,
      onInit(){
        this.powerResistance = 1;
        var power = this.world.systems.power;
        if (power){
          this.power_nw = power.createNetwork(this);
        }
        var tile = world.cellGet(this.tx, this.ty);
        if (tile == 10){
          this.sync.u = true;
        }
      },
      onUpdate(){
        if (this.sync.u){
          var tile = world.cellGet(this.tx, this.ty);
          if (tile == 10){
            this.setHidden(false);
          }else{
            this.setHidden(true);
          }
        }

        this.changeSprite(1, {number: 4, source: "objects/cable_red.png", width: 32, height: 32, index: 0, visible: this.sync.e});
        this.changeSprite(2, {number: 4, source: "objects/cable_red.png", width: 32, height: 32, index: 1, visible: this.sync.n});
        this.changeSprite(3, {number: 4, source: "objects/cable_red.png", width: 32, height: 32, index: 2, visible: this.sync.w});
        this.changeSprite(4, {number: 4, source: "objects/cable_red.png", width: 32, height: 32, index: 3, visible: this.sync.s});

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