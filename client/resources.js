res = {
 tiles: {},
 items: {}
};

function Tile(sprite){
 this.sprite = sprite;
}
function Item(sprite,name){
 this.sprite = sprite;
 this.name = name;
}

function load(object){
 console.log("Got asset information from server!");
 if (object.tiles != undefined){
  $.each(object.tiles,function(key,value){
   var spr = Sprite(subfolder+"sprites/"+value.image);
   var obj = new Tile(spr);
   obj.connectionType = value.connectionType;
   obj.connectionGroup = value.connectionGroup;
   res.tiles[key] = obj;
  });
 }
 if (object.items != undefined){
  $.each(object.items,function(key,value){
   var spr = Sprite(subfolder+"sprites/"+value.image);
   res.items[key] = new Item(spr,value.name);
  });
 }
}