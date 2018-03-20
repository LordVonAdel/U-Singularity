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
        sender.msg("Number of entites in the world:");
        sender.msg("number: "+sender.world.ents.length);
      }
    },
    cellGet: {
      fun: function(sender, args){
        var index = sender.world.grid.cellGet(sender.ent.tx,sender.ent.ty);
        sender.msg("TileID: "+index);
        var collisions = sender.world.collisionsGet(sender.ent.tx, sender.ent.ty)
        sender.msg(collisions.length+" collisions: "+collisions.map((ent)=>{return ent.type}).join(", "));
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