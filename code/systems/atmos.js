const Grid = require('../grid.js');
const Mixture = require('../mixtures.js');

function Atmos(world){
  this.world = world;
  this.modulename = "Atmos";

  world.gridAtmos = new Grid(100,100);
  world.gridAtmos.forEach(function(tileX,tileY){
    world.gridAtmos.cellSet(tileX,tileY,Mixture.air());
  });
}

module.exports = Atmos;