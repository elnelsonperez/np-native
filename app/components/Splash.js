import React, { Component } from 'react';
import {StyleSheet, Text, View,Image} from 'react-native';
import {observer,inject} from 'mobx-react'
import {autorun} from 'mobx'

@inject('store')
@observer
export default class Splash extends Component {

  constructor (props) {
    super(props)
    this.state = {
      statusText: "Inicializando"
    }
  }

  componentWillMount () {
    this._disposer = autorun( () => {
          const store = this.props.store
          if (store.bluetoothAdapterStatus !== "ON") {
            this.setState({statusText: "Active el Bluetooth del dispositivo"})
          } else {
            if (store.bluetoothStatus !== "CONNECTED") {
              this.setState({statusText: "Intentando conectar con PMS Hub"})
            } else {
              this.setState({statusText: "Autentíquese utilizando su iButton"})
              if (store.authStatus === "SUCCESS") {
                this.setState({statusText: "Esperando configs"})
                if (store.config) {
                  this.setState({statusText: "Configuracion cargada"})
                  this.props.onReady()
                } else {
                  store.sendConfigRequest()
                }
              } else if (store.authStatus === "FAILED" || store.authStatus === "NOT_EXIST") {
                this.setState({statusText: "Autenticación Fallida"})
                setTimeout(() => {
                  store.authInvalidate()
                },1000)
              }
            }
          }

        }
    )
  }

  componentWillUnmount () {
    this._disposer()
  }

  render() {
    return (
        <View style={styles.container}>
          <Image
              style={{
                width: 600,
                height: 200,
                resizeMode: 'contain'}}
              source={require("./../static/logo.png")}
          />
          <Text style={styles.status}>{this.state.statusText}</Text>
        </View>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1976D2',

  },
  status: {
    fontSize: 18,
    fontFamily: "Roboto",
    fontWeight: "300",
    color: "#ffff"
  },
  logoText: {
    marginBottom: 15,
    fontSize: 65,
    fontFamily: "Roboto",
    fontWeight: "500",
    color: "#ffff"
  }
});
