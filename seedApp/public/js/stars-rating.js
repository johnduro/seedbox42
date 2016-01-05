$// .fn.stars = function() {
// 	return $(this).each(function() {
// 		$(this).html($('<span />').width(Math.max(0, (Math.min(5, parseFloat($(this).html())))) * 16));
// 	});
// }




// $.fn.stars = function() {
// 	return this.each(function(i,e){$(e).html($('<span/>').width($(e).text()*16));});
// };


// $.fn.stars = function() {
// 	return $(this).each(function() {
// 	// Get the value
// 	var val = parseFloat($(this).html());
// 	// Make sure that the value is in 0 - 5 range, multiply to get width
// 	var size = Math.max(0, (Math.min(5, val))) * 16;
// 	// Create stars holder
// 	var $span = $('<span />').width(size);
// 	// Replace the numerical value with stars
// 	$(this).html($span);
// });
// }


$.fn.stars = function() {
	return $(this).each(function() {
		// Get the value
		var val = parseFloat($(this).html());
		// Make sure that the value is in 0 - 5 range, multiply to get width
		var size = Math.max(0, (Math.min(5, val))) * 16;
		$(this).empty();
		$(this).width(size);
	});
};


// $('.stars').stars();


// $(function() {
// 	$('span.stars').stars();
// });
