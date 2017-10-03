function LightController(renderer){
  this.canvas = renderer.view;
  this.renderer = renderer;

  this.stage = new PIXI.Container();
  
  this.grDarkness = new PIXI.Graphics();
  this.grDarkness.beginFill(0x000000, 0.99)
  this.grDarkness.drawRect(0, 0, this.renderer.width, this.renderer.height);
  this.grDarkness.beginFill(0x0000FF, 0.99)
  this.grDarkness.drawRect(100, 100, 400, 400);
  this.stage.addChild(this.grDarkness);

  this.renderer.render(this.stage);
  

  var img = new Image();
  img.src = "sprites/light_point.png";
  this.lightSprites = {
    point: img
  }
  
}

LightController.prototype.render = function(){

  this.grDarkness.clear();
  this.grDarkness.beginFill(0x000000, 0.99);
  this.grDarkness.drawRect(0, 0, this.renderer.width, this.renderer.height);
  
  for (var k in ents){
    var ent = ents[k];
    for (i = 0; i < ent.lightData.length; i++){
      var data = ent.lightData[i];
      if (data != null){
        if (!ent.lights[i]){
          spr = new PIXI.Sprite(getTexture("sprites/light_point.png"));
          spr.anchor.x = spr.anchor.y = 0.5;
          spr.width = data.radius * 2;
          spr.height = data.radius * 2; 
          ent.lights[i] = spr 
          this.stage.addChild(spr);
        }
        var spr = ent.lights[i];
        spr.visible = true;

        spr.x = (ent.x - view.x + (data.x || 16)) * view.zoom;
        spr.y = (ent.y - view.y + (data.y || 16)) * view.zoom;

        var len = data.patternTime || 1000;

        var intensity = data.intensity || 0.8;
        var time = ((Date.now() % len)/len);
        var pattern = data.pattern || "X";
        var current = Math.floor(pattern.length * time);
        var char = pattern.charAt(current);
      
        var int = parseInt(char);
        if (!isNaN(char)){
          intensity = (int / 10) * (data.intensity || 0.8);
        }else{
          if (char == "X"){intensity = (data.intensity || 0.8);}
          if (char == "-"){intensity = 0;}
        }

        spr.alpha = intensity;
        spr.tint = data.color || 0xffffff;
      }else{
        if (ent.lights[i]){
          ent.lights[i].visible = false;
        }
      }
    }
  }
  
  this.renderer.render(this.stage);
}