cmake_minimum_required(VERSION 3.1.0 FATAL_ERROR)

set(Boost_USE_STATIC_LIBS ON)
find_package(Boost REQUIRED COMPONENTS program_options)

add_subdirectory(socket.io-client-cpp)

INCLUDE_DIRECTORIES(socket.io-client-cpp/src)

add_executable(wii-scale wii-scale.cpp XWiiMonitor.cpp XWiiIface.cpp)

set_property(TARGET wii-scale PROPERTY CXX_STANDARD 11)
set_property(TARGET wii-scale PROPERTY CXX_STANDARD_REQUIRED ON)

target_link_libraries(wii-scale sioclient ${Boost_LIBRARIES} pthread xwiimote)
