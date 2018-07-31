(function() {
  'use strict';

  angular
    .module('app')
    .controller('ImpresionController', ImpresionController);

  /** @ngInject */
  function ImpresionController(restUrl, Storage, Documento) {
    var vm = this;
    vm.titulo = "Imprimir documentos";
    vm.url = restUrl + "plantillasFormly/documento/";
    var cuenta = Storage.getUser();
    vm.usuario = cuenta.id;

    vm.queryExtra = {
        estado: 'APROBADO,CERRADO,DERIVADO'
    };

    vm.permission = {
        create: false,
        update: false,
        delete: false
    };

    vm.fields = [
        "id_documento",
        "nombre",
        "nombre_plantilla",
        "fecha",
        "impreso",
        "_usuario_modificacion",
        "_fecha_creacion",
        "_fecha_modificacion"
    ];

    vm.buttons = [
      {
        tooltip: 'Ver',
        icon: 'remove_red_eye',
        onclick: vistaPrevia
      },
      {
        tooltip: 'Ver Historial',
        icon: 'timeline',
        onclick: verProgreso
      }
    ];

    function verProgreso(pEvento, pIdentificador) {
        Documento.showProgressAll(pEvento, pIdentificador);
    }

    function vistaPrevia(pEvento, pIdentificador){
        Documento.showPdfId(pIdentificador);
    }

  }
})();
