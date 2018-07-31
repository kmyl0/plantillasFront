(function() {
  'use strict';

  angular
    .module('app')
    .controller('AprobacionController', AprobacionController);

  /** @ngInject */
  function AprobacionController(DataService, restUrl, backUrl, Storage, $location, Modal, UtilFormly, Datetime, Documento) {

    var vm = this;
    vm.titulo = "Documentos derivados";
    var cuenta = Storage.getUser();
    vm.usuario=cuenta.id;
    vm.url = restUrl + 'plantillasFormly/documento/'+cuenta.id+'/todo/';

    //cargamos funciones
    vm.vistaPrevia = vistaPrevia;

    vm.permission ={
      create:false,
      update:false,
      delete:false
    };

    vm.estadoOpciones = [{ v:'deriv', t:'DERIVADO'}];
    if(cuenta.es_jefe){
        vm.titulo = "Aprobar documentos";
        vm.estadoOpciones.push({ v:'envia', t:'ENVIADO'});
    }

    vm.fields = [
      "id_documento",
      "nombre",
      "nombre_plantilla",
      "fecha",
      "estado",
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
        var datosEnviar = {doc:{}};
        datosEnviar.doc = {};
        DataService.get(restUrl + 'plantillasFormly/documento/'+pIdentificador)
        .then(function (data) {
            // console.log(data);
            datosEnviar.model_actual = angular.fromJson(data.datos.plantilla_valor);
            var model = datosEnviar.model_actual;
            if( model["cite-0"] && model["cite-0"]["fecha"] )
            model["cite-0"]["fecha"] = Datetime.format(model["cite-0"]["fecha"], 'dd de MMM de YYYY');
            datosEnviar.form_actual = UtilFormly.dataToView(angular.fromJson(data.datos.plantilla), datosEnviar.model_actual);
            datosEnviar.doc.nombre = data.datos.nombre;
            datosEnviar.doc.plantilla = data.datos.plantilla;

            DataService.post(restUrl+ "plantillasFormly/generarDocumento/",datosEnviar)
            .then(function(pRespuesta){
                datosEnviar = { html: pRespuesta.datos.html, nombre: pRespuesta.datos.nombre};
                datosEnviar.esDispositivoMovil = Documento.isMobile();
                DataService.pdf(restUrl+'plantillasFormly/documentoPDF/',{cite: datosEnviar.nombre})
                .then(function (respuestaPdf) {
                    datosEnviar.pdf = respuestaPdf;
                    var config = {
                        data: { id:data.datos.id_documento, dc: data.datos, cuenta: cuenta, pdf: datosEnviar },
                        templateUrl: 'app/modules/plantillasFormly/aprobacion/dialogPDF.html',
                        controller: ['data', '$scope', '$mdDialog', 'DataService', 'restUrl', '$timeout', 'Storage', 'Datetime', 'Documento', 'Message', DialogPDFController]
                    }
                    Modal.show(config);
                })
            })
        });

    }





    function DialogPDFController(data, $scope, $mdDialog, DataService, restUrl, $timeout, Storage, Datetime, Documento, Message){
        var vmd = $scope;
        vmd.data={};
        vmd.data.dc=data.dc;
        vmd.data.observaciones;
        vmd.data.show_select = false;
        vmd.data.datosEnviar=data.dc.datosEnviar;

        vmd.data.html=data.pdf.html;
        vmd.data.pdf=data.pdf.pdf;
        vmd.data.flag_html=data.pdf.esDispositivoMovil;
        vmd.data.show_pdf=!data.pdf.esDispositivoMovil;

        //funciones
        vmd.cerrar = cerrar;
        vmd.aprobar = aprobar;
        vmd.observar = observar;
        vmd.derivar = derivar;
        vmd.openSelect = openSelect;
        vmd.crear = crear;
        vmd.verDocumento = verDocumento;

        vmd.mostrarPdf = function (id, sw){ if(sw) Documento.showPdfx(id); else Documento.showPdfId(id, false); }
        vmd.verHtml=function(){ vmd.data.flag_html=true; }
        vmd.verPdf=function(){ vmd.data.flag_html=false; }

        iniciar();

        function iniciar() {
            vmd.data.es_derivar = (vmd.data.dc.estado=='DERIVADO');
            vmd.data.es_para = (vmd.data.dc.para.indexOf(data.cuenta.id)!=-1 && !vmd.data.es_derivar);
            vmd.data.sw_es_respuesta = vmd.data.dc.grupo || false;
            if(vmd.data.sw_es_respuesta) {
                // obtener documentos de grupo
                DataService.get(restUrl + 'plantillasFormly/documento/?fields=id_documento,nombre,nombre_plantilla&estado=DERIVADO,CERRADO,APROBADO&sort=_fecha_creacion&grupo='+vmd.data.dc.grupo)
                .then(function (resultado) {
                    vmd.data.docs_grupo = resultado.datos.resultado;
                });
            }

            DataService.get(restUrl + 'seguridad/usuario/'+vmd.data.dc._usuario_creacion)
            .then(function (respuesta) {
                vmd.data.nombres =  respuesta.datos.nombres;
                vmd.data.apellidos =  respuesta.datos.apellidos;
                if(vmd.data.es_para || vmd.data.es_derivar)
                    return DataService.get(restUrl + 'seguridad/usuario/'+cuenta.id+'/informacion')
                return;
            })
            .then(function (respuesta) {
                if(respuesta){
                    vmd.data.accion='observar';
                    vmd.data.usuarios = respuesta.datos.resultado;
                }
                if(vmd.data.es_derivar || vmd.data.es_para)
                    return DataService.get(restUrl + 'plantillasFormly/plantilla_formly/?fields=id_plantilla_formly,nombre,abreviacion&sort=nombre&estado=ACTIVO&limit=10000')
                return;
            })
            .then(function (respuesta) {
                if(respuesta){
                    vmd.data.plantillas_disponibles = respuesta.datos.resultado;
                }
            });

            if(vmd.data.es_derivar){
                DataService.get(restUrl + 'historialFlujo/'+vmd.data.dc.id_documento+'/ultimo')
                .then(function (resultado) {
                    vmd.data.usuario_proveido = resultado.datos.nombres+' '+resultado.datos.apellidos;
                })
            }

        }

        function aprobar(text) {
            var datos = { usuario: cuenta.id };
            var sw_crear = text=='crear';
            if(vmd.data.es_para) {

                datos.usuario_derivar = vmd.data._usuario_seleccionado;
                if(text=='aprobar') {
                    text = 'aprobar y cerrar';
                    datos.derivar = false;
                }
                if(text=='derivar'){
                    text = 'aprobar y derivar';
                    datos.observaciones = vmd.data.observaciones;
                    datos.derivar = true;
                }
                if(sw_crear){
                    text = 'aprobar y luego crear documento';
                    datos.usuario_derivar = datos.usuario;
                    datos.observaciones = '';
                    datos.derivar = true;
                }
            }
            Modal.confirm('¿Esta seguro de que quiere '+text+'?', function () {
                DataService.put( restUrl+'plantillasFormly/documento/'+data.id+"/aprobar", datos)
                .then(function (respuesta) {
                    Message.show(respuesta.tipoMensaje, respuesta.mensaje);
                    if (sw_crear) {
                      DataService.get(restUrl + 'plantillasFormly/plantilla_formly/'+vmd.data._plantilla_seleccionada.id_plantilla_formly)
                      .then(function (respuesta) {
                        respuesta.datos.documento_padre = data.id;
                        respuesta.datos.grupo = data.dc.grupo;
                        Storage.setSession("pl", respuesta.datos);
                        $location.path('documento/0');
                        $mdDialog.cancel();
                      });
                      $timeout(function(){ angular.element('#btn-refresh-crudtable').click(); });
                      cerrar();
                    }else{
                        $timeout(function(){ angular.element('#btn-refresh-crudtable').click(); });
                        cerrar();
                    }
                });
            });
        }

        function observar() {
            var datos = {
                usuario: cuenta.id,
                observaciones: vmd.data.observaciones,
                observado_por: cuenta.first_name+' '+cuenta.last_name
            };
            Modal.confirm('¿Esta seguro de que quiere observar?', function(){
              DataService.put( restUrl+'plantillasFormly/documento/'+data.id+"/rechazar", datos)
              .then(function (respuesta) {
                Message.show(respuesta.tipoMensaje, respuesta.mensaje);
                $timeout(function(){ angular.element('#btn-refresh-crudtable').click(); });
                cerrar();
              });
            });
        }

        function derivar(){
            Modal.confirm('¿Esta seguro de que quiere derivar?', function(){
                var datos = {
                    usuario: cuenta.id,
                    destino: vmd.data._usuario_seleccionado,
                    observaciones: vmd.data.observaciones
                };
                DataService.put( restUrl+'plantillasFormly/documento/'+data.id+"/derivar", datos)
                .then(function (respuesta) {
                    Message.show(respuesta.tipoMensaje, respuesta.mensaje);
                    $timeout(function(){ angular.element('#btn-refresh-crudtable').click(); });
                    cerrar();
                });
            });
        }

        function openSelect(ev){
            angular.element(ev.currentTarget).next().children()[0].click();
            vmd.data.show_select = true;
        }

        function crear(p) {
            DataService.get(restUrl+'plantillasFormly/documento/?documento_padre='+data.id)
            .then(function (respuesta) {
                if(respuesta.datos.total==0){
                  if(angular.isDefined(p) && p){
                    aprobar('crear');
                  }
                  else {
                    Modal.confirm('¿Esta seguro de que quiere crear '+vmd.data._plantilla_seleccionada.nombre+'?', function () {
                      DataService.get(restUrl + 'plantillasFormly/plantilla_formly/'+vmd.data._plantilla_seleccionada.id_plantilla_formly)
                      .then(function (respuesta) {
                          respuesta.datos.documento_padre = data.id;
                          respuesta.datos.grupo = data.dc.grupo;
                          Storage.setSession("pl", respuesta.datos);
                          $location.path('documento/0');
                          $mdDialog.cancel();
                      });
                      cerrar();
                    });
                  }

                }

                else{
                    var doc = respuesta.datos.resultado[0];
                    var html = '';
                    html+= 'El documento ya tiene respuesta!!<br>';
                    html+= 'Si quiere crear otra tiene que borrar la actual <br>';
                    html+= 'Nombre: '+doc.nombre+' <br>';
                    html+= 'Tipo de documento: '+doc.nombre_plantilla+' <br>';
                    html+= 'Estado: '+doc.estado+' <br>';
                    html+= 'Fecha de creación: '+Datetime.format(doc._fecha_creacion)+' <br>';
                    Modal.alert(html);
                    $location.path('documentos');
                }


            })



        }

        function verDocumento(id_doc) { Documento.showPdfId(id_doc, false); }
        function cerrar(){ $mdDialog.cancel(); }
    }

  }
})();
