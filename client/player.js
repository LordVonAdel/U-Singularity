function Player() {
  var player = this;
  this.id = -1;
  this.x = 32;
  this.y = 32;
  this.tileX = 1;
  this.tileY = 1;
  this.speed = 3;
  this.hands = 9;         //the number of hands the player have
  this.inventoryActive = 0;
  this.drag = false;
  this.pawn = null;

  this.hudInventorySlots = [];
  this.hudInventoryItems = [];
  var texSlot = getTexture(subfolder+"sprites/ui/ui_inventory_slot.png");
  var texSlotActive = getTexture(subfolder+"sprites/ui/ui_inventory_slot_active.png");

  this.hudDragSprite = new PIXI.Sprite(texSlot);
  this.hudDragText = new PIXI.Text("Drag",{fontFamily : 'Arial', fontSize: 14, fill : 0xffffff, align : 'center'});
  this.hudDragText.x = 0;
  this.hudDragText.y = 8;
  this.hudDragContainer = new PIXI.Container();
  this.hudDragContainer.addChild(this.hudDragSprite);
  this.hudDragContainer.addChild(this.hudDragText);
  stageUI.addChild(this.hudDragContainer);

  this.inventory = [];
  for (i = 0; i < this.hands; i++) {
    var sprite = new PIXI.Sprite(texSlot);
    var itemSprite = new PIXI.Sprite(PIXI.Texture.EMPTY);
    stageUI.addChild(sprite);
    stageUI.addChild(itemSprite);
    this.hudInventorySlots[i] = sprite;
    this.hudInventoryItems[i] = itemSprite;
    this.inventory[i] = null;
  }
  this.hudCurrentItemText = new PIXI.Text('',{fontFamily : 'Arial', fontSize: 28, fill : 0xffffff, align : 'left', stroke: 0x000000, strokeThickness: 2});
  stageUI.addChild(this.hudCurrentItemText);

  this.updateUI();
}

Player.prototype.step = function () {
  var speed = player.speed;
  this.pawn = players[this.id];
  if (!chat_is_open) {
    if (keyboardCheck(input.UP)) {
      socket.emit('move', { dir: 1 })
    }
    if (keyboardCheck(input.RIGHT)) {
      socket.emit('move', { dir: 0 })
    }
    if (keyboardCheck(input.DOWN)) {
      socket.emit('move', { dir: 3 })
    }
    if (keyboardCheck(input.LEFT)) {
      socket.emit('move', { dir: 2 })
    }
    //drawSprite(2,player.sprite,player.x,player.y);
  }
  if (mouseCheckPressed(0)) {
    var tx = Math.floor(mouseX / 32);
    var ty = Math.floor(mouseY / 32);
    if (input.hlast == null) {
      socket.emit('useOnFloor', { x: tx, y: ty });
    }
  }
  if (mouseWheelUp()) {
    this.inventoryActive = (this.inventoryActive + 1) % this.hands;
    socket.emit('inv_active', { slot: this.inventoryActive });
    this.updateUI();
  }
  if (mouseWheelDown()) {
    this.inventoryActive -= 1;
    if (this.inventoryActive < 0) {
      this.inventoryActive = this.hands - 1;
    }
    socket.emit('inv_active', { slot: this.inventoryActive });
    this.updateUI();
  }
  if (keyboardCheckPressed(input.DROP)) {
    var tx = Math.floor(mouseX / 32);
    var ty = Math.floor(mouseY / 32);
    socket.emit('drop', { x: tx, y: ty });
  }
}

Player.prototype.updateUI = function(){
  //slot sprite
  var texSlot = getTexture("sprites/ui/ui_inventory_slot.png");
  var texSlotActive = getTexture("sprites/ui/ui_inventory_slot_active.png");

  var s = config.uiScale * 2 * 32; //size in pixel (width & height)


  for (i = 0; i < this.hands; i++) {
    var sprite = this.hudInventorySlots[i];
    sprite.scale.x = config.uiScale * 2;
    sprite.scale.y = config.uiScale * 2;
    sprite.x = (renderer.screen.width) / 2 - (this.hands * s / 2) + s * i;
    sprite.y = (renderer.screen.height) - s;
    if (i == this.inventoryActive){
      sprite.setTexture(texSlotActive);
    }else{
      sprite.setTexture(texSlot);
    }

    //item sprite
    var sprite = this.hudInventoryItems[i];
    var s = config.uiScale * 2 * 32; //size in pixel (width & height)
    sprite.scale.x = config.uiScale * 2;
    sprite.scale.y = config.uiScale * 2;
    sprite.x = renderer.screen.width / 2 - (this.hands * s / 2) + s * i;
    sprite.y = renderer.screen.height - s;
    if (this.inventory[i] == null){
      sprite.setTexture(PIXI.Texture.EMPTY);
    }else{
      var url = "sprites/"+res.items[this.inventory[i].type].sprite;
      sprite.setTexture(getTexture(url));
    }
  }

  if (this.inventory[this.inventoryActive] != null){
    this.hudCurrentItemText.text = res.items[this.inventory[this.inventoryActive].type].name;
  }else{
    this.hudCurrentItemText.text = "";
  }
  this.hudCurrentItemText.x = 0;
  this.hudCurrentItemText.y = renderer.screen.height - 32;

  this.hudDragContainer.x = renderer.screen.width / 2 - (this.hands * s / 2) + s * this.hands + 96;
  this.hudDragContainer.y = renderer.screen.height - s;
  this.hudDragContainer.scale.x = config.uiScale * 2;
  this.hudDragContainer.scale.y = config.uiScale * 2;
  this.hudDragContainer.visible = this.drag;
}

Player.prototype.getActiveItem = function(){
  return this.inventory[this.inventoryActive];
}

/*
function Pawn() {
  this.id = 0;
  this.inventory = {};
  this.x = 0;
  this.y = 0;
  this.tileX = 0;
  this.tileY = 0;
  this.move = 3.2;
  this.name = "unnamed";
  this.direction = 0;
  this.job = "phy";
  this.gender = "m";
  this.burning = false;
  this.burn_frame = 0;
  this.say_time = 0;
  this.say_msg = "";
  this.say = function (text) {
    this.say_time = text.length * config.speech_time * 60;
    this.say_msg = text;
  }
  this.update = function () {
    this.burn_frame = (this.burn_frame + 1 / 5) % 4;
    if (this.say_time > 0) {
      this.say_time -= 1;
    }
  }
  this.draw = function () {
    spr = spr_chars[this.job + "_" + this.gender];
    if (this.burning) {
      drawSpritePart(20, spr_eff_fire_human_back, this.x, this.y, Math.floor(this.burn_frame) * 32, 0, 32, 32)
      drawSpritePart(21, spr_eff_fire_human_front, this.x, this.y, Math.floor(this.burn_frame) * 32, 0, 32, 32)
    }
    drawSpritePart(20, spr, this.x, this.y - Math.sin((((this.x % 32) + (this.y % 32)) / 32) * Math.PI) * 2, this.direction * 32, 0, 32, 32)
    if (this.say_time > 0) {
      if (config.speech_enable) {
        drawSpeech(900, this.say_msg, this.x + 16, this.y - 16);
      }
    }
  }
}
*/