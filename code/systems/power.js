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
    for (var i = 0; i < network1.members.length; i++){
      var mem = network1.members[i];
      mem.update();
    }
    network2.destroy();
  }
  network1.update();
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
  this.resistance = 0;
  this.use = 0;
  this.flow = 0;
  this.saturation = 0;
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
  this.update();
  this.members = [];
  this.destroy();
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
  var resistance = 0; //The resistance of the network. Will lower the energy there
  var voltage = 0; //The voltage in the network
  var use = 0; //The power that is requested by all members
  var flow = 0; //The power that is given by the members

  //Calculate current voltage and resistance in the network
  for (var i = 0; i < this.members.length; i++){
    var ent = this.members[i];
    voltage = Math.max(ent.power_voltage || 0, voltage);
    resistance += ent.power_resistance || 0;
    use += ent.power_use || 0;
    flow += ent.power_give || 0;
  }

  flow -= resistance;

  var covered = Math.min(flow / use, 1);
  if (flow == 0){
    covered = 0;
  }

  //If the values differ, say your members that they have changed
  if (this.resistance != resistance || this.voltage != voltage || this.use != use || this.flow != flow){
    this.resistance = resistance;
    this.voltage = voltage;
    this.use = use;
    this.flow = flow;
    this.saturation = covered;
    for (var i = 0; i < this.members.length; i++){
      var member = this.members[i];
      member.fire("onPowerChange", covered);
    }
  }
}

module.exports = PowerSystem;