subfolder = ""

isAdmin=false;

spr_player = Sprite(subfolder+"sprites/player.png");
spr_ui_inventory_slot = Sprite(subfolder+"sprites/ui/ui_inventory_slot.png");
spr_ui_inventory_slot_active = Sprite(subfolder+"sprites/ui/ui_inventory_slot_active.png");

spr_eff_fire_human_back = Sprite(subfolder+"sprites/effects/eff_fire_human_back.png")
spr_eff_fire_human_front = Sprite(subfolder+"sprites/effects/eff_fire_human_front.png")

spr_chars = {};
spr_chars["che_m"] = Sprite(subfolder+"sprites/chars/char_chemist_m.png");
spr_chars["che_f"] = Sprite(subfolder+"sprites/chars/char_chemist_f.png");
spr_chars["phy_m"] = Sprite(subfolder+"sprites/chars/char_physicist_m.png");
spr_chars["phy_f"] = Sprite(subfolder+"sprites/chars/char_physicist_f.png");

draw_pipe = [];

cam = null;

players = {};
ents = {};

gm = {};

function def(item,def){
  if (item == null){
    return def;
  }else{
    return item;
  }
}

config = {
  speech_time: def(localStorage.getItem('speech_time'),0.25),
  speech_enable: def(localStorage.getItem('speech_enable'),true)
};

viewX = 0;
viewY = 0;
view_width = 320;
view_height = 320;
view_zoom = 2;

chat_is_open = false;

world = new World();
world.resize(100,100);

server_ip = getParam('ip');
var socket = io();
socket.on('welcome',function(data){
  player.id = data.id;
  console.log("Connected to Server!");
  socket.emit('welcome',{});
});
socket.on('player_joined',function(data){
  console.log("A player joined the game!");
  var pawn = new Pawn();
  players[data.id] = pawn;
  pawn.id = data.id;
});
socket.on('player_move',function(data){
  var obj = players[data.id];
  if (obj != undefined){
    obj.tileX = data.x;
    obj.tileY = data.y;
    obj.x = data.w_x;
    obj.y = data.w_y;
    obj.direction = data.dir;
  }
});
socket.on('player_stats',function(data){
  var obj = players[data.id];
  if (obj != undefined){
    obj.moveSpeed = data.speed;
    obj.health = data.health;
    obj.name = data.name;
    obj.inventory = data.inventory;
    obj.gender = data.gender;
    obj.job = data.job;
    obj.burning = data.burning;
  }
});
socket.on('chat',function(data){
  //console.log('chat: '+data.msg);
  $("#chat_msg").append("<br>"+data.msg);
  if (data.player != undefined){
    if (players[data.player] != undefined){
      players[data.player].say(data.raw);
    }
  }
  $("#chat_msg").scrollTop($("#chat_msg").prop("scrollHeight"));
});
socket.on('resource',function(data){
  //console.log(data);
  load(data);
});
socket.on('server_content',function(data){
  content_set(data.id,data.html);
  //$("#server_content").html(data.html);
  //$("#server_content").css("display","intial");
});
socket.on('change_tile',function(data){
  world.grid.cellSet(data.x,data.y,data.id);
})
socket.on('world',function(data){
  world.resize(data.w,data.h);
  world.grid.load(data.str);
});
socket.on('world_region',function(data){
  world.grid.loadRegion(data.str,data.x,data.y,data.w);
});
socket.on('disc',function(data){
  delete players[data.id];
});
socket.on('ent_spawn',function(data){
  var ent = new Entity(data.id,data.x,data.y,data.image,data.image_number,data.image_index,data.tile)
  ent.update(data);
  ents[data.id] = ent;
});
socket.on('ent_data',function(data){
  var ent = ents[data.id];
  if (ent == undefined){
    ents[data.id] = new Entity(data.id,data.x,data.y,data.image,data.image_number,data.image_index,data.tile)
    ent = ents[data.id];
  }
  ent.update(data)
});
socket.on('ent_destroy',function(data){
  var ent = ents[data.id];
  ent.destroy();
  delete ents[data.id];
});
socket.on('gm',function(data){
  Object.assign(gm, data);
});
socket.on('pSelf',function(data){
  $.extend(player,data)
});
socket.on('clear',function(data){
  ents = {};
});

player = new Player(socket);
player.sprite = spr_player;
cam = player;

var lastTime = new Date;

$(document).ready(function(){
  initRenderer();

  //$("#chat_msg").mCustomScrollbar();

  $('#chat_input').hide();
  var canvas = document.getElementById("canvas");
  var ctx = canvas.getContext('2d');
  ctx.canvas.width  = window.innerWidth;
  ctx.canvas.height = window.innerHeight;
  ctx.scale(view_zoom, view_zoom);

  mouseX_ui = 0;
  mouseY_ui = 0;
  mouseX = 0;
  mouseY = 0;

  document.getElementById("server_content").addEventListener('mousemove', function(evt) {
    mouseX_ui = evt.clientX;
    mouseY_ui = evt.clientY;
  });

  world.draw();

  gameLoop();
});