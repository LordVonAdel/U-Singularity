var lasttarget = null;

function gameLoop(){

  var delta = Date.now() - lastTime;
  lastTime = Date.now();

  if (cam != null){
    if (player.mode == "player"){
      view.x = transition(view.x,cam.x+16-view.width/2,0.4,1);
      view.y = transition(view.y,cam.y-view.height/2,0.4,1);
    }
    if (player.mode == "spectator"){
      view.x = cam.x - view.width / 2;
      view.y = cam.y - view.height / 2;
    }
  }else{
    if (camId != null){
      var ent = ents[camId];
      if (ent != undefined){
        cam = ent;
      }
    }
  }

  mouseX = (mouseX_ui/view.zoom + view.x);
  mouseY = (mouseY_ui/view.zoom + view.y);

  stageWorld.pivot.x = view.x;
  stageWorld.pivot.y = view.y;
  stageWorld.scale.x = renderer.width / view.width;
  stageWorld.scale.y = renderer.height / view.height;

  hoverlist = ["tile"];

  for (k in ents){
    ents[k].step(delta);
  }

  var tx = Math.floor(mouseX / 32);
  var ty = Math.floor(mouseY / 32);
  var lx = Math.floor(mouseX) % 32;
  var ly = Math.floor(mouseY) % 32;
  var pixel = ly * 32 + lx;
  var tile = world.tileGet(tx, ty);
  var targetIndex = 0;

  var list = $("#hoverlist-list");
  list.empty();
  for (var i = 0; i < hoverlist.length; i++){
    var item = hoverlist[i];
    if (item == "tile"){
      list.append(`<li id="hover-index-${i}"><img src="${subfolder + "sprites/" + tile.sprite}"></img></li>`);
    }else{
      var pixels = renderer.extract.pixels(item.container);
      var image = renderer.extract.image(item.container);
      if (pixels[pixel*4+3] > 0){
        targetIndex = i;
      }
      list.append($("<li>").attr("id", "hover-index-"+i).append(image));
    }
  }

  $("#hover-index-"+targetIndex).attr("class", "active")
  var target = hoverlist[targetIndex];

  //player
  player.step({mouseX, mouseY, target});
  player.updateUI();

  //fps calculation
  var fps = Math.floor(1000/(delta));
  document.getElementById("fps").innerHTML = fps;
  document.getElementById("mouse_position_ui").innerHTML = mouseX_ui+" , "+mouseY_ui;
  document.getElementById("mouse_position_world").innerHTML = mouseX+" , "+mouseY;

  //draw
  renderLoop();

  //repeat!
  requestAnimationFrame(gameLoop);
  if (keyboardCheckPressed(13)){
    chat_is_open = !chat_is_open;
    if (chat_is_open){
      $('#chat_input').show().focus();
      $('#chat_input').val("");
    }else{
      if ($('#chat_input').val() != ""){
        chat($('#chat_input').val());
      }
      $('#chat_input').hide();
    }
  }
  input.next();
}