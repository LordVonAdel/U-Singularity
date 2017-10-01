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
  speech_enable: localStorage.getItem('speech_enable') || true,
  uiScale: 1
};

useFOV = false;
useLight = false;

server_ip = getParam('ip');

var lastTime = Date.now();

$(document).ready(function(){

  initRenderer();
  player = new Player();
  //cam = player;

  view = new View(320,320);
  view.setZoom(2);

  lc = new LightController(document.getElementById("canvas-light"));

  uiZoom = 2;

  chat_is_open = false;

  world = new World();
  world.resize(100,100);

  //$("#chat_msg").mCustomScrollbar();

  $('#chat_input').hide();

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