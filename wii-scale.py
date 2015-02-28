import wiiboard
import pygame
import time
import sys
import json
from bluetooth import *

class Storage:
	def __init__(self):
		self.path = "data.json"
		self.currentWeight = 0
		self.totalWeight = 0
		self.status = ""

	def formatFloat(self, data):
		return float("{0:.1f}".format(data))

	def saveToFile(self, data):
		with open(self.path, "w") as outfile:
			json.dump(data, outfile, sort_keys = True, indent = 4, separators = (',', ': '))

	def setCurrentWeight(self, weight):
		self.currentWeight = self.formatFloat(weight)

	def setTotalWeight(self, total):
		self.totalWeight = self.formatFloat(total)

	def setStatus(self, status):
		self.status = status

	def save(self):
		data = {'weightCurrent': self.currentWeight, 'weightTotal': self.totalWeight, 'status': self.status}
		self.saveToFile(data)



class CalculateWeight:
	def __init__(self):
		self.debug = False
		self.weightPercent = 0.9

	def highestWeight(self, data):
		i = 0
		high = 0
		for i in range(len(data)):
			if data[i] > high:
				high = data[i]
		return high

	def filterLowReadings(self, data):
		i = 0
		lowest = 0
		result = []

		highest = self.highestWeight(data)
		lowest = highest * self.weightPercent

		for i in range(len(data)):
			if data[i] >= lowest:
				result.append(data[i])
		return result

	def weight(self, data):

		data = self.filterLowReadings(data)

		i = 0
		total = 0
		for i in range(len(data)):
			if self.debug:
				print "Calculated value " + `data[i]`
			total += data[i]
		total = total / len(data)
		return round(total, 1)



def main():
	debug = True
	sensitivity = 30 #kg

	calculate = CalculateWeight()
	storage = Storage()
	pygame.init()

	running = True
	while(running):
		# Re initialize each run due to bug in wiiboard
		board = wiiboard.Wiiboard()

		print "Press the red sync button on the board now"
		address = None
		while (address == None):
			storage.setStatus("Syncing")
			storage.save()
			address = board.discover()
		board.connect(address)

		#Flash lights
		time.sleep(0.1)
		board.setLight(True)

		#Measure weight
		print "Step on me..."
		storage.setStatus("Ready")
		storage.save()

		i = 0
		done = False
		total = []
		firstStep = True

		while(not done):
			time.sleep(0.05)

			for event in pygame.event.get():
				if event.type == wiiboard.WIIBOARD_MASS:
					if event.mass.totalWeight > sensitivity:

						if firstStep:
							firstStep = False
							storage.setStatus("Measuring")
							storage.save()

						total.append(event.mass.totalWeight)

						storage.setTotalWeight(calculate.weight(total))
						storage.setCurrentWeight(event.mass.totalWeight)
						storage.save()

						if debug:
							print "Weight: %.1f kg" % (event.mass.totalWeight)

					if event.mass.totalWeight <= sensitivity and not firstStep:
						done = True
					
					if event.type == wiiboard.WIIBOARD_BUTTON_RELEASE:
						done = True

		# Print final weight
		storage.setStatus("Done")
		storage.save()

		totalWeight = calculate.weight(total)
		print "\nTotal weight: %.1f kg" % (totalWeight)

		# Disconnect and cleanup
		board.disconnect()

	pygame.quit()





if __name__ == "__main__":
	main()