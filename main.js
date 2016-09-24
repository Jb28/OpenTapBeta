
var mraa = require("mraa");
var fs = require('fs');
var lcd = require('jsupm_i2clcd');
var display = new lcd.Jhd1313m1(0, 0x3E, 0x62);
var http = require('http');
var serverIp = 'http://25.73.188.26:4200/'

function startSensorWatch(socket) {
    'use strict';
    var touch_sensor_value = 0, last_t_sensor_value;

    //Touch Sensor connected to D2 connector
    var digital_pin_D2 = new mraa.Gpio(2);
    digital_pin_D2.dir(mraa.DIR_IN);

    //Buzzer connected to D6 connector
    var digital_pin_D6 = new mraa.Gpio(6);
    digital_pin_D6.dir(mraa.DIR_OUT);

    digital_pin_D6.write(0);

    setInterval(function () {
        touch_sensor_value = digital_pin_D2.read();
        if (touch_sensor_value === 1 && last_t_sensor_value === 0) {
            console.log("Buzz ON!!!");
            //socket.emit('orderRaised', { information: "orderRaised"});
            manageLCD(1);
            digital_pin_D6.write(touch_sensor_value);
        } else if (touch_sensor_value === 0 && last_t_sensor_value === 1) {
            console.log("Buzz OFF!!!");
            //socket.emit('buzzerPress', { information: "Buzzer Off"});
            digital_pin_D6.write(touch_sensor_value);
        }
        last_t_sensor_value = touch_sensor_value;
    }, 100);
}

function postOrderRaised(orderStatus) {
    http.get({
        host: serverIp,
        path: '/buy?order=' + orderStatus    
    });
}

var startAsync = function async (startResponsePoll, callback) {
    console.log('startAsync hit');
    process.nextTick(function() { 
        callback();
        //get from server
        //callback(serverResponse);
    });
}

function startResponsePoll() {
    console.log('callback of get response from server for order')
}


//0 - is tap to order 
//      1 beer: £5.50
//1 - Processing order...
//2 - Order on its way!
function manageLCD(buttonState) {
    
    if (buttonState === 0) {
        display.setColor(255, 240, 240); //white
        display.setCursor(0, 2);
        display.write('Tap to order');
        display.setCursor(1, 1);
        display.write('1 Beer:  £5.50');
    } else if (buttonState === 1) {
        postOrderRaised(1);
        startAsync(startResponsePoll, manageLCD(2));
        display.setColor(255, 150, 50); //orange
        display.setCursor(0, 2);
        display.write('Tap to order');
        display.setCursor(1, 4);
        display.write('Order');
        sleep(200);
        display.write('.');
        sleep(200);
        display.write('.');
        sleep(200);
        display.write('.');
    } else if (buttonState === 2) {
        display.setColor(0, 255, 0);
    } else if (buttonState === 3) {
        //red screen
        //error
        console.log('setting screen red');
    }
    
   
    
//    display.setCursor(1, 1);
//    display.write('hi there');
//    
//    display.setCursor(0,0);
//    display.write('more text');
}


//Create Socket.io server

var app = http.createServer(function (req, res) {
//    'use strict';
//    res.writeHead(200, {'Content-Type': 'text/plain'});
//    res.end('<h1>Hello world from Intel IoT platform!</h1>');

//    THis will take out the index.html
        fs.readFile(__dirname + '/index.html',
      function (err, data) {
        if (err) {
          res.writeHead(500);
          return res.end('Error loading index.html');
        }

        res.writeHead(200);
        res.end(data);
      });
    
    
}).listen(1337);

var io = require('socket.io')(app);

console.log("Sample Reading Touch Sensor");

//Attach a 'connection' event handler to the server
io.on('connection', function (socket) {
    'use strict';
    console.log('a user connected');
    //Emits an event along with a message
    socket.emit('news', { hello: 'world' });
    
    manageLCD(0);
    
    //Start watching Sensors connected to Galileo board
    startSensorWatch(socket);
    
    //Attach a 'disconnect' event handler to the socket
    socket.on('disconnect', function () {
        console.log('user disconnected');
    });
});
//
////var serverIo = require('socket.io')();
////var serverSocket = serverIo.connect(serverIp);
//
//var serverSocket = io(serverIp);
////serverSocket.emit()

//var socket = require('socket.io-client')('http://25.73.188.26:4200/');
//socket.on('connect', function (socket) {
//    'use strict';
////    console.log('a user connected');
//    //Emits an event along with a message
////    socket.emit('news', { hello: 'world' });
//
//    //Start watching Sensors connected to Galileo board
//    startSensorWatch(socket);
//
//    //Attach a 'disconnect' event handler to the socket
////    socket.on('disconnect', function () {
////        console.log('user disconnected');
////    });
//});
function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}