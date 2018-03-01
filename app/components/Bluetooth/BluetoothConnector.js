import React from 'react';
import {Bluetooth, Events} from './BluetoothModule'
import BtMessage from "./../../core/BtMessage"
import {observer, inject} from 'mobx-react'

@inject('store') @observer
export default class BluetoothConnector extends React.Component {
  constructor (props) {
    super(props);
    this.ReqMsg = this.ReqMsg.bind(this)
    this.searchForNpmodule = this.searchForNpmodule.bind(this)
    this.enableAutoPull = this.enableAutoPull.bind(this)

    const store = this.props.store
    Bluetooth.on(Events.STATUS_CHANGED, (e) => {

      store.setBluetoothStatus(e)
    })

    Bluetooth.on(Events.BT_STATUS_CHANGED, (e) => {

      store.setBluetoothAdapterStatus(e)
    })

    Bluetooth.on(Events.DATA_RECEIVED, (e) => {
      const data = JSON.parse(e)
      switch (data.type) {
        case "GET_DEVICE_CONFIG_RESPONSE":
          store.getDeviceConfigResponse(data.payload)
          break
        case "SEND_MESSAGE_TO_SERVER_RESPONSE":
          store.sendMessageToServerResponse(data.payload)
          break
        case "NEW_SERVER_MESSAGES":
          store.newServerMessages(data.payload)
          break
        case "NEW_SERVER_INCIDENCIAS":
          store.newServerIncidencias(data.payload)
          break
      }
    })

    Bluetooth.initialize("B8:27:EB:6D:6D:51").then(a => {
      console.log(a)
    }).catch(b => {
      console.log(b.message)
    })

    // for (let item in Events) {
    //   if (Events.hasOwnProperty(item)) {
    //     Bluetooth.on(Events[item], (e) => {
    //       console.log(e)
    //     })
    //   }
    // }

  }


  ReqMsg() {
    Bluetooth.sendMessage(
        new BtMessage(
            {
              type: "GET_TODAY_MENSAJES",
              payload: {}
            }
        ))
  }


  enableAutoPull () {
    Bluetooth.sendMessage(
        new BtMessage(
            {
              type: "AUTO_PULL_MENSAJES",
              payload: true
            }
        ))
  }

  searchForNpmodule() {
    Bluetooth.searchForNpModule();
  }
  render () {
    console.log(this.props.store.bluetoothStatus)
    return null
  }
}
