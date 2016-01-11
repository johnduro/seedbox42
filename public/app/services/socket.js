app.factory('socket', ['$rootScope', function ($rootScope) {
    // var socket = io.connect(api, {token:$rootScope.token});

    var socket;
    // var socket = io.connect(api);
	// var obj = socket.connect();
	// console.log(socket.connected);
    // if (socket.connected === true)
    //     console.log("Socket connected");
    // else
    //     console.log("Socket not connected");

	// socket.on('connect', function() {
	// 	console.log('check 2', socket.connected);
	// });

    return {
        connection: function(){
            socket = io.connect(api, { query : "token=" + localStorage.getItem("token") });
        },

        on: function (eventName, callback) {
            function wrapper() {
                var args = arguments;
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            }

            socket.on(eventName, wrapper);

            return function () {
                socket.removeListener(eventName, wrapper);
            };
        },

        emit: function (eventName, data, callback) {
            socket.emit(eventName, data, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    if(callback) {
                        callback.apply(socket, args);
                    }
                });
            });
        }
    };
}]);
