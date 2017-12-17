//Constuctor of a grid instance. It will saves things in a grid like a 2-Dimensional array but with additional features.
function Grid(width,height){
  this.width = Math.ceil(width);
  this.height = Math.ceil(height);
  this.grid = [];
  var grid = this.grid;
  
  var i,j;
  for(i=0; i<width; i++){
    grid[i] = [];
    for(j=0; j<height; j++){
      grid[i][j] = 0;
    }
  }
}

//gets the content of a cell at a specific position
Grid.prototype.cellGet = function(x,y){
  if (x < 0 || y < 0){return null}
  if (this.grid[x] instanceof Array){
    return this.grid[x][y];
  }
}

//sets the content of a cell at a specific position
Grid.prototype.cellSet = function(x,y,value){
  if (x < 0 || y < 0){return null}
  if (this.grid[x] instanceof Array){
    this.grid[x][y] = value;
  }
}

//changes the size of the grid
Grid.prototype.resize = function(width, height){
  this.grid.width = width;
  this.grid.height = height;
}

//saves the grid. Returns a string with the information needed to load the grid again.
Grid.prototype.save = function(){
  var i;
  var str = "";
  var last = 0;
  var now = 0;
  var len = 0;
  for(i = 0; i<this.width*this.height; i++){
    now = this.grid[i % this.width][Math.floor(i / this.height)];
    if (now == last){
      len ++;
    }else{
      str += len + "x" + last + "x";
      len = 1;
    }
    last = now;
  }
  str += len + "x" + last;
  return str;
}

//saves a part of the grid. Returns a string needed to reconstruct the area
Grid.prototype.saveRegion = function(x,y,width,height){
  var i;
  var str = "";
  var last = 0;
  var now = 0;
  var len = 0;
  for(i = 0; i<width*height; i++){
    now = this.cellGet(i % width+x,Math.floor(i / height)+y)//grid[i % width+x][Math.floor(i / height)+y];
    if (now == last){
      len ++;
    }else{
      str += len + "x" + last + "x";
      len = 1;
    }
    last = now;
  }
  str += len + "x" + last;
  return str;
}

//loads one of the strings above into the grid
Grid.prototype.load = function(str){
  var res = str.split("x");
  var cx = 0;
  var cy = 0;
  for(i = 0; i < res.length; i+=2){
    for(j = 0; j < parseInt(res[i],10); j++){
      if (cx == this.width){
      cx = 0;
      cy += 1;
      }
      this.grid[cx][cy] = parseInt(res[i+1]);
      cx++
    }
  }
}

//loads a part of the grid. The thing to load from is a string returned from saveRegion or save
Grid.prototype.loadRegion = function(str,x,y,width){
  var res = str.split("x");
  var cx = 0;
  var cy = 0;
  for(i = 0; i < res.length; i+=2){
    for(j = 0; j < parseInt(res[i],10); j++){
      if (cx == width){
        cx = 0;
        cy += 1;
      }
      this.grid[cx+x][cy+y] = res[i+1];
      cx++
    }
  }
}

//does something for each cell.
Grid.prototype.forEach = function(callback, thisArg){
  var i,j;
  for(i=0; i<this.width; i++){
    //grid[i] = [];
    for(j=0; j<this.height; j++){
      if (thisArg){
        var a = callback.call(thisArg, i, j, this.cellGet(i, j));
      }else{
        var a = callback(i, j, this.cellGet(i, j));
      }
      if (a){
        this.cellSet(i, j);
      }
    }
  }
}

module.exports = Grid;