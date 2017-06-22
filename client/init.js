subfolder = ""

isAdmin=false;

/*
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
*/

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

server_ip = getParam('ip');

player = new Player();
//player.sprite = spr_player;
cam = player;

var lastTime = new Date;

$(document).ready(function(){
  initRenderer();
  view = new View(320,320);
  view.setZoom(2);

  chat_is_open = false;

  world = new World();
  world.resize(100,100);

  //$("#chat_msg").mCustomScrollbar();

  $('#chat_input').hide();
  var canvas = document.getElementById("canvas");
  var ctx = canvas.getContext('2d');
  ctx.canvas.width  = window.innerWidth;
  ctx.canvas.height = window.innerHeight;
  //ctx.scale(view_zoom, view_zoom);

  mouseX_ui = 0;
  mouseY_ui = 0;
  mouseX = 0;
  mouseY = 0;

  document.getElementById("server_content").addEventListener('mousemove', function(evt) {
    mouseX_ui = evt.clientX;
    mouseY_ui = evt.clientY;
  });

  initNetworking();

  gameLoop();
});