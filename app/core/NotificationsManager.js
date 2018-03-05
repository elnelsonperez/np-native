import PushNotification from "react-native-push-notification";
import {AppState} from 'react-native'
class NotificationsManager {

  constructor () {
    PushNotification.configure({
      onNotification: function(notification) {
        console.log( 'NOTIFICATION:', notification );
      },
      popInitialNotification: true,
      requestPermissions: true,
    });

  }

  newMessages () {
    if (AppState.currentState.match(/inactive|background/)) {
      PushNotification.localNotification({
        autoCancel: true, // (optional) default: true
        largeIcon: "ic_launcher", // (optional) default: "ic_launcher"
        smallIcon: "ic_notification", // (optional) default: "ic_notification" with fallback for "ic_launcher"
        subText: "Mensajes",
        vibrate: true, // (optional) default: true
        vibration: 300, // vibration length in milliseconds, ignored if vibrate=false, default: 1000
        ongoing: false,
        title: "Nuevo mensaje desde Destacamento",
        message: "Usted tiene mensajes nuevos",
        playSound: true, // (optional) default: true
        soundName: 'default', // (optional) Sound to play when the notification is shown. Value of 'default' plays the default sound. It can be set to a custom sound such as 'android.resource://com.xyz/raw/my_sound'. It will look for the 'my_sound' audio file in 'res/raw' directory and play it. default: 'default' (default sound is played)
        number: '10', // (optional) Valid 32 bit integer specified as string. default: none (Cannot be zero)
      });
    }
  }

  newIncidencia (incidencia) {
    if (AppState.currentState.match(/inactive|background/)) {
      PushNotification.localNotification({
        autoCancel: false, // (optional) default: true
        largeIcon: "ic_launcher", // (optional) default: "ic_launcher"
        smallIcon: "ic_notification", // (optional) default: "ic_notification" with fallback for "ic_launcher"
        subText: "Incidencias",
        vibrate: true, // (optional) default: true
        vibration: 1000, // vibration length in milliseconds, ignored if vibrate=false, default: 1000
        ongoing: false,
        title: "Nueva Incidencia Asignada",
        message: "Tipo: "+ incidencia.tipo.nombre + " | Priodidad: "+incidencia.prioridad.nombre,
        bigText: 'Tipo: '+incidencia.tipo.nombre+ ' | Sector: '+ incidencia.sector.nombre
        +' | Prioridad: '+incidencia.prioridad.nombre+ " | Distancia: "+incidencia.distancia,
        playSound: true,
        soundName: 'default', // (optional) Sound to play when the notification is shown. Value of 'default' plays the default sound. It can be set to a custom sound such as 'android.resource://com.xyz/raw/my_sound'. It will look for the 'my_sound' audio file in 'res/raw' directory and play it. default: 'default' (default sound is played)
        number: '10', // (optional) Valid 32 bit integer specified as string. default: none (Cannot be zero)
      });
    }
  }

}

export default new NotificationsManager();