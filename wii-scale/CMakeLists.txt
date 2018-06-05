# This file is part of Wii-Scale
# Copyright © 2017-2018 Matt Robinson
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

cmake_minimum_required(VERSION 3.1.0 FATAL_ERROR)

set(Boost_USE_STATIC_LIBS ON)
find_package(Boost REQUIRED COMPONENTS program_options)

find_package(PkgConfig REQUIRED)
pkg_check_modules(GIOMM REQUIRED giomm-2.4)

add_subdirectory(socket.io-client-cpp EXCLUDE_FROM_ALL)

INCLUDE_DIRECTORIES(socket.io-client-cpp/src ${GIOMM_INCLUDE_DIRS})

add_executable(wii-scale wii-scale.cpp XWiiMonitor.cpp XWiiIface.cpp UDev.cpp
                         UDevDevice.cpp BlueZDevice.cpp)

set_property(TARGET wii-scale PROPERTY CXX_STANDARD 11)
set_property(TARGET wii-scale PROPERTY CXX_STANDARD_REQUIRED ON)

target_link_libraries(wii-scale sioclient ${Boost_LIBRARIES} pthread xwiimote
                                udev ${GIOMM_LIBRARIES})

file(GLOB CPP_FILES *.cpp)

add_custom_target(cppcheck ALL COMMAND cppcheck --quiet --error-exitcode=2
                  --enable=all --suppress=missingIncludeSystem --std=c++11
                  ${CPP_FILES}
                  DEPENDS wii-scale VERBATIM)
