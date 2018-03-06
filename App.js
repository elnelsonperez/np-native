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

@inject('store')
@observer
class TabBarIcon extends Component {
  constructor(props) {
    super(props)
  }

  render () {
    const count =  this.props.store.unreadMessagesCount;
    return (
        count > 0 &&
        <View style={{ position: 'absolute', right:-30, width: 20, height: 20 }}>
          <View style={{
            backgroundColor: '#E51B11',
            borderRadius: 10,
            alignItems:'center',
            borderColor: '#FCFCFC',
            borderWidth: 1
          }}>
            <Text style={{ color: 'white', fontSize: 12 }}>{count}</Text>
          </View>
        </View>
    )
  }
}

const AppContent = TabNavigator({
  Home: {
    screen: Home,
    navigationOptions:  {
      tabBarLabel: "PRINCIPAL"
    }
  },
  Mensajes: {
    screen: Chat,
    navigationOptions:  {
      tabBarLabel: ({tintColor}) => {
        return (
            <View style={{flexDirection: 'row'}}>
              <Text style={{color:tintColor}}>MENSAJES</Text>
              <TabBarIcon/>
            </View>
        )
      },
    }
  }
},{
  initialRouteName: 'Home',
  tabBarOptions: {
    scrollEnabled: false,
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
    // Icon.getImageSource("bars", 22,"#FCFCFC").then((source) => this.setState({ hamburgerIcon: source }));
  }

  componentDidMount () {
    const store = this.props.store
    this._disposer = autorun (() => {
      if (store.bluetoothStatus !== "CONNECTED") {
        store.authInvalidate()
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
                title="NP PMS  -  Unidad #1"
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
