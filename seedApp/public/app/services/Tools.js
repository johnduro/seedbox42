
//Librairie personnel de manipulation de datas
app.service('Tools', function ($rootScope, RequestHandler, $timeout) {

    /**
     * Librairie php disponible avec js
     */
    var phpjs = new PHP_JS;

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
        popMessage: popMessage
    };
});
