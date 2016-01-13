
//Librairie personnel de manipulation de datas
app.service('Tools', function ($rootScope, RequestHandler, $timeout, $modal, $q) {

    /**
    * Librairie php disponible avec js
    */
    var phpjs = new PHP_JS;

    Number.prototype.toTruncFixed = function(place) {
		var ret = Math.floor(this * Math.pow (10, place)) / Math.pow(10, place);
		return ret.toFixed(place);
	};

    /**
    * Convert string to int in array obecjts
    * @param {array} array - Array with datas.
    * @param {string} column - Column to convert.
    */
    var strToIntInArray = function (array, column) {
        for (var key in array) {
            array[key][column] = parseInt(array[key][column]);
        }
    };

    /**
    * Ajout d'un champ dans un array pour chaque element
    * @param {array} array - Tableau d'objets.
    * @param {string} new_element - Nouveau champ a ajouter.
    * @param {string | int} default_value - Valeur par defaut.
    */
    var addElementInNode = function (array, new_element, default_value) {
        for (var key in array) {
            array[key][new_element] = default_value;
        }
    };

    var deleteElementInObject = function (object, elements){

    };

    /**
    * Set la valeur d'un champ pour chaques elements d'un tableau
    * @param {array} array - Tableau avec les differents rootscope a verifier.
    * @param {string} element - Champ a set pour chaque objet.
    * @param {mixte} new_value - Nouvelle valeur.
    */
    var setAllItems = function (array, element, new_value) {
        for (var key in array) {
            array[key][element] = new_value;
        }
    };

    /**
    * Retrourne l'element du tableau recherché
    * @param {array} array - Tableau de donnees.
    * @param {string} element_search - champ sur lequel la recheche sera effectuée.
    * @param {string} element_value - Valeur recherchée.
    */
    var getLineInArray = function (array, element_search, element_value) {
        for (var key in array) {
            if (array[key][element_search] == element_value)
            return array[key];
        }
    };

    /**
    * Retourne l'index d'un element du tableau
    * @param {array} arrayItems - Tableau avec les differents rootscope a verifier.
    * @param {string} column - champ sur lequel la recheche sera effectuée.
    * @param {array} value - Valeur recherchée.
    */
    var getIndex = function (arrayItems, column, value) {
        for (var key in arrayItems) {
            if (arrayItems[key][column] == value)
            return key;
        }
    };

    /**
    * Retourne le nombre d'item possedent la valeur recherché pour un element donné
    * @param {array} arrayItems - Tableau avec les differents rootscope a verifier.
    * @param {string} column - champ sur lequel la recheche sera effectuée.
    * @param {array} value - Valeur recherchée.
    */
    var getCountValue = function (arrayItems, column, value) {
        var count = 0;
        for (var key in arrayItems) {
            if (arrayItems[key][column] == value)
                count++;
        }
        return count;
    };

    /**
    * Retourne un tableau d'items contenant la valeur du champ souhaité pour
    * chaque item matchant avec la cle valeur passee en parametre
    * @param {array} arrayItems - Tableau avec les differents rootscope a verifier.
    * @param {string} column - champ sur lequel la recheche sera effectuée.
    * @param {array} value - Valeur recherchée.
    */
    var getElementForMatchValue = function (arrayItems, columnReturn, columnSearch, valueSearch) {
        var items = [];
        for (var key in arrayItems) {
            if (arrayItems[key][columnSearch] == valueSearch)
                items.push(arrayItems[key][columnReturn]);
        }
        return items;
    };

    /**
    * Lance le loading jusau'au moment ou toutes les variables sont setter.
    * @param {array} array - Tableau avec les differents rootscope a verifier.
    */
    var getItem = function (arrayItems, column, value) {
        for (var key in arrayItems) {
            if (arrayItems[key][column] == value)
            return arrayItems[key];
        }
    };

    /**
    * Ajoute un element a la fin du rootScope du model passer en parametre
    * @param {Object} UpdateItem - Nouvel object.
    * @param {String} Model - Model de donnees.
    */
    var setItemInRootScope = function (UpdateItem, model) {
        angular.extend($rootScope[model].datas[getIndex($rootScope[model].datas, 'id', UpdateItem.id)], UpdateItem);
    };

    /**
    * Gestion du loader.
    */
    var loading = {
        start: function (classLoader) {
            classLoader = typeof classLoader !== 'undefined' ? classLoader : "";
            $rootScope.loading.active = 1;
            $rootScope.loading.style = classLoader;
        },
        stop: function () {
            $rootScope.loading.active = 0;
            $rootScope.loading.style = "";
        },
        wait: function (array) {
            if (phpjs.is_array(array))
            var checkCount = array.length;
            else
            var checkCount = 1;
            $rootScope.loading.active = 1;
            var varLoaded = 0;
            for (var key in array) {
                if (!phpjs.empty($rootScope[array[key]])) {
                    varLoaded++;
                }
            }
            if (varLoaded == checkCount) {
                $timeout(function () {
                    $rootScope.loading.active = 0;
                }, 500);
            } else {
                $timeout(function () {
                    loading.wait(array)
                }, 500);
            }
        }
    };

    var popMessage = function (title, message){
        setTimeout(function() {
            toastr.options = {
                closeButton: true,
                progressBar: true,
                showMethod: 'fadeIn',
                hideMethod: 'fadeOut',
                timeOut: 10000
            };
            toastr.success(message, title);
        }, 1800);
    };

    var modalConfirm = function (title, message, callbackConfirm, callbackCancel){
        var modalInstance = $modal.open({
            templateUrl: "app/views/partials/modalConfirm.html",
            resolve: {
                getTitle: function () {
                    return title;
                },
                getMessage: function () {
                    return message;
                }
            },
            controller: function ($scope, $modalInstance, getTitle, getMessage) {

                $scope.message = getMessage;
                $scope.title = getTitle;

                $scope.confirm = function () {
                    $modalInstance.close();
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            }
        });
        modalInstance.result.then(function () {
            callbackConfirm();
        }, function () {
            callbackCancel();
        });
    };

    var FileConvertSize = function (bytes){
        var size_K = 1000;
		var size_B_str =  'B';
		var size_K_str = 'kB';
		var size_M_str = 'MB';
		var size_G_str = 'GB';
		var size_T_str = 'TB';

		if (bytes < size_K)
			return [ bytes, size_B_str ].join(' ');

		var convertedSize;
		var unit;

		if (bytes < Math.pow(size_K, 2))
		{
			convertedSize = bytes / size_K;
			unit = size_K_str;
		}
		else if (bytes < Math.pow(size_K, 3))
		{
			convertedSize = bytes / Math.pow(size_K, 2);
			unit = size_M_str;
		}
		else if (bytes < Math.pow(size_K, 4))
		{
			convertedSize = bytes / Math.pow(size_K, 3);
			unit = size_G_str;
		}
		else
		{
			convertedSize = bytes / Math.pow(size_K, 4);
			unit = size_T_str;
		}

		// try to have at least 3 digits and at least 1 decimal
		return convertedSize <= 9.995 ? [ convertedSize.toTruncFixed(2), unit ].join(' ') : [ convertedSize.toTruncFixed(1), unit ].join(' ');

        /*if (aSize < 1)
            return "0 octets";
		aSize = Math.abs(parseInt(aSize, 10));
		var def = [[1, 'octets'], [1024, 'ko'], [1024*1024, 'Mo'], [1024*1024*1024, 'Go'], [1024*1024*1024*1024, 'To']];
		for(var i=0; i<def.length; i++){
			if(aSize<def[i][0])
				return (aSize/def[i-1][0]).toFixed(2)+' '+def[i-1][1];
		}*/
	};

    var getConfig = function (){
        var defer = $q.defer();
        if ("config" in $rootScope){
            defer.resolve($rootScope.config);
        }else{
            RequestHandler.get(api + "admin/settings")
                .then(function(result){
                    $rootScope.config = result.data.data;
                    defer.resolve($rootScope.config);
                });
        }
        return defer.promise;
    };

    var getUser = function (){
        var defer = $q.defer();
        if ("user" in $rootScope){
            defer.resolve($rootScope.user);
        }else{
            RequestHandler.get(api + "users/profile")
                .then(function(result){
                    $rootScope.user = result.data.data;
                    defer.resolve($rootScope.user);
                });
        }
        return defer.promise;
    };

    return {
        phpjs: phpjs,
        strToIntInArray: strToIntInArray,
        addElementInNode: addElementInNode,
        setAllItems: setAllItems,
        getLineInArray: getLineInArray,
        getIndex: getIndex,
        getItem: getItem,
        setItemInRootScope: setItemInRootScope,
        loading: loading,
        popMessage: popMessage,
        modalConfirm: modalConfirm,
        FileConvertSize: FileConvertSize,
        getCountValue: getCountValue,
        getElementForMatchValue: getElementForMatchValue,
        getConfig: getConfig,
        getUser: getUser
    };
});
