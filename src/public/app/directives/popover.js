app.directive('mypopover', function(){
	return {
		restrict: 'A',
		link: function(scope, element, attrs){
			$('[class*="admdir-popover-"]').popover({ container: 'body'});
		}
	};
});
