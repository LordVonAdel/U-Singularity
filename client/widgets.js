function widget_radio(node,options){
 var htm = "<span>0</span>";
 var number = options.length;
 options.forEach(function(value,index){
  if (index == 0){
   htm += '<span class="radio radio-active" style="width:'+((99/number))+'%; margin:0px;">'+value+"</span>"
  }else{
   htm += '<span class="radio rad_'+value+'" style="width:'+((99/number))+'%">'+value+"</span>"
  }
 });
 node.html(htm);
 node.css("width","100%");
 node.css("padding","2px")
}
function widget_radio_set(node, index){
 node.children().removeClass("radio-active");
 node.firstChild.innerHTML = index;
}
function server_window_close(id){
 $('#'+id).html("");
 $('#'+id).css("display","none");
}