function PowerSystem(world){
  this.world = world;
  this.nextNwId = 0;
  
  this.modulename = "Power System";
  this.networks = [];
}
PowerSystem.prototype.connectNetworks = function(network1, network2){
  if (network1 != network2){
    for (var i = 0; i < network2.members.length; i++){
      var mem = network2.members[i];
      network1.members.push(mem);
      mem.power_nw = network1;
    }
    network2.destroy();
  }
}
PowerSystem.prototype.createNetwork = function(entity){
  var nw = new Network(this);
  this.networks.push(nw);
  nw.addMember(entity);
  return nw;
}
PowerSystem.prototype.step = function(delta){
  for (var i = 0; i < this.networks.length; i++) {
    element = this.networks[i].step(delta);
  }
}

function Network(system){
  this.system = system;
  this.members = [];
  this.id = system.nextNwId;
  system.nextNwId ++;
}
Network.prototype.destroy = function(){
  var index = this.system.networks.indexOf(this);
  //first say everyone, they are no longer part of this great network
  for (var i = 0; i < this.members.length; i++){
    if (this.members[i].power_nw == this)
      this.members[i].power_nw = null;
  }
  if (index >= 0){
    this.system.networks.splice(index, 1);
  }
}
Network.prototype.removeMember = function(entity){
  for (var i = 0; i < this.members.length; i++){
    this.members[i].power_nw = null;
  }
  for (var i = 0; i < this.members.length; i++){
    this.members[i].update();
  }
  this.members = [];
  this.destroy();
}
Network.prototype.addMember = function(entity){
  if (this.members.indexOf(entity) == -1)
    this.members.push(entity);
}
Network.prototype.step = function(delta){
  if (this.members.length == 0){
    this.destroy();
  }
}

module.exports = PowerSystem;