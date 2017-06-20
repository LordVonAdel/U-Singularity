function Admin(){
  this.x = 0;
  this.y = 0;
  this.zoom = 0;
}

isAdmin = true;
adminDrag = false;
admin = new Admin();
cam = admin;
function adminLoop(){
  if (mouseCheckPressed(2)){
    adminDrag = true;
    adminDragX = mouseX;
    adminDragY = mouseY;
  }
  if (adminDrag){
    admin.x = adminDragX - (mouseX-admin.x);
    admin.y = adminDragY - (mouseY-admin.y);
  }
  if (mouseCheckReleased(2)){
    adminDrag = false;
  }
  if (mouseWheelUp()){
    view_zoom /= 2
  }
  if (mouseWheelDown()){
    view_zoom *= 2
  }
  viewX = admin.x
  viewY = admin.y
  $("#mouse_bucket").html(Math.floor(mouseX/(32*8))+", "+Math.floor(mouseY/(32*8)))
}