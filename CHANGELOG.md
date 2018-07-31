.:: Plantillas Formly Frontend ::.
==================================

|

A continuación se detalla el historial de cambios desde la fecha .

### [v1.1.0] -- 22-02-2017

#### Añadido

- Añadido componente chartGraph para mostrar graficos de estadistica con chart.js
- Vista monitoreo para ver gráficos

#### Modificado

- Colores y tabs en dialog de aprobacion


### [v1.0.2] -- 17-02-2017

#### Añadido

- Añadido tooltip a la lista de documentos en misdocumentos, en_curso, apaobados
- Añadido editar configuracion de notificaciones
- Se añadio como opción poder visualizar html en el dialog de PDF's, en celulares se puede descargar el PDF
- Se añadio un boton para poder duplicar documentos
- Se añadio componente archivo, que sirve para subir archivos al servidor
- Se añadio la funcion de derivar documentos y/o crear documentos respuesta
- Se añadio la interfaz para visualizar el historial de aprobaciones, derivaciones, etc.
- Se añadio la funcion de autoguardado en los documentos que se crean o modifican con intervalo de 10 min

#### Modificado

- Colores y tabs en dialog de aprobacion
- Modificado simditor, para que no depende de la libreria, ademas su manejo de tablas
- Forma de ver PDF's ahora es consumido desde rest para los Usuarios
- Modificado la forma de controlar el tiempo de expiración
- Paleta de simditor y el doccumento su posición a fixed
- Modificado el uso del storage en el frontend, cambiandolo todo a Session Storage
- Modificado install.md y update.md para implementar seguridad de headers en apache2
