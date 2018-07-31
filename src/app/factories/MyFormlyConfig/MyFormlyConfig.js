(function() {
    'use strict'

    angular
    .module('app')
    .factory('MyFormlyConfig', FormlyConfigFactory);

    /** @ngInject */
    function FormlyConfigFactory() {

        var factory = {
            init: init
        };

        return factory;


        /**
          Funcion que inicia los elementos formly extras que se usaran en la aplicacion
          @param {formlyConfig} ProveedorServicio Objeto el cual angular-formly provee para poder configurar nuevos elementos y wrappers
        */
        function init(formlyConfig){
            // console.log(formlyConfig);
            formlyConfig.setType({
                name: 'texto',
                templateUrl: 'app/components/formlyComponents/texto/texto.html'
            });
            formlyConfig.setType({
              name: 'lista',
              templateUrl: 'app/components/formlyComponents/listas/listas.html'
            });
            formlyConfig.setType({
                name: 'vacio',
                templateUrl: 'app/components/formlyComponents/vacio/vacio.html',
                controller: 'fcVacioController'
            });
            formlyConfig.setType({
                name: 'cite',
                templateUrl: 'app/components/formlyComponents/cite/cite.html',
                controller: 'fcCiteController'
            });
            formlyConfig.setType({
                name: 'inputt',
                templateUrl: 'app/components/formlyComponents/inputt/inputt.html'
            });
            formlyConfig.setType({
                name: 'editorTexto',
                templateUrl: 'app/components/formlyComponents/editorTexto/editorTexto.html'
            });
            formlyConfig.setType({
              name: 'datosGenerales',
              templateUrl: 'app/components/formlyComponents/datosGenerales/datosGenerales.html',
              controller: 'fcDatosGeneralesController'
            });
            formlyConfig.setType({
              name: 'encabezado',
              templateUrl: 'app/components/formlyComponents/encabezado/encabezado.html',
              controller: 'fcEncabezadoController'
            });
            formlyConfig.setType({
              name: 'documentosRelacionados',
              templateUrl: 'app/components/formlyComponents/documentosRelacionados/documentosRelacionados.html',
              controller: 'fcDocumentosRelacionadosController'
            });
            formlyConfig.setType({
              name: 'ccArchivo',
              templateUrl: 'app/components/formlyComponents/ccArchivo/ccArchivo.html',
              controller: 'fcConCopiaArchivoController'
            });
            formlyConfig.setType({
              name: 'archivo',
              templateUrl: 'app/components/formlyComponents/archivo/archivo.html',
              controller: 'fcArchivoController'
            });
        }

    }
})();
