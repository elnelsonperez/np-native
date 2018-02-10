import {NativeModules} from "react-native";
const {BluetoothModule} = NativeModules;
import {DeviceEventEmitter} from 'react-native';
import BtMessage from "../../core/BtMessage";

const Events = {
    STATUS_CHANGES: "statusChanged",
    CONNECTION_LOST: "connectionLost",
    CONNECTED: 'connectionWithNpModule',
    RECEIVED: 'dataReceived',
    BLUETOOTH_STATUS_CHANGE: "bluetoothStatus",
    SEARCHING: "searchNpModule"
}

const Bluetooth = {
  /**
   * @param {BtMessage} BtMessage
   */
  sendMessage: function (BtMessage) {
    BluetoothModule.send(BtMessage.toJson())
  },
  searchForNpModule: function () {
    BluetoothModule.searchForNpModule()
  },
  initialize: function () {
    return BluetoothModule.initialize()
  },
  /**
   * @param {Number} timeout
   */
  setBluetoothConnectionRetryTimeout: function (timeout) {
    BluetoothModule.setBluetoothConnectionRetryTimeout(timeout)
  },

  on: function (event, cb) {
    DeviceEventEmitter.addListener(event, cb)
  }
}

export {Bluetooth, Events};