function GameConfig(){
  this.width = 1200;
  this.height = 800;
  this.window = "game";
  this.checkPoint = "checkPoint";
  this.goal = "goal";
  this.score = "score";
}
GameConfig.prototype.getWidth = function(){return this.width;};
GameConfig.prototype.getHeight = function(){return this.height;};
GameConfig.prototype.getWindow = function(){return this.window;};
GameConfig.prototype.getCheckPoint = function(){return this.checkPoint;};
GameConfig.prototype.getGoal = function(){return this.goal;};
GameConfig.prototype.getScore = function(){return this.score;};
GameConfig.prototype.getBuffer = function(){return this.buffer;};
