
app.controller('torrentsCtrl', function ($scope, $rootScope) {

	console.log("torrentsCtrl");

	$scope.torrents = [
		{
			name: "test1",
			size: 100,
			pourcentage: 10
		},
		{
			name: "test2",
			size: 1260,
			pourcentage: 60
		},
		{
			name: "test3",
			size: 7500,
			pourcentage: 28
		},
		{
			name: "test4",
			size: 10000,
			pourcentage: 95
		}
	];
});
