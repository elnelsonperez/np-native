import React, {Component} from 'react'
import {View, Text,StyleSheet, Button, Animated,Alert, TouchableOpacity} from 'react-native'
import PropTypes from 'prop-types';
import {Incidencia} from "../shared";
import * as Progress from 'react-native-progress';
import {inject, observer} from "mobx-react";
import Icon from 'react-native-vector-icons/FontAwesome'
import Collapsible from 'react-native-collapsible';
const Field = props => {
  return (
      <View>
        <View >
          <Text style={{color:'#1976D2', fontSize: 11}}>{props.small}</Text>
        </View>
        <View>
          <Text>{props.big}</Text>
        </View>
      </View>
  )
}

@inject('store')
@observer
class IncidenteOverlay extends Component {

  constructor(props) {
    super(props)
    this.state = {
      fadeAnim: new Animated.Value(0),
      rollAnim: new Animated.Value(-170),
      collapsed: false
    }
  }

  componentDidMount() {
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

  cancelPressed() {
    Alert.alert(
        'Confirmacion de rechazo',
        'Esta seguro que quiere rechazar la incidencia?',
        [
          {
            text: 'NO', onPress: () => {
            }, style: 'cancel'
          },
          {
            text: 'SI', onPress: () => {
              this.props.store.sendUpdateIncidenteStatus(
                  Incidencia.RECHAZADA, this.props.store.nextPendingIncidencia.id)
            }
          },
        ],
        {cancelable: false}
    )
  }

  acceptPressed() {
    this.props.store.sendUpdateIncidenteStatus(
        Incidencia.EN_CURSO, this.props.store.nextPendingIncidencia.id)
  }

  render() {
    const {incidente, active, time} = this.props;
    if (this.props.store.updatingIncidenciaStatus) {
      return (
          <View style={{
            width: '100%', height: 100, flexDirection: 'row',
            backgroundColor: '#FCFCFC',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 5, opacity: .8
          }}>
            <Progress.CircleSnail
                color={'#1976D2'}
                size={50}
                indeterminate={true}
            />
          </View>
      )
    } else {
      if (active) {
        return (
            <View style={[styles.wrapper, {height: 230}]}>
              <View style={[styles.content, {height: this.state.collapsed ? 35 : 180}]}>
                <TouchableOpacity onPress={() => {
                  this.setState({collapsed: !this.state.collapsed})
                }}>
                  <View style={{ flexDirection: 'row'}}>
                    <View style={{flexGrow: 2}}>
                      <Text style={{fontSize: 16, fontWeight: "500", color: "#58a721"}}>
                        Incidente en curso
                      </Text>
                    </View>
                    <View style={{flexGrow: 1, alignItems: 'flex-end'}}>
                      <Text>
                        <Icon name={"clock-o"} size={15} />
                        {' '} {time}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
                <Collapsible collapsed={this.state.collapsed}>
                  <View style={{ borderTopColor: '#e0e0e0', borderTopWidth: 1 ,height: '100%' ,

                   }}>
                    <View>
                      <View style={styles.fieldRow}>
                        <Field small={'Ubicacion'} big={incidente.ubicacion_texto}/>
                        <Field small={'Detalle de ubicacion'} big={incidente.detalle_ubicacion}/>
                      </View>
                      <View style={styles.fieldRow}>
                        <Field small={'Detalle del incidente'} big={incidente.detalle_incidente}/>
                      </View>
                    </View>
                    <View style={{
                      justifyContent: 'center',
                      flexDirection: 'row',
                      position: 'absolute',
                      width: '100%',
                      bottom: 20
                    }}>
                      <TouchableOpacity>
                        <Text style={{fontWeight: "500", fontSize: 15}}>Ver mas detalles</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Collapsible>
              </View>
            </View>
        )
        //       <View style={styles.buttons} key={2}>
        //       <View style={{flexGrow: 1, marginLeft:2}}>
        // <Button onPress={() => {}} title={"Marcar como Completado"} color={'#1976D2'}/>
        // </View>
        // </View>
      }
      else {
        return (<Animated.View
            style={[styles.wrapper, {opacity: this.state.fadeAnim, height: this.state.rollAnim}]}>
          <View style={styles.content}>
            <View style={{
              justifyContent: 'center', flexDirection: 'row',
              borderBottomColor: '#e0e0e0',
              borderBottomWidth: 1
            }}>
              <Text style={{fontSize: 16, fontWeight: "500", color: '#1976D2'}}>Nuevo Incidente Asignado</Text>
            </View>
            <View>
              <View style={styles.fieldRow}>
                <Field small={'Tipo'} big={incidente.tipo.nombre}/>
                <Field small={'Prioridad'} big={incidente.prioridad.nombre}/>
                <Field small={'Involucrados'} big={incidente.personas_involucradas}/>
              </View>
              <View style={styles.fieldRow}>
                <Field small={'Sector'} big={incidente.sector.nombre}/>
                <Field small={'Distancia'} big={incidente.distancia ? incidente.distancia : "N/A"}/>
                <Field small={'Tiempo'} big={incidente.tiempo ? incidente.tiempo : "N/A"}/>
              </View>
            </View>
          </View>
          <View style={styles.buttons} key={2}>
            <View style={{flexGrow: 1, marginRight: 2}}>
              <Button onPress={() => {
                this.cancelPressed()
              }} title={"Rechazar"} color={'#C4351C'}/>
            </View>
            <View style={{flexGrow: 1, marginLeft: 2}}>
              <Button onPress={() => {
                this.acceptPressed()
              }} title={"Aceptar"} color={'#1976D2'}/>
            </View>
          </View>
        </Animated.View>)
      }

    }
  }
}

const styles = StyleSheet.create({
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10
  },
  buttons: {
    flexDirection: 'row',
    bottom:0,
    left: 5,
    position: 'absolute',
  },
  wrapper: {
    position: 'absolute',
    top: 0,
    zIndex: 20,
    width: '100%',
    padding: 5,
  },
  content: {
    backgroundColor: "#FCFCFC",
    elevation: 3,
    padding: 5,
    height: 125
  }
})

export default IncidenteOverlay;