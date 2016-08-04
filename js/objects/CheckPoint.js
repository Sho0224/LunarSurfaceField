/**
 * チェックポイント
 */
function CheckPoint(point){
  this.point = point;
  this.isClear = false;
};
CheckPoint.prototype = new GameObject();

CheckPoint.prototype.getPoint = function(){return this.point;}

CheckPoint.prototype.getImageFilename = function(){
    if(!this.isClear){
        return "./img/checkpoint.gif";
    } else {
        return "./img/clear.gif";
    }
}

CheckPoint.prototype.getZindex = function(){return 1;}

CheckPoint.prototype.isClear = function(){return this.isClear;}

CheckPoint.prototype.isInRange = function(point){
    return this.getPoint().getX() <= point.getX() && point.getX() <= this.getPoint().getX() + 40
        && this.getPoint().getY() <= point.getY() && point.getY() <= this.getPoint().getY() + 40;
}

CheckPoint.prototype.clear = function(){
    this.isClear = true;
}
