function scanRegion(x,y){
  function addToOpenList(pos){
    if(closedlist.indexOf(pos.x+","+pos.y) == -1){
      openlist.push(pos);
      closedlist.push(pos.x+","+pos.y);
    }
  }
  var closedlist = [(x+1)+","+y,(x-1)+","+y,x+","+(y-1),x+","+(y+1)]; //Atmo positions
  var atmolist = []; //Atmo data
  var openlist = [{x:x+1,y:y},{x:x-1,y:y},{x:x,y:y+1},{x:x,y:y-1}];
  //if(wrd.collisionCheck(x,y)){
  //  return [];
  //}
  var cols = [];
  while(openlist.length > 0){
    var pos = openlist[0];
    openlist.splice(openlist.indexOf(pos),1)
    if(!wrd.collisionCheck(pos.x,pos.y)){
      //closedlist.push(pos.x+","+pos.y);
      atmolist.push(wrd.gridAtmos.cellGet(pos.x,pos.y));
      openlist.splice(openlist.indexOf(pos),1)
      addToOpenList({x: pos.x+1, y: pos.y})
      addToOpenList({x: pos.x-1, y: pos.y})
      addToOpenList({x: pos.x, y: pos.y+1})
      addToOpenList({x: pos.x, y: pos.y-1})
    }else{
      cols.push(pos);
    }
  }
  /*
  list.push(wrd.gridAtmos.cellGet(x,y))
  list.push(wrd.gridAtmos.cellGet(x+1,y))
  list.push(wrd.gridAtmos.cellGet(x-1,y))
  list.push(wrd.gridAtmos.cellGet(x,y+1))
  list.push(wrd.gridAtmos.cellGet(x,y-1))
  */
  console.log("Region size: "+atmolist.length);
  return atmolist;
}
function balanceRegion(region){
  var cnt = {};
  var num = region.length;
  region.forEach(function(cell){
    for(k in cell.content){
      if(cnt[k] == undefined){
        cnt[k] = cell.content[k];
      }else{
        cnt[k] += cell.content[k];
      }
    } 
  });
  for(k in cnt){
    cnt[k] = cnt[k]/num;
  }
  region.forEach(function(cell){
    cell.content = Object.assign({},cnt);
  })
}
function addGas(x,y,mix){
  var cell = wrd.gridAtmos.cellGet(x,y);
  for(k in mix){
    if(cell.content[k] == undefined){
      cell.content[k] = mix[k];
    }else{
      cell.content[k] += mix[k];
    }
  }
  LINDA(x,y);
  //var reg = scanRegion(x,y);
  //balanceRegion(reg);
}
function LINDA(x,y){
  list = [];
  list.push(wrd.gridAtmos.cellGet(x,y))
  list.push(wrd.gridAtmos.cellGet(x+1,y))
  list.push(wrd.gridAtmos.cellGet(x-1,y))
  list.push(wrd.gridAtmos.cellGet(x,y+1))
  list.push(wrd.gridAtmos.cellGet(x,y-1))
  balanceRegion(list);
}

module.exports.addGas = addGas;