function Player(socket){
 var player = this;
 this.sprite = null;
 this.id = -1;
 this.x = 32;
 this.y = 32;
 this.tileX = 1;
 this.tileY = 1;
 this.speed = 3;
 this.socket = socket;
 this.hands = 9;         //the number of hands the player have
 this.inventoryActive = 0;
 this.drag = false;
 
 //this.pawn = undefined;
 this.step = function(){
    var speed = player.speed;
    this.pawn = players[this.id];
    if (!chat_is_open){
    if (keyboardCheck(input.UP)){
      player.socket.emit('move',{dir: 1})
    }
    if (keyboardCheck(input.RIGHT)){
      player.socket.emit('move',{dir: 0})
    }
    if (keyboardCheck(input.DOWN)){
      player.socket.emit('move',{dir: 3})
    }
    if (keyboardCheck(input.LEFT)){
      player.socket.emit('move',{dir: 2})
    }
    //drawSprite(2,player.sprite,player.x,player.y);
    }
    if (mouseCheckPressed(0)){
      var tx = Math.floor(mouseX/32);
      var ty = Math.floor(mouseY/32);
      if(input.hlast == null){
        this.socket.emit('useOnFloor',{x:tx,y:ty});
      }
    }
    if (mouseWheelUp()){
      this.inventoryActive = (this.inventoryActive + 1) % this.hands; 
      this.socket.emit('inv_active',{slot: this.inventoryActive});
    }
    if (mouseWheelDown()){
      this.inventoryActive -= 1;
      if (this.inventoryActive < 0){
        this.inventoryActive = this.hands-1;
      }
      this.socket.emit('inv_active',{slot: this.inventoryActive});
    }
    if (keyboardCheckPressed(input.DROP)){
      var tx = Math.floor(mouseX/32);
      var ty = Math.floor(mouseY/32);
      this.socket.emit('drop',{x:tx,y:ty});
    }
  }
  this.draw = function(){
    var sprites = [spr_ui_inventory_slot,spr_ui_inventory_slot_active];
    var i;
    if (this.pawn != undefined){
      for(i=0; i<this.hands; i++){
        drawSprite(1000,sprites[(i == this.inventoryActive)*1],view_width/2-(this.hands*32/2)+32*i,view_height-32);
        if(this.pawn.inventory[i] != null){
          drawItem(1000,this.pawn.inventory[i],view_width/2-(this.hands*32/2)+32*i,view_height-32);
        }
      }
      if (this.pawn.inventory[this.inventoryActive] != null){
        drawText(1000,res.items[this.pawn.inventory[this.inventoryActive].type].name,0,view_height-16,"#FFFFFF")
      }
    }
    var xx = view_width/2-(this.hands*32/2)+32*i+16;
    if (this.drag){
      drawSprite(1000,sprites[0],xx,view_height-32);
      drawText(1000,"Drag",xx,view_height-24,"#ffffff");
    }
  }
}
function Pawn(){
  this.id = 0;
  this.inventory = {};
  this.x = 0;
  this.y = 0;
  this.tileX = 0;
  this.tileY = 0;
  this.moveSpeed = 3.2;
  this.name = "unnamed";
  this.direction = 0;
  this.job = "phy";
  this.gender = "m";
  this.burning = false;
  this.burn_frame = 0;
  this.say_time = 0;
  this.say_msg = "";
  this.say = function(text){
    this.say_time = text.length*config.speech_time*60;
    this.say_msg = text;
  }
  this.update = function(){
    this.burn_frame = (this.burn_frame + 1/5) % 4;
    if (this.say_time > 0){
      this.say_time -= 1;
    }
  }
  this.draw = function(){
    spr = spr_chars[this.job+"_"+this.gender];
    if (this.burning){
      drawSpritePart(20,spr_eff_fire_human_back,this.x,this.y,Math.floor(this.burn_frame)*32,0,32,32)
      drawSpritePart(21,spr_eff_fire_human_front,this.x,this.y,Math.floor(this.burn_frame)*32,0,32,32)
    }
    drawSpritePart(20,spr,this.x,this.y-Math.sin((((this.x % 32)+(this.y % 32))/32)*Math.PI)*2,this.direction*32,0,32,32)
    if (this.say_time > 0){
      if (config.speech_enable){
        drawSpeech(900,this.say_msg,this.x+16,this.y-16);
      }
    }
  }
}