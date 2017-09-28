function Grid(width, height) {
  this.width = width;
  this.height = height;
  this.grid = [];
  var grid = this.grid;
  var obj = this;

  var i, j;
  for (i = 0; i < width; i++) {
    grid[i] = [];
    for (j = 0; j < height; j++) {
      grid[i][j] = 0;
    }
  }

  this.cellGet = function (x, y) {
    if (grid[x] instanceof Array) {
      return grid[x][y];
    }
  }

  this.cellSet = function (x, y, value) {
    if (grid[x] instanceof Array) {
      grid[x][y] = value;
    }
  }

  this.resize = function (width, height) {
    grid.width = width;
    grid.height = height
  }

  this.clear = function (value) {
    for (var i = 0; this.width; i++) {
      for (var j = 0; this.height; j++) {
        this.gridi[i][j] = value;
      }
    }
  }

  this.save = function () {
    var i;
    var str = "";
    var last = 0;
    var now = 0;
    var len = 0;
    for (i = 0; i < obj.width * obj.height; i++) {
      now = grid[i % width][Math.floor(i / height)];
      if (now == last) {
        len++;
      } else {
        str += len + "x" + last + "x";
        len = 1;
      }
      last = now;
    }
    str += len + "x" + last;
    return str;
  }

  this.load = function (str) {
    var res = str.split("x");
    var cx = 0;
    var cy = 0;
    for (i = 0; i < res.length; i += 2) {
      for (j = 0; j < parseInt(res[i], 10); j++) {
        if (cx == this.width) {
          cx = 0;
          cy += 1;
        }
        if (cx < this.width && cy < this.height) {
          this.grid[cx][cy] = res[i + 1];
        }
        cx++
      }
    }
  }
  
  this.loadRegion = function (str, x, y, width) {
    var res = str.split("x");
    var cx = 0;
    var cy = 0;
    for (i = 0; i < res.length; i += 2) {
      for (j = 0; j < parseInt(res[i], 10); j++) {
        if (cx == width) {
          cx = 0;
          cy += 1;
        }
        if (cx + x < this.width && cy + y < this.height) {
          this.grid[cx + x][cy + y] = res[i + 1];
        }
        cx++
      }
    }
  }
}