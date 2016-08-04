'use strict';


// onload時に実行
window.addEventListener("load", function() {
  console.log("load game window");
  
  var gameConfig = new GameConfig();
  
  var fields = new Array();
  // フィールドを登録
  var fields = new Array();
  fields.push(new Field(new Point(0 ,0)));
  var canvas = document.getElementById(gameConfig.getWindow());
  var context = canvas.getContext('2d');
  drawEvent(context, gameConfig, fields);
    
  //チェックポイント
  var checkPoints = new Array();
  for(var checkPointIndex = 0; checkPointIndex < 3; checkPointIndex++){
    checkPoints.push(new CheckPoint(new Point(parseInt(Math.random() * gameConfig.getWidth()), parseInt(Math.random() * gameConfig.getHeight()))));  
  }
  var checkPointCanvas = document.getElementById(gameConfig.getCheckPoint());
  var ctxCheckPoint = checkPointCanvas.getContext('2d');
  drawEvent(ctxCheckPoint, gameConfig, checkPoints);

//  var playerX = 0, playerY = 0;
//  var player = new Player(new Point(playerX, playerY))  
  // ゴール
//  var goals = new Array();
//  goals.push(new Goal(new Point(parseInt(Math.random() * gameConfig.getWidth()), parseInt(Math.random() * gameConfig.getHeight())))); 
//  var goalCanvas = document.getElementById(gameConfig.getGoal());
//  var ctxGoal = goalCanvas.getContext('2d');
//  drawEvent(ctxGoal, gameConfig, goals);
    
  // websocketから玉の現在位置を取得する
  var socket = { on: function(){} };
  if(!socket.connected){
    socket = io.connect('http://192.168.11.2:3001');
  } else {
    socket.connect();
  }
  socket.on('point', function(data){
    // チェックポイントの範囲に入ったら画像を変える
    var dataPoint = {x : parseInt(data.x, 10) - 380 , y : parseInt(data.y , 10) - 30};
    console.log("x:" + data.x + " y:" + data.y);
    console.log("game:x:" + dataPoint.x + " game:y:" + dataPoint.y);
    for(var i=0; i<checkPoints.length; i++){
      if(!checkPoints[i].isClear && checkPoints[i].isInRange(new Point(dataPoint.x, dataPoint.y))){
        checkPoints[i].clear();
        console.log("Clear game:x:" + dataPoint.x + " game:y:" + dataPoint.y);

      }
    }
    drawEvent(ctxCheckPoint, gameConfig, checkPoints);

      
    // ゴールの範囲に入ったら画像を変える
//    if(!goals[0].isClear && goals[0].isInRange(new Point(data.x, data.y))){
//      goals[0].clear();
//    }
//    drawEvent(ctxCheckPoint, gameConfig, goals);
//       player.setX(data.x);
//       player.setY(data.y);
//       console.log(data);
//      
//       player.getImage().addEventListener('load', function(){
//         context.drawImage(player.getImage(), player.getX(), player.getY());
//       }, false);
  });

//   console.log("player (" + player.getX() + "," + player.getY() + ")");
  
  // キー入力
  new SlantFloor().init(gameConfig.getWidth(), gameConfig.getHeight());

  // TODO デバッグ用マウスムーブ
  function MouseMoveFunc(e){
    // クライアント座標系を基点としたマウスカーソルの座標を取得
    var mouse_x = e.clientX;
    var mouse_y = e.clientY;

    // 出力テスト
    console.log("mouse x:" + mouse_x + "mouse y:" + mouse_y);
  }
  // イベントリスナーに対応している
  if(document.addEventListener){

    // マウスを移動するたびに実行されるイベント
    document.addEventListener("mousemove" , MouseMoveFunc);

  // アタッチイベントに対応している
  }else if(document.attachEvent){

  // マウスを移動するたびに実行されるイベント
  document.attachEvent("onmousemove" , MouseMoveFunc);

  }
});

/**
 * 描画イベント
 */
function drawEvent(context, config, objects){

  for(var cpi in objects){
    var images = objects[cpi].getImage();
    images.getImage().addEventListener('load', function() {
      //for(var cpj in objects){
        context.drawImage(this.getImage(), this.getX(), this.getY());
      //}
    }.bind(images), false);
  }
}
