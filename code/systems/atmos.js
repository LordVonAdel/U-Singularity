const Grid = require('../grid.js');
const Mixture = require('../mixtures.js');

function Atmos(world){
  this.world = world;
  this.modulename = "Atmos";

  world.gridAtmos = new Grid(100,100);
  world.gridAtmos.map(function(tileX,tileY){
    return Mixture.air();
  });
}

module.exports = Atmos;