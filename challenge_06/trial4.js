{
    init: function(elevators, floors) {

        // GLOBALS
        const numberOfElevators = elevators.length;
        const numberOfFloors    = floors.length;

        // HELPERS
        function getBestElevatorForRequest(floorNum, upOrDown) {
            console.log("Finding the best elevator for UpOrDown:", upOrDown,
                        "Request on floor:", floorNum);
            let bestElevatorNum   = -1;
            let bestElevatorScore = -1;
            for (let elevatorNum = 0; elevatorNum < numberOfElevators; ++elevatorNum) {
                let elevator = elevators[elevatorNum];
                const elevatorScore = getElevatorScore(elevator, floorNum, upOrDown);
                console.log("Elevator:", elevatorNum,
                            "Score:", elevatorScore);
                if (elevatorScore > bestElevatorScore) {
                    bestElevatorScore = elevatorScore;
                    bestElevatorNum   = elevatorNum;
                }
            }

            console.log("Found the best elevator:", bestElevatorNum,
                        "Score:", bestElevatorScore,
                        "For UpOrDown:", upOrDown,
                        "Request on floor:", floorNum);
            return elevators[bestElevatorNum];
        }

        function getElevatorScore(elevator, floorNum, upOrDown) {
            if (elevator.destinationQueue.length == 0) {
                const distanceWeight = 0.5;
                return calculateScore(elevator, floorNum, upOrDown, distanceWeight);
            }

            const currentFloor = elevator.currentFloor();
            let distanceWeight;
            const [nextFloor]  = elevator.destinationQueue;
            if (nextFloor >= currentFloor) { // up
                if (floorNum >= currentFloor) { // up
                    if (upOrDown === "up") {
                        distanceWeight = 1.0;
                    } else {
                        distanceWeight = 1.5;
                    }
                } else {
                    if (upOrDown === "down") {
                        distanceWeight = 2.0;
                    } else {
                        distanceWeight = 2.5;
                    }
                }
            } else { // down
                if (floorNum <= currentFloor) { // down
                    if (upOrDown === "down") {
                        distanceWeight = 1.0;
                    } else {
                        distanceWeight = 1.5;
                    }
                } else {
                    if (upOrDown === "up") {
                        distanceWeight = 2.0;
                    } else {
                        distanceWeight = 2.5;
                    }
                }
            }
            return calculateScore(elevator, floorNum, upOrDown, distanceWeight);
        }

        function calculateScore(elevator, floorNum, upOrDown, distanceWeight) {
            // Normalize the components to [0.0, 1.0]

            let alreadyHasBonus = 0.0;
            if (upOrDown === "up" && elevator.requestsUp.has(floorNum)) {
                alreadyHasBonus += 2.0;
            } else if (upOrDown === "down" && elevator.requestsDown.has(floorNum)) {
                alreadyHasBonus += 2.0;
            }
            alreadyHasBonus += elevator.buttonsPressed.has(floorNum) ? 0.5 : 0.0;

            return 5.0
                   + alreadyHasBonus
                   - elevator.loadFactor() * elevator.maxPassengerCount() / 10.0    // elevator load by capacity
                   - distanceWeight * Math.abs(elevator.currentFloor() - floorNum) / numberOfFloors  // distance
                   - elevator.destinationQueue.length / (2.0 * numberOfFloors);     // queue length
        }

        function insertFloor(elevator, floorNum, upOrDown) {
            if (upOrDown === "undefined") {
                elevator.buttonsPressed.add(floorNum);
            } else if (upOrDown === "up") {
                elevator.requestsUp.add(floorNum);
            } else {
                elevator.requestsDown.add(floorNum);
            }

            console.log("Elevator:", elevator.num,
                        "Destination queue:", [...elevator.destinationQueue],
                        "Buttons pressed:", [...elevator.buttonsPressed],
                        "Requests UP:", [...elevator.requestsUp],
                        "Requests DOWN:", [...elevator.requestsDown],
                        "Direction:", elevator.destinationDirection(),
                        "Last Direction:", elevator.lastDirection,
                        "Current floor:", elevator.currentFloor(),
                        "Inserting floor:", floorNum,
                        "UpOrDown:", upOrDown);
        }

        function updateDestinationQueue(elevator) {
            const direction     = elevator.destinationDirection();
            const currentFloor  = elevator.currentFloor();
            const lastDirection = elevator.lastDirection;
            if (direction === "up" || (direction === "stopped" && lastDirection === "up")) {
                const floorsFirstUp   = new Set([...elevator.buttonsPressed, ...elevator.requestsUp]);
                const floorsUpGreater = [...floorsFirstUp].filter(v => v > currentFloor).sort((a, b) => a - b);

                const buttonsPressedLower = [...elevator.buttonsPressed].filter(v => v <= currentFloor);
                const floorsAllDown       = new Set([...buttonsPressedLower, ...elevator.requestsDown]);
                const floorsDown          = [...floorsAllDown].sort((a, b) => b - a);

                const floorsUpLower = [...elevator.requestsUp].filter(v => v <= currentFloor).sort((a, b) => a - b);

                elevator.destinationQueue = [...floorsUpGreater, ...floorsDown, ...floorsUpLower];
            } else {
                const floorsFirstDown = new Set([...elevator.buttonsPressed, ...elevator.requestsDown]);
                const floorsDownLower = [...floorsFirstDown].filter(v => v < currentFloor).sort((a, b) => b - a);

                const buttonsPressedGreater = [...elevator.buttonsPressed].filter(v => v >= currentFloor);
                const floorsAllUp           = new Set([...buttonsPressedGreater, ...elevator.requestsUp]);
                const floorsUp              = [...floorsAllUp].sort((a, b) => a - b);

                const floorsDownGreater = [...elevator.requestsDown].filter(v => v >= currentFloor).sort((a, b) => b - a);

                elevator.destinationQueue = [...floorsDownLower, ...floorsUp, ...floorsDownGreater];
            }

            elevator.destinationQueue = [...new Set(elevator.destinationQueue)];
            elevator.checkDestinationQueue();
            console.log("Elevator:", elevator.num,
                        "Updated destination queue:", [...elevator.destinationQueue]);
        }

        function updateUpDownIndicator(elevator) {
            const direction = elevator.destinationDirection();
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

        // FLOOR EVENT HANDLERS
        for (let floorNum = 0; floorNum < numberOfFloors; ++floorNum) {
            floors[floorNum].on("up_button_pressed", function() {
                console.log("Floor:", floorNum,
                            "UP button pressed");

                const upOrDown = "up";
                let elevator = getBestElevatorForRequest(floorNum, upOrDown);
                insertFloor(elevator, floorNum, upOrDown);
                updateDestinationQueue(elevator);
            });
            floors[floorNum].on("down_button_pressed", function() {
                console.log("Floor:", floorNum,
                            "DOWN button pressed");

                const upOrDown = "down";
                let elevator = getBestElevatorForRequest(floorNum, upOrDown);
                insertFloor(elevator, floorNum, upOrDown);
                updateDestinationQueue(elevator);
            });
        }

        // ELEVATOR EVENT HANDLERS
        for (let elevatorNum = 0; elevatorNum < numberOfElevators; ++elevatorNum) {
            let elevator = elevators[elevatorNum];

            // Add some members to the elevator
            // Its "number" (mostly for debugging)
            elevator.num            = elevatorNum;
            // Buttons pressed in the elevator
            elevator.buttonsPressed = new Set();
            // Requests UP assigned to this elevator
            elevator.requestsUp     = new Set();
            // Requests DOWN assigned to this elevator
            elevator.requestsDown   = new Set();
            // The elevator's last known direction
            elevator.lastDirection  = "stopped";

            console.log("Elevator:", elevatorNum,
                        "Max passenger count:", elevator.maxPassengerCount());

            // IDLE
            elevator.on("idle", function() {
                console.log("Elevator:", elevator.num,
                            "IDLE at current floor:", elevator.currentFloor(),
                            "Destination queue:", [...elevator.destinationQueue],
                            "Buttons pressed:", [...elevator.buttonsPressed],
                            "Requests UP:", [...elevator.requestsUp],
                            "Requests DOWN:", [...elevator.requestsDown]);

                turnOnUpDownIndicators(elevator);
            });

            // BUTTON PRESSED (inside the elevator)
            elevator.on("floor_button_pressed", function(floorNum) {
                console.log("Elevator:", elevator.num,
                            "BUTTON pressed:", floorNum,
                            "Destination queue:", [...elevator.destinationQueue],
                            "Buttons pressed:", [...elevator.buttonsPressed],
                            "Requests UP:", [...elevator.requestsUp],
                            "Requests DOWN:", [...elevator.requestsDown]);

                insertFloor(elevator, floorNum, "undefined");
                updateDestinationQueue(elevator);
            });

            // STOPPED
            elevator.on("stopped_at_floor", function(floorNum) {
                const direction = elevator.destinationDirection();
                console.log("Elevator:", elevator.num,
                            "STOPPED at floor:", floorNum,
                            "Load factor:", elevator.loadFactor(),
                            "Direction:", direction,
                            "Last direction:", elevator.lastDirection,
                            "Destination queue:", [...elevator.destinationQueue],
                            "Buttons pressed:", [...elevator.buttonsPressed],
                            "Requests UP:", [...elevator.requestsUp],
                            "Requests DOWN:", [...elevator.requestsDown]);

                elevator.buttonsPressed.delete(floorNum);
                if (elevator.goingUpIndicator()) {
                    elevator.requestsUp.delete(floorNum);
                }
                if (elevator.goingDownIndicator()) {
                    elevator.requestsDown.delete(floorNum);
                }

                if (elevator.destinationQueue.length > 0) {
                    const [nextFloor]  = elevator.destinationQueue;
                    if (nextFloor > floorNum) {
                        elevator.lastDirection = "up";
                        elevator.goingUpIndicator(true);
                        elevator.goingDownIndicator(false);
                        elevator.requestsUp.delete(floorNum);
                    } else {
                        elevator.lastDirection = "down";
                        elevator.goingUpIndicator(false);
                        elevator.goingDownIndicator(true);
                        elevator.requestsDown.delete(floorNum);
                    }
                }

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
                            "Passing floor:", floorNum,
                            "Destination queue:", [...elevator.destinationQueue]);

                elevator.lastDirection = direction;
                updateUpDownIndicator(elevator);
            });
        }
    },

    update: function(dt, elevators, floors) {
    }
}
