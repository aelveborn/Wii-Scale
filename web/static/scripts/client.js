// Data.Status / SYNC / READY / MEASURING / DONE

(function () {

    var init = function() {
        // UI
        $('#status').popover({
            trigger: 'manual',
            placement: 'bottom',
            content: 'Hello, start Wii-Scale.py or press the red sync button under the board'
        });

        $('#status').popover('show');

        // Progress bar
        var count = 0;
        var complete = 0;
        var progress = 0;
    }();

    var reset = function() {
        count = 0;
        complete = 300;
        progress = 0;
    }();

    var setProgress = function() {
        if(count < complete) {
            progress = Math.round((count / complete) * 100);
            $('.progress-bar').css('width', progress + '%'); 
        }
    };

    var setPopup = function(message) {
        var popover = $('#status').attr('data-content', message).data('bs.popover');
        popover.setContent();
        popover.$tip.addClass(popover.options.placement);
    }

    // Socket io
    var socket = io();

    socket.on('weight data', function(data){
        count++;
        setProgress();

        $('#weight-current').text(data.currentWeight);
        $('#weight-total').text(data.totalWeight);
    });

    socket.on('status data', function(data) {
        console.log(data.status);
        setPopup(data.message);

        if(data.status === "DONE") {
            reset();
        }        
    });
})();