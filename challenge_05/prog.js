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
            updateDirection(elevator);
            updateUpDownIndicator(elevator);
            console.log("Elevator:", elevator.num,
                        "Consolidated queue:", [...elevator.destinationQueue],
                        "Direction:", elevator.direction,
                        "Current floor:", elevator.currentFloor());
        }

        function rearrangeDestinationQueue(elevator) {
            console.log("Elevator:", elevator.num,
                        "Rearranging destination queue:", [...elevator.destinationQueue],
                        "Direction:", elevator.direction,
                        "Current floor:", elevator.currentFloor());
            var queue = [...new Set(elevator.destinationQueue)];
            if (elevator.direction === "up") {
                return rearrangeUp(queue, elevator.currentFloor());
            }
            if (elevator.direction === "down") {
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

        function updateDirection(elevator) {
            if (elevator.destinationQueue.length == 0) {
                elevator.direction = "undefined";
                return;
            }
            const nextFloor = elevator.destinationQueue[0];
            const currFloor = elevator.currentFloor();
            if (nextFloor > currFloor) {
                elevator.direction = "up";
            } else if (nextFloor < currFloor) {
                elevator.direction = "down";
            }
        }

        function updateUpDownIndicator(elevator) {
            var direction = elevator.direction;
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

        function handleExternalRequests(elevator, elevatorNum) {
            if (elevator.loadFactor() > 0.95) {
                console.log("Elevator:", elevator.num, "is almost full, ignoring external requests...");
                return;
            }

            const currentFloor            = elevator.currentFloor();
            const externalRequestsUpArr   = [...externalRequestsUp];
            const externalRequestsDownArr = [...externalRequestsDown];

            console.log("Elevator:", elevator.num,
                        "handles external requests... Destination queue:", [...elevator.destinationQueue],
                        "UP requests:", externalRequestsUpArr,
                        "DOWN requests:", externalRequestsDownArr,
                        "Direction:", elevator.direction,
                        "Current floor:", currentFloor);

            const [nextDestination] = elevator.destinationQueue;
            if ((nextDestination < currentFloor && elevator.direction === "up") ||
                (nextDestination > currentFloor && elevator.direction === "down")) {
                console.log("Elevator:", elevator.num,
                            "Next destination:", nextDestination,
                            "CONTRADICTS to Direction:", elevator.direction,
                            "Current floor:", currentFloor);
            }

            if (elevator.direction === "up") {
                const targets = externalRequestsUpArr.filter(item => item > currentFloor);
                if (targets.length > 0 && targets[0] > currentFloor) {
                    console.log("Elevator:", elevator.num,
                                "Concat UP targets to destination queue");
                    elevator.destinationQueue = [...elevator.destinationQueue, ...targets];
                    elevator.checkDestinationQueue();
                    externalRequestsUp = new Set(externalRequestsUpArr.filter(item => item <= currentFloor));
                }
                return;
            }

            if (elevator.direction === "down") {
                const targets = externalRequestsDownArr.filter(item => item < currentFloor);
                if (targets.length > 0 && targets[0] < currentFloor) {
                    console.log("Elevator:", elevator.num,
                                "Concat DOWN targets to destination queue");
                    elevator.destinationQueue = [...elevator.destinationQueue, ...targets];
                    elevator.checkDestinationQueue();
                    externalRequestsDown = new Set(externalRequestsDownArr.filter(item => item >= currentFloor));
                }
                return;
            }

            if (externalRequestsUp.size >= externalRequestsDown.size) {
                const [targetFloor] = externalRequestsUp;
                externalRequestsUp.delete(targetFloor);
                elevator.goToFloor(targetFloor);
                return;
            }

            const [targetFloor] = externalRequestsDown;
            externalRequestsDown.delete(targetFloor);
            elevator.goToFloor(targetFloor);
            return;
        }

        // EVENT HANDLERS
        for (let elevatorNum = 0; elevatorNum < numberOfElevators; ++elevatorNum) {
            let elevator = elevators[elevatorNum];

            // Add its "num" to the elevator (mostly for debugging)
            elevator.num = elevatorNum;

            elevator.on("idle", function() {
                const currentFloor = elevator.currentFloor();
                console.log("Elevator:", elevator.num,
                            "IDLE at current floor:", currentFloor);

                elevator.goingUpIndicator(true);
                elevator.goingDownIndicator(true);

                if (externalRequestsUp.size == 0 && externalRequestsDown.size == 0) {
                    const targetFloor = Math.floor(elevatorNum * numberOfFloorsPerElevators);
                    if (targetFloor == currentFloor) {
                        return;
                    }
                    if (targetFloor > currentFloor) {
                        elevator.direction = "up";
                    } else {
                        elevator.direction = "down";
                    }
                    elevator.goToFloor(targetFloor);
                    return;
                }

                handleExternalRequests(elevator, elevatorNum);
                consolidateDestinationQueue(elevator);
            });

            // inside the elevator
            elevator.on("floor_button_pressed", function(floorNum) {
                console.log("Elevator:", elevator.num,
                            "BUTTON pressed:", floorNum);
                elevator.goToFloor(floorNum);
                consolidateDestinationQueue(elevator);
            });

            for (let floorNum = 0; floorNum < numberOfFloors; ++floorNum) {
                // external to the elevator (on the floor)
                floors[floorNum].on("up_button_pressed", function() {
                    externalRequestsUp.add(floorNum);
                    console.log("Elevator:", elevator.num,
                                "UP button pressed at floor:", floorNum,
                                "UP requests:", [...externalRequestsUp]);
                });
                floors[floorNum].on("down_button_pressed", function() {
                    externalRequestsDown.add(floorNum);
                    console.log("Elevator:", elevator.num,
                                "DOWN button pressed at floor:", floorNum,
                                "DOWN requests:", [...externalRequestsDown]);
                });
            }

            elevator.on("stopped_at_floor", function(floorNum) {
                console.log("Elevator:", elevator.num,
                            "STOPPED at floor:", floorNum);

                if (floorNum == 0) {
                    elevator.direction = "up";
                    updateUpDownIndicator(elevator);
                } else if (floorNum == numberOfFloors - 1) {
                    elevator.direction = "down";
                    updateUpDownIndicator(elevator);
                }

                elevator.destinationQueue = elevator.destinationQueue.filter(item => item !== floorNum)
                elevator.checkDestinationQueue();

                handleExternalRequests(elevator, elevatorNum);
                consolidateDestinationQueue(elevator);
            });

            elevator.on("passing_floor", function(floorNum, direction) {
                console.log("Elevator:", elevator.num,
                            "Direction:", direction,
                            "Passing floor:", floorNum);
                elevator.direction = direction;
                handleExternalRequests(elevator, elevatorNum);
                consolidateDestinationQueue(elevator);
            });
        }
    },

    update: function(dt, elevators, floors) {
    }
}
