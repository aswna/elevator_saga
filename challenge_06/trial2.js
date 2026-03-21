{
    init: function(elevators, floors) {

        // GLOBALS
        var numberOfElevators          = elevators.length;
        var numberOfFloors             = floors.length;
        var numberOfFloorsPerElevators = Math.floor(numberOfFloors / numberOfElevators);

        // up/down buttons pressed on floors
        var externalRequestsUp   = new Set();
        var externalRequestsDown = new Set();

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
            var queue = [...new Set(elevator.destinationQueue)];
            if (elevator.destinationDirection() === "up") {
                return rearrangeUp(queue, elevator.currentFloor());
            }
            if (elevator.destinationDirection() === "down") {
                return rearrangeDown(queue, elevator.currentFloor());
            }
            if (Math.random() >= 0.5) {
                return rearrangeUp(queue, -1);
            }
            return rearrangeDown(queue, 999);
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

        function handleExternalRequests(elevator, elevatorNum) {
            if (isElevatorFull(elevator)) {
                return;
            }

            const currentFloor = elevator.currentFloor();

            console.log("Elevator:", elevator.num,
                        "Handle external requests:",
                        "Destination queue:", [...elevator.destinationQueue],
                        "UP requests:", [...externalRequestsUp],
                        "DOWN requests:", [...externalRequestsDown],
                        "Direction:", elevator.destinationDirection(),
                        "Current floor:", currentFloor);

            if (elevator.destinationDirection() === "up") {
                addExternalTargetsUp(elevator, currentFloor);
                return;
            }

            if (elevator.destinationDirection() === "down") {
                addExternalTargetsDown(elevator, currentFloor);
                return;
            }

            if (externalRequestsUp.size > externalRequestsDown.size) {
                const [targetFloor] = externalRequestsUp;
                externalRequestsUp.delete(targetFloor);
                elevator.goToFloor(targetFloor);
                return;
            }

            if (externalRequestsDown.size == 0) {
                return;
            }

            const [targetFloor] = externalRequestsDown;
            externalRequestsDown.delete(targetFloor);
            elevator.goToFloor(targetFloor);
        }

        function addExternalTargetsUp(elevator, pivotFloor) {
            if (externalRequestsUp.size == 0) {
                return;
            }
            const externalRequestsUpArr   = [...externalRequestsUp];
            const targets                 = externalRequestsUpArr.filter(item => item > pivotFloor);

            if (targets.length > 0 && targets[0] > pivotFloor) {
                elevator.destinationQueue = [...elevator.destinationQueue, ...targets];
                elevator.checkDestinationQueue();
                externalRequestsUp = new Set(externalRequestsUpArr.filter(item => item <= pivotFloor));
                console.log("Elevator:", elevator.num,
                            "Concat UP targets to destination queue", [...elevator.destinationQueue]);
            }
        }

        function addExternalTargetsDown(elevator, pivotFloor) {
            if (externalRequestsDown.size == 0) {
                return;
            }
            const externalRequestsDownArr = [...externalRequestsDown];
            const targets                 = externalRequestsDownArr.filter(item => item < pivotFloor);

            if (targets.length > 0 && targets[0] < pivotFloor) {
                elevator.destinationQueue = [...elevator.destinationQueue, ...targets];
                elevator.checkDestinationQueue();
                externalRequestsDown = new Set(externalRequestsDownArr.filter(item => item >= pivotFloor));
                console.log("Elevator:", elevator.num,
                            "Concat DOWN targets to destination queue", [...elevator.destinationQueue]);
            }
        }

        function isElevatorFull(elevator) {
            // Different elevators have the capacity for 4, 5, 6, or 8 passengers
            // Not sure how do children count, so I calculate with below, so a child still may fit in?
            if (elevator.loadFactor() > elevator.maxLoad) {
                console.log("Elevator:", elevator.num,
                            "load:", elevator.loadFactor(),
                            "is probaby full, ignoring external requests...");
                return true;
            }

            return false;
        }

        // FLOOR EVENT HANDLERS
        for (let floorNum = 0; floorNum < numberOfFloors; ++floorNum) {
            floors[floorNum].on("up_button_pressed", function() {
                externalRequestsUp.add(floorNum);
                console.log("Floor:", floorNum,
                            "UP button pressed",
                            "UP requests:", [...externalRequestsUp],
                            "DOWN requests:", [...externalRequestsDown]);
            });
            floors[floorNum].on("down_button_pressed", function() {
                externalRequestsDown.add(floorNum);
                console.log("Floor:", floorNum,
                            "DOWN button pressed",
                            "UP requests:", [...externalRequestsUp],
                            "DOWN requests:", [...externalRequestsDown]);
            });
        }

        // ELEVATOR EVENT HANDLERS
        for (let elevatorNum = 0; elevatorNum < numberOfElevators; ++elevatorNum) {
            let elevator = elevators[elevatorNum];

            const maxCount = elevator.maxPassengerCount();
            const maxLoad  = (maxCount - 0.9) / maxCount;
            // Add maxLoad as a cutoff to check in isElevatorFull()
            elevator.maxLoad =  maxLoad;
            // Add its "number" to the elevator (mostly for debugging)
            elevator.num     = elevatorNum;

            console.log("Elevator:", elevatorNum,
                        "max passenger count:", maxCount,
                        "max load:", maxLoad);

            // IDLE
            elevator.on("idle", function() {
                console.log("Elevator:", elevator.num,
                            "IDLE at current floor:", elevator.currentFloor());

                turnOnUpDownIndicators(elevator);

                if (externalRequestsUp.size == 0 && externalRequestsDown.size == 0) {
                    return;
                }

                handleExternalRequests(elevator, elevatorNum);
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

                handleExternalRequests(elevator, elevatorNum);
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

                handleExternalRequests(elevator, elevatorNum);
                consolidateDestinationQueue(elevator);
                updateUpDownIndicator(elevator);
            });
        }
    },

    update: function(dt, elevators, floors) {
    }
}
