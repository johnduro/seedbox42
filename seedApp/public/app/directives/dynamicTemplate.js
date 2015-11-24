app.directive('contentItem', function ($compile, RequestHandler, $rootScope) {
    var getTemplate = function (templates, contentType) {
        var template = '';

        switch (contentType) {
            case 'image':
                template = templates.imageTemplate;
                break;
            case 'video':
                template = templates.videoTemplate;
                break;
            case 'notes':
                template = templates.noteTemplate;
                break;
        }

        return template;
    };

    var linker = function (scope, element, attrs) {

        console.log(scope.content.type);

        RequestHandler.get("/app/views/partials/" + scope.content.type + ".html")
            .then(function(resultTemplate){
                RequestHandler.get(api + "dashboard/" + scope.content.name)
            		.then(function(result){
            			scope.lastFiles = result.data.data;
                        
            			$rootScope.tools.convertFields(scope.lastFiles);
                        element.html(resultTemplate.data).show();
                        $compile(element.contents())(scope);
            		});
                //console.log(result.data);

            });
        /*scope.rootDirectory = 'images/';

        TemplateService.getTemplates().then(function (response) {
            var templates = response.data;

            element.html(getTemplate(templates, scope.content.content_type));

            $compile(element.contents())(scope);
        });**/
    };

    return {
        restrict: 'E',
        link: linker,
        scope: {
            content: '='
        }
    };
});
