function gameLoop(){

  var delta = Date.now() - lastTime;
  lastTime = Date.now();

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

  //fps calculation
  var fps = Math.floor(1000/(delta));
  document.getElementById("fps").innerHTML = fps;
  document.getElementById("mouse_position_ui").innerHTML = mouseX_ui+" , "+mouseY_ui;
  document.getElementById("mouse_position_world").innerHTML = mouseX+" , "+mouseY;

  hoverlist = ["tile"];
  for (k in ents){
    ents[k].step(delta);
  }

  var tx = Math.floor(mouseX / 32);
  var ty = Math.floor(mouseY / 32);
  var tile = world.tileGet(tx, ty);

  var list = $("#hoverlist-list");
  list.empty();
  for (var i = 0; i < hoverlist.length; i++){
    var item = hoverlist[i];
    if (item == "tile"){
      list.append(`<li><img src="${subfolder + "sprites/" + tile.sprite}"></img></li>`);
    }else{
      list.append(`<li><img src="${subfolder + "sprites/" + hoverlist[i].spriteData[0].source}"></img></li>`);
    }
  }

  var target = hoverlist.length > 1 ? hoverlist[1] : hoverlist[0];

  if (target){
    if (mouseCheckPressed(0)){
      if (target == "tile"){
        socket.emit('useOnFloor', { x: tx, y: ty });
      }else{
        if (keyboardCheck(input.DRAG)){
          socket.emit('ent_drag',{id: target.id});
        }else{
          socket.emit('ent_click',{id: target.id});
        }
      }
    }
    if (mouseCheckPressed(2)){
      console.log(target);
    }
  }

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