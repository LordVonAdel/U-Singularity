var utils = require('./utils.js');
var fs = require('fs');
var item = require('./item.js');

function Player(socket) {
  this.socket = socket;
  this.tileX = 0;
  this.tileY = 0;
  this.x = this.tileX * 32;
  this.y = this.tileY * 32;
  this.id = nextEntId;
  nextEntId += 1;
  this.name = "unnamed(" + this.id + ")";
  this.speed = config.player.walkSpeed;//3.2;
  this.config = false;
  this.inventory = {};
  this.direction = 0;
  this.sex = "m";
  this.job = "phy";
  this.burning = false;
  this.hands = 9;
  this.inventoryActive = 0;
  this.handRange = 1; //in tiles
  this.permissions = ['master.*', 'world.*','admin.*'];
  this.drag = null;
  this.pushCooldown = 0;
  this.bucket = null;
  this.alive = true;

  this.ent = null;
  this.world = null;
  this.game = null;

  var inv = this.inventory;
  for (var i = 0; i < this.hands; i++) {
    inv[i] = null;
  }

  var that = this;

  socket.on('move', function (data) {
    if (that.game != null && that.config && that.alive) {
      if (!that.ent.isMoving) {
        that.ent.moveDir(data.dir, that.speed);
        that.direction = data.dir;
        that.ent.changeImageIndex(0, data.dir);
        that.updateBucket();
      }
    }
  });

  socket.on('chat', function (data) {
    data.msg = that.stringSave(data.msg);
    console.log(that.name + ": " + data.msg);
    if (data.msg.charAt(0) == "/") { //if the message is a command
      var args = data.msg.slice(1).split(" ");
      var sender = that;
      that.executeCommand(args);
    } else {
      that.game.broadcast('chat', { msg: '<span class="name">' + that.name + ":</span> " + data.msg, player: that.id, raw: data.msg });
    }
  });

  socket.on('config', function (data) {
    if (!that.config) {
      that.name = that.stringSave(data.name);
      if (that.name == "" && !config.player.allowEmptyName){that.popup("config","./html/login.html", {error: "You need a name to play this great game!"}); return false;}
      that.sex = data.sex;
      that.job = data.job;
      var cls = loader.res.classes[that.job];
      if (!cls){
        console.error("Unkown job: "+that.job);
        return false;
      }
      var img = that.sex == "m" ? cls["sprite-male"] : cls["sprite-female"];

      if (cls.inventory){
        for (var i = 0; i < Math.min(that.hands, cls.inventory.length); i++){
          that.inventory[i] = item.create(cls.inventory[i]);
        }
      }

      that.shareSelf();
      that.update();
      if (img != undefined) {
        that.ent.changeSprite(0, {source: img});
      } else {
        //Config was not correct!
      }
      that.config = true;
    }
  });

  socket.on('inv_active', function (data) {
    if (that.game){
      if (data.slot < that.hands) {
        that.inventoryActive = data.slot;
        that.update();
      }
    }
  });

  socket.on('useOnFloor', function (data) {
    if (that.config && that.alive) {
      var xx = data.x;
      var yy = data.y;
      var itm = that.inventory[that.inventoryActive];

      var distance = Math.hypot(xx - that.ent.tx, yy - that.ent.ty);
      that.lookAt(xx, yy);

      if (itm != null) {
        var fun = res.actions[res.items[itm.type].onUseFloor];
        if (distance < that.handRange + 1) {
          if (fun != undefined) {
            fun(that.world, xx, yy, that, itm);
            that.inventory[that.inventoryActive] = item.update(itm);
            that.shareSelf();
          }
        }
      }
      that.update();
    }
  });

  socket.on('disconnect', function (data) {
    console.log("[Server]" + that.name + " disconnected!");
    that.disconnect();
  });

  socket.on('drop', function (data) {
    if (that.game && that.alive){
      var itm = that.inventory[that.inventoryActive];
      var distance = Math.hypot(data.x - that.ent.tx, data.y - that.ent.ty);

      if (item == null){return false}

      if (distance < (that.handRange + 1)){ //Put
        if (!that.world.collisionCheck(data.x, data.y)) {
          world.spawnItem(data.x, data.y, itm);

          that.inventory[that.inventoryActive] = null;
          that.shareSelf();
        }
      }else{ //else throw the item.
        var itemEnt = world.spawnItem(that.ent.tx, that.ent.ty, itm);
        itemEnt.impulse(data.x - that.ent.tx, data.y - that.ent.ty, config.player.throwSpeed);

        that.inventory[that.inventoryActive] = null;
        that.shareSelf();
      }

      that.update();
    }
  });

  socket.on('ent_click', function (data) {
    if (that.game != null && that.alive) {
      var itm = that.inventory[that.inventoryActive];
      if (itm == null) { itm = { type: "hand" } }
      var ent = that.world.ents[data.id];
      var itemMaster = item.getMaster(itm);
      if (ent) {
        that.lookAt(ent.tx, ent.ty);
        if (Math.hypot(ent.x - that.ent.x, ent.y - that.ent.y) < (Math.max(that.handRange, itemMaster.range || 1) + 1) * 32) {
          ent.use(that, itm);

          var master = item.getMaster(itm);
          if (master){
            if (master.onUseEnt){
              var fun = res.actions[master.onUseEnt];
              if (fun){
                fun(ent, itm);
                that.inventory[that.inventoryActive] = item.update(that.inventory[that.inventoryActive]);     
              }else{
                console.error("Action " + master.onUseEnt + " not found! Requested from item '" + itm.type + "'");
              }
            }
          }

          that.inventory[that.inventoryActive] = item.update(that.inventory[that.inventoryActive]);
          that.update();
          that.shareSelf();
        }
      }
    }
  });

  socket.on('ent_drag', function (data) {
    if (that.game != null && that.alive) {
      var ent = that.world.getEntById(data.id);
      if (ent != null) {
        if (ent == that.ent.drag) {
          ent.clearDragger();
        } else {
          if (ent.ent.draggable) {
            if (Math.hypot(ent.x - that.ent.x, ent.y - that.ent.y) < (that.handRange + 1) * 32) {
              that.ent.drag = ent;
              ent.setDragger(that.ent);
            }
          }
        }
      }
      that.shareSelf({ "drag": (that.ent.drag != null) });
    }
  });

  socket.on('ent_request', function (id) {
    var ent = that.world.getEntById(id);
    if (ent) {
      socket.emit('ent_data', ent.getClientData());
    }
  });

  socket.on('inventory_combine', function(index){
    console.log("Player combined with "+index);
    var item2 = that.inventory[that.inventoryActive];
    var item1 = that.inventory[index];
    if (item1 == null || item2 == null){return};

    item.combine(item1, item2);
    that.inventory[that.inventoryActive] = item.update(item1);
    that.inventory[that.index] = item.update(item2);

    that.shareSelf();
  });

  if (this.bucket != null) {
    this.bucket.sendMegaPacketArea(this.socket);
  }
}

//Executes a command as the player
Player.prototype.executeCommand = function (args) {
  var cmd = loader.commands[args[0]];
  if (cmd != undefined) {
    var allowed = true;
    if (cmd.permission) {
      allowed = this.getPermission(cmd.permission)
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
Player.prototype.stringSave = function (str) {
  str = str.replace(/>/g, '&gt');
  str = str.replace(/</g, '&lt');
  return str;
}

//shows a popup at the client
Player.prototype.popup = function (id, filename, data) {
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
Player.prototype.msg = function (msg) {
  this.socket.emit('chat', { msg: msg, id: this.id });
}

//When the player disconnects
Player.prototype.disconnect = function () {
  if (this.game){
    this.ent.destroy();
    this.game.broadcast('disc', { id: this.id });
    this.game.players.splice(this.game.players.indexOf(this), 1);
  }
  var i = playerlist.indexOf(this);
  playerlist.splice(i, 1);
}

//Teleports the player to a specific position
Player.prototype.teleport = function (tileX, tileY) {
  this.ent.teleport(tileX, tileY);
  this.updateBucket();
}

//Resets the dragging of an object. So you don't drag anymore, since this is executed
Player.prototype.resetDrag = function () {
  this.ent.drag = null;
  this.shareSelf({ drag: false });
}

//sends data to the client about his player
Player.prototype.shareSelf = function (data) {
  if (!data){
    data = {
      hp: Math.floor(this.ent.sync.hp),
      inventory: this.inventory,
      drag: this.drag
    }
  }
  this.socket.emit('pSelf', data);
}

//will be executed every step
Player.prototype.step = function (delta) {
  /*this.x = utils.transition(this.x, this.tileX * 32, this.speed * (delta * 100), 0);
  this.y = utils.transition(this.y, this.tileY * 32, this.speed * (delta * 100), 0);
  if (this.x == this.tileX * 32 && this.y == this.tileY * 32) {
    this.inMovement = false;
  }*/
  if (this.ent.getState("burning")){
    this.ent.sync.hp -= delta;
    this.shareSelf({"hp" : Math.ceil(this.ent.sync.hp)});
  }
}

//update refreshes values and stuff
Player.prototype.update = function(){
  var hand = this.inventory[this.inventoryActive];
  if (hand != null){
    if (hand.sprite.length > 0){
      this.ent.changeSprite(1, {source: hand.sprite[0].source, visible: true});
    }
  }else{
    this.ent.changeSprite(1, {visible: false});
  }
}

//Gives the player an item
Player.prototype.give = function (itemData) {
  for (var val in this.inventory) {
    if (this.inventory[val] == null) {
      this.inventory[val] = itemData;
      this.shareSelf();
      this.update();
      break;
    }
  }
}

//Checks if the player have a permission to do something
Player.prototype.getPermission = function (permission) {
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
Player.prototype.updateBucket = function () {
  var tbucket = this.world.buckets.cellGet(Math.floor(this.ent.tx / config.bucket.width), Math.floor(this.ent.ty / config.bucket.height));
  this.changeBucket(tbucket);
}

//Changes the bucket, the player belongs to
Player.prototype.changeBucket = function (bucket) {
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
Player.prototype.kick = function (title, message) {
  this.popup("kicked", "html/kicked.html", {title: title || "", msg:message});
  var that = this;
  setTimeout(function(){
    that.socket.disconnect();
  }, 1000);
}

//rotates the player
Player.prototype.lookAt = function(tileX, tileY){

  var angle = Math.atan2(-(tileY - this.ent.ty), (tileX - this.ent.tx));
  //Thanks to Mario for the next line of code
  this.direction = Math.floor(2*angle / Math.PI + 4.5) % 4;

  this.ent.changeImageIndex(0, this.direction);
}

module.exports.Player = Player;