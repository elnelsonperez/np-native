## NP PMS Mobile App Software
Aplicacion utilizada en Android para el NP PMS.
Desarrollado por Nelson Pérez y Nathaly Persia como proyecto de grado. 2017-2018.

Para solicitar documentacion adicional sobre algo, enviame un email a 
me@nelsonperez.net

##### Recomendaciones previas
Esta app esta creada con React Native. Las ventajas que propone este hecho, 
es que se puede desarrollar una aplicacion nativa en Android y iOS utilizando Javascript.

Es **muy** importante hecharle muy buen ojo y entender lo siguiente:

* [Que es React?](https://www.desarrolloweb.com/articulos/que-es-react-motivos-uso.html)
* [React Native](https://facebook.github.io/react-native/)
* [React Native for Beginners](https://medium.com/techtrument/react-native-for-beginners-8b6e185e12f9)
* [Mobx](https://mobx.js.org/)

##### Comunicacion con el NP HUB
La app se conecta con el hub utilizando un modulo nativo creado en Java,
llamado BluetoothModule. Se encuentra en el directorio`android/app/src/main/java/com/nppms`.

Es improbable que se tenga que modificar este archivo, ya que todos los metodos necesarios para
trabajar con el Bluetooth se encuentran en `app/components/Bluetooth/BluetoothModule.js`.
La fucion `sendMessage` de este objeto sirve para enviar mensajes de tipo `BtMessage` al hub, y la
funcion `on` permite escuchar cualquiera de los siguientes eventos:

* BT_STATUS_CHANGED : Estado del adaptador de bluetooth cambio.
* STATUS_CHANGED : Estado de la conexion bluetooth cambio.
* DATA_RECEIVED : Data enviada por el hub ha sido recibida.
* SEARCHING : Se esta buscando una conexion con el hub.
* CONNECTION_ATTEMP : Se intento conectar con el hub.

El evento mas importante aqui es DATA_RECEIVED, ya que es el evento que trae consigo la data enviada
desde el nphub.

El objeto **BluetoothConnector** del directorio `app/components/Bluetooth` es el que se comunica 
con el **BridgeService** del Nphub. Osea, que todo lo que se envia desde el celular llega al
**BridgeService** y todo lo que se envia desde el hub llega al **BluetoothConnector**.

El BluetoothConnector lo que hace es mapear los mensajes que vengan desde el hub que ean de cierto tipo
a ciertas funciones del [store de Mobx](https://mobx.js.org/getting-started.html) de la app, 
y el store tiene acciones que pueden ser llamadas desde cualquier parte de la app y envian mensajes
al hub. 