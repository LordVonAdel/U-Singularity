res = {
  tiles: {}
};

function Tile(sprite) {
  this.sprite = sprite;
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
}