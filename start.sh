#!/bin/bash

#install
npm install pm2 -g

#compile project
npx tsc

#start app using pm2
pm2 start dist/src/ --name ePlannerAPI

#tells PM2 to starts on boot
pm2 startup