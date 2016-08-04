'use strict';

var port;  
var useTouch = false;

function SlantFloor(){
	this.servoDriver;
	this.xVal=0;
	this.yVal=0;
	this.maxX=20;
	this.maxY=20;
	this.sxOffsetAngle = -12;
	this.syOffsetAngle = -12;
	this.SX_CH = 1;
	this.SY_CH = 2;
	// ゼロ点補正した角度設定を行う
	this.lstickPort1;
	this.lstickPort2;
	this.rstickPort1;
	this.rstickPort2;
};
SlantFloor.prototype.init = function(){
	console.log(this);
	var self = this;
	self.i2cInit().then(()=>{
	//self.gpioInit().then(()=>{
	self.keyboardController();
	//});
	});
}
SlantFloor.prototype.gpioInit = function(){
	var self = this;
	return new Promise(function(resolve, reject){
		navigator.requestGPIOAccess().then(gpioAccess=>{
	    self.lstickPort1 = gpioAccess.ports.get(196);
	    self.lstickPort2 = gpioAccess.ports.get(197);
	    self.rstickPort1 = gpioAccess.ports.get(198);
	    self.rstickPort2 = gpioAccess.ports.get(199);
	    console.log(self.lstickPort1);
	    return Promise.all([
	      self.lstickPort1.export("in"),
	      self.lstickPort2.export("in"),
	      self.rstickPort1.export("in"),
	      self.rstickPort2.export("in")
	    ]).then(()=>{
	    	console.log(self.lstickPort1);
	    	self.lstickPort1.onchange = self.radioController.bind(self);
	    	self.lstickPort2.onchange = self.radioController.bind(self);
	    	self.rstickPort1.onchange = self.radioController.bind(self);
	    	self.rstickPort2.onchange = self.radioController.bind(self);
	    	resolve();
	    });
	  }).catch(error=>{
	    console.log("Failed to get GPIO access catch: " + error.message);
	    reject();
	  });
  });
}
SlantFloor.prototype.i2cInit = function(){
	var self = this;
	return new Promise(function(resolve, reject){
		navigator.requestI2CAccess().then(i2cAccess => {
	    var port = i2cAccess.ports.get(0);
	    self.servoDriver = new PCA9685(port,0x40);

	    //servo setting for sg90
	    self.servoDriver.init(0.00150,0.00060,50,true).then(function(){
	      console.log("servo init");
	      self.setServoXY( 0, 0 );
	      resolve();
			}).catch(e=> {
				console.error('error', e);
				reject();
			});
		});
	});
}
SlantFloor.prototype.radioController = function(){
	var self = this;
	console.log(self.lstickPort1);
	Promise.all([
    self.lstickPort1.read(),
    self.lstickPort2.read(),
    self.rstickPort1.read(),
    self.rstickPort2.read()
  ]).then(v=>{
    console.log(v);
  });
}
SlantFloor.prototype.keyboardController = function(){
	var self = this;
	window.addEventListener('keypress', function(event){
		console.log(event);
		var x = self.xVal;
		var y = self.yVal;
		switch(event.key)
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
    self.setServoXY(x, y);
	}, true);
}

SlantFloor.prototype.setServoXY = function(sx,sy){
	var self = this;
	this.xVal = sx;
	this.yVal = sy;
	var nX, nY;
	nX = 0.7 * sx - 0.7 * sy;
	nY = 0.7 * sx + 0.7 * sy;
	this.setAngle( self.SX_CH, nX);
	Sleep( 3 );
	this.setAngle( self.SY_CH, nY);
}

SlantFloor.prototype.setAngle = function( cha , angle ){
	var self = this;
	var offsetAngle = 0;
	if( cha == self.SX_CH ){
		offsetAngle = self.sxOffsetAngle;
	} else if ( cha == self.SY_CH) {
		offsetAngle = self.syOffsetAngle;
	}
	// setServo(port, cha , angle + offsetAngle );
	//self.servoDriver.setServo(port,0x40,cha,angle + offsetAngle);


	self.servoDriver.setServo(cha,angle + offsetAngle).then(function(){
    console.log('value:', angle+offsetAngle);
	});
}

function Sleep(millisec) {
  var start = new Date();
  while(new Date() - start < millisec);
}

