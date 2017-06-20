function World(){
 this.width = 100;
 this.height = 100;
 this.grid = new Grid(this.width,this.height);
 this.gridOverwrite = new Grid(this.width, this.height);
 this.resize = function(width,height){
  this.width = width;
  this.height = height;
  this.grid.resize(width, height);
  this.gridOverwrite.resize(width,height);
 }
 this.tileGet = function(tileX,tileY){
  var tile = res.tiles[this.grid.cellGet(tileX,tileY)];
  var overwrite = this.gridOverwrite.cellGet(tileX,tileY);
  return Object.assign({},tile,overwrite);
 }
 this.cellSetOverwrite = function(tileX,tileY,data){
   this.gridOverwrite.cellSet(tileX,tileY,data);
 }
 this.draw = function(){
  var sx = Math.max(Math.floor(viewX/32),0);
  var sy = Math.max(Math.floor(viewY/32),0);
  var sw = Math.ceil(view_width/32)+1;
  var sh = Math.ceil(view_height/32)+1;
  for(i = sx; i<sx+sw; i++){
   for(j = sy; j<sy+sh; j++){
    var index = this.grid.cellGet(i,j);
    var tile = res.tiles[index];
    if (tile != undefined){
     if (tile.connectionType == undefined){
      drawSpritePart(1,tile.sprite,i*32,j*32,0,0,32,32);
     }
     if (tile.connectionType == "perspective"){
      var curve = false;

      var tile_top = (this.tileGet(i,j-1).connectionGroup == tile.connectionGroup);
      var tile_left = (this.tileGet(i-1,j).connectionGroup == tile.connectionGroup);
      var tile_right = (this.tileGet(i+1,j).connectionGroup == tile.connectionGroup);
      var tile_bottom = (this.tileGet(i,j+1).connectionGroup == tile.connectionGroup);
      var dir = 0;

      if(tile_top && tile_bottom){dir = 1}
      if(((tile_top || tile_bottom) && (tile_left || tile_right))){curve = true;}
      var angle = Math.round(((Math.atan2(i*32-player.x,j*32-player.y)*180/Math.PI)+180-dir*90)/(180-curve*90))*(180-curve*90)-dir*90
      drawSpritePartAngle(1,tile.sprite,i*32,j*32,32*curve,0,32,32,angle);
     }
     if (tile.connectionType == "wall"){
      var tile_top = this.tileGet(i,j-1);
      var tile_left = this.tileGet(i-1,j);
      var tile_right = this.tileGet(i+1,j);
      var tile_bottom = this.tileGet(i,j+1);
      drawSpritePart(1,tile.sprite,i*32,j*32,32,0,32,32);
      if (tile_top != undefined && tile_bottom != undefined && tile_right != undefined && tile_left != undefined){
      drawSpritePart(1,tile.sprite,i*32,j*32,160,0,32,32);
       if(tile_top.connectionGroup == tile.connectionGroup){
        drawSpritePart(1,tile.sprite,i*32,j*32,32,0,32,32);
       }
       if(tile_left.connectionGroup == tile.connectionGroup && tile_right.connectionGroup != tile.connectionGroup){
        drawSpritePart(1,tile.sprite,i*32,j*32,96,0,32,32);
       }
       if(tile_right.connectionGroup == tile.connectionGroup && tile_left.connectionGroup != tile.connectionGroup){
        drawSpritePart(1,tile.sprite,i*32,j*32,128,0,32,32);
       }
       if(!(tile_left.connectionGroup == tile.connectionGroup || tile_right.connectionGroup == tile.connectionGroup)){
        if(tile_top.connectionGroup == tile.connectionGroup){
         drawSpritePart(2,tile.sprite,i*32,j*32,32,0,32,32);
        }
       }
       if(tile_left.connectionGroup == tile.connectionGroup && tile_right.connectionGroup == tile.connectionGroup){
        drawSpritePart(1,tile.sprite,i*32,j*32,0,0,32,32);
       }
       if(tile_bottom.connectionGroup == tile.connectionGroup){
        drawSpritePart(1,tile.sprite,i*32,j*32,64,0,32,32);
       }
      }
     }
     if (tile.connectionType == "simple"){
      var tile_top = this.tileGet(i,j-1);
      var tile_left = this.tileGet(i-1,j);
      var tile_right = this.tileGet(i+1,j);
      var tile_bottom = this.tileGet(i,j+1);
      if (tile_top != undefined && tile_bottom != undefined && tile_right != undefined && tile_left != undefined){
       if(tile_top.connectionGroup != tile.connectionGroup){ //top lane
        if (tile_left.connectionGroup != tile.connectionGroup){
         drawSpritePart(1,tile.sprite,i*32,j*32,0,0,32,32);
        }else if (tile_right.connectionGroup != tile.connectionGroup){
         drawSpritePart(1,tile.sprite,i*32,j*32,64,0,32,32);
        }else{
         drawSpritePart(1,tile.sprite,i*32,j*32,32,0,32,32);
        }
       }else if(tile_bottom.connectionGroup != tile.connectionGroup){ //bottom lane
        if (tile_left.connectionGroup != tile.connectionGroup){
         drawSpritePart(1,tile.sprite,i*32,j*32,0+96+96,0,32,32);
        }else if (tile_right.connectionGroup != tile.connectionGroup){
         drawSpritePart(1,tile.sprite,i*32,j*32,64+96+96,0,32,32);
        }else{
         drawSpritePart(1,tile.sprite,i*32,j*32,32+96+96,0,32,32);
        }}else{ //middle lane
        if (tile_left.connectionGroup != tile.connectionGroup){
         drawSpritePart(1,tile.sprite,i*32,j*32,0+96,0,32,32);
        }else if (tile_right.connectionGroup != tile.connectionGroup){
         drawSpritePart(1,tile.sprite,i*32,j*32,64+96,0,32,32);
        }else{
         drawSpritePart(1,tile.sprite,i*32,j*32,32+96,0,32,32);
        }
       }
      }
     }
    }
   }
  }
 }
}