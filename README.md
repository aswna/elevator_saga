# Elevator Saga Solutions
Solutions for the [Elevator Saga (The elevator programming game)](https://play.elevatorsaga.com/) challenges.

## Challenges, Trials and Solutions

  * [Challenge #1](https://play.elevatorsaga.com/#challenge=1): Transport 15 people in 60 seconds or less
    - This is a basic challenge with 1 elevator and 3 floors
    - [Solution](https://github.com/aswna/elevator_saga/tree/master/challenge_01/prog.js): simply visit all floors from bottom to top and start again

  * [Challenge #2](https://play.elevatorsaga.com/#challenge=2): Transport 20 people in 60 seconds or less
    - This is still a basic challenge with 1 elevator and 5 floors
    - [Trial #1](https://github.com/aswna/elevator_saga/tree/master/challenge_02/trial1.js): extending the previous brute force solution does not work
    - [Trial #2](https://github.com/aswna/elevator_saga/tree/master/challenge_02/trial2.js): a [paternoster](https://en.wikipedia.org/wiki/Paternoster_lift)-like solution does not work
    - [Trial #3](https://github.com/aswna/elevator_saga/tree/master/challenge_02/trial3.js): taking into account, which floor button was pressed in the elevator while maintaining the brute force solution does not work
    - [Solution](https://github.com/aswna/elevator_saga/tree/master/challenge_02/prog.js): go to the floors, which were pressed in the elevator, and go to the bottom floor when idle (I know this is dumb, but works for this challenge and sometimes for [Challenge #3](https://play.elevatorsaga.com/#challenge=3))

  * [Challenge #3](https://play.elevatorsaga.com/#challenge=3): Transport 23 people in 60 seconds or less
    - This is still a basic challenge with 1 larger elevator and 5 floors
    - [Solution](https://github.com/aswna/elevator_saga/tree/master/challenge_03/prog.js): same as previously

  * [Challenge #4](https://play.elevatorsaga.com/#challenge=4): Transport 28 people in 60 seconds or less
    - This challenge has 2 elevators and 8 floors
    - [Trial #1](https://github.com/aswna/elevator_saga/tree/master/challenge_04/trial1.js): adopting the previous algorithm for multiple elevators (works for about half of the runs)
    - [Trial #2](https://github.com/aswna/elevator_saga/tree/master/challenge_04/trial2.js): sometimes works for this challenge
      - Starting to handle up/down button presses on the floors and distribute them between the elevators
      - Partition the building to vertical sections: we send idle elevators to the bottom floor of their sections
      - Consolidate destination queue (remove duplicate floors)
    - [Trial #3](https://github.com/aswna/elevator_saga/tree/master/challenge_04/trial3.js)
      - Adding debug logs (can be checked in the Console of Developer mode, e.g., CTRL+Shift+I)
    - [Solution](https://github.com/aswna/elevator_saga/tree/master/challenge_04/prog.js): mostly works for this challenge
      - When we stop at a floor remove the floor from the destination queue of the elevator
      - Issues:
        - The elevator stops at phantom destinations (at floors where we should not stop anymore, e.g. the other elevator took care of it)
        - Too many up-and-down moves (we should do a full scan to up/down)
        - The elevator stops at floors to take passengers, but the elevator is already full

  * [Challenge #5](https://play.elevatorsaga.com/#challenge=5): Transport 100 people in 68 seconds or less
    - This challenge has 4 elevators and 6 floors
    - [Previous solution](https://github.com/aswna/elevator_saga/tree/master/challenge_04/prog.js) stops 4th elevator between 4th and 5th floors :)
    - [Trial #1](https://github.com/aswna/elevator_saga/tree/master/challenge_05/trial1.js): best were 99 people
      - Fix for integer division
    - [Trial #2](https://github.com/aswna/elevator_saga/tree/master/challenge_05/trial2.js): mostly works for this challenge (~50%)
      - Add more debug log
      - Fix: consolidate destination queue more (on up/down button pressed)
      - Add basic handling for the going up/down indicator
      - Apply the vertical partitioning instead of stripes for the up/down button presses
    - [Solution](https://github.com/aswna/elevator_saga/tree/master/challenge_05/prog.js): sometimes works for this challenge (~30%)
      - I have experimented with different approaches, solutions, retried previous challenges (not saved as trials, there were too many)
      - Highlights
        - Introduce queues for external requests (separately for up and down), which are populated by up/down button presses on the floors
        - If an elevator is almost full, it ignores external requests
        - In case of idle, stopped at floor, or passing floor the elevator takes all external requests to the given direction (up or below of its current position)
      - I hope these are fixed (at least improved)
        - Too many up-and-down moves (we should do a full scan to the same direction - up/down)
        - We probably do not handle the going up/down indicator correctly, so elevators can trick waiting passengers to get in the wrong direction
      - This solution sometimes fails at [Challenge #3](https://play.elevatorsaga.com/#challenge=3) and [Challenge #4](https://play.elevatorsaga.com/#challenge=4)
      - The performance of [Trial #2](https://github.com/aswna/elevator_saga/tree/master/challenge_05/trial2.js) seems to be superior to this solution

  * [Challenge #6](https://play.elevatorsaga.com/#challenge=6): Transport 40 people using 60 elevator moves or less
    - This challenge has 2 elevators and 4 floors
    - [Trial #1](https://github.com/aswna/elevator_saga/tree/master/challenge_06/trial1.js): sometimes works for this challenge (~20%)
      - This trial sometimes works for Challenges #7-#12, but performs really poorly at Challenge #10 and #12, and cannot seem to work for Challenge #13
      - We often can see that one of the elevators stays idle for too long
    - [Trial #2](https://github.com/aswna/elevator_saga/tree/master/challenge_06/trial2.js): mostly refactor
      - Elevators already have `destinationDirection()`, use that instead of own `direction`
      - Fix for empty external requests in `handleExternalRequests()`
    - [Trial #3](https://github.com/aswna/elevator_saga/tree/master/challenge_06/trial3.js): performs worse on this floor, but I believe we are on the right track
      - Get rid of own queues for external up/down requests
      - Introduce `getElevatorScore()` and `findBestElevatorForRequest()` to find best elevator for up/down button pressed on floor
    - [Trial #4](https://github.com/aswna/elevator_saga/tree/master/challenge_06/trial4.js): new approach
      - Already realized that the idea/implementation of `consolidateDestinationQueue()` was inherently wrong, since we mixed up floors where we needed to stop upwards and downwards, so I removed it
      - Trying to insert the actual (pressed) floors to their correct position in the `destinationQueue` of the given elevator is also wrong, since we loose the information when should we stop there (upwards or downwards), so
      - Introduced 3 sets per elevator (for buttons pressed in the elevator, for the floors where the elevator needs to stop upwards and downwards)
      - Then we actualize the destination queue of an elevator based on these sets and the actual position and direction of the elevator
      - We also need to remove the visited floors from the appropriate sets (considering the elevator was moving up or down)
    - [Solution](https://github.com/aswna/elevator_saga/tree/master/challenge_06/prog.js): works well for this challenge (~90%)
      - some refactor
      - some fixes, e.g.:
          - when the elevator was full it still tried to accept passengers,
          - when the elevator was in idle it did not start to serve its requests

  * [Challenge #7](https://play.elevatorsaga.com/#challenge=7): Transport 100 people using 63 elevator moves or less
    - This challenge has 3 elevators and 3 floors

  * [Challenge #8](https://play.elevatorsaga.com/#challenge=8): Transport 50 people and let no one wait more than 21.0 seconds
    - This challenge has 2 larger elevators and 6 floors

  * [Challenge #9](https://play.elevatorsaga.com/#challenge=9): Transport 50 people and let no one wait more than 20.0 seconds
    - This challenge has 3 elevators and 7 floors

  * [Challenge #10](https://play.elevatorsaga.com/#challenge=10): Transport 50 people in 70 seconds or less
    - This challenge has 1 big and 1 regular elevators and 13 floors

  * [Challenge #11](https://play.elevatorsaga.com/#challenge=11): Transport 60 people and let no one wait more than 19.0 seconds
    - This challenge has 5 elevators and 9 floors

  * [Challenge #12](https://play.elevatorsaga.com/#challenge=12): Transport 80 people and let no one wait more than 17.0 seconds
    - This challenge has 5 elevators and 9 floors

  * [Challenge #13](https://play.elevatorsaga.com/#challenge=13): Transport 100 people and let no one wait more than 15.0 seconds
    - This challenge has 5 larger elevators and 9 floors

## Known issues
- The elevator stops at phantom destinations (at floors where it should not stop anymore, e.g. the other elevator took care of it already)
- The elevator stops at floors to take passengers, but the elevator is already full
