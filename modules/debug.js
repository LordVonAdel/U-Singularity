module.exports = {
  commands:{
    burn: {
      permission: "master.player.burn",
      fun: function(sender,args){
        sender.burning = !sender.burning;
        sender.share();
      }
    },
    ents: {
      fun: function(sender,args){
        sender.msg(JSON.stringify(wrd.ents));
      }
    },
    cellGet: {
      fun: function(sender, args){
        var index = wrd.cellGet(sender.tileX,sender.tileY);
        sender.msg("TileID: "+index);
      }
    },
    collision_get: {
      fun: function(sender,args){
        var list = JSON.stringify(wrd.gridCollision.cellGet(sender.tileX,sender.tileY));
        sender.msg("Collision: "+list);
      }
    },
    help: {
      fun :function(sender,args){
        var str = "Commands:<br>"
        for (var k in loader.commands) {
          str += k + "<br>"
        }
        sender.msg(str)
      }
    }
  }
}