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
    - This is still a basic challenge with 1 (larger) elevator and 5 floors
    - [Solution](https://github.com/aswna/elevator_saga/tree/master/challenge_03/prog.js): same as previously

  * [Challenge #4](https://play.elevatorsaga.com/#challenge=4): Transport 28 people in 60 seconds or less
    - This challenge has 2 elevators and 8 floors
    - [Trial #1](https://github.com/aswna/elevator_saga/tree/master/challenge_04/trial1.js): adopting the previous algorithm for multiple elevators (works for about half of the runs)
    - [Trial #2](https://github.com/aswna/elevator_saga/tree/master/challenge_04/trial2.js): sometimes works for this challenge
      - starting to handle up/down button presses on the floors and distribute them between the elevators,
      - partition the building to vertical sections: we send idle elevators to the bottom floor of their sections
      - consolidate destination queue (remove duplicate floors)
    - [Trial #3](https://github.com/aswna/elevator_saga/tree/master/challenge_04/trial3.js)
      - adding debug logs (can be checked in the Console of Developer mode, e.g., CTRL+Shift+I),
    - [Solution](https://github.com/aswna/elevator_saga/tree/master/challenge_04/prog.js): mostly works for this challenge
      - when we stop at a floor remove the floor from the destination queue of the elevator
      - Issues:
        - the elevator stops at phantom destinations (at floors where we should not stop anymore, e.g. the other elevator took care of it)
        - too many up-and-down moves (we should do a full scan to up/down)
        - the elevator stops at floors to take passengers, but the elevator is already full

  * [Challenge #5](https://play.elevatorsaga.com/#challenge=5): Transport 100 people in 68 seconds or less
    - This challenge has 4 elevators and 6 floors
    - Previous solution stops 4th elevator between 4th and 5th floors :)
    - [Trial #1](https://github.com/aswna/elevator_saga/tree/master/challenge_05/trial1.js): best were 99 people
      - fix for integer division
    - [Trial #2](https://github.com/aswna/elevator_saga/tree/master/challenge_05/trial2.js): mostly works for this challenge (~50%)
      - add more debug log
      - fix: consolidate destination queue more (on up/down button pressed)
      - add basic handling for the going up/down indicator
      - apply the vertical partitioning instead of stripes for the up/down button presses
    - [Solution](https://github.com/aswna/elevator_saga/tree/master/challenge_05/prog.js): sometimes works for this challenge (~30%)
      - I have experimented with different approaches, solutions, retried previous challenges (not saved as trials, there were too many)
      - Highlights
        - Introduce queues for external requests (separately for up and down), which are populated by up/down button presses on the floors
        - If an elevator is almost full, it ignores external requests
        - In case of idle, stopped at floor, or passing floor the elevator takes all external requests to the given direction (up or below of its current position)
      - I hope these are fixed (at least improved)
        - too many up-and-down moves (we should do a full scan to the same direction - up/down)
        - we probably do not handle the going up/down indicator correctly, so elevators can trick waiting passengers to get in the wrong direction
      - This solution sometimes fails at [Challenge #3](https://play.elevatorsaga.com/#challenge=3) and [Challenge #4](https://play.elevatorsaga.com/#challenge=4)
      - The performance of [Trial #2](https://github.com/aswna/elevator_saga/tree/master/challenge_05/trial2.js) seems to be superior to this solution

  * [Challenge #6](https://play.elevatorsaga.com/#challenge=6): Transport 40 people using 60 elevator moves or less

## Known issues
- the elevator stops at phantom destinations (at floors where it should not stop anymore, e.g. the other elevator took care of it already)
- the elevator stops at floors to take passengers, but the elevator is already full
