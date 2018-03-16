import React, {Component} from 'react'
import {View, Text,StyleSheet, Button, Animated,Alert, TouchableOpacity} from 'react-native'
import PropTypes from 'prop-types';
import * as Progress from 'react-native-progress';
import {inject, observer} from "mobx-react";
import Icon from 'react-native-vector-icons/FontAwesome'
import Collapsible from 'react-native-collapsible';
import moment from 'moment'
import Field from './Field'
const colors = [
  "#ef4e2f",
  "#EF5350",
  "#ef7c41",
  "#efb920",
  "#efc06d",
  "#efe66e",
  "#b3ef51",
  "#66BB6A",
  "#29B6F6",
]

@inject('store')
@observer
class StatsOverlay extends Component {

  constructor(props) {
    super(props)
    this.state = {
      fadeAnim: new Animated.Value(0),
      rollAnim: new Animated.Value(-170),
      collapsed: true
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

  hourToRange (hour) {
    const H = hour
    const h = H % 12 || 12;
    const ampm = (H < 12 || H === 24) ? "AM" : "PM";
    return h + ":00 " + ampm +' - '+ h + ":59 " + ampm;
  }

  render() {
    const {stats} = this.props

    return (
        <View style={[styles.wrapper]}>
          <View style={[styles.content, {height: this.state.collapsed ? 35 : '100%'}]}>
            <TouchableOpacity onPress={() => {
              this.setState({collapsed: !this.state.collapsed})
            }}>
              <View style={{ flexDirection: 'row'}}>
                <View style={{flexGrow: 2}}>
                  <Text style={{fontSize: 16, fontWeight: "500", color: "#1864b4"}}>
                    {this.state.collapsed && <Icon name={"arrow-circle-o-right"} size={15} />}
                    {!this.state.collapsed && <Icon name={"arrow-circle-o-down"} size={15} />}
                    {' '}
                    INFO DEL SECTOR ASIGNADO (30 días)
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
            <Collapsible collapsed={this.state.collapsed} easing="sin">
              <View style={{ borderTopColor: '#e0e0e0',
                borderTopWidth: 1}}>
                <View style={{padding: 5}}>
                  <Text style={{fontSize:15, fontWeight: '500', paddingTop:15, alignSelf: 'center'}}>
                    Tipos de incidentes más frecuentes</Text>
                  {stats.count_by_type.map((s,i) => {
                    return <View key={i} style={{justifyContent: 'space-between',
                      borderBottomWidth: 1,
                      borderStyle: 'dashed',
                      borderBottomColor: '#d8d8d8',
                      paddingBottom: 5,
                      flexDirection: 'row'}}>
                      <Text>{s.nombre}</Text>
                      <Text>{s.cantidad}</Text>
                    </View>
                  })}

                  <Text style={{fontSize:15, fontWeight: '500', paddingTop:15, alignSelf: 'center'}}>
                    Días en los que ocurren más incidentes</Text>
                  {stats.count_by_day.map((s,i) => {
                    return <View key={i} style={{justifyContent: 'space-between',
                      borderBottomWidth: 1,
                      borderStyle: 'dashed',
                      borderBottomColor: '#d8d8d8',
                      paddingBottom: 5,
                      flexDirection: 'row'}}>
                      <Text>{s.dia}</Text>
                      <Text>{s.cantidad}</Text>
                    </View>
                  })}

                  <Text style={{fontSize:15, fontWeight: '500', paddingTop:15, alignSelf: 'center'}}>
                    Horas del día en las que ocurren más incidentes</Text>
                  {stats.count_by_hour.map((s,i) => {
                    return <View key={i} style={{justifyContent: 'space-between',
                      borderBottomWidth: 1,
                      borderStyle: 'dashed',
                      borderBottomColor: '#d8d8d8',
                      paddingBottom: 5,
                      flexDirection: 'row'}}>
                      <Text>{this.hourToRange(s.hora)}</Text>
                      <Text>{s.cantidad}</Text>
                    </View>
                  })}

                </View>
                <View style={{
                  width: '100%',
                  marginTop: 'auto'
                }}>
                </View>
              </View>
            </Collapsible>
          </View>
        </View>
    )
  }
}

const styles = StyleSheet.create({
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
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
    padding: 8,
    height: 125
  }
})

export default StatsOverlay;