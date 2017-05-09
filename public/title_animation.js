/*

This Javascript snippet handles the animation of the title as the app loads.

*/

if (localStorage.getItem('students')) {
    $('#titleDivider').css('margin-bottom', '274px');
}

var titleIn = function() {

	$('#titleText').removeClass('no-display').addClass('animated fadeIn');

}

var dividerIn = function() {

	$('#titleDivider').removeClass('transparent').addClass('teal lighten-2 animated fadeIn');

}

var buttonIn = function() {
    
    if (localStorage.getItem('students')) {
        $('#titleDivider').css('margin-bottom', '0');
        $('#localStoragePresentOption').removeClass('no-display').addClass('animated fadeIn');
        $('#initialOptions').removeClass('no-display').addClass('animated fadeIn');
    } else {
        $('#titleDivider').css('margin-bottom', '0');
        $('#initialOptions').removeClass('no-display').addClass('animated fadeIn');
    }
    

}

var titleHighlight = function() {

	var letters = ['#markS', '#markE1', '#markL', '#markE2', '#markC', '#markT'];

	var count = 0;

	var interval = setInterval(function() {
		if(count > 5) {
			clearInterval(interval);
		}

		$(letters[count]).removeClass('mark-off');
		count++;
	}, 100);

}

setTimeout(function() {
	titleIn();
}, 1000);

setTimeout(function() {
	dividerIn();
}, 2000);

setTimeout(function() {
	buttonIn();
}, 3000);

if (localStorage.getItem('students')) {
    setTimeout(function() {
        titleHighlight();
    }, 5500);
} else {
    setTimeout(function() {
        titleHighlight();
    }, 4500);
}