import React, { Component } from 'react';
import { Text , StyleSheet,Button, View} from 'react-native';
import MapboxGL from '@mapbox/react-native-mapbox-gl';
import * as Progress from 'react-native-progress';
MapboxGL.setAccessToken(
    'sk.eyJ1IjoiZWxuZWxzb25wZXJleiIsImEiOiJjamR6N3c2ZWg0bWV1MzNxcHhuMHFxN3BkIn0.YIqeih5lO_YU43ZHTS1v3A');
import getDirections from 'react-native-google-maps-directions'

export default class Home extends Component {

  constructor(props) {
    super(props)
    this.state = {
      isFetchingAndroidPermission: false,
      isAndroidPermissionGranted: false,
      activeExample: -1,
    };
    this.handleGetDirections = this.handleGetDirections.bind(this)
  }

  async componentWillMount() {
    const isGranted = await MapboxGL.requestAndroidLocationPermissions();
    this.setState({
      isAndroidPermissionGranted: isGranted,
      isFetchingAndroidPermission: false,
      mapDownloaded: false,
      downloadProgress: 0
    });

    const progressListener = (offlineRegion, status) => {
      console.log(status)
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
    console.log(offlinePacks,pack)
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
    const data = {
      destination: {
        latitude: 19.459881,
        longitude: -70.661594
      }
    }

    getDirections(data)
  }

  renderAnnotations () {
    return (
        <MapboxGL.PointAnnotation
            key='pointAnnotation'
            id='pointAnnotation'
            coordinate={[-70.661594, 19.459881]}>

          <View style={styles.annotationContainer}>
            <View style={styles.annotationFill} />
          </View>
          <MapboxGL.Callout selected={true} title='#35 Tiempo: 00:35:00' />
        </MapboxGL.PointAnnotation>
    )
  }

  render() {
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
    } else {

      return (
          <View style={{flex: 1}}>
            <MapboxGL.MapView
                showUserLocation={true}
                zoomLevel={12}
                centerCoordinate={[ -70.687692,19.451361]}
                userTrackingMode={MapboxGL.UserTrackingModes.Follow}
                rotateEnabled={false}
                styleURL={"mapbox://styles/elnelsonperez/cjdz3c7xj1kt12ss6psoiv9ax"}
                style={{flex:1}} >
              {this.renderAnnotations()}
            </MapboxGL.MapView>
            <View style={[styles.container, styles.bottomBar]}>
              <View style={styles.bottomLeft}>
                <Text style={styles.textTop}>El Embrujo I</Text>
                <Text style={styles.textBottom}> Sector asignado</Text>
              </View>
              <View style={styles.bottomRight}>
                <Text style={styles.textTop}>El Embrujo I</Text>
                <Text style={styles.textBottom}> Sector asignado</Text>
              </View>
            </View>
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