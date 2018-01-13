subfolder = ""

cam = null;
camId = null;

players = {};
ents = {};
hoverlist = [];

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

$(function(){

  mouseX_ui = 0;
  mouseY_ui = 0;
  mouseX = 0;
  mouseY = 0;

  initRenderer();
  player = new Player();

  view = new View(320,320);
  view.setZoom(2);

  uiZoom = 2;

  chat_is_open = false;

  world = new World();
  world.resize(100,100);

  $('#chat_input').hide();

  document.getElementById("server_content").addEventListener('mousemove', function(evt) {
    mouseX_ui = evt.clientX;
    mouseY_ui = evt.clientY;
  });

  initNetworking();

  gameLoop();

  //becuause the world is not shown directly after joining
  setTimeout(function(){
    for (var i = 0; i < world.loadedChunks.length; i++){
      world.loadedChunks[i].update();
    }
  }, 500);
});