(function() {
  'use strict';

  angular
    .module('app')
    .controller('fcDocumentosRelacionadosController', documentosRelacionados);

  /** @ngInject */
  function documentosRelacionados($scope, DataService, restUrl, $timeout, ArrayUtil, Documento) {
    var vm = this;
    var sc = $scope;
    sc.vm = vm;


    vm.buscar_doc = "";
    vm.show_doc = false;
    vm.documentos = [];

    //cargamos funciones
    vm.openSelect = openSelect;
    vm.mostrarPdf = mostrarPdf;

    $timeout(iniciarController);

    function iniciarController() {
        var form_nuevo, i, arr, xdocs;
        form_nuevo = angular.isUndefined(sc.model[sc.options.key]);

        // DataService.get( restUrl+'plantillasFormly/documento?fields=id_documento,nombre,fecha' )
        DataService.get( restUrl+'plantillasFormly/documento?fields=id_documento,nombre,fecha&estado=APROBADO,CERRADO,DERIVADO&limit=100000000')
        .then(function (respuesta) {
            arr = respuesta.datos.resultado;
            vm.documentos = [];

            if(form_nuevo){
                vm.documentos = arr;
            }else {
                xdocs = sc.model[sc.options.key];
                for (i = 0; i < arr.length; i++) {
                    if(ArrayUtil.buscarObj(xdocs, 'id_documento', arr[i].id_documento)){
                        vm.documentos.push( ArrayUtil.buscarObj(xdocs, 'id_documento', arr[i].id_documento, true) );
                    }else {
                        vm.documentos.push( arr[i] );
                    }
                }
            }
        });
    }

    function openSelect(ev, show) {
        angular.element(ev.currentTarget).parent().next().children()[1].click();
        switch (show) {
            case 'doc': vm.show_doc = true; break;
        }
    }

    function mostrarPdf(pIdentificador){
        Documento.showPdfId(pIdentificador);
    }

  }
})();
