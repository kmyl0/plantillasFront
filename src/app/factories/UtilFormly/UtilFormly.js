(function() {
    'use strict'

    angular
    .module('app')
    .factory('UtilFormly', UtilFormlyFactory);

    /** @ngInject */
    function UtilFormlyFactory() {

        var factory = {
            getConfigItem: getConfigItem,
            parse: parse,
            listToForm: listToForm,
            filterDates: filterDates,
            newTemplate: newTemplate,
            dataToView: dataToView,
            sizeObj: sizeObj,
            recursiveShowError: recursiveShowError,
            disableForm: disableForm

        };

        load_templates();

        return factory;

        /**
          Funcion que crea un nuevo template
          @param {String} tipo Tipo de template que se quiere crear
        */
        function newTemplate(tipo) {
            return parse(this.templates[tipo].template);
        }

        function sizeObj(o) {
            return Object.keys(o).length;
        }
        function recursiveShowError(error) {
            for (var k in error) {
                for (var i = 0; i < error[k].length; i++) {
                    if(angular.isDefined(error[k][i].$submitted)){
                        error[k][i].$submitted = true;
                        recursiveShowError(error[k][i].$error);
                    }else {
                        if(error[k][i].$setTouched)
                            error[k][i].$setTouched(true);
                    }
                }
            }
        }

        /**
          Funcion que transforma los string de la lista_valores a datepicker
          @param {Array} lista_templates Lista de objetos formato formly
          @param {Array} lista_valores Lista de objetos que son valores de los templates
        */
        function filterDates(lista_templates, lista_valores) {
            for (var j = 0; j < lista_templates.length; j++) {
                //cuando en la lista de templates exista uno de tipo datepicker
                //hay que cambiar de tipo String a Objeto Date
                if (lista_templates[j].type == "datepicker") {
                    var nombre = lista_templates[j].templateOptions.label;
                    if(lista_valores.hasOwnProperty(nombre)){
                        lista_valores[nombre] = new Date(lista_valores[nombre]);
                    }
                }
            }
        }
        /**
          Funcion que crea un array de templates formly tranformado
          @param {Array} data Array de objetos formly
          @param {Objeto} model contiene los valores para todos los keys de cada template
        */
        function dataToView(data, model) {
            var elem;
            var form = [];
            var keys = {}; // variable para controlar que no existan keys iguales
            for (var i = 0; i < data.length; i++) {
                if (data[i].type=="layout") {
                    var fg = parse(data[i]);
                    var clase = " flex-"+parseInt(100/fg.elementAttributes['num-cols']);
                    delete fg.type;
                    delete fg.elementAttributes['num-cols'];
                    fg.fieldGroup = [];
                    for (var j = 0; j < data[i].fieldGroup.length; j++) {
                        elem = getConfigItem(data[i].fieldGroup[j]);
                        elem.className += clase;
                        changeElement(elem, keys, model);
                        fg.fieldGroup.push(elem);
                    }
                    form.push(fg);
                }else {
                    elem = getConfigItem(data[i]);
                    changeElement(elem, keys, model);
                    form.push(elem);
                }
            }

            return form;
        }
        /**
          Funcion deshabilita/habilita todos los campos de un formulario
          @param {Array} data Array de objetos formly
          @param {Boolean} val True/false
        */
        function disableForm(data, val) {
            angular.forEach(data, function(field) {
                if (angular.isDefined(field.fieldGroup)) {
                    for (var i = 0; i < field.fieldGroup.length; i++) {
                        if(field.fieldGroup[i].templateOptions)
                            field.fieldGroup[i].templateOptions.disabled = val;
                    }
                }else {
                    if(field.templateOptions)
                        field.templateOptions.disabled = val;
                }
            });
        }


        /**
          Funcion que modifica la estructura de un elemento, ademas tranforma de cadena a Date del modelo de la plantilla
          @param {Template} elem template formly
          @param {Objeto} keys Objeto que representa un arbol de tipos de formly, para ir incrementando sus keys
          @param {Objeto} model contiene los valores para todos los keys de cada template
        */
        function changeElement(elem, keys, model) {
            if(angular.isUndefined(keys[elem.type])){
                keys[elem.type] = 1;
                elem.key = elem.type + "-0";
            } else {
                elem.key = elem.type +"-"+ keys[elem.type];
                keys[elem.type]++;
            }
            if(elem.type === "radio"){
                elem.templateOptions.className = "layout layout-wrap";
            }
            if(elem.type === "datepicker" && angular.isDefined(model)){
                model[elem.key] = new Date(model[elem.key]);
            }
            if(elem.type === "textarea"){
                elem.templateOptions.grow = true;
            }

            if(elem.templateOptions){
                var validation = {};
                if(elem.templateOptions.required){
                    validation = {messages:{ required: '"Debe llenar este campo."' }};
                }

                if( elem.type==="input" && elem.templateOptions.pattern!==null ){
                    var idx = {
                        '([a-zA-Zñáéíóú]+ ?)+': 0,
                        '\\d+': 1,
                        '([a-zA-Z0-9ñáéíóú]+ ?)+': 2,
                        '^(([^<>()\\[\\]\\\\.,;:\\s@"]+(\\.[^<>()\\[\\]\\\\.,;:\\s@"]+)*)|(".+"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$': 3
                    };
                    // console.log(idx[elem.templateOptions.pattern]);
                    if(elem.templateOptions.required){
                        switch (idx[elem.templateOptions.pattern]) {
                            case 0: validation.messages.pattern = '"El campo debe contener solo palabras separadas por un espacio."';  break;
                            case 1: validation.messages.pattern = '"El campo debe contener solo números."';  break;
                            case 2: validation.messages.pattern = '"El campo debe contener palabras y números separadas por un espacio."';  break;
                            case 3: validation.messages.pattern = '"El campo debe ser un email válido."';  break;
                        }
                    }else {
                        switch (idx[elem.templateOptions.pattern]) {
                            case 0: validation = {messages:{ pattern: '"El campo debe contener solo palabras separadas por un espacio."' }};  break;
                            case 1: validation = {messages:{ pattern: '"El campo debe contener solo números."' }};  break;
                            case 2: validation = {messages:{ pattern: '"El campo debe contener palabras y números separadas por un espacio."' }};  break;
                            case 3: validation = {messages:{ pattern: '"El campo debe ser un email válido."' }};  break;
                        }
                    }
                    elem.validation = validation;
                }
            }
        }
        /**
          Funcion que añade clases a la lista de templates para que se renderizen dividos por columnas
          @param {Array} lista_templates Lista de objetos formato formly
          @param {Objeto} config configuracion que tendra el formulario tiene columnas y deshabilitar
          @return {Array} formulario Lista de objetos, que son la transformacion de la lista de templates
        */
        function listToForm(lista_templates, config) {

            var nro_columnas = config.columnas || 1;

            var clase='flex-gt-sm-' + parseInt(100/nro_columnas);
            // console.log(lista_templates.length+"/"+nro_columnas+"="+(parseInt( lista_templates.length / nro_columnas ) + 1 ));
            var nro_filas = parseInt( lista_templates.length / nro_columnas ) + 1;

            var formulario = [];
            for (var i = 0; i < nro_filas; i++) {
                formulario.push({
                    "elementAttributes": {
                        "layout-gt-sm": "row",
                        "layout": "column",
                        "layout-align-gt-sm": "start end"
                    },
                    "fieldGroup": []
                });
            }
            i = 0;
            var k = 0;
            while ( i < lista_templates.length ) {
                var j = 0;
                while (i < lista_templates.length && j < nro_columnas ) {

                    lista_templates[i].className = clase;

                    // Hacemos que el key de cada elemento sea su label
                    if(lista_templates[i].templateOptions.label === "" || lista_templates[i].templateOptions.label === null){
                        lista_templates[i].key = lista_templates[i].templateOptions.placeholder;
                    }
                    else lista_templates[i].key = lista_templates[i].templateOptions.label;


                    if(lista_templates[i].type === "radio"){
                        lista_templates[i].templateOptions.className = "layout layout-wrap";
                    }

                    if(config.deshabilitar || false){
                        lista_templates[i].templateOptions.disabled = true;
                    }else {
                        lista_templates[i].templateOptions.disabled = false;
                    }
                    if(config.todoMayuscula || false){
                        if(lista_templates[i].type === "input"){
                            var onkeyup = 'model["' + lista_templates[i].key + '"] = model["' + lista_templates[i].key + '"].toUpperCase()';
                            lista_templates[i].templateOptions.onKeyup = onkeyup;
                        }
                    }

                    if(config.validacion || false){
                        if(lista_templates[i].type === "input" || lista_templates[i].type === "datepicker"){
                            lista_templates[i].validation = {
                                messages: {
                                    required: '"Debe llenar este campo."'
                                    // required: '"El campo " + to.label + " es requerido"'
                                }
                            }
                        }
                    }

                    formulario[k].fieldGroup.push(getConfigItem(lista_templates[i]));
                    i++;
                    j++;
                }
                k++;
            }

            return formulario;
        }

        /**
        Funcion que obtiene el template limpio de un elemento
        */
        function getConfigItem(item){
            if(item.type=='layout') return parse(item);
            var obj = {
                type: item.type,
                key: item.key,
                className: parse(item.className),
                templateOptions: parse(item.templateOptions),
                validation: parse(item.validation)
            }
            return obj;
        }
        /**
        Funcion que copia un objeto, pero perdiendo la referencia
        */
        function parse(data) {
            return angular.fromJson(angular.toJson(data));
        }

        function load_templates() {
            // console.log(this);
            factory.templates = {
                input: {
                    template: {
                        type: "input",
                        key: "inputText",
                        templateOptions: {
                            type: "text",
                            label: "Campo de texto",
                            disabled: false
                        }
                    }
                },
                radio: {
                    template: {
                        type: "radio",
                        key: "inputRadio",
                        templateOptions: {
                            label: "Selección simple",
                            labelProp: "value",
                            valueProp: "id",
                            vertical:false,
                            options: [
                                {value: "opción 1", id: "opcion 1"},
                                {value: "opción 2", id: "opcion 2"}
                            ]
                        }
                    }
                },
                select: {
                    template: {
                        type: "select",
                        key: "inputSelect",
                        templateOptions: {
                            label: "Lista de selección",
                            multiple: false,
                            labelProp: "value",
                            valueProp: "id",
                            options: [
                                {value: "opción 1", id: "opcion 1"},
                                {value: "opción 2", id: "opcion 2"}
                            ]
                        }
                    }
                },
                select_multiple: {
                    template: {
                        type: "select",
                        key: "inputSelect",
                        templateOptions: {
                            label: "Lista de selección",
                            multiple: true,
                            labelProp: "value",
                            valueProp: "id",
                            options: [
                                { value: "opción 1", id: "opcion 1" },
                                { value: "opción 2", id: "opcion 2" }
                            ]
                        }
                    }
                },
                textarea: {
                    template: {
                        type: "textarea",
                        key: "inputTextArea",
                        // className: "ap-text-left",
                        templateOptions: {
                            label: "Area de texto",
                            rows: 2,
                            grow: false
                        }
                    }
                },
                checkbox: {
                    template: {
                        type: "checkbox",
                        key: "inputCheckBox",
                        templateOptions: {
                            label: "Casilla de verificación",
                            disabled: false
                        }
                    }
                },
                datepicker: {
                    template: {
                        type: "datepicker",
                        key: "inputDatePicker",
                        templateOptions: {
                            label: "Calendario"
                            // placeholder: "Calendario",
                            // minDate: minDate, // instance of Date
                            // maxDate: maxDate, // instance of Date
                            // filterDate: function(date) {
                            //     // only weekends
                            //     var day = date.getDay();
                            //     return day === 0 || day === 6;
                            // }
                        }
                    }
                },
                slider: {
                    template: {
                        type: "slider",
                        key: "inputSlider",
                        templateOptions: {
                            label: "Deslizador",
                            min: 1,
                            max: 5,
                            step: 0.5,
                            discrete: true
                        }
                    }
                },
                switch: {
                    template: {
                        type: "switch",
                        key: "inputSwitch",
                        templateOptions: {
                            label: "Interruptor"
                        }
                    }
                },
                chips: {
                    template: {
                        type: "chips",
                        key: "inputChips",
                        templateOptions: {
                            label: "Palabras clave",
                            placeholder: "+palabras",
                            secondaryPlaceholder: "Añadir palabras",
                            deleteButtonLabel: "Borrar",
                            deleteHint: "Borrar palabra"
                            // onAdd: function() {
                            //   console.log('new chip');
                            // },
                            // onRemove: function() {
                            //   console.log('chip removed');
                            // }
                        }
                    }
                },
                titulo: {
                    template: {
                        type: "texto",
                        key: "texto",
                        templateOptions: {
                            label: "Título",
                            tipo: "h2",
                            className: "ap-text-left",
                            mTop: true,
                            mBot: true
                        }
                    }
                },
                subtitulo: {
                    template: {
                        type: "texto",
                        key: "texto",
                        templateOptions: {
                            label: "Subtítulo",
                            tipo: "h3",
                            className: "ap-text-left",
                            mTop: true,
                            mBot: true
                        }
                    }
                },
                parrafo: {
                    template: {
                        type: "texto",
                        key: "parrafo",
                        templateOptions: {
                            label: "Texto del párrafo, texto del párrafo, texto del párrafo, texto del párrafo, texto del párrafo, texto del párrafo, texto del párrafo, texto del párrafo.",
                            tipo: "p",
                            className: "ap-text-justify",
                            mTop: true,
                            mBot: true
                        }
                    }
                },
                lista: {
                    template: {
                        type: "lista",
                        key: "lista",
                        templateOptions: {
                            label: "Lista de elementos",
                            className: "ap-text-left",
                            tipo: "ol",
                            options: [
                                "Elemento 1",
                                "Elemento 2"
                            ]
                        }
                    }
                },
                datosGenerales: {
                    template: {
                        type: "datosGenerales",
                        key: "datosGenerales",
                        templateOptions: {
                            labelw: 10,
                            labelRef: 'REF.:',
                            showItem: true,
                            show: {
                                para: true,
                                via: true,
                                de: true,
                                ref: true
                            }
                        }
                    }
                },
                encabezado: {
                    template: {
                        type: "encabezado",
                        key: "encabezado",
                        templateOptions: {
                            labelw: 10,
                            labelRef: 'REF.:',
                            show: {
                                para: true,
                                via: true,
                                de: true,
                                ref: true
                            }
                        }
                    }
                },
                documentosRelacionados: {
                    template: {
                        type: "documentosRelacionados",
                        key: "documentosRelacionados",
                        templateOptions: {
                            labelw: 10,
                            label: "Referencias:"
                        }
                    }
                },
                ccArchivo: {
                    template: {
                        type: "ccArchivo",
                        key: "ccArchivo",
                        templateOptions: {
                            labelw: 10,
                            label: "CC/Archivo:"
                        }
                    }
                },
                archivo: {
                    template: {
                        type: "archivo",
                        key: "archivo",
                        templateOptions: {
                            label: "Elegir PDF"
                        }
                    }
                },
                cite: {
                    template: {
                        type: "cite",
                        templateOptions: {
                            labelCite: 'CITE',
                            labelFecha: 'FECHA',
                            tipo: 'general',
                            numeracionPagina:'false',
                            tipoHoja:'Letter'
                        }
                    }
                },
                inputt: {
                    template: {
                        type: "inputt",
                        templateOptions: {
                            labelw: 20,
                            labelx: 'Asunto:'
                        }
                    }
                },
                editorTexto: {
                    template: {
                        type: "editorTexto",
                        templateOptions: {
                            label: 'jojojo'
                        }
                    }
                },
                layout: {
                    template: {
                        "type": "layout",
                        "elementAttributes": {
                            "num-cols": "2",
                            "layout-align": "start end",
                            "layout": "row"
                        },
                        "fieldGroup": []
                    }
                },
                vacio: {
                    template: {
                        type: "vacio",
                        templateOptions: {
                            height: 1,
                            style: {}
                        }
                    }
                }
            };
        }

    }
})();
