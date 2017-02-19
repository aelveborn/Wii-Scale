/*
 * This file is part of Wii-Scale
 * Copyright © 2015 Andreas Älveborn
 * Copyright © 2016-2017 Matt Robinson
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
#include <deque>
#include <numeric>

#include <sio_client.h>
#include <xwiimote.h>
#include <poll.h>

#include "XWiiMonitor.h"

namespace options = boost::program_options;

sio::socket::ptr current_socket;
std::unique_ptr<XWiiIface> board;

const int sensitivity = 3000; // as 10ths of a kg

// Number of standard deviations less than the mean to discard at start
const int stdDevCutoff = 2;

void send_status(std::string status)
{
    auto object = sio::object_message::create();
    std::static_pointer_cast<sio::object_message>(object)->insert("status", status);
    current_socket->emit("wiiscale-status", object);
}

void send_weight(std::deque<uint32_t> *totals, double calibrate)
{
    static std::chrono::high_resolution_clock::time_point lastTime;
    std::chrono::milliseconds ms = std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::high_resolution_clock::now() - lastTime);

    if(ms.count() < 100)
    {
        // Only send the weight every 0.1 of a second
        return;
    }

    lastTime = std::chrono::high_resolution_clock::now();

    // First, calculate the mean
    double mean = std::accumulate(totals->begin(), totals->end(), 0.0) / totals->size();

    // Next, calculate the standard deviation
    uint32_t variance = 0;

    for(auto iter = totals->begin(); iter != totals->end(); ++iter)
    {
        variance += pow(*iter - mean, 2);
    }

    variance /= totals->size();
    double stdev = sqrt(variance);

    /* Finally, discard any values from the start of measuring that are
     * significantly lower from the average than the standard deviation.
     * This prevents values generated when stepping on to the balance board
     * from dragging the mean down irrespective of how quickly the user steps.
     */
    double threshold = (mean - (stdev * stdDevCutoff));

    while(totals->at(0) < threshold)
    {
        totals->pop_front();
    }

    auto value = sio::double_message::create(((double)mean / 100) + calibrate);
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

    return nullptr;
}

int main(int argc, const char* argv[])
{
    std::string host = "localhost";
    int port = 8080;
    double calibrate = 0;

    options::options_description desc("wii-scale");

    desc.add_options()
        ("help", "Show this help")
        ("host,h", options::value<std::string>(&host), "host")
        ("port,p", options::value<int>(&port), "port")
        ("calibrate,c", options::value<double>(&calibrate), "calibration kg")
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
    bool firstStep;
    std::deque<uint32_t> total;

    current_socket->on("wiiscale-connect", [&](sio::event& ev)
    {
        send_status("CONNECTING");
        board = connect();

        send_status(board ? "CONNECTED" : "NO DEVICE FOUND");
    });

    current_socket->on("wiiscale-disconnect", [&](sio::event& ev)
    {
        if(board)
        {
            board->Disconnect();
        }
    });

    // Scale
    for(;;)
    {
        if(!board)
        {
            // Waiting for connection or command
            usleep(100000);
            continue;
        }

        // Post ready status once
        if(!ready)
        {
            firstStep = true;
            total.clear();

            ready = true;
            send_status("READY");
        }

        struct xwii_event event;
        board->Dispatch(XWII_EVENT_WATCH | XWII_EVENT_BALANCE_BOARD, &event);

        if(event.type == XWII_EVENT_WATCH)
        {
            // Board has disconnected
            send_status("DISCONNECTED");

            board = nullptr;
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
                ready = false;
                send_status("DONE");
            }

            continue;
        }

        if(firstStep)
        {
            firstStep = false;
            send_status("MEASURING");
        }

        total.push_back(totalWeight);
        send_weight(&total, calibrate);
    }
}
