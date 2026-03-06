{
    init: function(elevators, floors) {

        function consolidateDestinationQueue(elevator) {
            elevator.destinationQueue = [...new Set(elevator.destinationQueue)];
            elevator.checkDestinationQueue();

            // updateUpDownIndicator(elevator);
        }

        function updateUpDownIndicator(elevator) {
            var direction = elevator.destinationDirection();
            if (direction === "up") {
                elevator.goingUpIndicator(true);
                elevator.goingDownIndicator(false);
            } else if (direction === "down") {
                elevator.goingUpIndicator(false);
                elevator.goingDownIndicator(true);
            } else {
                elevator.goingUpIndicator(true);
                elevator.goingDownIndicator(true);
            }
        }

        var numberOfElevators          = elevators.length;
        var numberOfFloors             = floors.length;
        var numberOfFloorsPerElevators = Math.floor(numberOfFloors / numberOfElevators);

        for (let elevatorNum = 0; elevatorNum < numberOfElevators; ++elevatorNum) {
            let elevator = elevators[elevatorNum];
            elevator.on("idle", function() {
                elevator.goToFloor(Math.floor(elevatorNum * numberOfFloorsPerElevators));
                consolidateDestinationQueue(elevator);
                console.log("Elevator:", elevatorNum, "Idle at floor:", elevator.currentFloor(), "Direction:", elevator.direction, "Queue:", this.destinationQueue);
            });

            elevator.on("floor_button_pressed", function(floorNum) {
                elevator.goToFloor(floorNum);
                consolidateDestinationQueue(elevator);
                console.log("Elevator:", elevatorNum, "Floor button pressed:", floorNum, "Direction:", elevator.direction, "Queue:", this.destinationQueue);
            });

            for (let floorNum = Math.floor(elevatorNum * numberOfFloorsPerElevators); floorNum < Math.floor((elevatorNum + 1) * numberOfFloorsPerElevators); ++floorNum) {
                floors[floorNum].on("up_button_pressed", function() {
                    elevator.goToFloor(floorNum);
                    consolidateDestinationQueue(elevator);
                    console.log("Elevator:", elevatorNum, "Up button pressed:", floorNum, "Direction:", elevator.direction, "Queue:", this.destinationQueue);
                });
                floors[floorNum].on("down_button_pressed", function() {
                    elevator.goToFloor(floorNum);
                    consolidateDestinationQueue(elevator);
                    console.log("Elevator:", elevatorNum, "Down button pressed:", floorNum, "Direction:", elevator.direction, "Queue:", this.destinationQueue);
                });
            }
            // 

            elevator.on("stopped_at_floor", function(floorNum) {
                elevator.destinationQueue = elevator.destinationQueue.filter(f => f !== floorNum);
                consolidateDestinationQueue(elevator);
                console.log("Elevator:", elevatorNum, "Stopped at floor:", floorNum, "Direction:", elevator.direction, "Queue:", elevator.destinationQueue);
            });

            elevator.on("passing_floor", function(floorNum, direction) {
                consolidateDestinationQueue(elevator);
                console.log("Elevator:", elevatorNum, "Passing floor:", floorNum, "Direction:", direction, "Queue:", this.destinationQueue);
            });
        }
    },

    update: function(dt, elevators, floors) {
    }
}
