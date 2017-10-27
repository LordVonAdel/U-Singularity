function PowerSystem(world){
  this.world = world;
  
  this.modulename = "Power System";
  this.networks = [];
}
PowerSystem.prototype.connectNetworks = function(network1, network2){
  network1.members.push.apply(network2.members);
  network2.destroy();
}

function Network(system){
  this.system = system;
  this.members = [];
}
Network.prototype.destroy = function(){
  var index = this.system.members.indexOf(this);
  this.system.members.splice(index, 1);
}

module.exports = PowerSystem;