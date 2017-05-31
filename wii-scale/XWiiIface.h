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

#include <xwiimote.h>
#include <poll.h>

class XWiiIface
{
    public:
        explicit XWiiIface(const std::string &path);
        ~XWiiIface();
        bool HasBalanceBoard();
        bool EnableBalanceBoard();
        void Dispatch(unsigned int mask, struct xwii_event *event);
        void Disconnect();

    private:
        struct xwii_iface* device;
        std::string address;
        struct pollfd fds[1];
        bool sentDisconnect = false;
};
