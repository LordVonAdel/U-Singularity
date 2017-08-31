Mixture = function(content,temperature){
  this.content = content || {}; //{o2: 40, co2: 60}
  this.temperature = temperature || 0; //kelvin (273,15°C)
  //pressure = sum of content. (kPa)
}
Mixture.prototype.getPressure = function(){
  var press = 0;
  for (k in this.content){
    press += this.content[k];
  }
  //press *= temperature;
  return press;
}

air = function(){
  var mix = new Mixture({o2: 21, n2: 78, ar:1},290);
  return mix;
}

module.exports.Mixture = Mixture;
module.exports.air = air;