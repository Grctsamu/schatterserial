const io = require("socket.io-client");
const SerialPort = require('serialport').SerialPort;
const Delimiter = require('@serialport/parser-delimiter').DelimiterParser;

var serverEnv;
var name = "rpiserial";
var msgPrefix = "";

var hoster = "everyone";

let connected = false;
var cryptCode = "schatter2023";

const _puertos = [];

var socket = io("");

// Función para escanear puertos y conectarse a todos
function scanAndConnectAll() {
  SerialPort.list().then((ports) => {
    if (ports.length === 0) {
      console.log('No se encontraron puertos disponibles. Volviendo a escanear en 3 segundos...');
      
      return;
    }

    ports.forEach((portInfo) => {
      var pathx = portInfo.path; // Manejar si la propiedad path no está presente
      
      if (!pathx) {
        console.error('Error: No se pudo determinar el path del puerto.');
        return;
      }
      const port = new SerialPort({ path: pathx, baudRate: 9600 });
      const parser = port.pipe(new Delimiter({ delimiter: '\n' }));

      _puertos.push({ port, parser, pathx });

      port.on('data', (data) => {
        let texto = convert(data);
        console.log(`Arduino en ${pathx}: ${texto}`);
        enviarServer(hoster, texto);
      });

      // Puedes agregar más eventos o lógica aquí según tus necesidades

      port.on('error', (err) => {
        console.error(`Error en el puerto ${pathx}:`, err.message);
      });
    });
  }).catch((err) => {
    console.error('Error al escanear puertos:', err.message);
  });
}

// Llamar a la función para escanear y conectar a todos los puertos
scanAndConnectAll();
setInterval(scanAndConnectAll, 5000);

socket.on('serial', function (datax) {
  if (connected) {
    var data = {
      sender: decrypt(cryptCode, datax.sender),
      receiver: decrypt(cryptCode, datax.receiver),
      text: decrypt(cryptCode, datax.text)
    };

    console.log(datax);

    if (data.receiver == name) {
      console.log("Sender: " + data.sender + " Content: " + data.text);

      if (data.text == "//h") {
        hoster = data.sender;
        enviarServer(hoster, "Eres el host");
      } else {
        console.log("Enviando al puerto: " + data.text);
        // Envía a todos los puertos en _puertos
        _puertos.forEach(({ port }) => {
          port.write(msgPrefix + data.text);
        });
      }
    }
  }
});

socket.on('checkcryptc', function(data) {
  console.log("Viendo si la clave de encriptación es correcta");
  var respuesta = "schatterFree2011";
  socket.emit('checkcrypt', { chain: respuesta });
});

socket.on('kick', function (data) {
  console.log("Kickeado: " + data.reason);
  connected = false;
});

socket.on('servered', function (data) {
  serverEnv = data;
  connected = true;
  console.log("Sesión iniciada en el servidor: " + serverEnv.servername + ", la clave de desencriptación era correcta!");
});

_puertos.forEach(({ port }) => {
  port.on('data', function (data) {
    let texto = convert(data);
    console.log("Arduino ## " + texto);
    enviarServer(hoster, texto);
  });
});

function enviarServer(receiver1, text1) {
  if (connected) {
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

