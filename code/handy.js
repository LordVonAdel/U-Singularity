module.exports = {
  broadcast: function(event,data){
    //console.log("Broadcast: "+event)
    playerlist.forEach(function(obj){
      obj.socket.emit(event,data);
    });
  },
  stringSave: function(str){
    str = str.replace(/>/g, '&gt');
    str = str.replace(/</g, '&lt');
    return str;
  },
  command: function(sender,args){
    var cmd = loader.commands[args[0]]
    if (cmd !=undefined){
      if (args.length > cmd.argNum || cmd.argNum == undefined){
        cmd.fun(sender,args);
      }else{
        sender.msg('<span style="color: red;">Command expects '+cmd.argNum+" arguments or more</span>");
      }
    }else{
      sender.msg('<span style="color: red;">Unknown command: '+args[0]+"</span>");
    }
  },
  transition: function(now,target,speed,ease){
  if (ease == 0){ //linear
    if (Math.abs(target-now)>speed){
      return now + Math.sign(target-now)*speed;
      }else{
      return target;
    }
  }
}
}