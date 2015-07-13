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

    var startContent = 
        '<h4>Find your Wii Balance Board</h4>' +
        '<button type="button" id="start-scanning" class="btn btn-info">Search</button>' +
        '<h6>Make sure bluetooth is working</h6>';


    var init = function() {
        // UI
        $('#status').popover({
            trigger: 'manual',
            placement: 'bottom',
            html: true,
            content: startContent
        });

        $('#status').popover('show');

        // Progress bar
        var count = 0;
        var complete = 0;
        var progress = 0;

        reset();
    }();

    function reset() {
        count = 0;
        complete = 50;
        progress = 0;
    }

    function done() {
        return count >= complete;
    }

    function setProgress() {
        if(!done()) {
            progress = Math.round((count / complete) * 100);
            $('.progress-bar').css('width', progress + '%'); 
        }
    }

    function setPopup(message) {
        var popover = $('#status').attr('data-content', message).data('bs.popover');
        popover.setContent();
        popover.$tip.addClass(popover.options.placement);
    }

    $('body').on('click', '#start-scanning', function () {
        socket.emit('device search');
    });

    $('body').on('click', '#cancel-scanning', function () {
        setPopup(startContent);
        socket.emit('device sleep');
    });

    socket.on('wiiscale-connection', function(data) {
        console.log(data.status); // TODO: Remove whole function
    });

    socket.on('device connected', function() {
        // TODO: Implement method
    });

    socket.on('device disconnected', function() {
        // TODO: Implement method
    });

    socket.on('wiiscale-weight', function(data){
        count++;
        setProgress();

        if(!done()) {
            $('#weight-total').text(data.totalWeight.toFixed(1));
        } else {
            setPopup("<h4>Thank you!</h4>");  
        }
    });

    socket.on('wiiscale-status', function(data) {
        console.log(data.status); // TODO: Remove

        switch(data.status) {
            case "SYNC":
                reset();
                setPopup("<h4>Press the red sync button under your Wii Balance Board</h4>" + 
                    "<img src='/static/images/ring.gif' />" +
                    "<button type='button' id='cancel-scanning' class='btn btn-block'>Cancel</button>");
                setProgress();
                break;
            case "READY":
                setPopup("<h4>Step on me...</h4>");
                break;
            case "MEASURING":
                setPopup("<h4>Measuring..</h4>");
                break;
            case "SLEEP":              
                reset();
                setProgress();
                setTimeout(function() {
                    setPopup(startContent);
                }, 1000);
                break;
        }
    });
})();