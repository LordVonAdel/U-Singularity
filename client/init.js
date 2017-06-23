subfolder = ""

isAdmin=false;

draw_pipe = [];

cam = null;
camId = null;

players = {};
ents = {};

gm = {};

config = {
  speech_time: localStorage.getItem('speech_time') || 0.25,
  speech_enable: localStorage.getItem('speech_enable') ||true,
  uiScale: 1
};

server_ip = getParam('ip');

var lastTime = new Date();

$(document).ready(function(){

  initRenderer();
  player = new Player();
  //cam = player;

  view = new View(320,320);
  view.setZoom(2);

  uiZoom = 2;

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