# Wii-Scale

Wii-Scale turns your Wii Balance Board into a digital scale. Wii-Scale will automatically find your Wii Balance Board when you press the red sync button under it. All you have to do is just stand on it :) No boring console interface, watch your weight being calculated in realtime on a beautiful web insterface.

![Wii-Scale](https://github.com/aelveborn/Wii-Scale/blob/gh-pages/images/wiiscale_measuring.png?raw=true) 

Wii-Scale is based on python and node.js and communicates with the lightning fast WebSocket protocol.

## Usage

Each time you whant to measure your weight you'll have to press the red sync button on your Wii Balance Board. The red sync button is located under the battery hatch. That's because it's a real hassle to pair it with your linux machine. Wii-Scale will stay on an listen for your Wii Balance Board and promt you what to do in the web interface.

![Wii-Scale scanning for Wii Balance Board](https://github.com/aelveborn/Wii-Scale/blob/gh-pages/images/wiiscale_search.png?raw=true) 

The weight is calculated by taking the mean of 500 readings. There is also a safe period of 80 readings where you will step on the balance board that are skipped by default. All this to get the best accurate reading as possible. Oh, and all this will take about 3 seconds.

## Dependencies

To run Wii-Scale you'll need `Python 2` and `Node.js with npm installed`. Since Wii-Scale uses `BlueZ` bluetooth stack it's most likely it will only run on Linux.


### Install dependencies on Ubuntu

Python

	sudo apt-get install python
	sudo apt-get install python-pip

Node.js with npm

	sudo apt-get install nodejs


## Install Wii-Scale

If you are a developer, check out the Developer install section. This will install Wii-Scale and pair your Wii balance board to you computer or Raspberry Pi.

	sudo npm install --production

## Run

	npm start

Now the web server and Wii-Scale should be up and running at [http://localhost:8080](http://localhost:8080)

## Developer install

If you are a developer or if you whant to manually install and configure Wii-Scale you can follow this guide.

Install Wii-Scale with development dependencies:

	sudo npm install

Manually install the Wii-Scale backend software (this is done during npm install):

	sudo python setup.py install

Manually pair your Wii Balance Board (this is done during npm install):

	sudo python wii-scale/bind-setup.py

## Config (optional)

You can configure a different host, port, Wii Balance Board bluetooth address and calibration. 

Define a custom port for the webserver (default is 8080):

	npm config set wii-scale:port 8080

Define a different host for the webserver (default is localhost):

	npm config set wii-scale:host localhost

If you have paired your Wii balance board with your computer or Raspberry Pi you'll need to set the address to your Wii balance boards MAC address. If the MAC address is configured Wii-Scale wont scan for your Wii balance board, since it should be paired :). This is configured during `npm install` or by running `sudo python wii-scale/bind-setup.py`.

	npm config set wii-scale:address 00:00:00:00:00

If the scales weight is off by any amout you can calibrate it by your own by setting the calibration i Kg. So `npm config set wii-scale:calibrate 2`will add 2kg to your weight, default is set to 0.

	npm config set wii-scale:calibrate 0

## For developers

### Grunt commands

Always run grunt release before commiting the changes.

	grunt
	grunt watch
	grunt clean-build
	grunt release

## Libraries

Wii-Scale uses the [wiiboard-simple](https://code.google.com/p/wiiboard-simple/) library and [xwiimote](https://github.com/dvdhrm/xwiimote)


## Lincense

Wii-Scale is created and copyrighted by [Andreas Älveborn](http://aelveborn.com) and lincensed under MIT. [wiiboard-simple](https://code.google.com/p/wiiboard-simple/) is licensed under LGPL.