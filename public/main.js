/*

Significant aspects of the code are thanks to Gordon Zhu's excellent Practical Javascript
course at watchandcode.com, which covers a Model View Controller Javascript coding pattern 
that organizes elements and functions into objects.

*/

// a helper variable for the Animate.css library
var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';

// initiates the Materialize CSS side-navigation toggle button
$(".button-collapse").sideNav();

$('.modal').modal({
      dismissible: false, // Modal can be dismissed by clicking outside of the modal
      opacity: 0, // Opacity of modal background
    }
  );

// model object that handles changes to data
var studentList = {
    // the primary array of objects that holds student information
    students: [],
    // method for adding new students
    addStudent: function(name) {
        this.students.push({
            name: name,
            absent: false
        });
    },
    // method for modifying an existing student's name (currently not being used)
    updateStudent: function(position, newName) {
        this.students[position].name = newName;
    },
    // removes a student record
    deleteStudent: function(position) {
        this.students.splice(position, 1);
    },
    // toggles whether to temporarily exclude a particular student from selection
    markAbsent: function(position) {
        var student = this.students[position];
            if (student.absent === false) {
                student.absent = true;
            } else {
                student.absent = false;
            }
    },
    // stores a list of student names in the browser for later use
    saveToLocalStorage: function() {
        var studentsNamesOnly = [];
        for (var i = 0; i < this.students.length; i++) {
            studentsNamesOnly.push(this.students[i].name);
        }
        localStorage.setItem('students', JSON.stringify(studentsNamesOnly));
    },
    // removes a locally stored student list
    clearLocalStorage: function() {
        localStorage.clear();
    },
    /* first checks if the user's browser has a stored student list 
    and then passes the names to the main students array of objects */
    loadFromLocalStorage: function() {
        if (localStorage.getItem('students')) {
            var savedStudentsNames = JSON.parse(localStorage.getItem('students'));
            for (var i = 0; i < savedStudentsNames.length; i++) {
                this.addStudent(savedStudentsNames[i]);
            }
        } else {
            console.log("There are no saved students in localStorage.");
        }
    },
    // randomizes the selection of a student twice
    selectRandomStudents: function() {
        if (this.students.length !== 0) {
            var studentsNamesOnly = [];
            for (var i = 0; i < this.students.length; i++) {
                // excludes any students marked absent from selection
                if (this.students[i].absent === false) {
                    // creates a new array of present students' names
                    studentsNamesOnly.push(this.students[i].name);   
                }
            }
            // shuffles the position of names in the studentsNamesOnly array 
            // (first randomization)
            var j, x, i;
            for (i = studentsNamesOnly.length; i; i--) {
                j = Math.floor(Math.random() * i);
                x = studentsNamesOnly[i - 1];
                studentsNamesOnly[i - 1] = studentsNamesOnly[j];
                studentsNamesOnly[j] = x;
            }
            /* chooses the length of the final array (randomArray) 
            from a random selection of one of the following possibilities,
            with sizes depending on the number of students in the list. */
            // (second randomization)
            if (studentsNamesOnly.length > 10) {
                var possibilities = [4, 5, 6];
            } else {
                var possibilities = [2, 3, 4];   
            }
            
            var randomNum = Math.floor(Math.random()*possibilities.length);
            var arraySize = possibilities[randomNum];
            // grabs from the top of the shuffled list to create the final array
            var randomArray = studentsNamesOnly.slice(0, arraySize);
            console.log('The size of the randomArray is', arraySize);
            console.log(randomArray);
            // returns the final array, the last name being the selected student
            return randomArray;
            
        } else {
            console.log('There are no students yet.');
        }
        
    },
    // pulls in student names via Tabletop from Google Sheets
    processSheetData: function(data) {
        data.forEach(function(item) {
           this.addStudent(item.students);
        }, this);
        this.saveToLocalStorage();
        view.displaySheetLoadedStudents();
    }
};
// handles interactions from the user interface to initiate data or interface changes
var handler = {
    addStudent: function() {
        // clears the input after a new student name has been added
        var addName = document.getElementById('addName');
        studentList.addStudent(addName.value);
        addName.value = '';
        view.displayStudents();
    },
    deleteStudent: function(position) {
        studentList.deleteStudent(position);
        view.displayStudents();
    },
    markAbsent: function(position) {
        studentList.markAbsent(position);
        view.displayLoadedStudents();
    },
    initialListBuilder: function() {
        // clears the student list if user decides to replace an existing list
        studentList.students = [];
        view.displayStudents();
    },
    startSelector: function() {

        var absentStudents = 0;
        studentList.students.forEach(function(student) {
            if (student.absent === true) {
                absentStudents++;
            }
        });
        
        // checks first to ensure that at least one student has been added or is present
        if (studentList.students.length === 0 || studentList.students.length === absentStudents) {
            $('#listFeedbackText').html('Please add students.');
            $('#editTapTarget').tapTarget('open');
        } else {
            /* disables the selector button to prevent user from accidentally
            calling a new selection before the animation completes */
            $('#selectStudent').addClass('disabled');
            $('#nameArea').addClass('animated fadeOut');
            // assigns the array returned to a local variable    
            var randomArray = studentList.selectRandomStudents();
            var i = 0;
            // passes number of iterations and random selection of students for animation
            view.nameAnimation(i, randomArray);
        }
        
    },
    // used to continue iterations to complete the animation
    /* 
    
    This was the most challenging aspect of the project for a variety of reasons:
    - I had difficulty understanding how to build a loop that delays iterations to allow
    for a more suspenseful user experience while a final name was presented.
    - Scoping the function within the MVC object design pattern caused quite a bit of
    confusion, finally resulting in me finally trying out dividing the iteration
    between two objects - the handler and the view.
    
    **Additional info about this issue: https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setTimeout#The_this_problem
    
    */
    continueSelector: function(i, randomArray) {
        view.nameAnimation(i, randomArray);
    },
    // handles option to load previously stored student list
    loadFromLocalStorage: function() {
        studentList.loadFromLocalStorage();
        view.loadFromLocalStorage();
    },
    // handles option to load a list from Google Sheets
    sheetImport: function() {
        var sheetURL = document.getElementById('sheetURLInput').value;
        init(sheetURL);
    }
};
// object to hold app transitions visible to the user
var view = {
    displayStudents: function() {
        // clears the list of names in the side panel
        var nameList = document.getElementById('nameList');
        nameList.innerHTML = '';
        for (var i = 0; i < studentList.students.length; i++) {
            // prints student list on the DOM with delete icons
            var student = studentList.students[i];
            
            if (student.absent === false) {
                nameList.innerHTML += '<li class="collection-item brown lighten-5"><div><span class="name-text">' + student.name + '</span><a id="' + i + '" href="#" class="secondary-content"><i class="material-icons delete-icon red-text text-darken-2">delete</i></a></div></li>';
            } else {
                nameList.innerHTML += '<li class="collection-item brown lighten-5"><div><span class="name-text absent-text">' + student.name + '</span><a id="' + i + '" href="#" class="secondary-content"><i class="material-icons delete-icon red-text text-darken-2">delete</i></a></div></li>';
            }
        } 
    },
    // if a list is loaded from localStorage, give option to mark as absent
    displayLoadedStudents: function() {
        // prompts to mark students as absent
        $('#listFeedbackText').html('Is anyone absent?');
        setTimeout(function() {
            $("#listFeedbackText").addClass("animated shake");
        }, 1500);
        // clears the list of names in the side panel
        var nameList = document.getElementById('nameList');
        nameList.innerHTML = '';
        for (var i = 0; i < studentList.students.length; i++) {
            // prints student list on the DOM with mark absent icons
            var student = studentList.students[i];

            if (student.absent === false) {
                nameList.innerHTML += '<li class="collection-item brown lighten-5"><div><span class="name-text">' + student.name + '</span><a id="' + i + '" href="#" class="secondary-content"><i class="material-icons mark-absent-icon red-text text-darken-2">assignment_late</i></a></div></li>';
            } else {
                nameList.innerHTML += '<li class="collection-item brown lighten-5"><div><span class="name-text absent-text">' + student.name + '</span><a id="' + i + '" href="#" class="secondary-content"><i class="material-icons mark-absent-icon red-text text-lighten-2">assignment_late</i></a></div></li>';
            }
             
        }
    },
    // transitions views after student names are loaded from Google Sheets
    displaySheetLoadedStudents: function() {
        // clears the list of names in the side panel
        var nameList = document.getElementById('nameList');
        nameList.innerHTML = '';
        for (var i = 0; i < studentList.students.length; i++) {
            // prints student list on the DOM with delete icons
            var student = studentList.students[i];
            
            if (student.absent === false) {
                nameList.innerHTML += '<li class="collection-item brown lighten-5"><div><span class="name-text">' + student.name + '</span><a id="' + i + '" href="#" class="secondary-content"><i class="material-icons delete-icon red-text text-darken-2">delete</i></a></div></li>';
            } else {
                nameList.innerHTML += '<li class="collection-item brown lighten-5"><div><span class="name-text absent-text">' + student.name + '</span><a id="' + i + '" href="#" class="secondary-content"><i class="material-icons delete-icon red-text text-darken-2">delete</i></a></div></li>';
            }
        } 
        // the following functions lazy load transitions
        $("#startContent").addClass("animated fadeOut");
        $('#saveListButtonListItem').addClass('no-display');
        $('#updateListButtonListItem').removeClass('no-display');

        setTimeout(function() {
            $("#startContent").addClass("no-display");
            $("#selectorContent").removeClass("no-display").addClass("animated fadeIn");
            $("footer").removeClass("no-display").addClass("animated slideInUp");
        }, 100);

        setTimeout(function() {
           $('#editTapTarget').tapTarget('open');
        }, 1500);

        setTimeout(function() {
           $('#editTapTarget').tapTarget('close');
            $('.button-collapse').sideNav('hide');
        }, 5500);

        setTimeout(function() {
           $('#selectTapTarget').tapTarget('open');
        }, 6500);
        
    },
    loadFromLocalStorage: function() {
        this.displayLoadedStudents();
    },
    nameAnimation: function(i, randomArray) {
        setTimeout(function() {
            /* Every 2.5 seconds prints a random student name and then fades out
            before the next iteration. */
            // makes sure any former selected student names fades out before restarting
            var nameArea = document.getElementById("nameArea");
            nameArea.innerHTML = "";
            $("#nameArea").removeClass("animated fadeOut");
            // constructs a handy references for quick jQuery use
            var newId = 'student' + i + '';
            var idTag = '#' + newId + '';
            nameArea.innerHTML += '<h1 id="' + newId + '">' + randomArray[i] + '</h1>';
            $(idTag).addClass("animated fadeInDown").one(animationEnd, function() {
               $(this).removeClass("animated fadeInDown"); 
            });
            // controls the transition to the next name or the final selection animation
            setTimeout(function() {
                if (i === randomArray.length) {
                    $(idTag).addClass("animated rubberBand");
                    $("#selectStudent").removeClass("disabled");
                } else {
                    $(idTag).addClass("animated bounceOutDown").one(animationEnd, function() {
                        $(this).addClass("no-display");
                    });   
                }
            }, 1500);

            i++;
            // continues iterations
            if (i < randomArray.length) {
                handler.continueSelector(i, randomArray);
            }
        }, 2500);

    },
    // method to connect all button / keyup actions
    setUpEventListeners: function() {
        
        var nameList = document.getElementById('nameList');
        // dynamically assigns listeners to delete icons through the parent ul
        nameList.addEventListener('click', function(event) {
            
            var elementClicked = event.target;
            
            if (elementClicked.className === 'material-icons delete-icon red-text text-darken-2') {
                handler.deleteStudent(parseInt(elementClicked.parentNode.id));
            } else if (elementClicked.className === 'material-icons mark-absent-icon red-text text-darken-2') {
                handler.markAbsent(parseInt(elementClicked.parentNode.id));
            } else if (elementClicked.className === 'material-icons mark-absent-icon red-text text-lighten-2') {
                handler.markAbsent(parseInt(elementClicked.parentNode.id));
            }
            
        });
        
        // allows submission of new names with the enter / return key
        $('#addName').keyup(function(e) {
        
                if (e.which === 13) {

                    handler.addStudent();

                }

        });
        // actions for initial list building (if creating a new list)
        document.getElementById('saveListButton').addEventListener('click', function() {
            // check to ensure at least one name is in the student list
            if (studentList.students.length > 0) {

                $('#listFeedbackText').html('');
                
                studentList.saveToLocalStorage();
            
                $('.button-collapse').sideNav('hide');
                // the following functions lazy load transitions
                setTimeout(function() {
                    $("#startContent").addClass("animated fadeOut");
                    $('#saveListButtonListItem').addClass('no-display');
                    $('#updateListButtonListItem').removeClass('no-display');
                }, 500);

                setTimeout(function() {
                    $("#startContent").addClass("no-display");
                    $("#selectorContent").removeClass("no-display").addClass("animated fadeIn");
                    $("footer").removeClass("no-display").addClass("animated slideInUp");
                }, 1200);

                setTimeout(function() {
                   $('#editTapTarget').tapTarget('open');
                }, 2000);

                setTimeout(function() {
                   $('#editTapTarget').tapTarget('close');
                    $('.button-collapse').sideNav('hide');
                }, 6000);

                setTimeout(function() {
                   $('#selectTapTarget').tapTarget('open');
                }, 7000);
                
            } else {
                $('#listFeedbackText').html('Please add students.');
            }
            
        });
        // for later changes to student name list
        document.getElementById('updateListButton').addEventListener('click', function() {
            // check to ensure at least one name is in the student list
            if (studentList.students.length > 0) {
                $('#listFeedbackText').html('');
                $('.button-collapse').sideNav('hide');
                studentList.clearLocalStorage();
                studentList.saveToLocalStorage();
            } else {
                $('#listFeedbackText').html('Please add students.');
            }
            
        });
        
    }
};
// calls the event listener method
view.setUpEventListeners();

// Tabletop - Google Sheet Integration
function init(sheetURL) {
  Tabletop.init( { key: sheetURL,
                   callback: function(data, tabletop) { 
                       studentList.processSheetData(data);
                   },
                   simpleSheet: true } )
}