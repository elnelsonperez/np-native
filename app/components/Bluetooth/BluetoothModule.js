import {NativeModules} from "react-native";
const {BluetoothModule} = NativeModules;
import {DeviceEventEmitter} from 'react-native';
import BtMessage from "../../core/BtMessage";

const Events = {
  BT_STATUS_CHANGED: "bluetooth_status_changed",
  STATUS_CHANGED: "status_changed",
  DATA_RECEIVED: "data_received",
  SEARCHING: "searching",
  CONNECTION_ATTEMP: "connection_attemp"
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
  initialize: function (mac_address) {
    return BluetoothModule.initialize(mac_address)
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