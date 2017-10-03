function contentSet(id, html){
  $("#"+id).remove();
  if (html != null){
    $("#server_content").append(html);
  }
}
function contentRemove(id){
  $("#"+id).remove();
}