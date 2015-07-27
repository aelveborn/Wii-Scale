#!/usr/bin/python
# -*- coding: UTF-8 -*-

# Author: Andreas Älveborn
# URL: https://github.com/aelveborn/Wii-Scale
# 
# This file is part of Wii-Scale
# Copyright (C) 2015 Andreas Älveborn
# 
# This program is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation; either version 2 of the License, or
# (at your option) any later version.
# 
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
# 
# You should have received a copy of the GNU General Public License along
# with this program; if not, write to the Free Software Foundation, Inc.,
# 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.

import wiiboard
import subprocess

from bluetooth import *

def main():
	address = None
	board = wiiboard.Wiiboard()
	
	print "Press the red sync button under the battery hatch"

	while(address is None):
		print "Searching for Wii Balance Board..."
		address = board.discover()

	cmd_wiibind = "../scripts/xwiibind.sh " + address
	cmd_npm = "npm config set wii-scale:address " + address
	
	subprocess.call(cmd_wiibind, shell=True)
	
	print "Finishing up.."

	subprocess.check_call(cmd_npm, shell=True)

	print "All done!"


if __name__ == "__main__":
	main()