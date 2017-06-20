function gameLoop()
{
  //global vars

  if (player.id != -1){
    var obj = players[player.id];
    if (obj != undefined){
    player.x = obj.x;
    player.y = obj.y;
    }
  }
  viewX = transition(viewX,cam.x+16-view_width/2,0.4,1);
  viewY = transition(viewY,cam.y-view_height/2,0.4,1);
  mouseX = (mouseX_ui/view_zoom + viewX);
  mouseY = (mouseY_ui/view_zoom + viewY);

  //player
  player.step();
  player.draw();

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

  //update pawns (clients)
  $.each(players,function(key,value){
    value.update();
    value.draw();
  });
  $.each(ents,function(key,value){
    value.step();
  });

  //draw
  drawAll();

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

function drawAll(){
  world.draw();

  draw();
}