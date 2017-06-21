function initRenderer(){

  var type = PIXI.utils.isWebGLSupported() ? "WebGL" : "canvas";
  PIXI.utils.sayHello(type);

  renderer = PIXI.autoDetectRenderer(256, 256);
  document.body.appendChild(renderer.view);

  stage = new PIXI.Container();
  stageUI = new PIXI.Container();
  stageWorld = new PIXI.Container();
  stageEntities = new PIXI.Container();

  stage.addChild(stageUI);
  stage.addChild(stageWorld);
  stageWorld.addChild(stageEntities);

  renderer.render(stage);

  renderer.view.style.position = "absolute";
  renderer.view.style.display = "block";
  renderer.autoResize = true;
  renderer.resize(window.innerWidth, window.innerHeight);

  var message = new PIXI.Text("Hello There!",{fontFamily: "Arial", fontSize: 32, fill: "white"});
  stageUI.addChild(message);
}

function renderLoop(){
  renderer.resize(window.innerWidth, window.innerHeight);
  renderer.render(stage);
}

/*
var toLoad = [];
var isLoading = false; 

function loadResources(){
  if (isLoading == false){
    isLoading = true;
    PIXI.loader.add(toLoad).load((loader, res)=>{
      console.log("Loading sprites... Progress:", Math.round(loader.progress));
      for (k in res){
        sprites[res[k].name] = res[k];
      }
    }).once('complete',()=>{
      if (toLoad.length > 0){
        //some new things to load are added to the que
        isLoading = false;
        loadResources();
      }else{
        console.log("Everything loaded!");
        isLoading = false;
      }
    });
    toLoad = [];
  }
}
*/

sprites = {};
textures = {};

function getTexture(source){
  if (textures[source] != undefined){
    return textures[source];
  }
  var tex = PIXI.Texture.fromImage(source);
  textures[source] = tex;

  console.log("[Load]Texture: "+source);

  return textures[source];
}

function getTextureFrame(source,index,width,height){
  if (textures[source+":"+index] != undefined){
    return textures[source+":"+index];
  }
  tex = getTexture(source);
  var len = tex.baseTexture.width / tex.baseTexture.height;
  textures[source+":"+index] = new PIXI.Texture(tex);
  textures[source+":"+index].frame = new PIXI.Rectangle(width*index, 0, width, height);
  return textures[source+":"+index];
}

function Sprite(source){ 
  /*
  if (sprites[source] != undefined){
    return sprites[source];
  }else{
    var spr = {};
    spr.img = new Image();
    spr.img.onload = function(){
      spr.init = true;
    }
    spr.img.src = source;
    spr.spriteWidth = 32;
    spr.spriteHeight = 32;
    spr.source = source;
    spr.init = false;
    sprites[source] = spr;
    return spr;
  }
  */
}
function drawSprite(depth,sprite,x,y){
  if (!Array.isArray(draw_pipe[depth])){
    draw_pipe[depth] = [];
  }
  draw_pipe[depth].push({"type":"sprite","sprite":sprite,"x":x,"y":y})
}
function drawSpriteAngle(depth,sprite,x,y,angle){
  if (!Array.isArray(draw_pipe[depth])){
    draw_pipe[depth] = [];
  }
  draw_pipe[depth].push({"type":"sprite_angle","sprite":sprite,"x":x,"y":y,"angle":angle})
}
function drawSpritePart(depth,sprite,x,y,left,top,width,height){
  if (!Array.isArray(draw_pipe[depth])){
    draw_pipe[depth] = [];
  }
  draw_pipe[depth].push({"type":"sprite_part","sprite":sprite,"x":x,"y":y,"left":left,"top":top,"width":width,"height":height})
}
function drawSpritePartAngle(depth,sprite,x,y,left,top,width,height,angle){
  if (!Array.isArray(draw_pipe[depth])){
    draw_pipe[depth] = [];
  }
  draw_pipe[depth].push({"type":"sprite_part_angle","sprite":sprite,"x":x,"y":y,"left":left,"top":top,"width":width,"height":height, "angle":angle})
}
function drawText(depth,text,x,y,color){
if (!Array.isArray(draw_pipe[depth])){
    draw_pipe[depth] = [];
  }
  draw_pipe[depth].push({"type":"text","text":text,"x":x,"y":y,"color":color}) 
}
function drawItem(depth,item,x,y){
  if (!Array.isArray(draw_pipe[depth])){
    draw_pipe[depth] = [];
  }
  draw_pipe[depth].push({"type":"item","item":item,"x":x,"y":y}) 
}
function drawSpeech(depth,text,x,y){
  if (!Array.isArray(draw_pipe[depth])){
    draw_pipe[depth] = [];
  }
  draw_pipe[depth].push({"type":"speech","text":text,"x":x,"y":y}) 
}
function draw(){
  var canvas = document.getElementById("canvas");
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.canvas.width  = window.innerWidth-1;
  ctx.canvas.height = window.innerHeight-1;
  view_width = ctx.canvas.width / view_zoom;
  view_height = ctx.canvas.height / view_zoom;
  ctx.scale(view_zoom, view_zoom);
  for (i=0; i<draw_pipe.length; i++){
    var arr = draw_pipe[i];
    if (Array.isArray(arr)){
      for(j=0; j<arr.length; j++){
        var obj = arr[j];
        var xx = obj.x;
        var yy = obj.y;
        if (i<1000){
          xx -= viewX;
          yy -= viewY;
        }
        if (obj.type == "sprite"){
          if (obj.sprite != undefined){
            if (obj.sprite.init){
              ctx.drawImage(obj.sprite.img,xx,yy);
            }
          }
        }
        if (obj.type == "sprite_angle"){
          if (obj.sprite != undefined){
            if (obj.sprite.init){
              var img = obj.sprite.img;
              ctx.translate(xx+16,yy+16)
              var rad = obj.angle*Math.PI/180;
              ctx.rotate(rad);
              ctx.drawImage(obj.sprite.img, -img.width/2, -img.height/2);
              ctx.rotate(-rad)
              ctx.translate(-xx-16,-yy-16)
            }
          }   
        }
        if (obj.type == "sprite_part"){
          if (obj.sprite != undefined){
            if (obj.sprite.init){
             ctx.drawImage(obj.sprite.img,obj.left,obj.top,obj.width,obj.height,xx,yy,obj.width,obj.height);
            }
          }
        }
        if (obj.type == "sprite_part_angle"){
           if (obj.sprite != undefined){
            if (obj.sprite.init){
              var img = obj.sprite.img;
              
              ctx.translate(xx+16,yy+16)
              var rad = obj.angle*Math.PI/180;
              ctx.rotate(rad);

              ctx.drawImage(obj.sprite.img,obj.left,obj.top,obj.width,obj.height,-obj.height/2,-obj.width/2,obj.width,obj.height);

              ctx.rotate(-rad)
              ctx.translate(-xx-16,-yy-16)
            }
          }         
        }
        if (obj.type == "text"){
          ctx.font = "12px Verdana";
          ctx.textBaseline = "top";
          ctx.fillStyle = obj.color;
          ctx.fillText(obj.text,xx,yy);
        }
        if (obj.type == "item"){
          if (typeof obj.item === 'object'){
            var spr = res.items[obj.item.type].sprite;
            if (spr != undefined){
            ctx.drawImage(spr.img,xx,yy);
            }
          }
          }
        if (obj.type == "speech"){
          ctx.font = "12px Verdana";
          ctx.textBaseline = "top";
          ctx.textAlign = "center";
          var width = ctx.measureText(obj.text).width;
          ctx.globalAlpha = 0.5;
          ctx.fillStyle = "#000000";
          ctx.fillRect(xx-width/2,yy,width,16);
          ctx.fillStyle = "#ffffff";
          ctx.globalAlpha = 1;
          ctx.fillText(obj.text,xx,yy);
          ctx.textAlign = "start";
        }
      }
      draw_pipe[i] = [];
    }
  }
}