(function() {
    'use strict';

    angular
    .module('app')
    .factory('Panel', ['$mdPanel', '$document',PanelFactory]);

    /** @ngInject */
    function PanelFactory($mdPanel, $document) {

        var factory = {
            show : show
        };

        return factory;

        function show(config) {
            // console.log(config);

            var position = null;
            // delete config.event;
            if(config.event){
                position = $mdPanel.newPanelPosition()
                .relativeTo(config.event.currentTarget)
                .addPanelPosition($mdPanel.xPosition.ALIGN_END, $mdPanel.yPosition.BELOW);
            }else {
                position = $mdPanel.newPanelPosition().absolute().center();
            }
            // console.log(position);

            var default_template = 'app/factories/Panel/defaultPanelTemplate.html';

            var settings = {
                    attachTo: angular.element($document[0].body),
                    controller: config.controller || ['$scope', '$log', PanelController],
                    templateUrl: config.templateUrl || default_template,
                    panelClass: 'md-panel',
                    position: position,
                    locals: {
                        data: config.data || ''
                    },
                    openFrom: config.event,
                    clickOutsideToClose: angular.isUndefined(config.clickOutsideToClose) ? true : config.clickOutsideToClose,
                    escapeToClose: angular.isUndefined(config.clickOutsideToClose) ? true : config.clickOutsideToClose,
                    focusOnOpen: true
                    // zIndex: 2
                };

            if (config.event) {
                settings.targetEvent = config.event;
            }

            $mdPanel.open(settings);

            // var settings = {
            //     controller: config.controller || ['$scope', '$mdDialog', 'data', 'fields', 'title', 'add', 'column', 'done', DialogController],
            //     templateUrl: config.templateUrl || '',
            //     parent: angular.element('body'),
            //     clickOutsideToClose:typeof config.clickOutsideToClose == 'undefined' ? true : config.clickOutsideToClose,
            //     escapeToClose:typeof config.escapeToClose == 'undefined' ? true : config.escapeToClose,
            //     locals: {
            //         data: config.data || '',
            //         fields: config.fields || '',
            //         title: config.title || '',
            //         add: config.add || '',
            //         column: config.column || 1,
            //         done: config.done || function () {}
            //     }
            // };
            // if (config.event) {
            //     settings.targetEvent = config.event;
            // }
            // $mdDialog.show(settings)
            // .then(function () {}, function() {
            //     if (config.close) {
            //         config.close();
            //     }
            // });
        }

        function PanelController($scope, $log) {
            $log.info("hola desde controller default, introduzca su controller");
        }

        // BasicDemoCtrl.prototype.showMenu = function(ev) {
        //     var position = this._mdPanel.newPanelPosition()
        //     .relativeTo('.demo-menu-open-button')
        //     .addPanelPosition(this._mdPanel.xPosition.ALIGN_START, this._mdPanel.yPosition.BELOW);
        //
        //     var config = {
        //         attachTo: angular.element(document.body),
        //         controller: PanelMenuCtrl,
        //         controllerAs: 'ctrl',
        //         template:
        //         '<div class="demo-menu-example" ' +
        //         '     aria-label="Select your favorite dessert." ' +
        //         '     role="listbox">' +
        //         '  <div class="demo-menu-item" ' +
        //         '       ng-class="{selected : dessert == ctrl.favoriteDessert}" ' +
        //         '       aria-selected="{{dessert == ctrl.favoriteDessert}}" ' +
        //         '       tabindex="-1" ' +
        //         '       role="option" ' +
        //         '       ng-repeat="dessert in ctrl.desserts" ' +
        //         '       ng-click="ctrl.selectDessert(dessert)"' +
        //         '       ng-keydown="ctrl.onKeydown($event, dessert)">' +
        //         '    {{ dessert }} ' +
        //         '  </div>' +
        //         '</div>',
        //         panelClass: 'demo-menu-example',
        //         position: position,
        //         locals: {
        //             'selected': el.selected,
        //             'desserts': el.desserts
        //         },
        //         openFrom: ev,
        //         clickOutsideToClose: true,
        //         escapeToClose: true,
        //         focusOnOpen: false,
        //         zIndex: 2
        //     };
        // }
    }
})();
