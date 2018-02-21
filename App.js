import React,{Component} from 'react';
import {View, StatusBar, Text, StyleSheet, ToolbarAndroid} from 'react-native'
import { TabNavigator } from 'react-navigation';
import Icon from 'react-native-vector-icons/FontAwesome'
import Home from './app/components/Home'
import Splash from './app/components/Splash'
import Chat from './app/components/Chat'
import Bluetooth from './app/components/Bluetooth/BluetoothConnector'
import { Provider } from 'mobx-react';
import store from './app/store/store'
import {autorun} from "mobx"
import {inject, observer} from "mobx-react"

const AppContent = TabNavigator({
  Home: {
    screen: Home
  },
  Mensajes: {
    screen: Chat
  }
},{
  initialRouteName: 'Mensajes',

  tabBarOptions: {
    activeTintColor: '#FCFCFC',
    labelStyle: {
      fontSize: 15,
    },
    style: {
      backgroundColor: '#1976D2' ,
    },
  },
  tabBarPosition: 'top'
})

@inject('store')
@observer
class App extends Component  {

  constructor (props) {
    super(props);
    this.state = {
      hamburgerIcon: null,
      ready: false
    };
    Icon.getImageSource("bars", 22,"#FCFCFC").then((source) => this.setState({ hamburgerIcon: source }));
  }

  componentDidMount () {
    const store = this.props.store
    this._disposer = autorun (() => {
      if (store.bluetoothStatus !== "CONNECTED") {
        this.setState({
          ready: false
        })
      }
    })
  }

  componentWillUnmount() {
    this._disposer()
  }

  splashReady () {
    this.setState({
      ready: true
    })
  }

  render () {
    let render = <Splash onReady={() => {this.splashReady()}} />
    if (this.state.ready) {
      render = (
          <View style={{flex: 1}}>
            <ToolbarAndroid
                navIcon={this.state.hamburgerIcon}
                title="NP PMS"
                titleColor={'#FCFCFC'} style={styles.toolbar}/>
            <AppContent />
          </View>)
    }
    return (
          <View style={{flex: 1}}>
            <StatusBar/>
            <Bluetooth />
            {render}
          </View>
    )
  }
}

export default AppWrapper = () => (
    <Provider store={store}>
      <App/>
    </Provider>
)


const styles = StyleSheet.create({
  toolbar: {
    height: 50,
    backgroundColor:'#1976D2'
  },

  npTitle: {
    alignSelf: 'center',
    color: '#FCFCFC',
    fontSize: 25,
    fontWeight: "600",
    backgroundColor:'#1976D2'
  },
  npContainer : {
    backgroundColor: '#1976D2',
    borderBottomColor: "#FCFCFC",
    borderBottomWidth: 1,
    paddingBottom:5
  }


});
