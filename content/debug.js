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
        var playernum = 0;
        var entnum = 0;
        for (k in sender.bucket.players){ playernum ++}
        for (k in sender.bucket.entities){ entnum ++}
        sender.msg(
          `Current Bucket
          <br>Position: ${sender.bucket.x}, ${sender.bucket.y}
          <br>Players: ${playernum}
          <br>Entities: ${entnum}
          `)
      }
    },
    power: {
      fun: function(sender, args){
        var power = sender.world.systems.power;
        if (power){
          sender.msg("Power networks: " + power.networks.length);
        }else{
          sender.msg("This world does not use the power system!");
        }
      }
    }
  }
}