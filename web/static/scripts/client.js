(function () {

    // Socket io
    var socket = io();

    var startContent = 
        '<h4>Find your Wii Balance Board</h4>' +
        '<button type="button" id="start-scanning" class="btn btn-info">Search</button>' +
        '<h6>Make sure bluetooth is working</h6>'


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
        complete = 500;
        progress = 0;
    };

    function done() {
        return count >= complete
    }

    function setProgress() {
        if(!done()) {
            progress = Math.round((count / complete) * 100);
            $('.progress-bar').css('width', progress + '%'); 
        }
    };

    function setPopup(message) {
        var popover = $('#status').attr('data-content', message).data('bs.popover');
        popover.setContent();
        popover.$tip.addClass(popover.options.placement);
    };

    $('body').on('click', '#start-scanning', function () {
        socket.emit('device search');
    });

    $('body').on('click', '#cancel-scanning', function () {
        setPopup(startContent);
        socket.emit('device sleep');
    });

    socket.on('weight data', function(data){
        count++;
        setProgress();

        if(!done()) {
            $('#weight-total').text(data.totalWeight.toFixed(1));
        } else {
            setPopup("<h4>Thank you!</h4>");  
        }
    });

    socket.on('status data', function(data) {
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
        };
    });
})();