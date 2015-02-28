#Usage

You can use Wii-Scale from the terminal only if you want to. But the prettiest presentation is to use the web interface. The web interface is running on a node.js express server and communicates with the lightning fast WebSocket standard.

# Install on Ubuntu / Raspbian

This will only run on Linux and probably works well on a Raspberry Pi with a compatible bluetooth dongle.

You will need PyBlueZ, python, pygame and socketIO-client to run this.

	sudo apt-get install python

	sudo apt-get install python-pygame

	sudo apt-get install python-pip

	sudo pip install socketIO-client

npm start wont work on debian without installing. You can use the command: nodejs server.js

	sudo apt-get install nodejs-legacy

Install node dependencies

	cd web

	npm install


# Run

Start wii-scale

	python wii-scale.py

Start web server

	cd web

	npm start

Web interface

	http://localhost:8080

## Tribute

Based on the [wiiboard-simple](https://code.google.com/p/wiiboard-simple/) library
