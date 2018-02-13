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
    Bluetooth.sendMessage(new BtMessage({type: "TEST", corr_id: 0, payload: "Test desde celular"}))
  }

  searchForNpmodule() {
    Bluetooth.searchForNpModule();
  }

  componentWillMount() {

    for (let item in Events) {
      if (Events.hasOwnProperty(item)) {
        Bluetooth.on(Events[item], (e) => {
          console.log(e)
          event = Events[item];
          if (event === Events.RECEIVED && e.type === "TEST") {
            this.addMessageToList(e.payload.data)
          } else {
            this.addMessageToList("EVENT ["+event+"]",e)
          }
        })
      }
    }

    Bluetooth.initialize().then(a => {
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
