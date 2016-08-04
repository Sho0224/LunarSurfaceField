'use strict';

var port;  
var useTouch = false;

function SlantFloor(){};
var pca9685;
SlantFloor.prototype.init = function(){
	navigator.requestI2CAccess()
    .then(i2cAccess => {
      var port = i2cAccess.ports.get(0);
      pca9685 = new PCA9685(port,0x40);

      //servo setting for sg90
      pca9685.init(0.00150,0.00060,50,true).then(function(){
        console.log("servo init");
        setServoXY( 0, 0 );

        window.addEventListener('keypress', function(event){
					console.log(event);
					var x = Number((document.getElementById("xRange")).value);
					var y = Number((document.getElementById("yRange")).value);
					if(event.key == 'z'){
		 	      x -= 1;
					}
					if(event.key == 'x'){
		 	      y += 1;
					}
					if(event.key == 'c'){
		 	      x += 1;
					}
					if(event.key == 's'){
		 	      y -= 1;
					}
					if(x < -30){
						x = -30;
					}
					if(x > 10){
						x = 10;
					}
					if(y < -30){
						y = -30;
					}
					if(y > 10){
						y = 10;
		      }
					console.log("(x, y)=(" + Number((document.getElementById("xRange")).value) + ", " + Number((document.getElementById("yRange")).value) + ")");
		      setServoXY(x, y);
				}, true);

      });
      
	}).catch(e=> console.error('error', e));
}




var xVal=0;
var yVal=0;
function setServoXY(sx,sy){
	xVal = sx;
	yVal = sy;
	var nX, nY;
	nX = 0.7 * sx - 0.7 * sy;
	nY = 0.7 * sx + 0.7 * sy;
	setAngle( SX_CH, nX);
	Sleep( 3 );
	setAngle( SY_CH, nY);
  //setTimeout(setServo,30,0,theta);

	setXYindicator( sx , sy );
}

var sxOffsetAngle = -12;
var syOffsetAngle = -12;
var SX_CH = 1;
var SY_CH = 2;
// ゼロ点補正した角度設定を行う

function setAngle( cha , angle ){
	var offsetAngle = 0;
	if( cha == SX_CH ){
		offsetAngle = sxOffsetAngle;
	} else if ( cha == SY_CH) {
		offsetAngle = syOffsetAngle;
	}
	// setServo(port, cha , angle + offsetAngle );
	//PCA9685.setServo(port,0x40,cha,angle + offsetAngle);


	pca9685.setServo(cha,angle + offsetAngle).then(function(){
    console.log('value:', angle+offsetAngle);
	});
}

// スライダーフォームからXY値を得て直接制御
function getXYval(){
	var xV = Number((document.getElementById("xRange")).value);
	var yV = Number((document.getElementById("yRange")).value);
	console.log("slider: x:",xV,"y:",yV);
	setServoXY(xV,yV);
}

function setXYindicator( sx , sy ){
	document.getElementById("xRange").value = sx.toString(10);
	document.getElementById("yRange").value = sy.toString(10);
}


function Sleep(millisec) {
  var start = new Date();
  while(new Date() - start < millisec);
}

