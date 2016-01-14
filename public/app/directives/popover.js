app.directive('mypopover', function(){
	return {
		restrict: 'A',
		link: function(scope, element, attrs){
			$('[class*="ad-popover-"]').popover({ container: 'body'});
		}
	};
});
