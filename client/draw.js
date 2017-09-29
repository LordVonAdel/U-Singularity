function initRenderer(){

  var type = PIXI.utils.isWebGLSupported() ? "WebGL" : "canvas";
  PIXI.utils.sayHello(type);

  renderer = PIXI.autoDetectRenderer(256, 256);
  //document.body.appendChild(renderer.view);
  document.body.insertBefore(renderer.view,document.body.firstChild);

  stage = new PIXI.Container();
  stageUI = new PIXI.Container();
  stageWorld = new PIXI.Container();
  stageTiles = new PIXI.Container();
  stageEntities = new PIXI.Container();
  stageFOV = new PIXI.Container();
  stageLight = new PIXI.Container();

  //Field of View setup
  grFOV = new PIXI.Graphics();

  //Light setup
  grLight = new PIXI.Graphics();

  stage.addChild(stageWorld);
  stage.addChild(stageUI);
  stageWorld.addChild(stageTiles);
  stageWorld.addChild(stageEntities);
  stageWorld.addChild(stageLight);
  stageWorld.addChild(stageFOV);
  stageFOV.addChild(grFOV);
  stageLight.addChild(grLight);

  renderer.render(stage);

  renderer.view.style.position = "absolute";
  renderer.view.style.display = "block";
  renderer.autoResize = true;
  renderer.resize(window.innerWidth, window.innerHeight);
}

function renderLoop(){
  renderer.resize(window.innerWidth, window.innerHeight);
  view.setZoom(2);
  world.updateView(view);
  player.updateFOV();
  world.updateLight(view);
  renderer.render(stage);
}

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
  if (tex.baseTexture != undefined){
    if (tex.baseTexture.hasLoaded == true){
      textures[source+":"+index] = new PIXI.Texture(tex);
      textures[source+":"+index].frame = new PIXI.Rectangle(width*index, 0, width, height);
      return textures[source+":"+index];
    }
  }
  return PIXI.Texture.EMPTY;
}