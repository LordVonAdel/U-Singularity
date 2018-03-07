module.exports = {
  items: {
    "hand":{
      "actions":["hand"]
    }
  },
  objects: {
    item:{ //the item entity
      sync:{item: null},
      image:[{source: "items/item_crowbar.png", width:32, height: 32}],
      layer: 2,
      onClick(user, _item){
        if(_item.type == "hand"){
          user.ent.sync.inventory[user.ent.sync.inventoryActive] = this.sync.item;
          user.shareSelf();
          user.update();
          this.destroy();
        }else{
          item.combine(this.sync.item, _item);
          this.sync.item = item.update(this.sync.item);
          this.update();
        }
      },
      onUpdate(){
        if (this.sync.item == null){
          this.destroy();
        }else{
          for (var i = 0; i < this.sync.item.sprite.length; i++){
            this.sprites[i] = Object.assign({}, this.sync.item.sprite[i]);
          }
          this.share();
        }
      },
      actions:{}
    },
    player:{
      draggable: true,
      collision:true,
      sync:{
        client: null, 
        hp: 100, 
        alive: true, 
        inventory: null, //will be replaced with an object in init event
        inventoryActive: 0,
        dmgSuffocation: 0,
        dmgBrute: 0,
        dmgToxin: 0,
        dmgBurn: 0,
        dmgGenetic: 0,
        direction: 0,
        job: null
      },
      layer: 3,
      image:[
        {
          layer: 3,
          source: "chars/char_chemist_f.png",
          image: 0,
          width: 32,
          height: 32,
          animation: "jump"
        },
        {
          visible: false,
          source: "", //makes errors
          width: 32,
          height: 32,
          scale: 0.5,
          image: 0,
          animation: "jump",
          x: 8,
          y: 8
        }
      ],
      actions: {
        stab(){
          if (this.client){
            this.sync.dmgBrute += 5;
            this.client.msg("Ouch!");
            this.update();
          }
        }
      },
      onInit(){
        this.sync.inventory = {};
        this.setLight(0, {color: 0xffffff, radius: 128, intensity: 1});
      },
      onStep(delta){
        if (this.getState("burning")){
          this.sync.dmgBurn += delta/1000;
          this.update();
        }

        if (this.sync.hp <= 0){
          this.changeSprite(0, {angle: 90, animation: "none"});
          this.client.alive = false;
        }
      },
      onUpdate(){
        if (this.client == undefined){
          this.destroy();
        }
        
        if (this.sync.class){
          this.changeSprite(0, {source: loader.res.classes[this.sync.class]["sprite-"+(this.sync.gender == "m" ? "male" : "female")]});
          this.changeImageIndex(0, this.sync.direction);
        }

        var hand = this.sync.inventory[this.sync.inventoryActive];
        if (hand != null){
          if (hand.sprite.length > 0){
            this.changeSprite(1, {source: hand.sprite[0].source, visible: true});
          }
        }else{
          this.changeSprite(1, {visible: false});
        }

        this.sync.hp = 100 - this.sync.dmgBrute - this.sync.dmgBurn - this.sync.dmgGenetic - this.sync.dmgSuffocation - this.sync.dmgToxin;
        if (this.client){
          this.client.shareSelf({"hp" : Math.ceil(this.sync.hp)});
        }
      },
      onDestroy(){
        if (this.client){
          this.client.ent = null;
        }
      }
    }
  }
}