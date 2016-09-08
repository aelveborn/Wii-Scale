/*
 * This file is part of Wii-Scale
 * Copyright © 2015 Andreas Älveborn
 * Copyright © 2016 Matt Robinson
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */

#include <boost/program_options.hpp>
#include <iostream>
#include <string>
#include <chrono>

#include <sio_client.h>
#include <xwiimote.h>
#include <poll.h>

#include "XWiiMonitor.h"

namespace options = boost::program_options;

sio::socket::ptr current_socket;
std::unique_ptr<XWiiIface> board;

const int sensitivity = 3000; // as 10ths of a kg

void send_status(std::string status)
{
    std::cout << "Sending status: " << status << std::endl;

    auto object = sio::object_message::create();
    std::static_pointer_cast<sio::object_message>(object)->insert("status", status);
    current_socket->emit("wiiscale-status", object);
}

void send_weight(std::vector<uint32_t> totals)
{
    static std::chrono::high_resolution_clock::time_point lastTime;
    std::chrono::milliseconds ms = std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::high_resolution_clock::now() - lastTime);

    if(ms.count() < 100)
    {
        // Only send the weight every 0.1 of a second
        return;
    }

    lastTime = std::chrono::high_resolution_clock::now();
    uint32_t total = 0;

    for(auto iter = totals.begin(); iter != totals.end(); ++iter)
    {
        total += *iter;
    }

    total /= totals.size();

    auto value = sio::double_message::create((double)total / 100);
    auto object = sio::object_message::create();
    std::static_pointer_cast<sio::object_message>(object)->insert("totalWeight", value);

    current_socket->emit("wiiscale-weight", object);
}

std::unique_ptr<XWiiIface> connect()
{
    XWiiMonitor monitor;
    std::unique_ptr<XWiiIface> device;

    while(device = monitor.Poll())
    {
        if(!device->HasBalanceBoard())
        {
            // Not a balance board, try the next device
            continue;
        }

        device->EnableBalanceBoard();
        return device;
    }

    std::cerr << "Unable to find a balance board" << std::endl;
    return nullptr;
}

int main(int argc, const char* argv[])
{
    std::string host;
    int port;
    int calibrate;
    std::string address;

    options::options_description desc("wii-scale");

    desc.add_options()
        ("help", "Show this help")
        ("host,h", options::value<std::string>(&host)->default_value("localhost"), "host")
        ("port,p", options::value<int>(&port)->default_value(8080), "port")
        ("calibrate,c", options::value<int>(&calibrate)->default_value(0), "calibration kg")
        ("address,a", options::value<std::string>(&address), "mac-address")
    ;

    options::variables_map map;
    options::store(options::parse_command_line(argc, argv, desc), map);
    options::notify(map);

    if (map.count("help")) {
        std::cout << desc << "\n";
        return 1;
    }

    std::cout << "Wii-Scale started" << std::endl;

    sio::client client;
    client.connect("http://" + host + ":" + std::to_string(port));
    current_socket = client.socket();

    bool ready = false;
    bool sleep = true;
    bool connected = false;

    current_socket->on("wiiscale-connect", [&](sio::event& ev)
    {
        std::cout << "Requested connect" << std::endl;
        sleep = false;
    });

    current_socket->on("wiiscale-disconnect", [&](sio::event& ev)
    {
        std::cout << "Requested disconnect" << std::endl;
        // TODO: Disconnect
    });

    // Scale
    for(;;)
    {
        // Check if connection status changed
        if(connected != (board != NULL))
        {
            connected = (board != NULL);

            if(connected)
            {
                send_status("CONNECTED");
            }
            else
            {
                send_status("DISCONNECTED");
            }
        }

        // Waiting for disconnect/sleep command
        usleep(100000);

        if(sleep)
        {
            continue;
        }

        // Reset
        int done = false;
        std::vector<uint32_t> total;
        bool firstStep = true;
        int skipReadings = 10;

        // Connect to balance board
        if(!board)
        {
            send_status("CONNECTING");
            board = connect();

            if(!board)
            {
                sleep = true;
            }
            else
            {
                connected = true;
                send_status("CONNECTED");
            }
        }

        // Board is connected and ready
        if(board)
        {
            // Post ready status once
            if(!ready)
            {
                ready = true;
                send_status("READY");
            }

            while(!done)
            {
                struct xwii_event event;

                if(!board->Dispatch(XWII_EVENT_BALANCE_BOARD, &event))
                {
                    continue;
                }

                // Measure weight
                uint32_t totalWeight = 0;

                for(int i = 0; i < 4; i++)
                {
                    totalWeight += event.v.abs[i].x;
                }

                if(totalWeight <= sensitivity)
                {
                    if(!firstStep)
                    {
                        done = true;
                        send_status("DONE");
                    }

                    continue;
                }


                if(firstStep)
                {
                    firstStep = false;
                    send_status("MEASURING");
                }

                // Skips the first readings when the user steps on the balance board
                skipReadings -= 1;

                if(skipReadings < 0)
                {
                    total.push_back(totalWeight);
                    send_weight(total);
                }
            }

            ready = false;
        }
    }
}
