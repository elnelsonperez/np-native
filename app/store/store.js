
import { observable, action, computed } from 'mobx';
import {Bluetooth} from './../components/Bluetooth/BluetoothModule'
import BtMessage from "../core/BtMessage";
import moment from 'moment'
import {Incidencia} from './../shared'
import NotificationsManager from './../core/NotificationsManager'
class store {
  @observable mensajes = []
  @observable incidencias = []
  @observable bluetoothStatus = null
  @observable bluetoothAdapterStatus = null
  @observable config = null
  @observable updatingIncidenciaStatus = false
  @observable authStatus = null
  @observable stats = null;

  @action setAuthStatus ({status}) {
    this.authStatus = status;
  }

  @action authInvalidate() {
    this.authStatus = null;
  }

  @action setSectorStats(stats) {
    this.stats = stats;
  }

  @action setBluetoothStatus (status) {
    this.bluetoothStatus = status
  }

  @action setBluetoothAdapterStatus (status) {
    this.bluetoothAdapterStatus = status
  }

  @action sendUpdateIncidenteStatus (estado_id, incidencia_id) {
    Bluetooth.sendMessage(
        new BtMessage(
            {
              type: "UPDATE_INCIDENCIA_STATUS",
              payload: {
                estado_id,
                incidencia_id
              }
            }
        ))
    this.updatingIncidenciaStatus = true;
  }

  @action updateIncidenciaStatusResponse ({status,incidencia, callPayload}) {
    if (status === 'OK') {
      this.newServerIncidencias([incidencia])
      this.updatingIncidenciaStatus = false;
    } else if (status === "FAILED"){
      Bluetooth.sendMessage(
          new BtMessage(
              {
                type: "UPDATE_INCIDENCIA_STATUS",
                payload: callPayload
              }
          ))
    }
  }

  @action newServerIncidencias (incidencias) {
    const old = this.incidencias.slice()
    for (let i of incidencias) {
      const existing = old.findIndex(v => v.id === i.id)
      if (existing !== -1) {
        old[existing] = i;
      } else {
        old.push(i)
      }
    }
    this.incidencias.replace(old);
  }

  @action sendMessageToServerResponse ({mensaje, tmp_id, status, callPayload}) {
    if (status === "OK") {

      const chatmsg = this.parseServerMessage(mensaje)

      const old = this.mensajes.slice()
      const existing = old.findIndex(v => v._id === tmp_id)
      if (existing !== -1) {
        old[existing] = chatmsg;
        this.mensajes.replace(old);
      }
    } else if (status === "FAILED"){
      Bluetooth.sendMessage(
          new BtMessage(
              {
                type: "SEND_MESSAGE_TO_SERVER",
                payload: callPayload
              }
          ))
    }
  }

  @action getSectorStatsResponse ({stats,status, callPayload}) {
    if (status === "OK") {
      this.stats = stats;
    }
    else if (status === "FAILED"){
      Bluetooth.sendMessage(
          new BtMessage(
              {
                type: "GET_SECTOR_STATS",
                payload: callPayload
              }
          ))
    }
  }

  parseServerMessage (mensaje) {
    const d = moment(mensaje.creado_en).toDate();
    const read = mensaje.estado_mensaje_hub_id === 2;
    const received = read || mensaje.estado_mensaje_hub_id === 3;
    if (mensaje.sentido === 0) { //Cuartel a unidad
      return {
        _id: mensaje.id,
        text: mensaje.contenido,
        createdAt: d,
        received: received,
        sent: true, //At this point the message has been sent
        read: read,
        user: {
          _id: mensaje.remitente.id,
          name: mensaje.remitente.nombre + " " + mensaje.remitente.apellido
        },
      };
    } else {
      return {
        _id: mensaje.id,
        text: mensaje.contenido,
        createdAt: d,
        received: received,
        sent: true,
        read: read,
        user: {
          _id: mensaje.oficial_unidad_id,
          name: mensaje.oficial_unidad.nombre + " " + mensaje.oficial_unidad.apellido
        },
      };
    }

  }

  @action updateMessagesStatusResponse ({status, callPayload}) {
    if (status === 'OK') {
      const read = callPayload.estado_id === 2;
      const received = read || callPayload.estado_id === 3;
      const old = this.mensajes.slice()
      for (let m of old) {
        if (callPayload.mensajes_ids.includes(m.id)) {
          m.read = read;
          m.received = received;
        }
      }
      this.mensajes.replace(old);
    } else if (status === "FAILED"){
      Bluetooth.sendMessage(
          new BtMessage(
              {
                type: "UPDATE_MESSAGES_STATUS",
                payload: callPayload
              }
          ))
    }
  }

  @action newServerMessages (mensajes) {
    const old = this.mensajes.slice()
    for (let m of mensajes) {
      const parsed = this.parseServerMessage(m);

      const existing = old.findIndex(v => v._id === m.id)
      if (existing !== -1) {
        old[existing] = parsed;
      } else {
        old.push(parsed)
      }
    }
    this.mensajes.replace(old);

    //Mensajes del servidor al hub con estado Enviado
    const mensajesConEstadoEnviado = mensajes.filter(
        v => v.estado_mensaje_hub_id === 1 && v.sentido === 0);

    if (mensajesConEstadoEnviado.length > 0) {
      Bluetooth.sendMessage(
          new BtMessage(
              {
                type: "UPDATE_MESSAGES_STATUS",
                payload: {
                  mensajes_ids: mensajesConEstadoEnviado.slice().map(v => v.id),
                  estado_id: 3
                }
              }
          ))
      NotificationsManager.newMessages()
    }

  }

  @action markUnreadMessagesAsRead () {
    const mensajes = this.mensajes.filter(v => v.read === false && v.user._id !== this.config.oficial.id);
    if (mensajes.length > 0) {
      Bluetooth.sendMessage(
          new BtMessage(
              {
                type: "UPDATE_MESSAGES_STATUS",
                payload: {
                  mensajes_ids: mensajes.slice().map(v => v._id),
                  estado_id: 2
                }
              }
          ))
    }
  }

  @action resetUnread () {
    this.unreadMessagesCount = 0;
  }

  @computed get nextPendingIncidencia () {
    const incidencias = this.incidencias.filter(i => {
      return i.estado_id === 3
    }).sort((a,b) => {
      return a.id - b.id
    })
    if (incidencias.length > 0){
      NotificationsManager.newIncidencia(incidencias[0])
      return incidencias[0]
    }
    return null
  }

  @computed get activeIncidencia () {
    const incidencias = this.incidencias.filter(i => {
      return i.estado_id === Incidencia.EN_CURSO
    }).sort((a,b) => {
      return a.id - b.id
    })
    if (incidencias.length > 0){
      return incidencias[0]
    }
    return null
  }

  @computed get unreadMessagesCount () {
    return this.mensajes.filter(
        m => {
          return m.hasOwnProperty('read') && m.read === false && m.user._id !== this.userId
        }
    ).length
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

  @action getDeviceConfigResponse (config) {
    this.config = config;
  }

  @action sendMessagesToServer (chatMessages) {
    chatMessages.forEach(v => {
      this.mensajes.push({...v,...{sent: true,received: false, read: false}})
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

  @action sendStatsRequest () {
    const sector_id = this.config.sector? this.config.sector.id : null;
    if (sector_id) {
      Bluetooth.sendMessage(
          new BtMessage(
              {
                type: "GET_SECTOR_STATS",
                payload: {
                  sector_id
                }
              }
          ))
    }
  }


}

export default new store()

