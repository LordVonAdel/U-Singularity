var fs = require("fs");
var path = require("path");

var commands = {};
var res = {
tiles: {},
  items: {
    "hand":{
      "actions":["hand"]
    }
  },
  actions: {},
  objects: {
    "item":{
      "sync":{item: null},
      "image":"items/item_crowbar.png",
      "onClick":function(sender,ent){
        if(sender.inventory[sender.inventory_active] == null){
          sender.inventory[sender.inventory_active] = ent.sync.item;
          sender.share();
          ent.destroy();
        }
      },
      "onUpdate":function(ent){
        if (ent.sync.item == null){
          ent.destroy()
          console.log("Destroyed Null Item")
        }else{
          var itm = res.items[ent.sync.item.type];
          if (itm){
            ent.image = itm.image;
            ent.share();
          }
        }
      },
      "actions":{}
    }
  }
}
function load(filename,callback){
  function logLoad(num,key,filename){
    if (num[key] > 0){
      console.log("[Loader]Loaded "+num[key]+" "+key+" from "+filename)
    }
  }
  var ext = path.extname(filename);
  var num = {
    tiles: 0,
    items: 0,
    actions: 0,
    commands: 0,
    actions: 0,
    objects: 0
  };
  if (ext == ".js"){
    var exp = require("../modules/"+filename);
    if (exp.tiles != undefined){
      Object.assign(res.tiles,exp.tiles);
      num.tiles = Object.keys(exp.tiles).length;
    }
    if (exp.items != undefined){
      Object.assign(res.items,exp.items);
      num.items = Object.keys(exp.items).length;
    }
    if (exp.commands != undefined){
      Object.assign(commands,exp.commands);
      num.commands = Object.keys(exp.commands).length;
    }
    if (exp.actions != undefined){
      Object.assign(res.actions,exp.actions);
      num.actions = Object.keys(exp.actions).length;
    }
    if (exp.objects != undefined){
      Object.assign(res.objects,exp.objects);
      num.objects = Object.keys(exp.objects).length;
    }
    logLoad(num,"tiles",filename);
    logLoad(num,"items",filename);
    logLoad(num,"commands",filename);
    logLoad(num,"actions",filename);
    logLoad(num,"objects",filename);
  }
  if(callback){callback();}
}

function auto(callback){
  fs.readdir( "./modules", function( err, files ){
    if(err){
      console.error( "[Loader]Can't list the modules directory.", err );
    }
    var num = files.length;
    var ind = 0;
    files.forEach(function(file,index){
      load(file,function(){
        ind++
        if (ind >= num){
          if(callback){
            callback();
          }
        }
      });
    });
  });
}

function Tile(name,collision,image){
  this.collision = collision;
  this.image = image;
}
function Item(type){
  if (res.items[type]!=undefined){
    this.type = type;
    this.sync = Object.assign({},res.items[type].sync || {});
  }else{
    console.log("Item not found: "+type)
    return null;
  }
}

module.exports.auto = auto;
module.exports.load = load;
module.exports.res = res;
module.exports.commands = commands;
module.exports.Item = Item;