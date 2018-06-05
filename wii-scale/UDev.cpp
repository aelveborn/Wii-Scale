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

#include <system_error>
#include "UDevDevice.h"

UDev::UDev()
{
    this->udev = udev_new();

    if(this->udev == NULL)
    {
        throw std::system_error(-errno, std::system_category(), "Failed to create udev context");
    }
}

UDev::~UDev()
{
    udev_unref(udev);
}

std::unique_ptr<UDevDevice> UDev::DeviceFromSyspath(const std::string &syspath)
{
    struct udev_device *device = udev_device_new_from_syspath(this->udev, syspath.c_str());

    if(device == NULL)
    {
        throw std::system_error(errno, std::system_category(), "Failed to create device");
    }

    return std::unique_ptr<UDevDevice>(new UDevDevice(device));
}
