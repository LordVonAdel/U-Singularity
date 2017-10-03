function gameLoop(){

  var delta = Date.now() - lastTime;
  lastTime = Date.now();


  if (player.id != -1){
    var obj = players[player.id];
    if (obj != undefined){
      player.x = obj.x;
      player.y = obj.y;
    }
  }

  if (cam != null){
    view.x = transition(view.x,cam.x+16-view.width/2,0.4,1);
    view.y = transition(view.y,cam.y-view.height/2,0.4,1);
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

  //player
  player.step();
  player.updateUI();

  //admin
  if (isAdmin){
    adminLoop()
  }

  //fps calculation
  var fps = Math.floor(1000/(delta));
  document.getElementById("fps").innerHTML = fps;
  document.getElementById("mouse_position_ui").innerHTML = mouseX_ui+" , "+mouseY_ui;
  document.getElementById("mouse_position_world").innerHTML = mouseX+" , "+mouseY;

  $.each(ents,function(key,value){
    value.step(delta);
  });

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