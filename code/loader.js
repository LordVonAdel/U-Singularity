var fs = require("fs");
var path = require("path");
var yaml = require("js-yaml");
var item = require("./item.js");

function Loader(){
  this.res = {
    tiles: {},
    commands: {},
    items: {},
    objects: {},
    actions: {},
    classes: {}
  }
  this.permissionGroups = {};
  this.config = {};
}

//Loads the classes from config/classes.yml
Loader.prototype.loadClasses = function(){
  console.log("[Loader]Reading classes from file...");
  try {
    var doc = yaml.safeLoad(fs.readFileSync('./config/classes.yml', 'utf8'));
    this.res.classes = doc;
    var keys = Object.keys(doc.classes);
    console.log("[Loader]Loaded "+keys.length+" classes: "+keys.join(", "));
  } catch (e) {
    console.error("[Loader]Classes: ", e);
  }
}

//Loads the permission groups from config/permissions.yml
Loader.prototype.loadPermissions = function(){
  console.log("[Loader]Reading permission groups from file...");
  try {
    var doc = yaml.safeLoad(fs.readFileSync('./config/permissions.yml', 'utf8'));
    this.permissionGroups = doc;
    console.log("[Loader]Loaded permission Groups");
  } catch (e) {
    console.error("[Loader]Permissions: ", e);
  }
}

//Loads the config from config/config.yml
Loader.prototype.loadConfig = function(){
  console.log("[Loader]Reading config from file...");
  try {
    var doc = yaml.safeLoad(fs.readFileSync('./config/config.yml', 'utf8'));
    this.config = doc;
    console.log("[Loader]Loaded config");
    console.log("[Loader]Found "+doc.games.length+" game configurations");
  } catch (e) {
    console.error("[Loader]Config: ", e);
  }
}

//Loads all objects from a file
Loader.prototype.loadFile = function(filename, callback){
  var res = this.res;

  function logLoad(num, key, filename){
    if (num[key] > 0){
      console.log("[Loader]Loaded "+num[key]+" "+key+" from "+filename)
    }
  }

  function checkItem(item){
    var img = [];
    if (typeof item.image == "string"){
      img = [{source: item.image}];
    }else if(Array.isArray(item.image)){
      for (var i = 0; i < item.image; i++){
        var image = item.image[i];
        if (typeof image == "string"){
          img.push({source: image});
        }else if (typeof image == "object"){
          img.push(image);
        }
      }
    }

    item.image = img;
    return item;
  }

  function checkObject(obj){
    if (obj.extends){
      var parent = res.objects[obj.extends];
      if (!parent){
        console.error("Can't extend from not existing object: "+obj.extends);
        return false;
      }
      return Object.assign({}, parent, obj);
    }else{
      return obj;
    }
  }

  var ext = path.extname(filename);
  var num = {
    tiles: 0,
    items: 0,
    actions: 0,
    commands: 0,
    objects: 0
  };
  if (ext == ".js"){

    //Dangerous!!!
    try {
      delete require.cache[require.resolve("../content/"+filename)];
      var exp = require("../content/"+filename);
    }catch(e){
      console.error("Content file has errors or don't exists: "+filename+"\n", e);
      return false;
    }
    if (exp.tiles != undefined){
      Object.assign(res.tiles,exp.tiles);
      num.tiles = Object.keys(exp.tiles).length;
    }
    if (exp.items != undefined){
      for (var k in exp.items){
        exp.items[k].id = k;
        exp.items[k] = checkItem(exp.items[k]);
      }
      Object.assign(res.items, exp.items);
      num.items = Object.keys(exp.items).length;
    }
    if (exp.commands != undefined){
      Object.assign(res.commands, exp.commands);
      num.commands = Object.keys(exp.commands).length;
    }
    if (exp.actions != undefined){
      Object.assign(res.actions,exp.actions);
      num.actions = Object.keys(exp.actions).length;
    }
    if (exp.objects != undefined){
      Object.assign(res.objects,exp.objects);
      num.objects = Object.keys(exp.objects).length;

      //extending and stuff
      for (var k in exp.objects){
        res.objects[k] = checkObject(exp.objects[k]);
      }
    }
    logLoad(num,"tiles",filename);
    logLoad(num,"items",filename);
    logLoad(num,"commands",filename);
    logLoad(num,"actions",filename);
    logLoad(num,"objects",filename);
  }
  if(callback){callback();}
}

//loads all the things from the content directory
Loader.prototype.auto = function(callback){
  var res = this.res;
  var that = this;

  console.log("[Loader]---Start auto load!---");
  var starttime = Date.now();
  fs.readdir( "./content", function( err, files ){
    if(err){
      console.error("[Loader]Can't list the modules directory.", err);
      return false;
    }
    var num = files.length;
    var ind = 0;
    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      that.loadFile(file, function(){
        ind++
        if (ind >= num){
          console.log("[Loader]---Finished auto load!---");
          console.log("[Loader]Registered tiles: "+Object.keys(res.tiles).length);
          console.log("[Loader]Registered items: "+Object.keys(res.items).length);
          console.log("[Loader]Registered actions: "+Object.keys(res.actions).length);
          console.log("[Loader]Registered commands: "+Object.keys(res.commands).length);
          console.log("[Loader]Registered objects: "+Object.keys(res.objects).length);
          console.log("[Loader]Loaded all content in " + (Date.now() - starttime) + "ms");
          if(callback){
            callback();
          }
        }
      });
    }
  });
}

module.exports = Loader;