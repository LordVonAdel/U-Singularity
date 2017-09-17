const jobSprites = {
  "phy_m": "chars/char_physicist_m.png",
  "phy_f": "chars/char_physicist_f.png",
  "che_m": "chars/char_chemist_m.png",
  "che_f": "chars/char_chemist_f.png"
}

Entity = require('./entity.js').Entity;
handy = require('./handy.js');

function Player(socket) {
  this.socket = socket;
  this.tileX = 0;
  this.tileY = 0;
  this.x = this.tileX * 32;
  this.y = this.tileY * 32;
  this.health = 100;
  this.id = nextEntId;
  nextEntId += 1;
  this.name = "unnamed(" + this.id + ")";
  this.moveSpeed = config.player.walkSpeed;//3.2;
  this.inMovement = 0;
  this.config = false;
  this.inventory = {};
  this.direction = 0;
  this.gender = "m";
  this.job = "phy";
  this.burning = false;
  this.hands = 9;
  this.inventoryActive = 0;
  this.handRange = 1; //in tiles
  this.noclip = false;
  this.permissions = ['admin.*', 'world.load', 'master.*', 'world.*'] //test permissions
  this.drag = null;
  this.pushCooldown = 0;
  this.bucket = null;

  this.ent = null;
  this.world = null;
  this.game = null;

  var inv = this.inventory;
  for (var i = 0; i < this.hands; i++) {
    inv[i] = null;
  }
  //giving the player the start items
  inv[0] = new loader.Item("metal");
  inv[1] = new loader.Item("crowbar");
  inv[2] = new loader.Item("glass");
  inv[3] = new loader.Item("wall_frame");
  inv[4] = new loader.Item("knife");
  inv[5] = new loader.Item("armor_plating");
  inv[6] = new loader.Item("destroyer");
  inv[7] = new loader.Item("atmo_scanner");
  inv[8] = null;
  inv[9] = null;
  var that = this;

  console.log("Construct Player " + this.id);

  socket.on('move', function (data) {
    if (that.game != null) {
      //that.move(data.dir);
      if (!that.ent.isMoving) {
        that.ent.moveDir(data.dir, that.moveSpeed);
        that.ent.imageIndex = data.dir;
        that.ent.share({ imageIndex: that.ent.imageIndex });
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
      that.config = true; 6
      that.gender = data.gender;
      that.job = data.job;
      that.share();
      that.ent.share({ "walkAnimation": "jump" });
      var img = jobSprites[data.job + "_" + data.gender];
      if (img != undefined) {
        that.ent.changeImage(img);
      } else {
        //Config was not correct!
      }
    }
  });

  socket.on('inv_active', function (data) {
    if (data.slot < that.hands) {
      that.inventoryActive = data.slot;
    }
  });

  socket.on('useOnFloor', function (data) {
    if (that.config) {
      var xx = data.x;
      var yy = data.y;
      if (that.inventory[that.inventoryActive] != null) {
        var fun = res.actions[res.items[that.inventory[that.inventoryActive].type].onUseFloor];
        if (Math.hypot(xx - that.ent.tileX, yy - that.ent.tileY) < that.handRange + 1) {
          if (fun != undefined) {
            fun(that.world, xx, yy, that);
          }
        }
      }
    }
    //console.log(that.name+" used "+res.items[that.inventory[that.inventoryActive].type].name+" on the floor at: "+xx+", "+yy);
    //console.log("-> action: "+     res.items[that.inventory[that.inventoryActive].type].onUseFloor);
  });

  socket.on('disconnect', function (data) {
    console.log("[Server]" + that.name + " disconnected!");
    that.disconnect();
  });

  socket.on('drop', function (data) {
    var itm = that.inventory[that.inventoryActive];
    if (!that.world.collisionCheck(data.x, data.y)) {
      if (itm != null) {
        world.spawnItem(data.x, data.y, itm);
        that.inventory[that.inventoryActive] = null;
        that.share();
      }
    }
  });

  socket.on('ent_click', function (data) {
    if (that.game != null) {
      var itm = that.inventory[that.inventoryActive];
      if (itm == null) { itm = { type: "hand" } }
      var ent = that.world.ents[data.id];
      if (ent) {
        if (Math.hypot(ent.x - that.ent.x, ent.y - that.ent.y) < (that.handRange + 1) * 32) {
          ent.use(that, itm);
        }
      }
      //console.log("player clicked on "+data.id);
      //ents.data.id.click();
    }
  });

  socket.on('ent_drag', function (data) {
    if (that.game != null) {
      var ent = that.world.getEntById(data.id);//that.world.ents[data.id];
      if (ent != null) {
        if (ent == that.ent.drag) {
          ent.clearDragger();
        } else {
          if (ent.ent.dragable) {
            if (Math.hypot(ent.x - that.ent.x, ent.y - that.ent.y) < (that.handRange + 1) * 32) {
              that.ent.drag = ent;
              ent.setDragger(that.ent);
            }
          }
        }
      }
      that.shareSelf({ "drag": (that.ent.drag != null) })
    }
  });

  socket.on('ent_request', function(id){
    var ent = that.world.getEntById(id);
    if (ent){
      socket.emit('ent_data', ent.getClientData());
    }
  });

  //this.updateBucket();

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
Player.prototype.popup = function (id, filename) {
  var that = this;
  fs.readFile(filename, "utf-8", function (err, str) {
    that.socket.emit('server_content', { html: str, id: id });
  });
}

//Sends a chat message to the player
Player.prototype.msg = function (msg) {
  this.socket.emit('chat', { msg: msg, id: this.id });
}

//When the player disconnects
Player.prototype.disconnect = function () {
  this.ent.destroy();
  this.game.broadcast('disc', { id: this.id });
  var i = playerlist.indexOf(this);
  playerlist.splice(i, 1);
}

//Teleports the player to a specific position
Player.prototype.teleport = function (tileX, tileY) {
  this.ent.teleport(tileX, tileY);
  this.tileX = tileX;
  this.tileY = tileY;
  //this.ent.tx = tileX;
  //this.ent.ty = tileY;
  this.updateBucket();
}

//Resets the dragging of an object. So you don't drag anymore, since this is executed
Player.prototype.resetDrag = function () {
  this.ent.drag = null;
  this.shareSelf({ drag: false });
}

//send data from this player all over the place
Player.prototype.share = function (data) {
  if (data) {
    var obj = Object.assign({ id: this.id }, data);
  } else {
    var obj = { id: this.id, health: this.health, speed: this.moveSpeed, nick: this.name, inventory: this.inventory, job: this.job, gender: this.gender, name: this.name, burning: this.burning }
  }
  if (this.bucket != null) {
    this.bucket.broadcastArea('player_stats', obj, 3);
  } else {
    this.game.broadcast('player_stats', obj);
  }
}

//sends data to the client about his player
Player.prototype.shareSelf = function (data) {
  this.socket.emit('pSelf', data);
}

//will be executed every step
Player.prototype.step = function (delta) {
  this.x = handy.transition(this.x, this.tileX * 32, this.moveSpeed * (delta * 100), 0);
  this.y = handy.transition(this.y, this.tileY * 32, this.moveSpeed * (delta * 100), 0);
  if (this.x == this.tileX * 32 && this.y == this.tileY * 32) {
    this.inMovement = false;
  }
  this.game.broadcast('player_move', { x: this.tileX, y: this.tileY, id: this.id, w_x: this.x, w_y: this.y, dir: this.direction });
  if (this.burning) {
    this.health -= config.damage.burn;
  }
}

//Gives the player an item
Player.prototype.give = function (itemData) {
  for (var val in this.inventory) {
    if (this.inventory[val] == null) {
      this.inventory[val] = itemData;
      break;
    }
  }
}

//Checks if the player have a permission to do something
Player.prototype.getPermission = function (permission) {
  var tree = permission.split(".");
  var allowed = this.permissions.includes(permission);
  return (allowed);
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

module.exports.Player = Player;