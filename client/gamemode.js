function gamemodeLoop(){
  if (gm.elevator){
    var y1 = 64;
    var y2 = view_height-128;
    var dist = Math.abs(y2-y1);
    for(i=0; i<Math.floor(dist/32)+1; i++){
      drawSpritePart(1002,Sprite(subfolder+"sprites/ui/ui_elevator_shaft.png"),view_width-32,(y1+i*32),0,(gm.elevator*1024)%32,32,32)
    }
    drawSpritePart(1002,Sprite(subfolder+"sprites/ui/ui_elevator_shaft.png"),view_width-32,(y1+i*32),0,(gm.elevator*1024)%32,32,dist%32)
    drawSprite(1003,Sprite(subfolder+"sprites/ui/ui_elevator.png"),view_width-32,y1+dist*gm.elevator)
  }
}