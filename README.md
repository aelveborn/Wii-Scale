# Wii-Scale

Wii-Scale turns your Wii Balance Board into a digital scale. Wii-Scale will automatically find your Wii Balance Board when you press the red sync button under it. All you have to do is just stand on it :) No boring console interface, watch your weight being calculated in realtime on a beautiful web insterface.

![Image of the Wii-Scale web interface](https://lh5.googleusercontent.com/RsUY3uzuUjYNqxs8iS07eaWySbWfK9GUHhAzw-hIVuKY_CkCP6He1zn0HNWp2zfVSrq4ZTrt4AU=w1290-h520)

Wii-Scale is based on python and node.js and communicates with the lightning fast WebSocket protocol.

## Usage

Each time you whant to measure your weight you'll have to press the red sync button on your Wii Balance Board. That's because it's a real hassle to pair it with your linux machine. Wii-Scale will stay on an listen for your Wii Balance Board and promt you what to do in the web interface.

The weight is calculated by taking the mean of 500 readings. There is also a safe period of 80 readings where you will step on the balance board that are skipped by default. All this to get the best accurate reading as possible. Oh, and all this will take about 3 seconds.

## Dependencies

To run Wii-Scale you'll need `Python 2` with `pygame` and `Node.js with npm installed`.

### Install dependencies on Ubuntu

Install Python, PIP and pygame

	sudo apt-get install python
	sudo apt-get install python-pip
	sudo apt-get install python-pygame

Install Node.js with npm (node package manager)

	sudo apt-get install nodejs

Optionally (if `npm start`won work)

	sudo apt-get install nodejs-legacy

## Install

Since Wii-Scale uses `BlueZ` bluetooth stack it's most likely it will only run on Linux.

### Install Wii-Scale

Install node packages

	npm install

Install python application

	python setup.py install


## Config (optional)

You can configure a different host and port for the node.js web server. By default Wii-Scale is using localhost:8080.

	npm config set wii-scale:port 80
	npm config set wii-scale:host 127.0.0.1
	npm config set wii-scale:address 00:00:00:00:00

## Run

	npm start

Now the web server and Wii-Scale should be up and running. Point you web browser to http://localhost:8080 and you should see the web interface.

## Libraries

Based on the [wiiboard-simple](https://code.google.com/p/wiiboard-simple/) library.


## Lincense

Wii-Scale is created and copyrighted by [Andreas Älveborn](http://aelveborn.com) and lincensed under MIT. [wiiboard-simple](https://code.google.com/p/wiiboard-simple/)  is licensed under LGPL.