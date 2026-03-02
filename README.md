# Elevator Saga solutions
Solutions for the [Elevator Saga (The elevator programming game)](https://play.elevatorsaga.com/) levels.

## Content
  * [Challenge #1](https://play.elevatorsaga.com/#challenge=1): Transport 15 people in 60 seconds or less
    - [Solution #1](https://github.com/aswna/elevator_saga/tree/master/challenge_01/prog.js): Simply visit all floors from bottom to top and start again

  * [Challenge #2](https://play.elevatorsaga.com/#challenge=2): Transport 20 people in 60 seconds or less
    - Extending the above brute force solution does not work ([trial #1](https://github.com/aswna/elevator_saga/tree/master/challenge_02/trial1.js))
    - A [paternoster](https://en.wikipedia.org/wiki/Paternoster_lift)-like solution does not work ([trial #2](https://github.com/aswna/elevator_saga/tree/master/challenge_02/trial2.js))
    - Taking into account, which floor button was pressed in the elevator while maintaining the brute force solution does not work ([trial #3](https://github.com/aswna/elevator_saga/tree/master/challenge_02/trial3.js))
    - [Solution #2](https://github.com/aswna/elevator_saga/tree/master/challenge_02/prog.js): go the the floors, which were pressed in the elevator, and go to the bottom floor when idle (I know this is dumb, but works for this level)

  * [Challenge #3](https://play.elevatorsaga.com/#challenge=3): Transport 23 people in 60 seconds or less
    - [Solution #3](https://github.com/aswna/elevator_saga/tree/master/challenge_03/prog.js): same as above
