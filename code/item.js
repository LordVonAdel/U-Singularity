
//item factory function
function createItem(type){
  var exp = {};

  var itm = res.items[type];
  if (itm){
    exp.type = type;
    exp.name = itm.name;
    exp.sprite = itm.image;
    return exp;
  }
  return null;
}

function check(item){
  if (!item){return null;}
  if (item.type){
    var itm = res.items[item.type];
    item.name = item.name || itm.name;
    item.image = item.image || itm.image;
    return item;
  }else{
    return null;
  }
}

module.exports.create = createItem;
module.exports.check = check;