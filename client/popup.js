function content_set(id,html){
 var elem = document.getElementById(id)
 $("#"+id).remove();
 $("#server_content").append(html)
}
function content_remove(id){
 $("#"+id).remove();
}