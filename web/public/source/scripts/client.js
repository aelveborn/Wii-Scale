/*
    Author: Andreas Älveborn
    URL: https://github.com/aelveborn/Wii-Scale

    This file is part of Wii-Scale

    ----------------------------------------------------------------------------
    
    The MIT License (MIT)
    
    Copyright (c) 2015 Andreas Älveborn
    
    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:
    
    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.
    
    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
*/

(function () {

    // Socket io
    var socket = io();

    var init = function() {
        reset();
        showControls(true, false);
        showDialog('#status-start');        
    };

    function reset() {
        count = 0;
        complete = 50;
        progress = 0;
        setProgress();
    }

    function done() {
        return count >= complete;
    }

    function setProgress() {
        progress = Math.round((count / complete) * 100);
        if(progress <= 100) {
            $('.progress-bar').css('width', progress + '%');
        }        
    }

    function showDialog(id) {
        $('.status').each(function() {
            $(this).hide();
        });
        $(id).fadeIn();
    }

    function connect() {
        socket.emit('device connect');
    }

    function disconnect() {
        socket.emit('device disconnect');
        showDialog('#status-disconnecting');
    }

    function save(weight) {
        socket.emit('entries new', weight);
    }


    // From wii-scale

    function weightReading(totalWeight) {       
        if(!done()) {            
            $('#weight-total').text(totalWeight);
        } else if (count === complete) {
            $('#weight-total').text(totalWeight);
            showDialog('#status-done');
            save(totalWeight);
        }

        setProgress();
        count++;            
    }


    // Buttons

    $('#connect').on('click', function(e) {
        e.preventDefault();
        connect();
    });

    $('#disconnect').on('click', function(e) {
        e.preventDefault();
        disconnect();
    });

    function showControls(connect, disconnect) {
        if(connect) {
            $('#connect').fadeIn();
        } else {
            $('#connect').hide();
        }

        if(disconnect) {
            $('#disconnect').fadeIn();
        } else {
            $('#disconnect').hide();
        }
    }


    // Socket

    socket.on('wiiscale-weight', function(data){
        weightReading(data.totalWeight.toFixed(1));
    });

    socket.on('wiiscale-status', function(data) {
        console.log(data.status); // TODO: Remove

        switch(data.status) {
            case "SYNC":
                showDialog('#status-search');
                showControls(false, true);
                break;

            case "NO DEVICE FOUND":
                showDialog('#status-warning');
                showControls(true, false);
                break;

            case "CONNECTING":
                break;

            case "CONNECTED":
                reset();
                showDialog('#status-ready');
                showControls(false, true);
                break;

            case "DISCONNECTED":
                showDialog('#status-start');        
                showControls(true, false);
                break;

            case "READY":
                showDialog('#status-ready');
                showControls(false, true);
                break;

            case "MEASURING":
                showDialog('#status-measuring');
                showControls(false, true);
                break;

            case "DONE":
                reset();
                break;

            case "NO PREVIOUS STATUS":
                init();
                break;
        }
    });
})();