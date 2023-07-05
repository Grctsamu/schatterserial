const io = require("socket.io-client").io;
const SerialPort = require('serialport').SerialPort;
const { DelimiterParser } = require('@serialport/parser-delimiter');




var serverEnv;

var name = "gserial";
var msgPrefix = "";

const _puerto = new SerialPort({

  path: "COM3",
  baudRate: 9600

})

const puerto = _puerto.pipe(new DelimiterParser({ delimiter: '\n'}));
var hoster = "everyone";


let connected = false;
var cryptCode = "schatter2023";

var socket = io("https://schatter.petacraft.repl.co");


socket.on('serial', function (datax) {


  if(connected) {

    var data = {
      sender: decrypt(cryptCode, datax.sender),
      receiver: decrypt(cryptCode, datax.receiver),
      text: decrypt(cryptCode, datax.text)
    };
if(data.receiver == name)
{
  console.log("Sender: " + data.sender + " Content: " + data.text);

  if(data.text == "//h") {
    hoster = data.sender;
    enviarServer(hoster, "Eres el host");
  } else {
    console.log("Enviando al puerto: " + data.text);
    _puerto.write(msgPrefix + data.text);
  }

}
  }
});


//Verificaciones
socket.on('checkcryptc', function(data) {
  console.log("Viendo si la clave de encriptacion es correcta");
  var respuesta = "schatterFree2011";
  socket.emit('checkcrypt', { chain: respuesta});
});

     socket.on('kick', function (data) {
      // controls(false);
    
       console.log("Kickeado: " + data.reason);
         connected = false;
       
     });
  
     socket.on('servered', function (data) {

      serverEnv = data;
      connected = true;
      console.log("Sesion iniciada en el servidor: " + serverEnv.servername + ", la clave de desecriptacion era correcta!");
      
      });




////////////////

puerto.on('data', function (data){


  
let texto = convert(data);
console.log("Arduino ## " + texto);
enviarServer(hoster, texto);

});

function enviarServer(receiver1, text1) {
  if(connected) {

    var data = {
      sender: crypt(cryptCode, name),
      receiver: crypt(cryptCode, receiver1),
      text: crypt(cryptCode, text1),
      cript: "cript"
    };

  socket.emit('serial', data);
  }
}

function convert(data) {
  var dec = new TextDecoder();
  var arr = new Uint8Array(data);

  return dec.decode(arr);

}

const crypt = (salt, text) => {
  const textToChars = (text) => text.split("").map((c) => c.charCodeAt(0));
  const byteHex = (n) => ("0" + Number(n).toString(16)).substr(-2);
  const applySaltToChar = (code) => textToChars(salt).reduce((a, b) => a ^ b, code);

  return text
    .split("")
    .map(textToChars)
    .map(applySaltToChar)
    .map(byteHex)
    .join("");
};

const decrypt = (salt, encoded) => {
  const textToChars = (text) => text.split("").map((c) => c.charCodeAt(0));
  const applySaltToChar = (code) => textToChars(salt).reduce((a, b) => a ^ b, code);
  return encoded
    .match(/.{1,2}/g)
    .map((hex) => parseInt(hex, 16))
    .map(applySaltToChar)
    .map((charCode) => String.fromCharCode(charCode))
    .join("");
};

