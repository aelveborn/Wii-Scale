# Wii-Scale

Wii-Scale turns your Wii Balance Board into a digital scale. Wii-Scale will automatically find your Wii Balance Board when it is connected to your computer. All you have to do is just stand on it :) No boring console interface, watch your weight being calculated in realtime on a beautiful web insterface.

You can also create multiple users for the whole family and see each members weight history. Wii-Scale runs on Linux and it also runs on a Raspberry Pi.

![Wii-Scale](https://github.com/aelveborn/Wii-Scale/blob/gh-pages/images/wiiscale_0_0_4_start.png?raw=true) 

Wii-Scale is based on C++, node.js, AngularJS and communicates over the lightning fast WebSocket protocol.

## Usage

Before you can use Wii-Scale, you need to have your balance board paired with your computer and connected.  To start, just press the green "Connect" button in Wii-Scale and follow the on-screen prompts in the web interface.

![Wii-Scale scanning for Wii Balance Board](https://github.com/aelveborn/Wii-Scale/blob/gh-pages/images/wiiscale_0_0_4_measuring.png?raw=true) 

The weight is calculated by taking the mean of 50 readings. Wii-Scale will ignore all weights under 30 kg to give you the most accurate reading possible. Oh, and all this will take about 3 seconds.

## Installation

Wii-Scale runs most likely only on Linux. Follow these guides to install Wii-Scale on Ubuntu or Raspberry Pi:

- [How to install Wii-Scale on Ubuntu](https://github.com/aelveborn/Wii-Scale/wiki/Guide:-How-to-install-Wii-Scale-on-Ubuntu)
- [How to install Wii-Scale on Raspberry Pi](https://github.com/aelveborn/Wii-Scale/wiki/Guide:-How-to-install-Wii-Scale-on-Raspberry-Pi)

To communicate with your Wii Balance Board you'll need a bluetooth 2.0 or 2.1 compatible device. You can find [compatible devices here](http://wiibrew.org/wiki/List_of_Working_Bluetooth_Devices). Wii-Scale is based on the following dependencies `Python 2`, `Python-pip` and `Node.js with npm` and `BlueZ` bluetooth stack.


### Install Wii-Scale

Download latest version of Wii-Scale:

	cd <your-directory>/
	git clone https://github.com/aelveborn/Wii-Scale.git --recursive --depth 1
	cd Wii-Scale/

Allow non-root users to access balance board:

	sudo cp wii-scale/70-wii-scales.rules /etc/udev/rules.d/

Run install:

	mkdir build && cd build
	cmake ../wii-scale && make
	npm install --production


### Run

	npm start

Now the web server and Wii-Scale should be up and running at [http://localhost:8080](http://localhost:8080)

## Configuration (optional)

You can configure a different host, port and calibration.

### Access the web interface from other computers

To open up the web server to be accessable from the outside, like if you'll running Wii-Scale on an Raspberry Pi or a server:

	npm config set wii-scale:host 0.0.0.0

### Web server port

Define a custom port for the webserver (default is 8080):

	npm config set wii-scale:port 8080

### Webserver host

Define a different host for the webserver (default is localhost):

	npm config set wii-scale:host localhost

### Calibrate Wii-Scale

If the scales weight is off by any amout you can calibrate it by your own by setting the calibration i Kg. So `npm config set wii-scale:calibrate 2`will add 2kg to your weight, default is set to 0.

	npm config set wii-scale:calibrate 0


## Update

To update Wii-Scale, grab the latest version from GitHub:

	cd <your-directory>/Wii-Scale
	git pull origin master

Update Wii-Scale by running install:

	cd build
	make
	npm install --production


## For developers

If you whant to make a code contribution, run a `grunt clean-build` before you commit and create a pull request to the dev branch. This is important since the dev branch is used for testing.

### Developer install

If you are a developer you can install Wii-Scale with all developer dependecies:

	sudo python setup.py install
	sudo npm install

If you are a developer and whant to contribute to the project, then this is some nice commands to know about.

Run:

	npm start

Run all tests:

	npm test

Grunt commands:

	grunt
	grunt build
	grunt clean-build

`grunt` will run `grunt watch` and build the whole project.

## Libraries

Wii-Scale uses the [xwiimote](https://github.com/dvdhrm/xwiimote), [socket.io-client-cpp](https://github.com/socketio/socket.io-client-cpp), [glibmm / giomm](https://developer.gnome.org/glibmm) and [libudev](https://www.freedesktop.org/software/systemd/man/libudev.html) libraries.


## Licence

Wii-Scale is created and copyrighted by [Andreas Älveborn](http://aelveborn.com) and lincensed under GPL v2.
