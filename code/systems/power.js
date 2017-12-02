//Power System constructor
function PowerSystem(world){
  this.world = world;
  this.nextNwId = 0;
  
  this.modulename = "Power System";
  this.networks = [];
}

//Connect to networks
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

//This creates a new network and gives it its first member
PowerSystem.prototype.createNetwork = function(entity){
  var nw = new Network(this);
  this.networks.push(nw);
  nw.addMember(entity);
  return nw;
}

//Step event of the power system
PowerSystem.prototype.step = function(delta){
  for (var i = 0; i < this.networks.length; i++) {
    element = this.networks[i].step(delta);
  }
}

//Network constructor
function Network(system){
  this.system = system;
  this.members = [];
  this.id = system.nextNwId;
  this.voltage = 0;
  this.resitance = 0;
  system.nextNwId ++;
}

//Destroys this network
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

//Removes a member from this network. This will eventually split the network and a the new ones will automatically created
Network.prototype.removeMember = function(entity){
  for (var i = 0; i < this.members.length; i++){
    this.members[i].power_nw = null;
  }
  for (var i = 0; i < this.members.length; i++){
    this.members[i].update();
  }
  this.members = [];
  this.destroy();
  this.update();
}

//Adds a member to this network
Network.prototype.addMember = function(entity){
  if (this.members.indexOf(entity) == -1)
    this.members.push(entity);
  this.update();
  return this;
}

//Step event of the network
Network.prototype.step = function(delta){
  if (this.members.length == 0){
    this.destroy();
  }
}

//Update the network
Network.prototype.update = function(){
  var resitance = 0;
  var voltage = 0;

  //Calculate current voltage and resitance in the network
  for (var i = 0; i < this.members.length; i++){
    var ent = this.members[i];
    voltage = Math.max(ent.power_voltage || 0, voltage);
    resitance += ent.power_resitance || 0;
  }

  //If the values differ, say your members that they have changed
  if (this.resitance != resitance || this.voltage != voltage){
    this.resitance = resitance;
    this.voltage = voltage;
    for (var i = 0; i < this.members.length; i++){
      var member = this.members[i];
      member.fire("onPowerChange");
    }
  }
}

module.exports = PowerSystem;