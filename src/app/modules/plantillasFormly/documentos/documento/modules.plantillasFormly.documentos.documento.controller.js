
(function() {
  'use strict';

  angular
    .module('app')
    .controller('DocumentoController', DocumentoController);

  /** @ngInject */
  function DocumentoController(DataService, restUrl, Modal, Message, UtilFormly, Storage, $stateParams, $location, backUrl, Panel, Documento, ExpirationTime) {
    var vm = this;
    var cuenta = Storage.getUser();

    vm.id_documento = $stateParams.idDocumento;
    vm.load = false;
    vm.model_actual = {};
    vm.form_actual = [];
    vm.doc = {};
    vm.sw_enviado = true;
    vm.sw_rechazado = false;
    vm.url_img = null;

    // cargamos funciones
    vm.cargarPlantilla = cargarPlantilla;
    vm.guardarDocumento = guardarDocumento;
    vm.vistaPrevia = vistaPrevia;
    vm.volverAtras = volverAtras;
    vm.verObservaciones = verObservaciones;
    vm.verDocumento = verDocumento;
    vm.copearDocumento = copearDocumento;

    iniciar();

    function iniciar() {
        if (vm.id_documento==0) {
            // console.log(Storage.getSession('pl'));
            if(Storage.getSession("pl")!=null){
                cargarPlantilla(Storage.getSession("pl"));
                vm.sw_enviado = false;
                vm.load = true;
                ExpirationTime.initAutoSave(guardar, false);
                Message.show('ADVERTENCIA', 'No olvide guardar sus cambios cada 40 minutos, de lo contrario se perderán.');
            } else $location.path('documentos');
        }else {
            // console.log(restUrl + 'plantillasFormly/documento/'+vm.id_documento);
            DataService.get(restUrl + 'plantillasFormly/documento/'+vm.id_documento)
            .then(function (resultado) {
                Storage.setSession('pl', resultado.datos);
                if(resultado.datos._usuario_creacion!=cuenta.id)
                    $location.path('documentos');
                cargarPlantilla(resultado.datos, true);
                vm.sw_rechazado = (resultado.datos.estado=="RECHAZADO")? true : false;
                vm.sw_enviado = ( resultado.datos.estado!="NUEVO" && !vm.sw_rechazado)? true : false;
                // deshabilitamos todos los campos para
                UtilFormly.disableForm(vm.form_actual, vm.sw_enviado);
                if(vm.sw_enviado){
                    var flujo = {
                        via_actual: resultado.datos.via_actual,
                        para: angular.fromJson(resultado.datos.para),
                        via: angular.fromJson(resultado.datos.via)
                    };
                    Storage.setSession('flujo_doc',flujo);
                }
                ExpirationTime.initAutoSave(guardar, vm.sw_enviado);
                Message.show('ADVERTENCIA', 'No olvide guardar sus cambios cada 40 minutos, de lo contrario se perderán.');
                vm.load = true;
            });
        }
    }

    function copearDocumento() {
        Modal.confirm('¿Esta seguro de que quiere crear otro documento igual a este?', function () {
            var model = angular.copy(vm.model_actual);
            delete model['cite-0'];
            var pl = {
                nombre: vm.doc.nombre_plantilla,
                nombre_plantilla: vm.doc.nombre_plantilla,
                abreviacion: vm.doc.abreviacion,
                plantilla: vm.doc.plantilla,
                plantilla_valor: angular.toJson(model),
                observaciones: null
            };
            Storage.setSession('pl',pl);
            $location.path('documento/0');
        })
    }

    function cargarPlantilla(pl, model) {

        vm.model_actual = (pl.plantilla_valor==null)? {} : angular.fromJson(pl.plantilla_valor);
        if(model)
            vm.form_actual = UtilFormly.dataToView(angular.fromJson(pl.plantilla), vm.model_actual);
        else
            vm.form_actual = UtilFormly.dataToView(angular.fromJson(pl.plantilla));

        actualizarPagina(vm.form_actual[0]);

        vm.doc.nombre = (model)? pl.nombre : pl.nombre+' - '+cuenta.first_name+' '+cuenta.last_name;
        vm.doc.nombre_plantilla = (model)? pl.nombre_plantilla : pl.nombre;
        vm.doc.abreviacion = pl.abreviacion;
        vm.doc.plantilla = pl.plantilla;
        vm.doc.observaciones = (model)? pl.observaciones : null;
        vm.sw_es_respuesta = pl.documento_padre || false;
        if(vm.sw_es_respuesta) {
            vm.doc.documento_padre = pl.documento_padre;
        }

        vm.sw_grupo = pl.grupo || false;
        if(vm.sw_grupo) {
            // obtener documentos de grupo
            DataService.get(restUrl + 'plantillasFormly/documento/?fields=id_documento,nombre,nombre_plantilla&estado=DERIVADO,CERRADO,APROBADO&sort=_fecha_creacion&grupo='+pl.grupo)
            .then(function (resultado) {
                vm.docs_grupo = resultado.datos.resultado;
            });
        }

    }

    function verDocumento(id_doc) { Documento.showPdfId(id_doc, false); }

    function actualizarPagina(template_cite) {
        var to = template_cite.templateOptions || 'sin membrete';
        switch (to.tipoMembrete) {
            case 'sin membrete':
                vm.url_img = null;
            break;
            case 'externo':
                vm.url_img = backUrl+'public/membrete.png';
            break;
        }
    }

    function agregarFlujo(documento, enviar) {
        if(enviar){
            var k, key, arr, i;
            k = key = "para";
            documento[k] = angular.toJson([vm.model_actual["datosGenerales-0"][key].id_usuario]);

            k = key = "via";
            arr = vm.model_actual["datosGenerales-0"][key] || [];
            documento[k] = [];
            for (i = 0; i < arr.length; i++) {
                documento[k].push(arr[i].id_usuario);
            }
            documento[k] = angular.toJson(documento[k].reverse());

            k = key = "de";
            arr = vm.model_actual["datosGenerales-0"][key];
            documento[k] = [];
            for (i = 0; i < arr.length; i++) {
                documento[k].push(arr[i].id_usuario);
            }
            documento[k] = angular.toJson(documento[k]);

            k = "referencia" ; key = "ref";
            documento[k] = vm.model_actual["datosGenerales-0"][key];
        }
    }
    function transformarModel(model) {
        // archivos
        var i = 0, arch;
        while (i!=-1) {
            arch = model['archivo-'+i];
            if(angular.isUndefined(arch)) break;
            if(angular.isUndefined(arch.length)){
                model['archivo-'+i] = [arch];
            }
            i++;
        }
        return angular.toJson(model);
    }

    function guardar(enviar, sw_location){
      var documento = {
          nombre: vm.doc.nombre,
          nombre_plantilla: vm.doc.nombre_plantilla,
          abreviacion: vm.doc.abreviacion,
          plantilla: vm.doc.plantilla,
          plantilla_valor: transformarModel(angular.copy(vm.model_actual))
      };

      if(vm.sw_es_respuesta) {
        documento.documento_padre = vm.doc.documento_padre;
      }

      if (!vm.sw_enviado) agregarFlujo(documento, enviar);
      // console.log(documento);
      if ( vm.id_documento==0 ) {
          documento._usuario_creacion = cuenta.id;
      }else {
          documento._usuario_modificacion = cuenta.id;
          documento.id = vm.id_documento;
      }
      documento.sw = {
          enviar: enviar,
          enviado: vm.sw_enviado,
          es_respuesta: vm.sw_es_respuesta
      }

      DataService.save( restUrl+'plantillasFormly/documento/', documento)
      .then(function (respuesta) {
          if(!sw_location){
              Message.show(respuesta.tipoMensaje, respuesta.mensaje);
              $location.path('documentos');
              Storage.removeSession('pl');
          }else if(vm.id_documento==0) $location.path('documento/'+respuesta.datos.id_documento);
      });
    }

    function guardarDocumento(enviar) {
        // Valida si es para enviar.
        if(enviar){
          if( UtilFormly.sizeObj(vm.formu.$error)==0 ){
              guardar(enviar);
          }else {
            UtilFormly.recursiveShowError(vm.formu.$error);
            Message.show("ERROR", 'Debe llenar todos los campos marcados con rojo porque son requeridos'.toUpperCase());
            abrirDialogError(vm.formu);
          }
        }
        else{
          guardar();

        }
    }


    function abrirDialogError( pFormulario){
      var config = {
        data: pFormulario,
        templateUrl: 'app/modules/plantillasFormly/documentos/documento/dialogError.html',
        controller: ['data', '$scope', '$mdDialog', DialogErrorController]
      }
      Modal.show(config);
    }

    function DialogErrorController(data, $scope, $mdDialog){
      var vmd = $scope;
      vmd.data={};

      vmd.cerrar= function(){
        $mdDialog.cancel();
      }
    }

    function volverAtras() {
        $location.path('documentos');
    }

    function vistaPrevia(){
        if( UtilFormly.sizeObj(vm.formu.$error)==0 ){
            Documento.showPdf(vm.doc.plantilla, angular.toJson(vm.model_actual), vm.doc.nombre);
        }else {
            UtilFormly.recursiveShowError(vm.formu.$error);
        }
    }


    function verObservaciones(event) {
        var data = {
            observacion: vm.doc.observaciones || 'El documento esta mal'
        }
        var config = {
            event: event,
            data: data,
            controller: ['$scope', 'data', 'mdPanelRef',PanelItemController],
            templateUrl: 'app/modules/plantillasFormly/documentos/documento/observacion.panel.html'
        };
        Panel.show(config);
    }

    function PanelItemController($scope, data, mdPanelRef) {
        var vmp = $scope;
        vmp.observacion = data.observacion;

        //cargamos funciones
        vmp.closePanel = closePanel;

        function closePanel() {
            mdPanelRef && mdPanelRef.close().then(function() { mdPanelRef.destroy(); });
        }
    }


  }
})();
