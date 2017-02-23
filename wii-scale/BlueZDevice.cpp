/*
 * This file is part of Wii-Scale
 * Copyright © 2017 Matt Robinson
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

#include <giomm.h>
#include <strings.h>
#include "BlueZDevice.h"

BlueZDevice::BlueZDevice(std::string address)
{
    if(address.empty())
    {
        throw std::invalid_argument("address is empty");
    }

    Gio::init();

    auto managerProxy = Gio::DBus::Proxy::create_for_bus_sync(Gio::DBus::BUS_TYPE_SYSTEM,
                                                              "org.bluez",
                                                              "/",
                                                              "org.freedesktop.DBus.ObjectManager");

    auto managedObjs = managerProxy->call_sync("GetManagedObjects");

    auto derived = Glib::VariantBase::cast_dynamic<Glib::Variant<std::map<std::string,std::map<std::string,std::map<std::string,Glib::VariantBase>>>>>(managedObjs.get_child());

    auto dict = derived.get();

    for (const auto& objectPair : dict)
    {
        auto devPair = objectPair.second.find("org.bluez.Device1");

        if(devPair == objectPair.second.end())
        {
            // No Device1 entry
            continue;
        }

        auto addrPair = devPair->second.find("Address");

        if(addrPair == devPair->second.end())
        {
            // No Address entry
            continue;
        }

        auto checkAddr = Glib::VariantBase::cast_dynamic<Glib::Variant<std::string>>(addrPair->second).get();

        if(strcasecmp(checkAddr.c_str(), address.c_str()) == 0)
        {
            this->path = objectPair.first;
            return;
        }
    }

    throw std::runtime_error("Could not find path for Bluetooth address " + address);
}

void BlueZDevice::Disconnect()
{
    auto devProxy = Gio::DBus::Proxy::create_for_bus_sync(Gio::DBus::BUS_TYPE_SYSTEM,
                                                          "org.bluez",
                                                          this->path,
                                                          "org.bluez.Device1");

    devProxy->call_sync("Disconnect");
}
