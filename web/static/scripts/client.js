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

    // Socket io
    var socket = io();

    socket.on('weight data', function(data){
        count++;
        setProgress();

        if(!done()) {
            $('#weight-total').text(data.totalWeight);
        }
    });

    socket.on('status data', function(data) {
        setPopup(data.message);

        if(data.status === "SYNC") {
            reset();
            setProgress();
        }

        if(data.status === "DONE") {
            reset();
        }        
    });
})();