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

#include <iostream>
#include <giomm.h>
#include <strings.h>
#include "BlueZDevice.h"

template <class retType>
retType GetPropertyValue(Glib::VariantBase properties, const std::string &name)
{
    Glib::VariantIter valuePairsIter(properties);
    Glib::VariantContainerBase container;

    while(valuePairsIter.next_value(container))
    {
        Glib::Variant<std::string> valueName;
        container.get_child(valueName, 0);

        if(valueName.get() != name)
        {
            continue;
        }

        Glib::Variant<Glib::VariantBase> valueOuter;
        container.get_child(valueOuter, 1);

        Glib::Variant<retType> value;
        valueOuter.get(value);

        return value.get();
    }

    return retType();
}

BlueZDevice::BlueZDevice(const std::string &address, const std::string &name)
{
    if(address.empty() && name.empty())
    {
        throw std::invalid_argument("both address and name are empty - one is required");
    }

    Gio::init();

    try
    {
        auto managerProxy = Gio::DBus::Proxy::create_for_bus_sync(Gio::DBus::BUS_TYPE_SYSTEM,
                                                                  "org.bluez",
                                                                  "/",
                                                                  "org.freedesktop.DBus.ObjectManager");

        auto managedObjs = managerProxy->call_sync("GetManagedObjects");

        Glib::VariantIter objectsIter(managedObjs.get_child());
        Glib::VariantContainerBase container;

        while(objectsIter.next_value(container))
        {
            Glib::Variant<std::string> objectPath;
            container.get_child(objectPath, 0);

            Glib::VariantIter objectPairsIter(container.get_child(1));

            while(objectPairsIter.next_value(container))
            {
                Glib::Variant<std::string> key;
                container.get_child(key, 0);

                if(key.get() != "org.bluez.Device1")
                {
                    continue;
                }

                auto properties = container.get_child(1);

                if(!GetPropertyValue<bool>(properties, "Connected"))
                {
                    continue;
                }

                if(address.empty())
                {
                    std::string checkName = GetPropertyValue<std::string>(properties, "Name");

                    if(checkName.empty())
                    {
                        continue;
                    }

                    if(checkName == name)
                    {
                        this->path = objectPath.get();
                        return;
                    }
                }
                else
                {
                    std::string checkAddr = GetPropertyValue<std::string>(properties, "Address");

                    if(checkAddr.empty())
                    {
                        continue;
                    }

                    if(strcasecmp(checkAddr.c_str(), address.c_str()) == 0)
                    {
                        this->path = objectPath.get();
                        return;
                    }
                }
            }
        }
    }
    catch(Gio::DBus::Error &dbusError)
    {
        // Dump details of the DBus error to stderr to aid troubleshooting
        std::cerr << dbusError.what() << std::endl;

        throw;
    }

    if(address.empty())
    {
        throw std::runtime_error("Could not find path for Bluetooth name \"" + name + "\"");
    }
    else
    {
        throw std::runtime_error("Could not find path for Bluetooth address \"" + address + "\"");
    }
}

void BlueZDevice::Disconnect()
{
    auto devProxy = Gio::DBus::Proxy::create_for_bus_sync(Gio::DBus::BUS_TYPE_SYSTEM,
                                                          "org.bluez",
                                                          this->path,
                                                          "org.bluez.Device1");

    devProxy->call_sync("Disconnect");
}
