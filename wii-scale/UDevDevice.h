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

#include <memory>
#include <libudev.h>
#include "UDev.h"

class UDevDevice
{
    public:
        ~UDevDevice();
        std::unique_ptr<UDevDevice> GetParent();
        std::string GetAttrValue(const std::string &name);

    private:
        explicit UDevDevice(struct udev_device *device);
        struct udev_device *device;

    friend std::unique_ptr<UDevDevice> UDev::DeviceFromSyspath(const std::string &syspath);
};
