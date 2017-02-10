/*
 * This file is part of Wii-Scale
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

#include <system_error>
#include <xwiimote.h>
#include "XWiiIface.h"
#include "UDevDevice.h"
#include "BlueZDevice.h"

XWiiIface::XWiiIface(std::string path)
{
    int ret = xwii_iface_new(&device, path.c_str());

    if(ret)
    {
        throw std::system_error(-ret, std::system_category(), "Failed to connect to device " + path);
    }

    UDev udev;
    std::unique_ptr<UDevDevice> board = udev.DeviceFromSyspath(path);
    std::unique_ptr<UDevDevice> parent = board->GetParent();
    this->address = parent->GetAttrValue("address");

    if(this->address.empty())
    {
        throw std::runtime_error("Couldn't find address");
    }
}

XWiiIface::~XWiiIface()
{
    xwii_iface_unref(device);
}

bool XWiiIface::HasBalanceBoard()
{
    return xwii_iface_available(device) & XWII_IFACE_BALANCE_BOARD;
}

bool XWiiIface::EnableBalanceBoard()
{
    if(!HasBalanceBoard())
    {
        return false;
    }

    int ret = xwii_iface_open(device, XWII_IFACE_BALANCE_BOARD);

    if(ret)
    {
        throw std::system_error(-ret, std::system_category(), "Failed to enable Balance Board");
    }

    return true;
}

bool XWiiIface::Dispatch(unsigned int mask, struct xwii_event *event)
{
    for(;;)
    {
        int ret = xwii_iface_dispatch(device, event, sizeof(*event));

        if(ret == -EAGAIN)
        {
            return false;
        }

        if(ret)
        {
            throw std::system_error(-ret, std::system_category(), "Read failed");
        }

        if (event->type & mask)
        {
            return true;
        }
    }
}

void XWiiIface::Disconnect()
{
    BlueZDevice bluez(this->address);
    bluez.Disconnect();
}
