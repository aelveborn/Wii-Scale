#!/usr/bin/python
# -*- coding: UTF-8 -*-

from setuptools import setup

setup(
	name = "WiiScale",
	version = "0.0.3",
	description = "Wii-Scale",
	license = "MIT",
	author = "Andreas Älveborn",
	url = "https://github.com/aelveborn/Wii-Scale",
	packages = ["wii-scale"],
	install_requires = [
		'pybluez==0.18',
		'socketio-client==0.6.1'
	]
)