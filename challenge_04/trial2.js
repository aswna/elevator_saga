{
    init: function(elevators, floors) {
        var numberOfElevators = elevators.length;
        var numberOfFloors    = floors.length;

        for (let elevatorIndex = 0; elevatorIndex < numberOfElevators; ++elevatorIndex) {
            let elevator = elevators[elevatorIndex];
            elevator.on("idle", function() {
                elevator.goToFloor(elevatorIndex * (numberOfFloors / numberOfElevators));
            });

            elevator.on("floor_button_pressed", function(floorNum) {
                elevator.goToFloor(floorNum);
            });

            for (let floorIndex = elevatorIndex % numberOfFloors; floorIndex < numberOfFloors; floorIndex += numberOfElevators) {
                floors[floorIndex].on("up_button_pressed", function() {
                    elevator.goToFloor(floorIndex);
                });
                floors[floorIndex].on("down_button_pressed", function() {
                    elevator.goToFloor(floorIndex);
                });
            }
        }
    },

    update: function(dt, elevators, floors) {
    }
}
