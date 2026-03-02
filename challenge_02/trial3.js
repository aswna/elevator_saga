{
    init: function(elevators, floors) {
        var elevator = elevators[0]; // Let's use the first elevator

        // Whenever the elevator is idle (has no more queued destinations) ...
        elevator.on("idle", function() {
            // Go to every floor
            for (var j = 0; j < floors.length; j++) {
                this.goToFloor(j);
            }
        });

        elevator.on("floor_button_pressed", function(floorNum) {
            elevator.goToFloor(floorNum);
        });
    },

    update: function(dt, elevators, floors) {
        // We normally don't need to do anything here
    }
}
