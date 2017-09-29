function content_set(id, html){
  $("#"+id).remove();
  if (html != null){
    $("#server_content").append(html);
  }
}
function content_remove(id){
  $("#"+id).remove();
}