import React,{Component} from 'react';
import {View, StatusBar, Text, StyleSheet, ToolbarAndroid} from 'react-native'
import { TabNavigator } from 'react-navigation';
import Icon from 'react-native-vector-icons/FontAwesome'
import Home from './app/components/Home'
import Chat from './app/components/Chat'
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
  tabBarPosition: 'bottom'
})

export default class App extends Component  {

  constructor () {
    super();
    this.state = {hamburgerIcon: null};
    Icon.getImageSource("bars",22,"#FCFCFC").then((source) => this.setState({ hamburgerIcon: source }));
  }

  render () {
    return (
        <View style={{flex: 1}}>
          <StatusBar   />
          <ToolbarAndroid
              navIcon={this.state.hamburgerIcon}
              title="NP PMS"
              titleColor={'#FCFCFC'} style={styles.toolbar}/>
          {/*<View style={styles.npContainer}>*/}
          {/*<Text style={styles.npTitle}>NP PMS</Text>*/}
          {/*</View>*/}
          <AppContent />
        </View>
    )
  }
}


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
