(function() {
    'use strict'

    angular
    .module('app')
    .factory('RouteValidator', ['$rootScope', 'Storage', 'Message', 'ExpirationTime', RouteValidatorFactory]);

    /** @ngInject */
    function RouteValidatorFactory($rootScope, Storage, Message, ExpirationTime) {

        var factory = {
            init: init
        };

        return factory;

        function init(){
            $rootScope.$on('$stateChangeStart', onStateChangeStart); // eslint-disable-line angular/on-watch
        }

        /**
            Funcion que se activa cada vez que se quiere cambiar de localizacion de vista
            @param {Objeto} ev Evento cambiar de localizacion
            @param {Objeto} toState Objeto con datos de la url a la que se quiere ir
            @param {Objeto} toParams Objeto con los parametros de la url a la que se quiere ir
            @param {Objeto} fromState Objeto con datos de la url en la se encuentra actualmente
        */
        function onStateChangeStart(ev, toState, toParams, fromState){

            if (fromState.url !== "^" && toState.url!=="/login") {
                // console.log("origen->"+fromState.url);
                // console.log("destino->" +toState.url);

                var user = Storage.getUser();
                var existeUsuario = (user !== null)? true : false;
                // console.log(user);

                var menus = Storage.getSession('menu');
                var rutaPermitida = true;
                // console.log(menus);

                if(fromState.url==="/login" && toState.url!=="/login" && !existeUsuario){
                    Message.error('Usted no esta autorizado para acceder a la vista.');
                    ev.preventDefault();
                    return;
                }else {
                    rutaPermitida = (toState.url === "/")? true : false;
                    if(toState.url==="/profile") rutaPermitida = true;
                    if(toState.url==="/vista_pdf") rutaPermitida = true;
                    // rutaPermitida = true;
                    if(existeUsuario && !rutaPermitida){
                        for (var i = 0; i < menus.length; i++) {
                            for (var j = 0; j < menus[i].submenu.length; j++) {
                                // console.log("submenu "+"/"+menus[i].submenu[j]);
                                if(tienePermiso(menus[i].submenu[j].url, toState.url)){
                                    rutaPermitida = true;
                                }
                            }
                        }
                    }

                    if(toState.url!=='/documento/:idDocumento') ExpirationTime.stopAutoSave();
                    // console.log(existeUsuario +"   "+ rutaPermitida);
                    if(!existeUsuario || !rutaPermitida){
                        Message.error('Usted no esta autorizado para acceder a la vista.');
                        ev.preventDefault();
                        return;
                    }
                }
            }
            // console.log("sigue el curso");
        }

        function tienePermiso(ruta, ruta_destino) {
            // console.log("sm-> " + ruta);
            var submenu_rutas = {
                "plantillas": {
                    "/plantillas": true,
                    "/plantilla/:idPlantilla": true
                },
                "usuario": {
                    "/usuario": true
                },
                "rol": {
                    "/rol": true
                },
                "menu": {
                    "/menu": true
                },
                "documentos": {
                    "/documentos": true,
                    "/documento/:idDocumento": true
                },
                "aprobacion": {
                    "/aprobacion": true
                },
                "progreso": {
                    "/progreso": true
                },
                "impresion": {
                    "/impresion": true
                },
                "en_curso": {
                    "/en_curso": true
                },
                "monitoreo": {
                    "/monitoreo": true
                }
            }
            if(angular.isDefined(submenu_rutas[ruta])){
                if(angular.isDefined(submenu_rutas[ruta][ruta_destino]))
                    return submenu_rutas[ruta][ruta_destino];
            }
            return false;
        }

    }
})();
