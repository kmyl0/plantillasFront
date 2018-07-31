(function() {
  'use strict';

  angular
    .module('app')
    .controller('MonitoreoController', MonitoreoController);

  /** @ngInject */
  function MonitoreoController(charColors, DataService, restUrl) {
      var vm = this,
        fecha_actual = new Date(),
        limite_inferior = 1880,
        limite_superior = 2130;

      iniciar();
      reiniciarChart();
      vm.refrescarChart = refrescarChart;
      vm.reiniciarChart = reiniciarChart;
      vm.paginar = paginar;

      function iniciar() {
          vm.chart = {};

          vm.graficos = [
              {
                  cod: 0,
                  nombre: 'Cantidad de documentos por mes',
                  labelChart: '# Visitas por dia',
                  tipoChart: 'line'
              },
              {
                  cod: 1,
                  nombre: 'Usuarios que mas documentos ven',
                  labelChart: 'Usuario mas concurrentes',
                  tipoChart: 'bar'
              },
              {
                  cod: 2,
                  nombre: 'Documentos mas vistos',
                  labelChart: 'Documentos mas vistos',
                  tipoChart: 'bar'
              },
              {
                  cod: 3,
                  nombre: 'Documentos que mas ve un usuario',
                  labelChart: 'Documentos mas visitados',
                  tipoChart: 'bar'
              }
          ];
          vm.grafico = vm.graficos[0];
          vm.mes = fecha_actual.getMonth();
          vm.meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
          vm.anio = fecha_actual.getFullYear()-limite_inferior;
          vm.anios = [];
          for (var i = limite_inferior-1; i < limite_superior; i++) vm.anios.push(i+1);

          DataService.get(restUrl+'seguridad/usuario/?fields=id_usuario,usuario,nombres,apellidos&order=nombres')
          .then(function (respuesta) {
              vm.usuarios = respuesta.datos.resultado;
              vm.usuario = vm.usuarios[0].id_usuario;
          })
      }

      function reiniciarChart() {
          vm.chart.tipo = vm.grafico.tipoChart;
          vm.chart.datos = {
              labels: [],
              datasets: [
                  {
                      label: vm.grafico.labelChart + ' total.',
                      data: [],
                      backgroundColor: charColors.bg.amarillo,
                      borderColor: charColors.bo.amarillo,
                      borderWidth: 1
                  },
                  {
                      label: vm.grafico.labelChart + ' con relación.',
                      data: [],
                      backgroundColor: charColors.bg.verde,
                      borderColor: charColors.bo.verde,
                      borderWidth: 1
                  },
                  {
                      label: vm.grafico.labelChart + ' sin relación.',
                      data: [],
                      backgroundColor: charColors.bg.azul,
                      borderColor: charColors.bo.azul,
                      borderWidth: 1
                  }
              ]
          };
          vm.chart.reiniciar = !vm.chart.reiniciar;
          vm.page = 1;
          vm.page_cant = 20;
          vm.page_text = ''+((vm.page-1)*vm.page_cant+1)+'-'+(vm.page*vm.page_cant);
          vm.page_tot = 1;
          refrescarChart();
      }

      function refrescarChart() {
          var anio=vm.anio+limite_inferior, mes=vm.mes+1;
        //   var tipo = ['doc_mes','usu_max', 'doc_max','usu_doc_max'][vm.grafico.cod];
          var url_get = [
              restUrl+'monitoreo/global/?anio='+anio+'&mes='+mes,
              restUrl+'monitoreo/usuario/?anio='+anio+'&mes='+mes+'&page='+vm.page,
              restUrl+'monitoreo/documento/?anio='+anio+'&mes='+mes+'&page='+vm.page,
              restUrl+'monitoreo/'+vm.usuario+'/documento/?anio='+anio+'&mes='+mes
          ];
          DataService.get(url_get[vm.grafico.cod])
          .then(function (respuesta) {
              vm.chart.datos.labels = respuesta.datos.nombres;
              vm.chart.datos.datasets[0].data = respuesta.datos.global;
              vm.chart.datos.datasets[1].data = respuesta.datos.relacionado;
              vm.chart.datos.datasets[2].data = respuesta.datos.no_relacionado;
              vm.chart.actualizar=!vm.chart.actualizar;
              vm.page_tot = respuesta.datos.total;
          })
      }

      function paginar(acc) {
          if(acc=='aa')
              vm.page = 1;
          if(acc=='a')
              vm.page--;
          if(acc=='s')
              vm.page++;
          if(acc=='ss')
              vm.page = Math.ceil(vm.page_tot/vm.page_cant);
          vm.page_text = ''+((vm.page-1)*vm.page_cant+1)+'-'+(((vm.page*vm.page_cant)>vm.page_tot)? vm.page_tot: vm.page*vm.page_cant);
          refrescarChart();
      }

  }
})();
