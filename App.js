import React from 'react';
import { StyleSheet, View, Text,Button } from 'react-native';
import BluetoothPairingManager from "./app/components/BluetoothPariringManager"
import PushNotification from 'react-native-push-notification'
import BackgroundTimer from 'react-native-background-timer';

export default class App extends React.Component {

  constructor () {
    super();
    this.pushNotification = this.pushNotification.bind(this)
  }
  componentWillMount() {
    PushNotification.configure({
      // (required) Called when a remote or local notification is opened or received
      onNotification: function(notification) {
        console.log( 'NOTIFICATION:', notification );
        // process the notification
      },
      popInitialNotification: true,
      requestPermissions: true,
    });
  }

  pushNotification () {
    BackgroundTimer.setTimeout(() => {
      PushNotification.localNotification({
        ticker: "My Notification Ticker", // (optional)
        autoCancel: true, // (optional) default: true
        largeIcon: "ic_launcher", // (optional) default: "ic_launcher"
        smallIcon: "ic_notification", // (optional) default: "ic_notification" with fallback for "ic_launcher"
        bigText: "My big text that will be shown when notification is expanded", // (optional) default: "message" prop
        subText: "This is a subText", // (optional) default: none
        // color: "red", // (optional) default: system default
        vibrate: true, // (optional) default: true
        vibration: 300, // vibration length in milliseconds, ignored if vibrate=false, default: 1000
        tag: 'some_tag', // (optional) add tag to message
        group: "group", // (optional) add group to message
        ongoing: true, // (optional) set whether this is an "ongoing" notification
        /* iOS and Android properties */
        title: "My Notification Title", // (optional, for iOS this is only used in apple watch, the title will be the app name on other iOS devices)
        message: "My Notification Message", // (required)
        playSound: true, // (optional) default: true
        soundName: 'default', // (optional) Sound to play when the notification is shown. Value of 'default' plays the default sound. It can be set to a custom sound such as 'android.resource://com.xyz/raw/my_sound'. It will look for the 'my_sound' audio file in 'res/raw' directory and play it. default: 'default' (default sound is played)
        number: '10', // (optional) Valid 32 bit integer specified as string. default: none (Cannot be zero)
      });
    }, 2500);

  }

  render() {
    return (
        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>NP PMS</Text>
            <Button
                title="Push Notif"
                color="black"
                onPress={this.pushNotification}
            />
          </View>
          <View style={styles.mainContainer}>
            <BluetoothPairingManager/>
          </View>
        </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: "stretch"
  },
  logoContainer: {
    flexDirection: "column",
    flexBasis: 280,
    flexGrow: 0,
    flexShrink: 0,
    backgroundColor: "#0D47A1",
    justifyContent: "center",
    alignItems: "center"
  },
  logoText: {
    fontSize: 65,
    fontFamily: "Roboto",
    fontWeight: "500",
    color: "#ffff"
  },
  mainContainer: {
    flexGrow: 1,
    flexDirection: "column",
    justifyContent: "center",

    alignItems: "stretch",
    // backgroundColor: "#96a18d"
  },
});
