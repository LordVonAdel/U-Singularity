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
  this.hp = 0;

  this.hudInventorySlots = [];
  this.hudInventoryItems = [];
  var texSlot = getTexture(subfolder+"sprites/ui/ui_inventory_slot.png");
  var texSlotActive = getTexture(subfolder+"sprites/ui/ui_inventory_slot_active.png");

  this.hudDragSprite = new PIXI.Sprite(texSlot);
  this.hudDragText = new PIXI.Text("Drag",{fontFamily : 'Arial', fontSize: 14, fill : 0xffffff, align : 'center'});
  this.hudDragText.x = 0;
  this.hudDragText.y = 8;
  this.hudHealthText = new PIXI.Text("Health: 100HP",{fontFamily : 'Arial', fontSize: 28, fill : 0x000000, align : 'bottom', stroke: 0xffffff, strokeThickness: 1});
  stageUI.addChild(this.hudHealthText);
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

  this.hudHealthText.text = "Health: " + this.hp + "HP";
  this.hudHealthText.x = this.hudInventorySlots[0].x;
  this.hudHealthText.y = this.hudInventorySlots[0].y - 32;

  this.hudDragContainer.x = renderer.screen.width / 2 - (this.hands * s / 2) + s * this.hands + 96;
  this.hudDragContainer.y = renderer.screen.height - s;
  this.hudDragContainer.scale.x = config.uiScale * 2;
  this.hudDragContainer.scale.y = config.uiScale * 2;
  this.hudDragContainer.visible = this.drag;
}

Player.prototype.getActiveItem = function(){
  return this.inventory[this.inventoryActive];
}

Player.prototype.updateFOV = function(){
  grFOV.visible = useFOV;
  if (useFOV){
    if (!cam){return false}
    function breakLine(x1, y1, x2, y2, ox, oy){
      var dir1 = Math.atan2(x1 - ox, y1 - oy);
      var dir2 = Math.atan2(x2 - ox, y2 - oy);
      grFOV.beginFill(0x000000, 0.5);
      grFOV.moveTo(x1, y1);
      grFOV.lineTo(x2, y2);
      grFOV.lineTo(x1 + Math.sin(dir1)*32, y1 + Math.cos(dir1)*32);
      grFOV.endFill();
      grFOV.beginFill(0x000000, 0.5);
      grFOV.lineTo(x2, y2);
      grFOV.lineTo(x1 + Math.sin(dir1)*32, y1 + Math.cos(dir1)*32);
      grFOV.lineTo(x2 + Math.sin(dir2)*32, y2 + Math.cos(dir2)*32);
      grFOV.endFill();
    }
    var xoff = Math.floor(view.x / 32);
    var yoff = Math.floor(view.y / 32);
    var cx = cam.x + 16;
    var cy = cam.y + 16;
    grFOV.clear();
    for (var i = 0; i < view.width / 32; i++){
      for (var j = 0; j < view.height / 32; j++){
        var tileX = xoff + i;
        var tileY = yoff + j;
        var tile = res.tiles[world.grid.cellGet(tileX, tileY)];
        if (tile != undefined){
          if (tile.transparent != undefined){
            if (tile.transparent == false){
              var x = tileX * 32;
              var y = tileY * 32;
              breakLine(x, y, x + 32, y, cx, cy);
              breakLine(x + 32, y, x + 32, y + 32, cx, cy);
              breakLine(x, y+32, x + 32, y + 32, cx, cy);
              breakLine(x, y, x, y + 32, cx, cy);      
            }
          }
        }
      }
    }
  }
}