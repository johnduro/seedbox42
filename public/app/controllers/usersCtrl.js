app.controller('usersCtrl', function ($scope, $rootScope, RequestHandler, Upload, Tools, clipboard, toaster) {

	console.log("usersCtrl");

	$scope.view = "list";
	$scope.myFile;
	$scope.newUser = {
		login: "test",
		mail: "test@hotmail.fr",
		password: "okok",
		role: 1,
	}

	$scope.$on("fileSelected", function (event, args) {
        $scope.myFile = args.file;
		$scope.myFileEdit = args.file;
    });

	function getUsers(){
		RequestHandler.get(api + "users")
			.then(function(result){
				for (var key in result.data){
					if (!("avatar" in result.data[key])){
						result.data[key].avatar = "default.png";
					}
				}
				$scope.users = result.data;
		});
	}
	getUsers();

	$scope.getMails = function () {
		var mails = "";
		$scope.users.forEach(function (user) {
			if ($rootScope.user.mail != user.mail)
				mails += (user.mail + ';');
		});
		clipboard.copyText(mails);
	};

	$scope.changeView = function(view){
		$scope.view = view;
	};

	$scope.addUser = function(){
		var callbackConfirm = function(){
			$scope.newUser.avatar = $scope.myFile;
			var fd = new FormData();
			for (var key in $scope.newUser){
				fd.append(key, $scope.newUser[key]);
			}
			RequestHandler.post(api + "users", fd, false, {transformRequest: angular.identity, headers: {'Content-Type': undefined}})
				.then(function(result){
					result.data = JSON.parse(result.data);
					if (result.data.success){
						$scope.users.push(result.data.data);
						toaster.pop('success', "Success", result.data.message, 5000);
					}else{
						toaster.pop('error', "Error", result.data.message, 5000);
					}
				});
		};

		var callbackCancel = function(){};

		Tools.modalConfirm("Confirmation", "Voulez ajouter cet utilisateur ?", callbackConfirm, callbackCancel);
	};

	$scope.deleteUser = function(id){
		var callbackConfirm = function(){
			RequestHandler.delete(api + "users/"+id)
				.then(function(result){
					if (result.data.success){
						$scope.users = result.data.data;
						toaster.pop('success', "Success", result.data.message, 5000);
					}else{
						toaster.pop('error', "Error", result.data.message, 5000);
					}
				});
		};

		var callbackCancel = function(){};

		Tools.modalConfirm("Confirmation", "Voulez vous supprimer cet utilisateur ?", callbackConfirm, callbackCancel);

	};

	$scope.editUser = function (user){
		$scope.changeView("edit");
		$scope.selectUserId = user._id;
		$scope.selectUser = {};
		$scope.selectUser.login = user.login;
		$scope.selectUser.password = user.password;
		$scope.selectUser.mail = user.mail;
		$scope.selectUser.role = user.role;
		$scope.selectUser.oldvatar = user.avatar;
	};

	$scope.updateUser = function(){

		var callbackConfirm = function(){
			$scope.selectUser.avatar = $scope.myFileEdit;
			var fd = new FormData();
			for (var key in $scope.selectUser){
				fd.append(key, $scope.selectUser[key]);
			}
			RequestHandler.put(api + "users/" + $scope.selectUserId, fd, false, {transformRequest: angular.identity, headers: {'Content-Type': undefined}})
				.then(function(result){
					result.data = JSON.parse(result.data);
					if (result.data.success){
						toaster.pop('success', "Success", result.data.message, 5000);
						getUsers();
					}else{
						toaster.pop('error', "Error", result.data.message, 5000);
					}
				});
		};

		var callbackCancel = function(){};

		Tools.modalConfirm("Confirmation", "Voulez confirmer cette modification ?", callbackConfirm, callbackCancel);
	};

});
