{
    init: function(elevators, floors) {
        elevators.forEach(function(elevator) {
            elevator.on("idle", function() {
                elevator.goToFloor(0);
            });

            elevator.on("floor_button_pressed", function(floorNum) {
                elevator.goToFloor(floorNum);
            });
        });
    },

    update: function(dt, elevators, floors) {
    }
}
