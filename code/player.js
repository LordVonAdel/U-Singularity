const jobSprites = {
  "phy_m": "chars/char_physicist_m.png",
  "phy_f": "chars/char_physicist_f.png",
  "che_m": "chars/char_chemist_m.png",
  "che_f": "chars/char_chemist_f.png"
}

Entity = require('./entity.js').Entity;

function Player(socket){
  this.socket = socket;
  this.tileX = 0;//wrd.spawnX;
  this.tileY = 0;//wrd.spawnY;
  this.x = this.tileX*32;
  this.y = this.tileY*32;
  this.health = 100;
  this.id = nextEntId;
  nextEntId += 1;
  this.name = "unnamed("+this.id+")";
  this.move_time = 20;
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
  this.permissions = ['admin.*','world.load'] //test permissions
  this.drag = null;
  this.pushCooldown = 0;
  this.bucket = null;

  this.ent = null;
  this.world = null;
  this.game = null;
  //this.ent.moveSpeed = this.moveSpeed;
  //socket.emit('cam',this.ent.id);

  //this.ent = new Entity("player",wrd.spawnX, wrd.spawnY);

  var inv = this.inventory;
  for(var i=0; i<this.hands; i++){
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

  console.log("Construct Player "+this.id);

  socket.on('move',function(data){
    if (that.game != null){
      that.move(data.dir);
      //that.ent.move(data.dir);
    }
  });

  socket.on('chat', function(data){
    data.msg = that.stringSave(data.msg);
    console.log(that.name+": "+data.msg);
    if (data.msg.charAt(0)=="/"){
      var args = data.msg.slice(1).split(" ");
      handy.command(that,args);
    }else{
      that.game.broadcast('chat',{msg: '<span class="name">'+that.name+":</span> "+data.msg, player: that.id, raw: data.msg});
    }
  });

  socket.on('config',function(data){
    if (!that.config){
      that.name = that.stringSave(data.name);
      that.config = true;6
      that.gender = data.gender;
      that.job = data.job;
      that.share();
      that.ent.share({"walkAnimation":"jump"});
      var img = jobSprites[data.job+"_"+data.gender];
      if (img != undefined){
        that.ent.changeImage(img);
      }else{
        //Config was not correct!
      }
    }
  });

  socket.on('inv_active',function(data){
    if (data.slot < that.hands){
      that.inventoryActive = data.slot;
    }
  });

  socket.on('useOnFloor',function(data){
    if (that.config){
      var xx = data.x;
      var yy = data.y;
      if (that.inventory[that.inventoryActive] != null){
        var fun = res.actions[res.items[that.inventory[that.inventoryActive].type].onUseFloor];
        if (Math.hypot(xx-that.tileX, yy-that.tileY)<that.handRange+1){
          if (fun != undefined){
            fun(xx,yy,that);
          }
        }
      }
    }
    //console.log(that.name+" used "+res.items[that.inventory[that.inventoryActive].type].name+" on the floor at: "+xx+", "+yy);
    //console.log("-> action: "+     res.items[that.inventory[that.inventoryActive].type].onUseFloor);
  });

  socket.on('disconnect',function(data){
    console.log("[Server]"+that.name+" disconnected!");
    that.disconnect();
  });

  socket.on('drop',function(data){
    var itm = that.inventory[that.inventoryActive];
    if (!wrd.collisionCheck(data.x,data.y)){
      if (itm != null){
        spawn.item(data.x,data.y,itm);
        that.inventory[that.inventoryActive] = null;
        that.share();
      }
    }
  });

  socket.on('ent_click',function(data){
    if (that.game != null){
      var itm = that.inventory[that.inventoryActive];
      if (itm == null){itm={type:"hand"}}
      var ent = that.world.ents[data.id];
      if (ent != undefined){
        if (Math.hypot(ent.x-that.x, ent.y-that.y)<(that.handRange+1)*32){
          ent.use(that,itm);
        }
      }
      //console.log("player clicked on "+data.id);
      //ents.data.id.click();
    }
  });

  socket.on('ent_drag',function(data){
    if (that.game != null){
      var ent = wrd.ents[data.id];
      if (ent == that.drag){
        ent.clearDragger();
      }else{
        if (ent.ent.dragable){
          if (Math.hypot(ent.x-that.x, ent.y-that.y)<(that.handRange+1)*32){
            that.drag = ent;
            ent.setDragger(that);
          }
        }
      }
      that.shareSelf({"drag":(that.drag != null)})
    }
  }); 

  //this.updateBucket();

  if (this.bucket != null){
    this.bucket.sendMegaPacketArea(this.socket);
  }
}

Player.prototype.stringSave = function(str){
  str = str.replace(/>/g, '&gt');
  str = str.replace(/</g, '&lt');
  return str;
}

Player.prototype.popup = function(id, filename){
  var that = this;
  fs.readFile(filename, "utf-8", function(err, str){
    that.socket.emit('server_content',{html: str, id: id});
  });
}

Player.prototype.msg = function(msg){
  this.socket.emit('chat',{msg: msg, id: this.id});
}

Player.prototype.disconnect = function(){
  this.world.collisionFree(this.tileX,this.tileY,this);
  this.game.broadcast('disc',{id: this.id});
  var i = playerlist.indexOf(this);
  playerlist.splice(i, 1);
}

Player.prototype.teleport = function(tileX,tileY){
  //wrd.collisionFree(this.tileX,this.tileY,this);
  //wrd.collisionAdd(tileX,tileY,this);
  this.tileX = tileX;
  this.tileY = tileY;
  this.x = tileX*32;
  this.y = tileY*32;
  this.updateBucket();
}

Player.prototype.moveTo = function(x,y,speed){
  //wrd.collisionFree(this.tileX,this.tileY,this);
  this.tileX = x;
  this.tileY = y;
  //wrd.collisionAdd(this.tileX,this.tileY,this);
  this.updateBucket();
  return true;
}

Player.prototype.resetDrag = function(){
  this.drag = null;
  this.shareSelf({drag: false});
}

Player.prototype.move = function(direction){
  var that = this;
  var success = false;
  var startX = this.tileX;
  var startY = this.tileY;
  var targetX = this.tileX;
  var targetY = this.tileY;
  if (direction == 0){targetX += 1;}
  if (direction == 1){targetY -= 1;}
  if (direction == 2){targetX -= 1;}
  if (direction == 3){targetY += 1;}
  this.direction = direction;
  if (this.config){
    if (!this.inMovement){
      this.move_action = this.move_time;
      if (direction == 0){
        if (!this.world.collisionCheck(this.tileX+1,this.tileY) || this.noclip ){
          this.tileX += 1;
          success = true;
        }
      }
      if (direction == 2){
        if (!this.world.collisionCheck(this.tileX-1,this.tileY) || this.noclip){
          this.tileX -= 1;
          success = true;
        }
      }
    }
    if (!this.inMovement){
      if (direction == 1){
        if (!this.world.collisionCheck(this.tileX,this.tileY-1) || this.noclip){
          this.tileY -= 1;
          success = true;
        }
      }
      if (direction == 3){
        if (!this.world.collisionCheck(this.tileX,this.tileY+1) || this.noclip){
          this.tileY += 1;
          success = true;
        }
      }
    }
  }
  if (success){
    this.pushCooldown = 0;
    //wrd.collisionFree(startX,startY,this);
    //wrd.collisionAdd(this.tileX,this.tileY,this);
    this.updateBucket();
    this.inMovement = true;
    this.ent.move(this.tileX, this.tileY);
    if (this.drag != null){
      var suc = this.drag.moveTo(startX,startY,this.moveSpeed);
      if (!suc){
        this.drag = null;
      }
    }
  }else if(!this.inMovement){
    this.pushCooldown += 1;
    if (this.pushCooldown >= 10){
      this.pushCooldown = 0;
      var collide = this.world.gridCollision.cellGet(targetX,targetY);
      /*collide.forEach(function(value,index){
        var ent = this.world.ents[value];
        if (ent != undefined){
          ent.clearDragger();
          if(ent.ent.dragable){
            ent.moveDir(direction,that.moveSpeed);
          }
          if(ent.ent.onPush != undefined){
            ent.ent.onPush(this,ent);
          }
        }
      });*/
      this.push = false;
    }
  }
  this.ent.imageIndex = direction;
  this.ent.share({imageIndex: direction});
}

Player.prototype.share = function(data){
  if (data){
    var obj = Object.assign({id: this.id},data)
  }else{
    var obj = {id: this.id, health: this.health, speed: this.moveSpeed, nick: this.name, inventory: this.inventory, job: this.job, gender: this.gender, name:this.name, burning: this.burning}
  }
  if (this.bucket != null){
    this.bucket.broadcastArea('player_stats',obj,3);
  }else{
    this.game.broadcast('player_stats',obj);
  }
}

Player.prototype.shareSelf = function(data){
  this.socket.emit('pSelf',data)
}

Player.prototype.step = function(delta){
  this.x = handy.transition(this.x,this.tileX*32,this.moveSpeed*(delta*100),0)
  this.y = handy.transition(this.y,this.tileY*32,this.moveSpeed*(delta*100),0)
  if (this.x == this.tileX*32 && this.y == this.tileY*32){
    this.inMovement = false;
  }
  this.game.broadcast('player_move',{x: this.tileX, y: this.tileY, id: this.id, w_x: this.x, w_y: this.y, dir: this.direction})
  if (this.burning){
    this.health -= config.damage.burn;
  }
}

Player.prototype.give = function(itemData){
  for(var val in this.inventory){
    if (this.inventory[val] == null){
      this.inventory[val] = itemData;
      break;
    }
  }
}

Player.prototype.getPermission = function(permission){
  if (this.permissions.indexOf(permission) >= 0){
    return true;
  }else{
    return false;
  }
}

Player.prototype.updateBucket = function(){
  var tbucket = this.world.buckets.cellGet(Math.floor(this.ent.tx/config.bucket.width),Math.floor(this.ent.ty/config.bucket.height))
  this.changeBucket(tbucket);
}

Player.prototype.changeBucket = function(bucket){
  if (bucket){
    if (this.bucket != bucket){
      bucket.addPlayer(this);
      if (this.bucket != null){
        this.bucket.removePlayer(this);
      }
      this.bucket = bucket;
      this.bucket.sendMegaPacketArea(this.socket);
    }
  }
}

module.exports.Player = Player;