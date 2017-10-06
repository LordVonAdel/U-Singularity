var input = {
  _down: {},
  _pressed: {},
  _released: {},
  LEFT: [37,65],
  UP: [38, 87],
  RIGHT: [39,68],
  DOWN: [40,83],
  DROP: [81],
  DRAG: [17],
  hover: null,

  isDown: function(keyCode){
    return this._down[keyCode]
  },
  isPressed: function(keyCode){
    return this._pressed[keyCode]
  },
  isReleased: function(keyCode){
    return this._released[keyCode]
  },
  onKeydown: function(event){
    this._down[event.keyCode] = true;
    this._pressed[event.keyCode] = true;
  },
  onKeyup: function(event){
    delete this._down[event.keyCode];
    this._released[event.button] = true;
  },
  onMousedown: function(event){
    this._down["M"+event.button] = true;
    this._pressed["M"+event.button] = true;
  },
  onMouseup: function(event){
    delete this._down["M"+event.button];
    this._released["M"+event.button] = true;
  },
  onMouseWheel: function(event){
    if (event.deltaY > 0){
      this._pressed["MWheelUp"] = true;
    }
    if (event.deltaY < 0){
      this._pressed["MWheelDown"] = true;
    }
  },
  next: function(){
    this._pressed = {};
    this._released = {};
    this.hlast = this.hover;
    this.hover = null;
  }
}

window.addEventListener('keyup', function(event) { input.onKeyup(event); }, false);
window.addEventListener('keydown', function(event) { input.onKeydown(event); }, false);
window.addEventListener('mousedown', function(event) {input.onMousedown(event); }, false);
window.addEventListener('mouseup', function(event) {input.onMouseup(event); }, false);
document.addEventListener("wheel", function(event) {input.onMouseWheel(event);}, false);


function keyboardCheck(keycode){
  if (Array.isArray(keycode)){
    var ret = false;
    keycode.forEach(function(value,index){
    if (input.isDown(value)){
      ret = true;
    }
    });
    if (ret){return true;}
  };
  if (input.isDown(keycode)){
    return true;
  }
}
function keyboardCheckPressed(keycode){
  if (Array.isArray(keycode)){
    var ret = false;
    keycode.forEach(function(value,index){
    if (input.isPressed(value)){
      ret = true;
    }
    });
    if (ret){return true;}
  };
  if (input.isPressed(keycode)){
    return true;
  }
}
function mouseCheck(button){
  if (input.isDown("M"+button)){
    return true;
  }
}
function mouseCheckPressed(button){
  if (input.isPressed("M"+button)){
    return true;
  }
}
function mouseCheckReleased(button){
  if (input.isReleased("M"+button)){
    return true;
  }
}
function mouseWheelUp(){
  if (input.isPressed("MWheelUp")){
    return true;
  } 
}
function mouseWheelDown(){
  if (input.isPressed("MWheelDown")){
    return true;
  } 
}

function mouseOver(x1,y1,x2,y2,id){
  if (mouseX > x1 && mouseX < x2 && mouseY > y1 && mouseY < y2){
    input.hover = id;
  }
  return (input.hlast == id)
}

function mouseOverUI(x1,y1,x2,y2,id){
  if (mouseX_ui > x1 && mouseX_ui < x2 && mouseY_ui > y1 && mouseY_ui < y2){
    input.hover = id;
  }
  return (input.hlast == id)
}