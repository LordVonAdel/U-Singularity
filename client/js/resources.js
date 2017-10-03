res = {
  tiles: {},
  items: {}
};

function Tile(sprite) {
  this.sprite = sprite;
}
function Item(sprite, name) {
  this.sprite = sprite;
  this.name = name;
}

function load(object) {
  console.log("Got asset information from server!");
  if (object.tiles != undefined) {
    for (k in object.tiles){
      var value = object.tiles[k];
      var obj = new Tile(object.tiles[k].image);
      obj.connectionType = value.connectionType;
      obj.connectionGroup = value.connectionGroup;
      obj.transparent = value.transparent;

      res.tiles[k] = obj;
    }
  }
  if (object.items != undefined) {
    $.each(object.items, function (key, value) {
      var spr = value.image;//Sprite(subfolder + "sprites/" + value.image);
      res.items[key] = new Item(spr, value.name);
    });
  }
}