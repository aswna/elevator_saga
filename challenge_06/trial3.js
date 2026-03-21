{
    init: function(elevators, floors) {

        // GLOBALS
        var numberOfElevators          = elevators.length;
        var numberOfFloors             = floors.length;
        var numberOfFloorsPerElevators = Math.floor(numberOfFloors / numberOfElevators);

        // HELPERS
        function consolidateDestinationQueue(elevator) {
            elevator.destinationQueue = rearrangeDestinationQueue(elevator);
            elevator.checkDestinationQueue();
            console.log("Elevator:", elevator.num,
                        "Consolidated queue:", [...elevator.destinationQueue],
                        "Direction:", elevator.destinationDirection(),
                        "Current floor:", elevator.currentFloor());
        }

        function rearrangeDestinationQueue(elevator) {
            console.log("Elevator:", elevator.num,
                        "Rearranging destination queue:", [...elevator.destinationQueue],
                        "Direction:", elevator.destinationDirection(),
                        "Current floor:", elevator.currentFloor());
            if (elevator.destinationQueue.length == 0) {
                return [];
            }

            const [nextFloor]  = elevator.destinationQueue;
            var queue = [...new Set(elevator.destinationQueue)];
            if (nextFloor >= elevator.currentFloor()) {
                return rearrangeUp(queue, elevator.currentFloor());
            } else {
                return rearrangeDown(queue, elevator.currentFloor());
            }
        }

        function rearrangeUp(queue, x) {
            const greater = queue.filter(v => v  > x).sort((a, b) => a - b);
            const rest    = queue.filter(v => v <= x).sort((a, b) => b - a);
            return [...greater, ...rest];
        }

        function rearrangeDown(queue, x) {
            const lower = queue.filter(v => v  < x).sort((a, b) => b - a);
            const rest  = queue.filter(v => v >= x).sort((a, b) => a - b);
            return [...lower, ...rest];
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
                turnOnUpDownIndicators(elevator);
            }
        }

        function turnOnUpDownIndicators(elevator) {
            elevator.goingUpIndicator(false);
            elevator.goingUpIndicator(true);

            elevator.goingDownIndicator(false);
            elevator.goingDownIndicator(true);
        }

        function findBestElevatorForRequest(floorNum, upOrDown) {
            console.log("Finding the best elevator for request:", upOrDown,
                        "on floor:", floorNum);
            bestElevatorNum   = -1;
            bestElevatorScore = -1;
            for (let elevatorNum = 0; elevatorNum < numberOfElevators; ++elevatorNum) {
                let elevator = elevators[elevatorNum];
                const elevatorScore = getElevatorScore(elevator, floorNum, upOrDown);
                console.log("Elevator:", elevatorNum,
                            "got score:", elevatorScore);
                if (elevatorScore > bestElevatorScore) {
                    bestElevatorNum   = elevatorNum;
                    bestElevatorScore = elevatorScore;
                }
            }

            console.log("Found the best elevator for request:", bestElevatorNum,
                        "score:", bestElevatorScore,
                        "to handle", upOrDown,
                        "request on floor:", floorNum);
            let elevator = elevators[bestElevatorNum];
            elevator.goToFloor(floorNum);
            consolidateDestinationQueue(elevator);
        }

        function getElevatorScore(elevator, floorNum, upOrDown) {
            const loadFactor        = elevator.loadFactor();
            const currentFloor      = elevator.currentFloor();
            const maxPassengerCount = 10.0
            const maxFloors         = 20.0
            // try to normalize the components to [0.0, 1.0]
            if (elevator.destinationQueue.length == 0) {
                return 1.0 + (1.0 - loadFactor) * elevator.maxPassengerCount() / maxPassengerCount - Math.abs(currentFloor - floorNum) / maxFloors;
            }
            const [nextFloor]  = elevator.destinationQueue;
            if (nextFloor >= currentFloor) { // up
                if (floorNum >= currentFloor) { // up
                    if (upOrDown === "up" || floorNum < nextFloor) {
                        return 1.0 + (1.0 - loadFactor) * elevator.maxPassengerCount() / maxPassengerCount - 0.5 * Math.abs(currentFloor - floorNum) / maxFloors;
                    } else {
                        return 1.0 + (1.0 - loadFactor) * elevator.maxPassengerCount() / maxPassengerCount - 2.0 * Math.abs(currentFloor - floorNum) / maxFloors;
                    }
                } else {
                    return 1.0 + (1.0 - loadFactor) * elevator.maxPassengerCount() / maxPassengerCount - 2.0 * Math.abs(currentFloor - floorNum) / maxFloors;
                }
            } else { // down
                if (floorNum <= currentFloor) { // down
                    if (upOrDown === "down" || floorNum > nextFloor) {
                        return 1.0 + (1.0 - loadFactor) * elevator.maxPassengerCount() / maxPassengerCount - 0.5 * Math.abs(currentFloor - floorNum) / maxFloors;
                    } else {
                        return 1.0 + (1.0 - loadFactor) * elevator.maxPassengerCount() / maxPassengerCount - 2.0 * Math.abs(currentFloor - floorNum) / maxFloors;
                    }
                } else {
                    return 1.0 + (1.0 - loadFactor) * elevator.maxPassengerCount() / maxPassengerCount - 2.0 * Math.abs(currentFloor - floorNum) / maxFloors;
                }
            }
        }

        // FLOOR EVENT HANDLERS
        for (let floorNum = 0; floorNum < numberOfFloors; ++floorNum) {
            floors[floorNum].on("up_button_pressed", function() {
                findBestElevatorForRequest(floorNum, "up");
                console.log("Floor:", floorNum,
                            "UP button pressed");
            });
            floors[floorNum].on("down_button_pressed", function() {
                findBestElevatorForRequest(floorNum, "down");
                console.log("Floor:", floorNum,
                            "DOWN button pressed");
            });
        }

        // ELEVATOR EVENT HANDLERS
        for (let elevatorNum = 0; elevatorNum < numberOfElevators; ++elevatorNum) {
            let elevator = elevators[elevatorNum];

            const maxCount = elevator.maxPassengerCount();
            // Add its "number" to the elevator (mostly for debugging)
            elevator.num     = elevatorNum;

            console.log("Elevator:", elevatorNum,
                        "max passenger count:", maxCount);

            // IDLE
            elevator.on("idle", function() {
                console.log("Elevator:", elevator.num,
                            "IDLE at current floor:", elevator.currentFloor());

                turnOnUpDownIndicators(elevator);

                consolidateDestinationQueue(elevator);
                updateUpDownIndicator(elevator);
            });

            // BUTTON PRESSED (inside the elevator)
            elevator.on("floor_button_pressed", function(floorNum) {
                console.log("Elevator:", elevator.num,
                            "BUTTON pressed:", floorNum);

                elevator.goToFloor(floorNum);
                consolidateDestinationQueue(elevator);
                updateUpDownIndicator(elevator);
            });

            // STOPPED
            elevator.on("stopped_at_floor", function(floorNum) {
                console.log("Elevator:", elevator.num,
                            "STOPPED at floor:", floorNum,
                            "load factor:", elevator.loadFactor());

                elevator.destinationQueue = elevator.destinationQueue.filter(item => item !== floorNum)
                elevator.checkDestinationQueue();

                consolidateDestinationQueue(elevator);
                updateUpDownIndicator(elevator);

                if (floorNum == 0) {
                    elevator.goingUpIndicator(true);
                    elevator.goingDownIndicator(false);
                } else if (floorNum == numberOfFloors - 1) {
                    elevator.goingUpIndicator(false);
                    elevator.goingDownIndicator(true);
                }
            });

            // PASSING FLOOR
            elevator.on("passing_floor", function(floorNum, direction) {
                console.log("Elevator:", elevator.num,
                            "Direction:", direction,
                            "Passing floor:", floorNum);

                consolidateDestinationQueue(elevator);
                updateUpDownIndicator(elevator);
            });
        }
    },

    update: function(dt, elevators, floors) {
    }
}
