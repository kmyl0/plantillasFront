(function() {
  'use strict';

  angular
    .module('app')
    .controller('VistaPdfController', VistaPdfController);

  /** @ngInject */
  function VistaPdfController($scope, DataService, restUrl, Storage, $sce, $location, Documento) {
      var vm = this;
      var datos_enviar = Storage.getSession('datos_enviar');

      if(datos_enviar==null) $location.path('/documentos');
      else {
          DataService.pdf(restUrl+'plantillasFormly/documentoPDF/',{cite: datos_enviar.nombre})
          .then(function (respuestaPdf) {
              datos_enviar.pdf = respuestaPdf;

            //   if(angular.isUndefined(respuestaPdf)) $location.path('/documentos');
              vm.html=datos_enviar.html;
              vm.pdf=datos_enviar.pdf;
              vm.flag_html=datos_enviar.esDispositivoMovil;
              vm.show_pdf=!datos_enviar.esDispositivoMovil;
              //funciones
              vm.verHtml = function(){ vm.flag_html=true; }
              vm.verPdf = function(){ vm.flag_html=false; }
              vm.load = true;
          })
      }

      $scope.mostrarPdf = function (id, sw){ if(sw) Documento.showPdfx(id); else Documento.showPdfId(id, false); } // eslint-disable-line angular/controller-as
  }
})();
