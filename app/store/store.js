
import { observable, action, computed,extendObservable } from 'mobx';
import {Bluetooth, Events} from './../components/Bluetooth/BluetoothModule'
import BtMessage from "../core/BtMessage";

class store {
  @observable mensajes = []
  @observable bluetoothStatus = null;
  @observable bluetoothAdapterStatus = null;
  @observable config = null

  @action setBluetoothStatus (status) {
    this.bluetoothStatus = status
  }

  @action setBluetoothAdapterStatus (status) {
    this.bluetoothAdapterStatus = status
  }

  @action appendMessage (serverResponseMessage) {
    const chatmsg = this.parseSentMessageResponse(serverResponseMessage.mensaje)
    const old = this.mensajes.slice()
    const existing = old.findIndex(v => v._id === serverResponseMessage.tmp_id)
    if (existing !== -1) {
      old[existing] = chatmsg;
      this.mensajes.replace(old);
    }
  }

  parseSentMessageResponse (mensaje) {
    return {
      _id: mensaje.id,
      text: mensaje.contenido,
      createdAt: new Date(mensaje.creado_en),
      received: true,
      sent: true,
      user: {
        _id: this.config.oficial.id
      },
    };
  }

  @action receiveServerMessages (mensajes) {
    const old = this.mensajes.slice()
    for (let m of mensajes) {
      const parsed = this.parseServerMessage(m);
      const existing = old.findIndex(v => v._id === m.id)
      if (existing !== -1) {
        old[existing] = parsed;
        this.mensajes.replace(old);
      } else {
        this.mensajes.push(parsed)
      }
    }
  }

  parseServerMessage (mensaje) {

    const timestamp=Date.parse(mensaje.creado_en)

    let d = new Date()
    if (isNaN(timestamp)===false)
    {
     d =new Date(timestamp);

    } else {
      console.log (mensaje)
    }

    if (mensaje.sentido === 0) {
      return {
        _id: mensaje.id,
        text: mensaje.contenido,
        createdAt: d,
        received: true,
        sent: true,
        user: {
          _id: mensaje.remitente.id,
          name: mensaje.remitente.nombre + " " + mensaje.remitente.apellido
        },
      };
    } else {
      return {
        _id: mensaje.id,
        text: mensaje.contenido,
        createdAt: new Date(mensaje.creado_en),
        received: true,
        sent: true,
        user: {
          _id: mensaje.oficial_unidad_id,
          name: mensaje.oficial_unidad.nombre + " " + mensaje.oficial_unidad.apellido
        },
      };
    }

  }

  @computed get userId() {
    if (this.config)
      return this.config.oficial.id
    return null
  }

  @action sendConfigRequest () {
    Bluetooth.sendMessage(
        new BtMessage(
            {
              type: "GET_DEVICE_CONFIG",
              payload: {}
            }
        ))
  }

  @action sendTodayMessagesRequest () {
    Bluetooth.sendMessage(
        new BtMessage(
            {
              type: "GET_TODAY_MESSAGES",
              payload: {}
            }
        ))
  }

  @action setDeviceConfig (config) {
    this.config = config;
  }

  @action sendMessagesToServer (chatMessages) {

    chatMessages.forEach(v => {
      this.mensajes.push({...v,...{sent: true}})
      Bluetooth.sendMessage(
          new BtMessage(
              {
                type: "SEND_MESSAGE_TO_SERVER",
                payload: {
                  oficial_unidad_id: v.user._id,
                  contenido: v.text,
                  temp_id: v._id
                }
              }
          ))
    })
  }

}

export default new store()

