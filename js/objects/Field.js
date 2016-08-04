function Field(point){
  this.point = point;
}
Field.prototype = new GameObject();

Field.prototype.getPoint = function(){return this.point;}

Field.prototype.getImageFilename = function(){return "./img/ground.gif";}

Field.prototype.getZindex = function(){return 0;}

Field.getWidth = function(){return 40;}
Field.getHeight = function(){return 40;}
