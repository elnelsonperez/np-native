import React from 'react';
import {Text, Button, FlatList, View, StyleSheet} from 'react-native';
import {Bluetooth,Events} from './BluetoothModule'
import BtMessage from "./../../core/BtMessage"
export default class BluetoothConnector extends React.Component {

  constructor () {
    super();
    this.state = {
      listData: []
    }
    this.sendMsg = this.sendMsg.bind(this)
    this.searchForNpmodule = this.searchForNpmodule.bind(this)
    this.counter = 1;
  }

  addMessageToList (message, payload = null) {
    let obj = ""
    if (payload !== null) {
      obj = JSON.stringify(payload);
    }
    this.setState(prevState => ({
      listData: [...prevState.listData, {key: this.counter++, message: message + " "+ obj}]
    }))
  }

  sendMsg() {
    console.log("Enviando")
    Bluetooth.sendMessage(
        new BtMessage(
            {
              type: "GET_TODAY_MENSAJES",
              payload: {}
            }
        ))
  }

  searchForNpmodule() {
    Bluetooth.searchForNpModule();
  }

  componentWillMount() {
    $i=0;
    for (let item in Events) {
      if (Events.hasOwnProperty(item)) {
        Bluetooth.on(Events[item], (e) => {
          event = Events[item];
          if (event === Events.DATA_RECEIVED) {
            console.log(e,$i++)
          } else {
            this.addMessageToList("EVENT ["+event+"]",e)
          }
        })
      }
    }

    Bluetooth.initialize("B8:27:EB:6D:6D:51").then(a => {
      this.addMessageToList(a)
    }).catch(b => {
      console.log(b.message)
      this.addMessageToList(b.message)
    })

  }

  render () {
    return (
        <View style={styles.container}>
          <View style={{flex: 4}}>
            <FlatList
                data={this.state.listData}
                renderItem={({item}) => (<Text>{item.message}</Text>)}
            />
          </View>
          <View style={
            {
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-around",
              backgroundColor: "#E3F2FD"

            }
          }>
            <Button
                title="Connect to NpModule"
                color="#0D47A1"
                onPress={this.searchForNpmodule}
            />
            <Button
                title="Send msg"
                color="#0D47A1"
                onPress={this.sendMsg}
            />
          </View>
        </View>
    )
  }
}

const styles = StyleSheet.create({
  status: {
    fontSize: 19
  },
  container: {
    flex: 1,
    alignItems: "stretch",
    flexDirection: 'column'
  }
})
