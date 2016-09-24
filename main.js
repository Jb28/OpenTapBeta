// OpenTapApp


var mraa = require('mraa');



main();



//display.setColor(red, green, blue);

function main() {
    var lcd = require('jsupm_i2clcd');
    var display = new lcd.Jhd1313m1(0, 0x3E, 0x62);
    var button = new mraa.Gpio(4);
    var buzzer = new mraa.Gpio(3);
    button.dir(mraa.DIR_IN);
    buzzer.dir(mraa.DIR_OUT);
    buzzer.write(0);
    var state=button.read();
    if(state===1){
        buzzer.write(1); 
        sleep(300);
        buzzer.write(0); 
    }
    display.setCursor(1, 1);
    display.write('hi there');
    
    display.setCursor(0,0);
    display.write('more text');
    main();
    
}


function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}