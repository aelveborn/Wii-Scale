/*
 * This file is part of Wii-Scale
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

#include <stdexcept>
#include <xwiimote.h>
#include "XWiiMonitor.h"

XWiiMonitor::XWiiMonitor()
{
    monitor = xwii_monitor_new(false, false);

    if(monitor == NULL)
    {
        throw std::runtime_error("Failed to create xwii_monitor");
    }
}

XWiiMonitor::~XWiiMonitor()
{
    xwii_monitor_unref(monitor);
}

std::unique_ptr<XWiiIface> XWiiMonitor::Poll()
{
    char *path = xwii_monitor_poll(monitor);

    if(path == NULL)
    {
        return nullptr;
    }

    std::unique_ptr<XWiiIface> iface(new XWiiIface(path));
    free(path);

    return iface;
}
