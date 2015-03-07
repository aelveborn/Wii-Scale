# Wii-Scale

Wii-Scale turns your Wii Balance Board into a digital scale. Wii-Scale will automatically find your Wii Balance Board when you press the red sync button under it. All you have to do is just stand on it :) No boring console interface, watch your weight being calculated in realtime on a beautiful web insterface.


![Image of the Wii-Scale web interface](https://lh5.googleusercontent.com/RsUY3uzuUjYNqxs8iS07eaWySbWfK9GUHhAzw-hIVuKY_CkCP6He1zn0HNWp2zfVSrq4ZTrt4AU=w1290-h520)

## Usage

Each time you whant to measure your weight you'll have to press the red sync button on your Wii Balance Board. That's because it's a real hassle to pair it with your linux machine. Wii-Scale will stay on an listen for your Wii Balance Board and promt you what to do in the web interface.

The weight is calculated by taking the mean of 500 readings. There is also a safe period of 80 readings where you will step on the balance board that are skipped by default. All this to get the best accurate reading as possible. Oh, and all this will take about 3 seconds.


## Install

Wii-Scale is based on python and node.js and communicates with the lightning fast WebSocket protocol. 

Wii-Scale requires these  `python` libraries `PyBlueZ`, `pygame`, `socketIO-client`. The web server is running `node.js` and you'll need `npm` installed.

Make the python script executable:

	chmod -x ./Wii-Scale.py

Go to the web folder:

	cd web/

Install all node packages:

	npm install

## Run

Start the web server:

	cd web/
	npm start

or start the web server with this command if you are running debian:

	nodejs server.js

Go back to the root folder and start Wii-Scale:

	cd ..
	python Wii-Scale.py

Now the web server and Wii-Scale should be up and running. Point you web browser to [Wii-Scale](http://localhost:8080) and you should see the web interface. Press the red sync button on your Wii Balance Board (lokated inside the battery hatch). It will sync and you should be promted to stand on your board.


### Only on Linux

Since Wii-Scale uses BlueZ bluetooth stack it's most likely it will only run on Linux.

## Install on Ubuntu / Raspbian (Not complete)


You will need PyBlueZ, python, pygame and socketIO-client to run this.

	sudo apt-get install python

	sudo apt-get install python-pygame

	sudo apt-get install python-pip

	sudo pip install socketIO-client

`npm start` wont work on debian without installing `nodejs-legacy`.

	sudo apt-get install nodejs-legacy



## Tribute

Based on the [wiiboard-simple](https://code.google.com/p/wiiboard-simple/) library.


## Lincense

Wii-Scale is created by [Andreas Älveborn](http://aelveborn.com) and lincensed under MIT. [wiiboard-simple](https://code.google.com/p/wiiboard-simple/)  is licensed under LGPL.