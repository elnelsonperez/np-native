import React from 'react';
import { StyleSheet, View, Text, Button } from 'react-native';
import BluetoothManager from "./app/components/BluetoothManager"
export default class App extends React.Component {

  constructor () {
    super();
  }

  componentWillMount() {

  }

  render() {
    return (
        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>NP PMS</Text>
          </View>
          <View style={styles.mainContainer}>
            <BluetoothManager />
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
