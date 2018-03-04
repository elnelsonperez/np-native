import React, { Component } from 'react';
import Overlay from './IncidenteOverlay'
import { Text , StyleSheet,Button, View,TouchableHighlight} from 'react-native';
import MapboxGL from '@mapbox/react-native-mapbox-gl';
import * as Progress from 'react-native-progress';
import {Incidencia} from './../shared'
import moment from 'moment'
MapboxGL.setAccessToken(
    'sk.eyJ1IjoiZWxuZWxzb25wZXJleiIsImEiOiJjamR6N3c2ZWg0bWV1MzNxcHhuMHFxN3BkIn0.YIqeih5lO_YU43ZHTS1v3A');
import getDirections from 'react-native-google-maps-directions'
import {inject, observer} from "mobx-react";
import {autorun} from "mobx";
import centroid from '@turf/centroid'
import midpoint from '@turf/midpoint'
@inject('store')
@observer
export default class Home extends Component {

  constructor(props) {
    super(props)
    this.state = {
      isFetchingAndroidPermission: false,
      isAndroidPermissionGranted: false,
      activeExample: -1,
      currentIncidenciaTimeSince: null
    };
    this.handleGetDirections = this.handleGetDirections.bind(this)
    this.jumpToSector = this.jumpToSector.bind(this)
  }

  componentWillUnmount () {
    this._dispose()
    clearInterval(this._timeout)
  }

  componentDidMount () {
    const {store} = this.props
    this._dispose = autorun (() => {
      if (store.nextPendingIncidencia !== null && store.activeIncidencia === null) {
        navigator.geolocation.getCurrentPosition(async res => {
          const p1 = [res.coords.longitude, res.coords.latitude]
          const p2 = store.nextPendingIncidencia.ubicacion.coordinates.slice();
          const center = midpoint(p1,p2)
          await this._map.flyTo(center.geometry.coordinates, 300)
          await this._map.zoomTo(12,300)
        })
      }
    })

    this._timeout =  setInterval(() => {
      if (store.nextPendingIncidencia !== null || store.activeIncidencia !== null) {
        let inci = null;
        if (store.activeIncidencia) {
          inci = store.activeIncidencia
        } else {
          inci = store.nextPendingIncidencia
        }
        const duration = moment.duration(moment().diff(moment(inci.fecha_incidencia)));
        const tiempo = moment.utc(duration.asMilliseconds()).format("HH:mm:ss");
        this.setState ({
          currentIncidenciaTimeSince: tiempo
        })
      } else {
        this.setState ( {
          currentIncidenciaTimeSince: null
        })
      }
    }, 1000);

  }
  async componentWillMount() {
    const isGranted = await MapboxGL.requestAndroidLocationPermissions();
    this.setState({
      isAndroidPermissionGranted: isGranted,
      isFetchingAndroidPermission: false,
      mapDownloaded: false,
      downloadProgress: 0,
      movingMap: false
    });

    const progressListener = (offlineRegion, status) => {
      this.setState({
        downloadProgress: status.percentage/100
      })
      if (status.percentage === 100) {
        this.setState({
          mapDownloaded: true
        })
      }
    };

    const errorListener = (offlineRegion, err) => console.log(offlineRegion, err);

    // await MapboxGL.offlineManager.deletePack('local')
    const offlinePacks = await MapboxGL.offlineManager.getPacks();
    const pack = offlinePacks.find(v => v._metadata.name === "local")
    if (pack) {
      this.setState({
        mapDownloaded: true
      })
    } else {
      await MapboxGL.offlineManager.createPack({
        name: 'local',
        styleURL: 'mapbox://styles/elnelsonperez/cjdz3c7xj1kt12ss6psoiv9ax',
        minZoom: 2,
        maxZoom: 20,
        bounds: [[ -70.753856,19.411341 ], [ -70.636783,19.50716]]
      }, progressListener, errorListener)
    }

  }

  handleGetDirections () {
    const {store} = this.props
    const data = {
      destination: {
        latitude: store.activeIncidencia.ubicacion.coordinates[1],
        longitude: store.activeIncidencia.ubicacion.coordinates[0],
      }
    }
    getDirections(data)
  }

  async jumpToSector () {
    if (!this.state.movingMap) {
      this.setState({
        movingMap: true
      })
      const center = centroid(this.props.store.config.sector.limites)
      await this._map.flyTo(center.geometry.coordinates,300)
      await this._map.zoomTo(14,300)
      this.setState({
        movingMap: false
      })
    }
  }

  renderIncidencias () {
    return this.props.store.incidencias.map(i => {
      return this.renderIncidencia(i)
    })
  }

  renderIncidencia (i) {
    if (i.estado_id === Incidencia.EN_CURSO ||
        i.estado_id === Incidencia.ASIGNADA
    ) {
      let color = '#e51b11';
      if (i.estado_id === Incidencia.EN_CURSO) {
        color = "#58a721"
      }

      return (
          <MapboxGL.PointAnnotation
              key={i.id}
              id={i.id.toString()}
              selected={false}
              coordinate={i.ubicacion.coordinates.slice()}>
            <View style={styles.annotationContainer}>
              <View style={[styles.annotationFill, {backgroundColor: color}]} />
            </View>
            <MapboxGL.Callout  title={'Tiempo: '+this.state.currentIncidenciaTimeSince} />
          </MapboxGL.PointAnnotation>
      )
    }
    return false

  }

  render() {
    const store = this.props.store;
    if ( !this.state.isAndroidPermissionGranted) {
      if (this.state.isFetchingAndroidPermission) {
        return null;
      }
      return (
          <View style={{flex:1}}>
            <Text style={styles.noPermissionsText}>
              Es necesario que conceda los permisos de localizacion para utilizar la App.
            </Text>
          </View>
      );
    }

    if (!this.state.mapDownloaded) {
      return (
          <View style={styles.centerAll}>
            <Text>Descargando Mapa de Santiago</Text>
            <View style={{marginTop: 15}}>
              <Progress.Circle
                  color={'#1976D2'}
                  size={85}
                  showsText={true}
                  progress={this.state.downloadProgress}/>
            </View>
          </View>
      )
    }
    else {
      return (
          <View style={{flex: 1, position: 'relative'}}>

            {store.nextPendingIncidencia !== null &&
            store.activeIncidencia === null &&
            <Overlay incidente={store.nextPendingIncidencia} active={false}/>}

            {store.activeIncidencia !== null &&
            <Overlay incidente={store.activeIncidencia} active={true}
                     time={this.state.currentIncidenciaTimeSince}/>
            }

            <MapboxGL.MapView
                ref={(child) => { this._map = child }}
                showUserLocation={true}
                zoomLevel={12}
                minZoomLevel={2}
                maxZoomLevel={20}
                compassEnabled={true}
                centerCoordinate={[-70.687692,19.451361]}
                userTrackingMode={MapboxGL.UserTrackingModes.Follow}
                rotateEnabled={false}
                styleURL={"mapbox://styles/elnelsonperez/cjdz3c7xj1kt12ss6psoiv9ax"}
                style={{flex:1}} >
              {this.renderIncidencias()}
              <MapboxGL.Animated.ShapeSource id="polygonSource" shape={store.config.sector.limites}>
                <MapboxGL.Animated.FillLayer
                    style={{fillOpacity: 0.20, fillColor: '#f44242',fillOutlineColor: "#BD2934"}}
                    id='fill-poly'/>
              </MapboxGL.Animated.ShapeSource>
            </MapboxGL.MapView>
            <View style={{ position: 'absolute',
              top: 0, bottom: 0, right: 0, height: "100%", width: 20,  backgroundColor: 'transparent', zIndex:100 }}/>

            {store.activeIncidencia &&
            <View style={[styles.container, styles.bottomBar, {backgroundColor: "#58a721"}]}>
              <View style={{justifyContent: 'center', alignItems: 'center', flexGrow: 1}}>
                <TouchableHighlight underlayColor={'transparent'} activeOpacity={0.7}
                                    onPress={this.handleGetDirections}>
                  <Text style={styles.textTop}>Obtener direcciones a incidente</Text>
                </TouchableHighlight>
                <Text style={styles.textBottom}>
                  Con Google Maps
                </Text>
              </View>
            </View>
            }

            {!store.activeIncidencia &&
            <View style={[styles.container, styles.bottomBar]}>
              <View style={{justifyContent: 'center', alignItems: 'center', flexGrow: 1}}>
                <TouchableHighlight underlayColor={'transparent'} activeOpacity={0.7} onPress={this.jumpToSector}>
                  <Text style={styles.textTop}>{store.config.sector.nombre}</Text>
                </TouchableHighlight>
                <Text style={styles.textBottom}>
                  Sector de patrullaje asignado
                </Text>
              </View>
            </View>
            }
          </View>


      );
    }
  }
}

const styles = StyleSheet.create({
  bottomLeft: {
    justifyContent: 'center',
    alignItems: 'center',
    flexGrow: 1
  },
  bottomRight: {
    justifyContent: 'center',
    alignItems: 'center',
    flexGrow: 1
  },
  textTop: {
    color: '#FCFCFC',
    fontSize: 18,
    fontWeight:"500"
  },
  textBottom: {
    color: '#FCFCFC',
    fontSize: 10
  },
  bottomBar: {
    flexDirection: 'row',
    paddingLeft: 5,
    paddingRight: 5,
    flexBasis: 45,
    backgroundColor: '#1976D2',
    borderTopColor: '#FCFCFC',
    borderTopWidth: 2,
  },
  noPermissionsText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  header: {
    marginTop: 48,
    fontSize: 24,
    textAlign: 'center',
  },
  centerAll : {
    justifyContent: "center",
    alignItems: "center",
    flex:1
  },
  annotationContainer: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 15,
  },
  annotationFill: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#e51b11',
    transform: [{ scale: 0.6 }],
  }
});