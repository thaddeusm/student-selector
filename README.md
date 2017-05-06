Student Selector
================

Selecting a student to better engage a class or to get feedback
is a common teacher task, but it is one that can cause a lot of
frustration for students.  Teachers also are often uneasy about 
their selection, not wanting students to feel that they are 
unfairly targeting someone or vise versa, that they are neglecting
certain learners.

The Tool
--------

Student Selector aims to gamify this classroom interaction by 
asking the computer to `randomly` select a student from a class
list.  In this way, it is not the teacher who directly calls
upon a learner, but an impartial third-party.

Randomization
-------------

The tool attempts to randomize the selection in two ways:
- by `shuffling` the list of student names each time the selection
button is pressed
- by pulling a random number of students names from the top of 
the shuffled list, the last name being the selected name

Additonal Features
------------------
- localStorage to save created lists locally for repeated use
- ability to mark students as `absent`, which takes their names
out of the selection pool for the session

Inspiration
-----------
This project would have been impossible without having completed 
Gordon Zhu's [Practical Javascript](http://www.practicaljavascript.net) 
course, which covers the development of a Javascript MVC Todo app.

UI elements were built using
- [Materialize](http://materializecss.com)
- [Animate.css](https://daneden.github.io/animate.css/)