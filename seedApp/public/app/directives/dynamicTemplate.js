app.directive('contentItem', function ($compile, RequestHandler, $rootScope, $location, socket) {

    var linker = function (scope, element, attrs) {

        scope.messages = [];

        RequestHandler.get("/app/views/partials/" + scope.content.template + ".html")
            .then(function(resultTemplate){
                if (scope.content.name == "minichat"){
                    socket.emit("chat:get:message", null, function(data){
                		scope.messages = data.message;
                        element.html(resultTemplate.data).show();
                        $compile(element.contents())(scope);
                	});
                }else{
                    RequestHandler.get(api + "dashboard/" + scope.content.name)
                		.then(function(result){
                            if (result.status == 200 && resultTemplate.status == 200){
                                scope.files = result.data.data;
                    			$rootScope.tools.convertFields(scope.files);
                                element.html(resultTemplate.data).show();
                                $compile(element.contents())(scope);
                            }
                		});
                }
            });


        scope.openFile = function(file){
    		$location.url('seedbox/file/' + file._id);
    	};
        scope.sendMessage = function(){
    		socket.emit("chat:post:message", {message: scope.newMessage, id:$rootScope.user._id});
    		scope.newMessage = "";
    	};
        socket.on("chat:post:message", function(data){
    		scope.messages.push(data.newmessage);
    	});
    };

    return {
        restrict: 'E',
        link: linker,
        scope: {
            content: '='
        }
    };
});
