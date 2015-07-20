#!/usr/bin/python
# -*- coding: UTF-8 -*-

# Author: Andreas Älveborn
# URL: https://github.com/aelveborn/Wii-Scale
#
# This file is part of Wii-Scale
#
# ----------------------------------------------------------------------------
#
# The MIT License (MIT)
# 
# Copyright (c) 2015 Andreas Älveborn
# 
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
# 
# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.
# 
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.

import wiiboard
import time
import sys
import getopt

from bluetooth import *
from socketIO_client import SocketIO, LoggingNamespace


# Global
board = None
sleep = True
sensitivity = 30 #kg
calibrate = 0 #kg
config_address = None

port = 8080
host = "localhost"


class CalculateWeight:
	def formatWeight(self, weight):
		return round(weight, 1)

	def weight(self, data):
		i = 0
		total = 0
		global calibrate

		for i in range(len(data)):
			total += data[i]
		total = total / len(data)
		total = total + calibrate
		return self.formatWeight(total)


class WebSocketIO:
	def __init__(self):
		global host
		global port
		self.socketIO = SocketIO(host, port, LoggingNamespace)
		self.socketIO.on('wiiscale-connect', self.receive_connect)
		self.socketIO.on('wiiscale-disconnect', self.receive_disconnect)

	def wait(self):
		self.socketIO.wait(seconds = 1)

	def send_status(self, status):
		self.socketIO.emit('wiiscale-status', {'status': status})

	def send_weight(self, totalWeight):
		self.socketIO.emit('wiiscale-weight', {'totalWeight': totalWeight})

#	def send_connection_status(self, status):
#		self.socketIO.emit('wiiscale-connection', {'status': status})

	# Accepts True or False as argument
	def receive_connect(self):
		global sleep
		sleep = False

	def receive_disconnect(self):
		global board
		global sleep
		sleep = True
		board.disconnect()


def options(argv):
	try:
		opts, args = getopt.getopt(argv, "h:p:c:a:", ["host=", "port=", "calibrate=", "address="])
	except getopt.GetoptError:
		print "wii-scale.py -h <host> -p <port> -c <calibration kg> -a <mac-addres>"
		sys.exit(2)

	for opt, arg in opts:
		if opt in ("-h", "--host"):
			global host
			if arg:
				host = arg.strip()
		elif opt in ("-p", "--port"):
			global port
			try:
				port = int(arg)
			except:
				pass
		elif opt in ("-c", "--calibrate"):
			global calibrate
			try:
				calibrate = int(arg)
			except:
				pass
		elif opt in ("-a", "--address"):
			global config_address
			if arg:
				config_address = arg.strip()


def main(argv):
	options(argv)
	print "Wii-Scale started"

	global sleep
	global port
	global config_address
	global calibrate
	global board

	ready = False
	sleep = True
	connected = False
	calculate = CalculateWeight()
	socket = WebSocketIO()
	board = wiiboard.Wiiboard()

	# Scale	
	while(True):

		# Check if connection status changed
		if connected is not board.isConnected():
			connected = board.isConnected()
			if connected:
				socket.send_status("CONNECTED")
			else:				
				socket.send_status("DISCONNECTED")
				#Turn off lights
				time.sleep(0.1) # This is needed for wiiboard.py
				board.setLight(False)

		# Waiting for disconnect/sleep command
		socket.wait()
		if sleep:
			continue


		# Reset
		done = False
		total = []
		firstStep = True
		skipReadings = 5


		# Connect to balance board
		if not board.isConnected():
			# Re initialize each run due to bug in wiiboard
			# Note: Seems to be working though :/
			board = wiiboard.Wiiboard()
			socket.send_status("SYNC")

			if not config_address:
				address = board.discover()
			else:
				address = config_address

			if not address:
				sleep = True
				socket.send_status("NO DEVICE FOUND")
				continue

			socket.send_status("CONNECTING")
			board.connect(address)

			if board.isConnected():
				connected = True
				socket.send_status("CONNECTED")


		#Board is connected and ready
		if board.isConnected():

			# Post ready status once
			if not ready:
				ready = True
				time.sleep(0.1) # This is needed for wiiboard.py
				board.setLight(True)
				socket.send_status("READY")

			#Measure weight
			if board.mass.totalWeight > sensitivity:
				while(not done):
					time.sleep(0.1)

					if firstStep:
						firstStep = False
						socket.send_status("MEASURING")

					# Skips the first readings when the user steps on the balance board
					skipReadings -= 1
					if(skipReadings < 0):
						total.append(board.mass.totalWeight)
						socket.send_weight(calculate.weight(total))

					if board.mass.totalWeight <= sensitivity and not firstStep:
						done = True
						socket.send_status("DONE")
				ready = False

if __name__ == "__main__":
	main(sys.argv[1:])