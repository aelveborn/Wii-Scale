#!/usr/bin/python

import wiiboard
import pygame
import time
import sys
from bluetooth import *
from socketIO_client import SocketIO, LoggingNamespace


class CalculateWeight:
	def formatWeight(self, weight):
		return round(weight, 1)

	def weight(self, data):
		i = 0
		total = 0
		for i in range(len(data)):
			total += data[i]
		total = total / len(data)
		return self.formatWeight(total)


class WebSocketIO:
	def __init__(self):
		self.server = "localhost"
		self.port = 8080
		self.socket = SocketIO(self.server, self.port, LoggingNamespace)

	def pushStatus(self, status, message):
		self.socket.emit('status', {'status': status, 'message': message})

	def pushWeight(self, totalWeight):
		self.socket.emit('weight', {'totalWeight': totalWeight})


def main():
	sensitivity = 30 #kg
	#useSocket = False

	calculate = CalculateWeight()
	socket = WebSocketIO()
	pygame.init()


	# Scale
	running = True
	while(running):
		# Re initialize each run due to bug in wiiboard
		board = wiiboard.Wiiboard()

		print "Press the red sync button"
		socket.pushStatus("SYNC", "Press the red sync button")

		# Connect to balance board
		address = None
		while (address == None):
			address = board.discover()
		board.connect(address)

		#Flash lights
		time.sleep(0.1)
		board.setLight(True)

		#Measure weight
		print "Step on me..."
		socket.pushStatus("READY", "Step on me...")

		i = 0
		done = False
		total = []
		firstStep = True
		skipReadings = 80

		while(not done):
			time.sleep(0.05)

			for event in pygame.event.get():
				if event.type == wiiboard.WIIBOARD_MASS:
					if event.mass.totalWeight > sensitivity:

						if firstStep:
							firstStep = False
							print "Measuring.."
							socket.pushStatus("MEASURING", "Measuring..")

						# Skips the first readings when the user steps on the balance board
						skipReadings -= 1
						if(skipReadings < 0):
							total.append(event.mass.totalWeight)
							socket.pushWeight(calculate.weight(total))

					if event.mass.totalWeight <= sensitivity and not firstStep:
						done = True
					
					if event.type == wiiboard.WIIBOARD_BUTTON_RELEASE:
						done = True

		# Print final weight
		print "Thank you!"
		socket.pushStatus("DONE", "Thank you!")

		totalWeight = calculate.weight(total)
		print "\nTotal weight: %.1f kg" % (totalWeight)

		# Disconnect
		board.disconnect()

	# Clean up
	pygame.quit()


if __name__ == "__main__":
	main()