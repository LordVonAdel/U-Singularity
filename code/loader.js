var fs = require("fs");
var path = require("path");

var commands = {}; //object with a list of commands
//default loaded things, which make no sense to move in external files
var res = { //object with every dynamic loaded content, excepts maps and commands
  tiles: {},
  items: {
    "hand":{
      "actions":["hand"]
    }
  },
  actions: {},
  objects: {
    "item":{ //the item entity
      "sync":{item: null},
      "image":"items/item_crowbar.png",
      "onClick":function(sender){
        if(sender.inventory[sender.inventoryActive] == null){
          sender.inventory[sender.inventoryActive] = this.sync.item;
          sender.share();
          this.destroy();
        }
      },
      "onUpdate":function(){
        if (this.sync.item == null){
          this.destroy();
          console.log("Destroyed Null Item");
        }else{
          var itm = res.items[this.sync.item.type];
          if (itm){
            this.image = itm.image;
            this.share();
          }
        }
      },
      "actions":{}
    },
    "player":{
      "collision":true,
      "sync":{client: null},
      "image":"chars/char_chemist_f.png",
      "actions": {
        "knife": function(){
          this.hp -= 1;
          this.client.msg("Ouch!");
        }
      }
    }
  }
}

//this thing loads all content found in one file
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
    var exp = require("../content/"+filename);
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

//loads all the things of the modules directory
function auto(callback){
  fs.readdir( "./content", function( err, files ){
    if(err){
      console.error("[Loader]Can't list the modules directory.", err);
      return false;
    }
    var num = files.length;
    var ind = 0;
    files.forEach(function(file, index){
      load(file, function(){
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

function Tile(name, collision, image){ 
  //I don't know if this is called somewhere...
  //Ok, used the search function and it is not called anywhere.
  //There is a constructor which uses the name "Tile", but it is in the client code
  //As you see down below, this is not event exported
  this.collision = collision;
  this.image = image;
}

function Item(type){
  if (res.items[type] != undefined){
    this.type = type;
    this.sync = Object.assign({}, res.items[type].sync || {});
  }else{
    console.log("Item not found: " + type)
    return null;
  }
}

module.exports.auto = auto;
module.exports.load = load;
module.exports.res = res;
module.exports.commands = commands;
module.exports.Item = Item;