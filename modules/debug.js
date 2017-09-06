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
        sender.msg(JSON.stringify(sender.world.ents));
      }
    },
    cellGet: {
      fun: function(sender, args){
        var index = sender.world.grid.cellGet(sender.tileX,sender.tileY);
        sender.msg("TileID: "+index);
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