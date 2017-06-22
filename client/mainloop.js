function gameLoop(){

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

  //admin
  if (isAdmin){
    adminLoop()
  }

  //gamemode
  gamemodeLoop();

  //fps calculation
  thisTime = new Date;
  var fps = Math.floor(1000/(thisTime - lastTime));
  lastTime = thisTime;
  drawText(1001,"FPS: "+fps,1,1,"#FFFFFF")
  //drawText(1001,"Mouse Position (UI): "+mouseX_ui+" , "+mouseY_ui,1,16,"#000000");
  //drawText(1001,"Mouse Position (World): "+mouseX+" , "+mouseY,1,32,"#000000");
  document.getElementById("fps").innerHTML = fps;
  document.getElementById("mouse_position_ui").innerHTML = mouseX_ui+" , "+mouseY_ui;
  document.getElementById("mouse_position_world").innerHTML = mouseX+" , "+mouseY;

  $.each(ents,function(key,value){
    value.step();
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