function transition(now,target,speed,ease){
  if (ease == 0){ //linear
    if (Math.abs(target-now)>speed){
     return now + Math.sign(target-now)*speed;
    }else{
     return target;
    }
  }
  if (ease == 1){ //multiplinear
    if (Math.abs(target-now)>speed){
      return now + (target-now)*speed;
    }else{
      return target;
    }
  }
}
function chat(msg){
  socket.emit('chat',{msg: msg}); 
}