var utils = require('./utils.js');
var fs = require('fs');
var item = require('./item.js');

//all handler for incoming data
nw = {
  move(data){
    if (this.game != null && this.ent.sync.alive){
      if (!this.ent.isMoving) {
        this.ent.moveDir(data.dir, this.speed);
        this.ent.sync.direction = data.dir;
        this.ent.update();
        this.updateBucket();
      }
    }
  },
  chat(data){
    data.msg = this.stringSave(data.msg);
    console.log(this.game.consolePrefix+this.name + ": " + data.msg);
    if (data.msg.charAt(0) == "/") { //if the message is a command
      var args = data.msg.slice(1).split(" ");
      this.executeCommand(args);
    } else {
      this.game.broadcast('chat', { msg: '<span class="name">' + this.name + ":</span> " + data.msg, player: this.id, raw: data.msg });
    }
  },
  config(data){
    /*
    if (!this.config) {
      this.name = this.stringSave(data.name);
      if (this.name == "" && !config.player.allowEmptyName){this.popup("config","./html/login.html", {error: "You need a name to play this great game!"}); return false;}
      this.ent.sync.sex = data.sex;
      this.ent.sync.job = data.job;
      var cls = loader.res.classes[data.job];
      if (!cls){
        console.error("Unkown class: "+data.job);
        return false;
      }
      if (cls.inventory){
        for (var i = 0; i < Math.min(this.hands, cls.inventory.length); i++){
          this.ent.sync.inventory[i] = item.create(cls.inventory[i]);
        }
      }
      if (cls) {
        this.ent.sync.job = data.job;
        this.ent.sync.gender = data.sex;

        this.ent.update();
        this.shareSelf();
        this.update();
        this.config = true;
      } else {
        //Config was not correct!
      }
    }
    */
  },
  invActive(data){
    if (this.game){
      if (data.slot < this.hands) {
        this.ent.sync.inventoryActive = data.slot;
        this.ent.update();
      }
    }
  },
  useOnFloor(data){
    if (this.ent.sync.alive) {
      var xx = data.x;
      var yy = data.y;
      var itm = this.ent.sync.inventory[this.ent.sync.inventoryActive];

      var distance = Math.hypot(xx - this.ent.tx, yy - this.ent.ty);
      this.lookAt(xx, yy);

      if (itm != null) {
        var master = item.getMaster(itm);
        var fun = res.actions[master.onUseFloor];
        if (distance < Math.max(this.handRange, master.range || 1) + 1) {
          if (fun != undefined) {
            fun(this.world, xx, yy, this, itm);
            this.ent.sync.inventory[this.ent.sync.inventoryActive] = item.update(itm);
            this.shareSelf();
          }
        }
      }
      this.update();
    }
  },
  onUseEnt(data){
    var inventory = this.ent.sync.inventory;
    var active = this.ent.sync.inventoryActive;

    if (this.game != null && this.ent.sync.alive) {
      var itm = inventory[active];
      if (itm == null) { itm = { type: "hand" } }
      var ent = this.world.ents[data.id];
      var itemMaster = item.getMaster(itm);
      if (ent) {
        this.lookAt(ent.tx, ent.ty);
        if (Math.hypot(ent.tx - this.ent.tx, ent.ty - this.ent.ty) < (Math.max(this.handRange, itemMaster.range || 1) + 1)) {
          ent.use(this, itm);

          var master = item.getMaster(itm);
          if (master){
            if (master.onUseEnt){
              var fun = res.actions[master.onUseEnt];
              if (fun){
                fun(ent, itm, this);
                inventory[active] = item.update(inventory[active]);     
              }else{
                console.error("Action " + master.onUseEnt + " not found! Requested from item '" + itm.type + "'");
              }
            }
          }

          inventory[active] = item.update(inventory[active]);
          this.update();
          this.shareSelf();
        }
      }
    }
  },
  disconnect(data){
    console.log("[Server]" + this.name + " disconnected!");
    this.disconnect();
  },
  drop(data){
    var inventory = this.ent.sync.inventory;
    var active = this.ent.sync.inventoryActive;

    if (this.game && this.ent.sync.alive){
      var itm = inventory[active];
      var distance = Math.hypot(data.x - this.ent.tx, data.y - this.ent.ty);
      if (item == null){return false}
      if (distance < (this.handRange + 1)){ //Put
        if (!this.world.collisionCheck(data.x, data.y)) {
          this.world.spawnItem(data.x, data.y, itm);
          inventory[active] = null;
          this.shareSelf();
        }
      }else{ //else throw the item.
        var itemEnt = this.world.spawnItem(this.ent.tx, this.ent.ty, itm);
        itemEnt.impulse(data.x - this.ent.tx, data.y - this.ent.ty, config.player.throwSpeed);
        inventory[active] = null;
        this.shareSelf();
      }
      this.update();
    }
  },
  entDrag(data){
    if (this.game != null && this.ent.sync.alive) {
      var ent = this.world.getEntById(data.id);
      if (ent != null) {
        if (ent == this.ent.drag) {
          ent.clearDragger();
        } else {
          if (ent.ent.draggable) {
            if (Math.hypot(ent.tx - this.ent.tx, ent.ty - this.ent.ty) < (this.handRange + 1)) {
              this.ent.drag = ent;
              ent.setDragger(this.ent);
            }
          }
        }
      }
      this.shareSelf({ "drag": (this.ent.drag != null) });
    }
  },
  entRequest(data){
    var ent = this.world.getEntById(data.id);
    if (ent) {
      socket.emit('ent_data', ent.getClientData());
    }
  },
  inventoryCombine(data){
    var index = data.index;

    var item2 = this.ent.sync.inventory[this.ent.sync.inventoryActive];
    var item1 = this.ent.sync.inventory[index];
    if (item1 == null || item2 == null){return};

    item.combine(item1, item2);
    this.ent.sync.inventory[this.ent.sync.inventoryActive] = item.update(item1);
    this.ent.sync.inventory[index] = item.update(item2);

    this.shareSelf();
  },
  spectatePosition(data){
    if (this.mode == "spectator"){
      if (this.ent){
        this.ent.teleport(data.x, data.y);
        this.updateBucket();
      }
    }
  },
  gamemode(data){ //for gamemode specific actions
    this.game.gamemode.network(this, data)
  }
}

function Client(socket, id) {
  this.socket = socket;
  this.id = id;
  this.name = "unnamed(" + this.id + ")";

  this.mode = "player";

  this.speed = config.player.walkSpeed;//3.2;
  //this.config = false;
  this.inventory = {};
  this.direction = 0;
  this.sex = "m";
  this.job = "phy";
  this.hands = 9;
  this.inventoryActive = 0;
  this.handRange = 1; //in tiles
  this.permissions = ['master.*', 'world.*','admin.*'];
  this.drag = null;
  this.bucket = null;

  this.ent = null;
  this.world = null;
  this.game = null;

  var inv = this.inventory;
  for (var i = 0; i < this.hands; i++) {
    inv[i] = null;
  }

  var that = this;

  socket.on('move', nw.move.bind(this));
  socket.on('chat', nw.chat.bind(this));
  //socket.on('config', nw.config.bind(this));
  socket.on('invActive', nw.invActive.bind(this));
  socket.on('useOnFloor', nw.useOnFloor.bind(this));
  socket.on('entClick', nw.onUseEnt.bind(this));
  socket.on('disconnect', nw.disconnect.bind(this));
  socket.on('drop', nw.drop.bind(this));
  socket.on('entDrag', nw.entDrag.bind(this));
  socket.on('entRequest', nw.entRequest.bind(this));
  socket.on('invCombine', nw.inventoryCombine.bind(this));
  socket.on('spectatePosition', nw.spectatePosition.bind(this));
  socket.on('gamemode', nw.gamemode.bind(this));
}

//Executes a command as the player
Client.prototype.executeCommand = function (args) {
  var cmd = loader.commands[args[0]];
  if (cmd != undefined) {
    var allowed = true;
    if (cmd.permission) {
      allowed = this.getPermission(cmd.permission);
    }
    if (allowed) {
      if (args.length > cmd.argNum || cmd.argNum == undefined) {
        cmd.fun(this, args);
      } else {
        this.msg('<span style="color: red;">Command expects ' + cmd.argNum + " arguments or more</span>");
      }
    } else {
      this.msg(`<span style="color: red;">You don't have the permission to do that! If you think you should be allowed to do this, please contact an admin.</span>`)
    }
  } else {
    this.msg('<span style="color: red;">Unknown command: ' + args[0] + "</span>");
  }
}

//Makes a string save
Client.prototype.stringSave = function (str) {
  str = str.replace(/>/g, '&gt');
  str = str.replace(/</g, '&lt');
  return str;
}

//shows a popup at the client
Client.prototype.popup = function (id, filename, data) {
  var that = this;
  fs.readFile(filename, "utf-8", function (err, str) {
    if (err){console.error(err); return false;}
    for (var k in data){
      str = str.replace("{"+k+"}", data[k]);
    }
    that.socket.emit('server_content', { html: str, id: id});
  });
}

//Sends a chat message to the player
Client.prototype.msg = function (msg) {
  this.socket.emit('chat', { msg: msg, id: this.id });
}

//When the player disconnects
Client.prototype.disconnect = function () {
  if (this.game){
    this.ent.destroy();
    this.game.broadcast('disc', { id: this.id });
    this.game.clients.splice(this.game.clients.indexOf(this), 1);
  }
  lc.removePlayer(this);
}

//Teleports the player to a specific position
Client.prototype.teleport = function (tileX, tileY) {
  this.ent.teleport(tileX, tileY);
  this.updateBucket();
}

//Resets the dragging of an object. So you don't drag anymore, since this is executed
Client.prototype.resetDrag = function () {
  this.ent.drag = null;
  this.shareSelf({ drag: false });
}

//sends data to the client about his player
Client.prototype.shareSelf = function (data) {
  if (!data){
    data = {
      hp: Math.floor(this.ent.sync.hp),
      inventory: this.ent.sync.inventory,
      drag: this.drag
    }
  }
  this.socket.emit('pSelf', data);
}

//will be executed every step
Client.prototype.step = function (delta) {

}

//update refreshes values and stuff
Client.prototype.update = function(){
  this.ent.update();
}

//Gives the player an item
Client.prototype.give = function (itemData) {
  for (var val in this.inventory) {
    if (this.ent.sync.inventory[val] == null) {
      this.ent.sync.inventory[val] = itemData;
      this.shareSelf();
      this.update();
      break;
    }
  }
}

//Checks if the player have a permission to do something
Client.prototype.getPermission = function (permission) {
  if (this.permissions.includes("*.*")){
    return true;
  }
  if (this.permissions.includes(permission)){
    return true;
  }

  var tree = permission.split(".");
  var perm = tree[0];
  for (var i = 1; i < tree.length; i++){
    if (this.permissions.includes(perm+".*")){
      return true;
    }
    perm += "." + tree[i];
  }

  return false;
}

//Updates the bucket the player is in
Client.prototype.updateBucket = function () {
  var tbucket = this.world.buckets.cellGet(Math.floor(this.ent.tx / config.bucket.width), Math.floor(this.ent.ty / config.bucket.height));
  this.changeBucket(tbucket);
}

//Changes the bucket, the player belongs to
Client.prototype.changeBucket = function (bucket) {
  if (bucket) {
    if (this.bucket != bucket) {
      bucket.addPlayer(this);
      if (this.bucket != null) {
        this.bucket.removePlayer(this);
      }
      this.bucket = bucket;
      this.bucket.sendMegaPacketArea(this.socket);
    }
  }
}

//Kick the player from the server
Client.prototype.kick = function (title, message) {
  console.log(this.game.consolePrefix + `Kicked player: "${this.name}". reason: "${title}", "${message}"`);
  this.popup("kicked", "html/kicked.html", {title: title || "", msg:message});
  var that = this;
  setTimeout(function(){
    that.socket.disconnect();
  }, 1000);
}

//rotates the player
Client.prototype.lookAt = function(tileX, tileY){
  if (tileX == this.ent.tx && tileY == this.ent.ty){
    return this.direction;
  }

  var angle = Math.atan2(-(tileY - this.ent.ty), (tileX - this.ent.tx));
  //Thanks to Mario for the next line of code
  this.ent.sync.direction = Math.floor(2*angle / Math.PI + 4.5) % 4;
  this.ent.update();

  return this.direction;
}

//Changes the mode of the player (spectator, builder and that stuff)
Client.prototype.changeMode = function(mode){
  this.mode = mode;
  this.msg("Changed your mode to "+mode);
  this.shareSelf({mode: mode});
  if (mode == "spectator"){
    this.ent.setHidden(true);
  }else{
    this.ent.setHidden(false);
    this.socket.emit('cam', this.ent.id);
  }
}

//sets the camera of the client
Client.prototype.camSet = function(entity){
  this.socket.emit('cam', entity.id);
}

//resets the camera of the client to its entity
Client.prototype.camReset = function(){
  this.socket.emit('cam', this.ent.id);
}

module.exports = Client;