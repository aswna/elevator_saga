{
    init: function(elevators, floors) {

        function consolidateDestinationQueue(elevator) {
            elevator.destinationQueue = [...new Set(elevator.destinationQueue)];
            elevator.checkDestinationQueue();
        }

        var numberOfElevators = elevators.length;
        var numberOfFloors    = floors.length;

        for (let elevatorIndex = 0; elevatorIndex < numberOfElevators; ++elevatorIndex) {
            let elevator = elevators[elevatorIndex];
            elevator.on("idle", function() {
                // partition the building to numberOfElevators vertical sections
                // when an elevator is idle, we send it to the floor at bottom of its section
                elevator.goToFloor(Math.floor(elevatorIndex * (numberOfFloors / numberOfElevators)));
            });

            elevator.on("floor_button_pressed", function(floorNum) {
                elevator.goToFloor(floorNum);
                consolidateDestinationQueue(elevator);
            });

            for (let floorIndex = elevatorIndex % numberOfFloors; floorIndex < numberOfFloors; floorIndex += numberOfElevators) {
                floors[floorIndex].on("up_button_pressed", function() {
                    elevator.goToFloor(floorIndex);
                });
                floors[floorIndex].on("down_button_pressed", function() {
                    elevator.goToFloor(floorIndex);
                });
            }

            elevator.on("stopped_at_floor", function(floorNum) {
                // remove floorNum from destination queue
                elevator.destinationQueue = elevator.destinationQueue.filter(f => f !== floorNum);
                consolidateDestinationQueue(elevator);
                console.log("Elevator:", elevatorIndex, "Stopped at floor:", floorNum, "Direction:", elevator.direction, "Queue:", elevator.destinationQueue);
            });

            elevator.on("passing_floor", function(floorNum, direction) {
                consolidateDestinationQueue(elevator);
                console.log("Elevator:", elevatorIndex, "Passing floor:", floorNum, "Direction:", direction, "Queue:", this.destinationQueue);
            });
        }
    },

    update: function(dt, elevators, floors) {
    }
}
