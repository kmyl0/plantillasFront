(function() {
    'use strict'

    angular
    .module('app')
    .factory('fUsuarios', ['$rootScope', 'Storage', 'Message', UsuariosFactory]);

    /** @ngInject */
    function UsuariosFactory(Storage, DataService, restUrl) {

        var factory = {
            usuarios: null,
            // funciones
            init: init
        };

        return factory;


        /**
          Funcion que transforma los string de la lista_valores a datepicker
          @param {Array} lista_templates Lista de objetos formato formly
          @param {Array} lista_valores Lista de objetos que son valores de los templates
        */
        function init(){
            var ousuarios = {};
            if(factory.usuarios==null){
                DataService.get(restUrl + 'seguridad/usuario/')
                .then(function (resultado) {
                    for (var i = 0; i < resultado.datos.length; i++) {
                        ousuarios[resultado.datos[i].id_usuario] = {
                            id: resultado.datos[i].id_usuario,
                            name: resultado.datos[i].nombres+" "+resultado.datos[i].apellido_paterno+" "+resultado.datos[i].apellido_materno
                        };
                    }
                });
            }
        }

    }
})();
