#!/bin/bash

#build the proj
npx tsc

#reload
pm2 reload ePlannerAPI