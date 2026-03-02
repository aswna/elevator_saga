# Elevator Saga Solutions
Solutions for the [Elevator Saga (The elevator programming game)](https://play.elevatorsaga.com/) challenges.

## Challenges, Trials and Solutions
  * [Challenge #1](https://play.elevatorsaga.com/#challenge=1): Transport 15 people in 60 seconds or less
    - This is a basic challenge with 3 floors
    - [Solution](https://github.com/aswna/elevator_saga/tree/master/challenge_01/prog.js): simply visit all floors from bottom to top and start again

  * [Challenge #2](https://play.elevatorsaga.com/#challenge=2): Transport 20 people in 60 seconds or less
    - This is still a basic challenge with 5 floors
    - [Trial #1](https://github.com/aswna/elevator_saga/tree/master/challenge_02/trial1.js): extending the above brute force solution does not work
    - [Trial #2](https://github.com/aswna/elevator_saga/tree/master/challenge_02/trial2.js): a [paternoster](https://en.wikipedia.org/wiki/Paternoster_lift)-like solution does not work
    - [Trial #3](https://github.com/aswna/elevator_saga/tree/master/challenge_02/trial3.js): taking into account, which floor button was pressed in the elevator while maintaining the brute force solution does not work
    - [Solution](https://github.com/aswna/elevator_saga/tree/master/challenge_02/prog.js): go to the floors, which were pressed in the elevator, and go to the bottom floor when idle (I know this is dumb, but works for this challenge and sometimes for [Challenge #3](https://play.elevatorsaga.com/#challenge=3))

  * [Challenge #3](https://play.elevatorsaga.com/#challenge=3): Transport 23 people in 60 seconds or less
    - This is still a basic challenge with 5 floors and a larger elevator
    - [Solution](https://github.com/aswna/elevator_saga/tree/master/challenge_03/prog.js): same as above

  * [Challenge #4](https://play.elevatorsaga.com/#challenge=4): Transport 28 people in 60 seconds or less
    - This challenge has two elevators and 8 floors
    - [Trial #1](https://github.com/aswna/elevator_saga/tree/master/challenge_04/trial1.js): adopting the above algorithm for multiple elevators (works for about half of the runs)
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
