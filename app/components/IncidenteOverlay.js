import React, {Component} from 'react'
import {View, Text,StyleSheet, Button, Animated, Alert} from 'react-native'
import PropTypes from 'prop-types';

class IncidenteOverlay extends Component {

  constructor (props) {
    super(props)
    this.state = {
      fadeAnim: new Animated.Value(0),
      rollAnim: new Animated.Value(-170),
    }
  }

  componentDidMount () {
    Animated.timing(
        this.state.fadeAnim,
        {
          toValue: 1,
          duration: 800,
        }
    ).start();
    Animated.timing(
        this.state.rollAnim,
        {
          toValue: 170,
          duration: 500,
        }
    ).start();
  }

  cancelPressed () {
    Alert.alert(
        'Confirmacion de rechazo',
        'Esta seguro que quiere rechazar la incidencia?',
        [
          {text: 'NO', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
          {text: 'SI', onPress: () => console.log('OK Pressed')},
        ],
        { cancelable: false }
    )
  }

  acceptPressed () {

  }

  render () {
    const {incidente} = this.props;
    return (
        <Animated.View style={[styles.wrapper, {opacity: this.state.fadeAnim, height: this.state.rollAnim}]}>
          <Text style={{fontSize: 16}}>Incidente #{incidente.id}</Text>
          <View style={styles.buttons}>
            <View style={{flexGrow: 1, marginRight:5}}>
              <Button onPress={() => {this.cancelPressed()}} title={"Rechazar"} color={'#C4351C'}  />
            </View>
            <View style={{flexGrow: 1,marginLeft:5}}>
              <Button onPress={() => {this.acceptPressed()}} title={"Aceptar"} color={'#1976D2'}/>
            </View>
          </View>
        </Animated.View>
    )
  }
}

const styles = StyleSheet.create({
  buttons: {
    flexDirection: 'row',
    bottom:5,
    left: 5,
    position: 'absolute',
  },
  wrapper: {
    position: 'relative',
    top: 0,
    zIndex: 20,
    backgroundColor: "#FCFCFC",
    width: '100%',
    elevation: 3,
    padding: 5
  }
})

IncidenteOverlay.proptypes = {
  incidente: PropTypes.object.isRequired
}

export default IncidenteOverlay;