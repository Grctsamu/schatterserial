#!/bin/bash

mkdir SchatterSerial
cd SchatterSerial
curl https://raw.githubusercontent.com/samu63cs/schatterserial/main/index.js >> index.js
npm i serialport
npm i socket.io-client

read -p "Add SchatterSerial to Crontab? (yes/no): " respuesta

if [ "$respuesta" == "yes" ]; then
    # Lógica para añadir el programa a la crontab
    echo "@reboot node $(pwd)/SchatterSerial/index.js" | crontab -
    echo "Added to crontab"
else
    echo " "
fi

echo "Done!"
