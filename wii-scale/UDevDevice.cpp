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

UDevDevice::UDevDevice(struct udev_device *device)
{
    if(device == NULL)
    {
        throw std::invalid_argument("device is NULL");
    }

    this->device = device;
}

UDevDevice::~UDevDevice()
{
    udev_device_unref(this->device);
}

std::unique_ptr<UDevDevice> UDevDevice::GetParent()
{
    struct udev_device *parent = udev_device_get_parent(this->device);

    if(parent == NULL)
    {
        throw std::system_error(errno, std::system_category(), "Failed to find parent");
    }

    // Increment parent ref count so it isn't freed with child object
    udev_device_ref(this->device);

    return std::unique_ptr<UDevDevice>(new UDevDevice(parent));
}

std::string UDevDevice::GetAttrValue(const std::string &name)
{
    const char *attrVal = udev_device_get_sysattr_value(this->device, name.c_str());

    if(attrVal != NULL)
    {
        return std::string(attrVal);
    }
    else
    {
        return std::string();
    }
}
