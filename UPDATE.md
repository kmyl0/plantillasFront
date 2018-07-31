.:: Plantillas Formly Frontend ::.
=================================================

A continuación se detalla la actualizacionón de la aplicación.

## ACTUALIZACIÓN DE LA APLICACIÓN

### Actualizar el proyecto

Ingresar al directorio 'plantillas-formly-frontend' y activar node

Ejecutar el siguiente comando:

    $ git pull origin master

Después ejecutar:

    $ gulp build

Verficar la creación de la carpeta dist, renombrar la carpeta dist a plantillas:

    $ ls
    $ mv dist plantillas

Eliminar la carpeta actual del proyecto y mover la carpeta plantillas a produccion

    $ rm -rf produccion/plantillas
    $ mv plantillas produccion/

### Actualizar el archivo index.html

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
