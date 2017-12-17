module.exports = {
  commands:{
    burn: {
      permission: "master.player.burn",
      fun: function(sender,args){
        sender.ent.toggleState("burning", true);
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
        sender.msg("Collisions: "+sender.world.collisionsGet(sender.tileX, sender.tileY).length);
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
    },
    create: {
      argNum: 1,
      fun: function(sender, args){
        sender.world.spawnEntity(args[1],sender.ent.tx,sender.ent.ty);
      }
    },
    bucket: {
      fun: function(sender, args){
        var playernum = Object.keys(sender.bucket.players).length;
        var entnum = Object.keys(sender.bucket.objects).length;
        sender.msg(
          `Current Bucket
          <br>Position: ${sender.bucket.x}, ${sender.bucket.y}
          <br>Players: ${playernum}
          <br>Entities: ${entnum}
          `);
      }
    },
    position: {
      fun: function(sender, args){
        sender.msg("You are standing at: "+sender.ent.tx+", "+sender.ent.ty);
      }
    }
  }
}