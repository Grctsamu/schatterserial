#!/bin/bash

mkdir SchatterSerial
cd SchatterSerial
curl https://raw.githubusercontent.com/samu63cs/schatterserial/main/index.js >> index.js
npm i serialport
npm i socket.io-client





echo "Done!"
