$.fn.stars = function() {
	return $(this).each(function() {
		// Get the value
		var val = parseFloat($(this).html());
		var stars = '<span class="fa fa-star one-star"></span><span class="fa fa-star one-star"></span><span class="fa fa-star one-star"></span><span class="fa fa-star one-star"></span><span class="fa fa-star one-star"></span>';
		// Make sure that the value is in 0 - 5 range, multiply to get width
		// var size = Math.max(0, (Math.min(5, val))) * 16;
		var size = Math.max(0, (Math.min(5, val))) * 15;
		// $(this).empty();
		$(this).html(stars);
		$(this).width(size);
	});
};
