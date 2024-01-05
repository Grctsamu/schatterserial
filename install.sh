#!/bin/bash

mkdir SchatterSerial
cd SchatterSerial
curl https://raw.githubusercontent.com/samu63cs/schatterserial/main/index.js >> index.js
npm i serialport
npm i socket.io-client

read -p "Do you want to add SchatterSerial to the crontab? (yes/no): " respuesta

if [[ "$respuesta" =~ ^[Yy][Ee][Ss]$ ]]; then
    # Logic to add the program to the crontab
    (crontab -l ; echo "@reboot node $(pwd)/SchatterSerial/index.js") | crontab -
    echo "Added to crontab"
else
    echo "Operation canceled."
fi



echo "Done!"
