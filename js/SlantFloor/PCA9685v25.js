var PCA9685 = function(i2cPort,slaveAddress){
  this.i2cPort = i2cPort;
  this.slaveAddress = slaveAddress;
  this.centerPulse=null;
  this.rangePulse=null;
  this.angleRange=null;
};

PCA9685.prototype = {
  sleep: function(ms, generator){
    setTimeout(function(){generator.next()}, ms);
  },
  init: function(centerPulse,rangePulse,angleRange,noSetZero){
    var self = this;
    if(self.centerPulse && self.rangePulse && self.angleRange){
      console.log("alredy set param");
    }
    if(centerPulse && rangePulse && angleRange){ 
      self.centerPulse = centerPulse;
      self.rangePulse = rangePulse;
      self.angleRange = angleRange;
      console.log("set servo setting.");
    }else{
      self.centerPulse = 0.0015;
      self.rangePulse = 0.00060;
      self.angleRange = 50;
      console.log("set defaul servo setting.");
    }

    return new Promise(function(resolve, reject){
      self.i2cPort.open(self.slaveAddress)
      .then(function(i2cSlave){
        var thread = (function* () {

          i2cSlave.write8(0x00,0x00);
          yield self.sleep(10, thread);
          i2cSlave.write8(0x01,0x04);
          yield self.sleep(10, thread);

          i2cSlave.write8(0x00,0x10);
          yield self.sleep(10, thread);
          i2cSlave.write8(0xfe,0x64);
          yield self.sleep(10, thread);
          i2cSlave.write8(0x00,0x00);
          yield self.sleep(10, thread);
          i2cSlave.write8(0x06,0x00);
          yield self.sleep(10, thread);
          i2cSlave.write8(0x07,0x00);
          yield self.sleep(300, thread);


          if ( !noSetZero ){
            for ( var servoPort = 0 ; servoPort < 16 ; servoPort ++ ){
              self.setServo(servoPort , 0 ).then(
                function(){
                  resolve();
                },
                function(){
                  reject();
                }
              );
            }
          }else{
            resolve();
          }

        })();

        thread.next();
      });
    });  
  },
  setServo: function(servoPort,angle){
    console.log(servoPort,angle)
    var self = this;

    var portStart = 8;
    var portInterval = 4;
    /*
    var freq = 61; // Hz
    var tickSec = ( 1 / freq ) / 4096; // 1bit resolution( sec )
    
    var centerPulse,maxPulse,angleRange,pulseRange;
    if(self.centerPulse && self.maxPulse && self.angleRange){
      centerPulse = self.centerPulse;
      maxPulse = self.maxPulse;
      pulseRange = maxPulse - minPulse;
      angleRange = self.angleRange;
      console.log(minPulse,maxPulse,angleRange,pulseRange);
    }else{
      console.log("wrong param.");
    }
    var pulse = minPulse + angle / angleRange * pulseRange;
    var ticks = Math.round(pulse / tickSec);
    */

    var center,range,angleRange;
    if(self.centerPulse && self.rangePulse && self.angleRange){
      center = self.centerPulse;
      range = self.rangePulse;
      angleRange = self.angleRange;
      console.log(center,range,angleRange);
    }else{
      console.log("wrong param.");
      return;
    }
    
    if ( angle > angleRange){
      angle = angleRange;
    } else if ( angle < -angleRange ){
      angle = - angleRange;
    }
        
    var freq = 61; // Hz
    var tickSec = ( 1 / freq ) / 4096; // 1bit resolution( sec )
    var centerTick = center / tickSec;
    var rangeTick = range / tickSec;
        
    var gain = rangeTick / angleRange; // [tick / angle]
        
    var ticks = Math.round(centerTick + gain * angle);
    
    var tickH = (( ticks >> 8 ) & 0x0f);
    var tickL = (ticks & 0xff);

    return new Promise(function(resolve, reject){
      self.i2cPort.open(self.slaveAddress)
      .then(function(i2cSlave){
        var thread = (function* () {
          var pwm = Math.round(portStart + servoPort * portInterval);
          i2cSlave.write8( pwm + 1, tickH);
          yield self.sleep(1, thread);
          i2cSlave.write8( pwm, tickL);

          resolve();

        })();

        thread.next();
      });
    });  
  }
};