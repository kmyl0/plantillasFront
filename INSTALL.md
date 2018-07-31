.:: Plantillas Formly Frontend ::.
=================================================

A continuación se detalla la instalación de la aplicación frontend desde cero.

## A. INSTALACIÓN DE DEPENDENCIAS

Se requiere tener instaladas las siguientes dependencias: git, nvm, node (ver INSTALL.md del proyecto backend).

### 1. Activar nodejs

    $ nvm use 6.9.x

### 2. Instalar las siguientes dependencias: gulp, bower

    npm install -g gulp bower

### 3. Instalar generator-gulp-angular (para desarrollo)

    npm install -g generator-gulp-angular

## B. INSTALACIÓN EN DESARROLLO

### 1. Clonar el proyecto por ssh

    $ git clone git@gitlab.geo.gob.bo:agetic/plantillas-formly-frontend.git

### 2. Instalar dependencias bower

Ingresar al directorio plantillas-formly-frontend

    $ bower install

### 3. Instalar dependencias npm

    $ npm install

### 4. Iniciar el proyecto

    $ gulp serve


## C. INSTALACIÓN EN PRODUCCIÓN

### 1. Instalación de apache

    $ sudo apt-get install apache2

### 2. Modificar la configuracion de apache

    $ sudo nano /etc/apache2/sites-enabled/000-default.conf

Cambiar la linea

    DocumentRoot /var/www/html

Por

    DocumentRoot /var/www/html/plantillas

Reiniciar apache

    $ sudo /etc/init.d/apache2 restart

### 3. Clonar el proyecto por https

Moverse a la misma carpeta donde esta plantillas-formly-backend y ejecutar el siguiente comando (Nos pedira usuario y contraseña de git)

    $ git -c http.sslVerify=false clone https://gitlab.geo.gob.bo/agetic/plantillas-formly-frontend.git

### 4. Instalar dependencias npm

Ingresar a la carpeta _plantillas-formly-frontend_ y ejecutar el siguiente comando

    $ npm install

### 5. Instalar dependencias bower

En este caso nos perdirá confirmaciones con opciones, se debe elegir siempre el número en que este la opción __app__

    $ bower install

### 6. Modificar el archivo _index.constants.js_

    $ nano src/app/index.constants.js

Asegurarse que las constantes authUrl, restUrl y backUrl deben apuntar al backend, por ejemplo:

    .constant('timeAutoSave', 10) // tiempo de autoguardado de documentos en minutos
    .constant('authUrl', 'http://institucion.gob.bo/backend/autenticar') // Auth
    .constant('restUrl', 'http://institucion.gob.bo/backend/api/v1/') // Rest Api Backend
    .constant('backUrl', 'http://institucion.gob.bo/backend/') // Backend

### 7. Generar el codigo minificado del proyecto (se creará la carpeta _dist_) y crear la carpeta _produccion_

    $ gulp build
    $ mkdir produccion

### 8. Renombrar la carpeta _dist_ a _plantillas_ y moverla  dentro de _produccion_

    $ mv dist plantillas
    $ mv plantillas produccion/

### 9. Crear un enlace simbólico al proyecto compilado

    $ sudo ln -s /home/ejimenez/proyecto-formly/plantillas-formly-frontend/produccion /var/www/html/plantillas

### 10. Actualizar el archivo index.html

Modificar _index.html_ del proyecto ejecutando

    $ nano produccion/plantillas/index.html

Nos movemos a la ultima linea y pulsando la tecla fin o end vamos al final de la linea en la cual debe estar algo asi:

    <script src=maps/scripts/app-893833878e.js.map></script></body></html>

Modificamos esa parte por esta, quitando el maps/  y la extension _.map_ :

    </script><script src=scripts/app-893833878e.js></script></body></html>

Hacer lo mismo con el script que esta a lado izquierdo, pulsando la tecla flecha izquierda hasta encontrar y le quitamos los _map_:

    encontrar: </footer><script src=maps/scripts/vendor-0828849e53.js.map>
    modificar a: </footer><script src=scripts/vendor-0828849e53.js>

Pulsar _ctrl+x_ , luego la tecla _y_, finalmente la tecla enter

## D. Implementar seguridad en apache 2.4.10 - debian 8.x

Los siguientes cambios afectarán a todos los virtual hosts del servidor apache

### Eliminar información de servidor y modificar headers de respuesta

    $ sudo nano /etc/apache2/apache2.conf

Añadir al final del archivo las lineas

    #Eliminan informacion del servidor
    #En paginas 404, 500 u otro que genera apache
    ServerSignature Off

    #En Headers de peticiones
    ServerTokens Prod

    #Modifican informacion de headers
    <IfModule mod_headers.c>
            Header set X-XSS-Protection "1; mode=block"
            Header set X-Content-Type-Options "nosniff"
            Header set X-Frame-Options sameorigin
            Header unset "X-Powered-By"
    </IfModule>

Habilitar el modulo headers

    sudo a2enmod headers

Reiniciar el servicio de apache2

    sudo /etc/init.d/apache2 restart
