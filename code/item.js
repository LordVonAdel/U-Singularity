
//item factory function
function createItem(type){
  var exp = {};

  var itm = res.items[type];
  if (itm){
    exp.type = type;
    exp.name = itm.name;
    exp.sprite = itm.image;
    exp.sync = Object.assign({}, itm.sync);
    return exp;
  }
  return null;
}

//Checks if an item object have the needed keys and if not it applies them
function check(item){
  if (!item){return null;}
  if (item.type){
    var mother = res.items[item.type];
    item.name = item.name || mother.name;
    item.sprite = item.sprite || mother.image;
    item.sync = item.sync || mother.sync;
    return item;
  }else{
    return null;
  }
}

//Changes the type of an item
function transform(item, type){
  var itm = res.items[type];
  if (itm){
    item.type = type;
    item.name = itm.name;
    item.sprite = itm.image;
  }
}

//Combines to items if possible
function combine(item1, item2){
  var type1 = res.items[item1.type];
  var type2 = res.items[item2.type];
  if (type1 && type2 && type1.on && type2.actions){
    for (var k in type1.on){
      var fun = type1.on[k];
      if (type2.actions.includes(k)){
        fun.call(item1, item2);
      }
    }
  }
}

module.exports.create = createItem;
module.exports.check = check;
module.exports.transform = transform;
module.exports.combine = combine;