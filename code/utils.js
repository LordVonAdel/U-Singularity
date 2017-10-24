//some utils misc functions

module.exports = {
  transition: function (now, target, speed, ease) {
    if (ease == 0) { //linear
      if (Math.abs(target - now) > speed) {
        return now + Math.sign(target - now) * speed;
      } else {
        return target;
      }
    }
  }
}