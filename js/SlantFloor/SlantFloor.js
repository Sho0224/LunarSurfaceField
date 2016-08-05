'use strict';

var port;  
var useTouch = false;
var radiconVal = [1,1,1,1];

function SlantFloor(){
	this.servoDriver;
	this.timer = new Array();
	this.keyBuffer = new Array();
	this.xVal=0;
	this.yVal=0;
	this.maxX=20;
	this.maxY=20;
	this.maxS=17;
	this.unitValue=2;
	this.interval = 50;
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
	self.gpioInit().then(()=>{
		self.keyboardAddEvent();
		//self.timer = setInterval(self.keyboardController.bind(self),self.interval);
		//self.timer = setTimeout(self.keyboardController.bind(self),self.interval);
	      	
	});
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
	    return Promise.all([
	      self.lstickPort1.export("in"),
	      self.lstickPort2.export("in"),
	      self.rstickPort1.export("in"),
	      self.rstickPort2.export("in")
	    ]).then(()=>{
	    	self.lstickPort1.onchange = self.radioController.bind(0);
	    	self.lstickPort2.onchange = self.radioController.bind(1);
	    	self.rstickPort1.onchange = self.radioController.bind(2);
	    	self.rstickPort2.onchange = self.radioController.bind(3);
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
	      self.setServoXY( 0, 0 ).then(()=>{
	      	resolve();
	      });
			}).catch(e=> {
				console.error('error', e);
				reject();
			});
		});
	});
}
SlantFloor.prototype.radioController = function(v){
	console.log(this,v);
	radiconVal[this] = v;
}
SlantFloor.prototype.keyboardAddEvent = function(){
	console.log("keyboardAddEvent");
	var self = this;
	window.addEventListener('keydown',function(e){
		if(e.key == "NumLock"){return;}
		//console.log("keydown"+e.key);
		switch(e.key){
			case "8"://up
				self.timer[8] = setInterval(self.moveUp.bind(self),self.interval);
				break;
			case "4"://left
				self.timer[4] = setInterval(self.moveLeft.bind(self),self.interval);
				break;
			case "6"://right
				self.timer[6] = setInterval(self.moveRight.bind(self),self.interval);
				break;
			case "2"://down
				self.timer[2] = setInterval(self.moveDown.bind(self),self.interval);
				break;
			case "5"://center
				self.moveCenter();
				break;
		}
		//self.keyBuffer[e.keyCode] = true;
	});
	window.addEventListener('keyup',function(e){
		if(e.key == "NumLock"){return;}
		//console.log("keyup"+e.key);
		switch(e.key){
			case "8"://up
				clearInterval(self.timer[8]);
				break;
			case "4"://left
				clearInterval(self.timer[4]);
				break;
			case "6"://right
				clearInterval(self.timer[6]);
				break;
			case "2"://down
				clearInterval(self.timer[2]);
				break;
		}
		//self.keyBuffer[e.keyCode] = false;
	});
	window.addEventListener('blur',function(){
		//self.keyBuffer.length = 0;
	});
}
SlantFloor.prototype.moveCenter = function(){
	console.log("center");
	var self = this;
	self.xVal = 0;
	self.yVal = 0;
	self.setServoXY(self.xVal, self.yVal).then(()=>{
		//self.timer = setTimeout(self.keyboardController.bind(self),self.interval);
	});

}
SlantFloor.prototype.moveLeft = function(){
	var self = this;
	self.yVal-= self.unitValue;
	self.setServoXY(self.xVal, self.yVal).then(()=>{
		//self.timer = setTimeout(self.keyboardController.bind(self),self.interval);
	});

}
SlantFloor.prototype.moveRight = function(){
	var self = this;
	self.yVal+= self.unitValue;
	self.setServoXY(self.xVal, self.yVal).then(()=>{
		//self.timer = setTimeout(self.keyboardController.bind(self),self.interval);
	});
	
}
SlantFloor.prototype.moveUp = function(){
	var self = this;
	self.xVal+= self.unitValue;
	self.setServoXY(self.xVal, self.yVal).then(()=>{
		//self.timer = setTimeout(self.keyboardController.bind(self),self.interval);
	});

}
SlantFloor.prototype.moveDown = function(){
	var self = this;
	self.xVal-= self.unitValue;
	self.setServoXY(self.xVal, self.yVal).then(()=>{
		//self.timer = setTimeout(self.keyboardController.bind(self),self.interval);
	});
	
}
SlantFloor.prototype.keyboardController = function(){
	//console.log("key");
	var self = this;
	console.log(self.yVal,self.xVal);
	/*
	if(!(self.keyBuffer[65]||self.keyBuffer[68]||self.keyBuffer[87]||self.keyBuffer[83])
		&& radiconVal[0]==1 && radiconVal[1]==1 && radiconVal[2]==1 && radiconVal[3]==1){
		//console.log(radiconVal);
		self.timer = setTimeout(self.keyboardController.bind(self),self.interval);
		return;
	}
	*/
	if(self.keyBuffer[65]){self.yVal-= self.unitValue;}//a
	if(self.keyBuffer[68]){self.yVal+= self.unitValue;}//d
	if(self.keyBuffer[87]){self.xVal+= self.unitValue;}//w
	if(self.keyBuffer[83]){self.xVal-= self.unitValue;}//s

	if(self.keyBuffer[100]){self.yVal-= self.unitValue;}//4
	if(self.keyBuffer[102]){self.yVal+= self.unitValue;}//6
	if(self.keyBuffer[104]){self.xVal+= self.unitValue;}//8
	if(self.keyBuffer[98]){self.xVal-= self.unitValue;}//2

	if(self.keyBuffer[101]){self.yVal = 0;self.xVal = 0;}//5

	if(self.keyBuffer[103]){self.xVal = self.maxX; self.yVal = -self.maxY;}//7
	if(self.keyBuffer[105]){self.xVal = self.maxX; self.yVal =  self.maxY;}//9
	if(self.keyBuffer[97]){self.xVal = -self.maxX; self.yVal = -self.maxY;}//1
	if(self.keyBuffer[99]){self.xVal = -self.maxX; self.yVal =  self.maxY;}//3
	//radicon
	//console.log(radiconVal);
	if(radiconVal[2]==1 && radiconVal[3]==0){self.yVal-= self.unitValue;}//a
	if(radiconVal[2]==0 && radiconVal[3]==0){self.yVal+= self.unitValue;}//d
	if(radiconVal[0]==0){self.xVal+= self.unitValue;}//w
	if(radiconVal[1]==0){self.xVal-= self.unitValue;}//s

	if(self.xVal < -self.maxX){ self.xVal = -self.maxX;}
	if(self.xVal > self.maxX){ self.xVal = self.maxX;}
	if(self.yVal < -self.maxY){ self.yVal = -self.maxY;}
	if(self.yVal > self.maxY){ self.yVal = self.maxY;}
	self.setServoXY(self.xVal, self.yVal).then(()=>{
		self.timer = setTimeout(self.keyboardController.bind(self),self.interval);
	});
}

SlantFloor.prototype.setServoXY = function(nx,ny){
	var self = this;
	var sx, sy;
	sx = 0.71 * nx + 0.71 * ny;
	sy = -0.71 * nx + 0.71 * ny;
	return new Promise(function(resolve, reject){
		self.setAngle( self.SX_CH, sx).then( ()=>{
			self.setAngle( self.SY_CH, sy).then( ()=>{
				resolve();
			});
		});
	});
	
	//Sleep( 3 );
	
}

SlantFloor.prototype.setAngle = function( cha , angle ){
	var self = this;
	var offsetAngle = 0;
	if(angle > self.maxS){
		angle = self.maxS;
		self.timer.forEach((timer)=>{clearInterval(timer)});
	}
	if(angle < -self.maxS){
		angle = -self.maxS;
		self.timer.forEach((timer)=>{clearInterval(timer)});
	}
	if( cha == self.SX_CH ){
		offsetAngle = self.sxOffsetAngle;
	} else if ( cha == self.SY_CH) {
		offsetAngle = self.syOffsetAngle;
	}
	// setServo(port, cha , angle + offsetAngle );
	//self.servoDriver.setServo(port,0x40,cha,angle + offsetAngle);

	return new Promise(function(resolve, reject){
		self.servoDriver.setServo(cha,angle + offsetAngle).then(function(){
    //console.log('value:', angle+offsetAngle);
    	resolve();
		});
		
	});

	
}

function Sleep(millisec) {
  var start = new Date();
  while(new Date() - start < millisec);
}

