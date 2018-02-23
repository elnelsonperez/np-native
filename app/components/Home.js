import React, { Component } from 'react';
import { Text , StyleSheet, View} from 'react-native';
import MapboxGL from '@mapbox/react-native-mapbox-gl';
import * as Progress from 'react-native-progress';
MapboxGL.setAccessToken(
    'sk.eyJ1IjoiZWxuZWxzb25wZXJleiIsImEiOiJjamR6N3c2ZWg0bWV1MzNxcHhuMHFxN3BkIn0.YIqeih5lO_YU43ZHTS1v3A');

export default class Home extends Component {

  constructor(props) {
    super(props)
    this.state = {
      isFetchingAndroidPermission: false,
      isAndroidPermissionGranted: false,
      activeExample: -1,
    };
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

      let directions = {"routes":[{"geometry":{"coordinates":[[-70.669408,19.442716],[-70.671457,19.444537],[-70.67106,19.444972],[-70.670725,19.445077],[-70.669136,19.443795],[-70.668629,19.443795],[-70.668262,19.444076],[-70.667873,19.444448],[-70.665839,19.449538],[-70.665473,19.453239],[-70.665873,19.456494],[-70.666188,19.456651],[-70.666091,19.459014],[-70.661592,19.45987]],"type":"LineString"},"legs":[{"summary":"","weight":958.1,"duration":460.5,"steps":[],"distance":2947.3}],"weight_name":"routability","weight":958.1,"duration":460.5,"distance":2947.3}],"waypoints":[{"name":"Autopista Duarte","location":[-70.669408,19.442716]},{"name":"Carretera Don Pedro","location":[-70.661592,19.45987]}],"code":"Ok","uuid":"cjdzhqczd0inw49ls39t1zl3j"}
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
              <MapboxGL.Animated.ShapeSource id="routeSource" shape={directions.routes[0].geometry}>
                <MapboxGL.Animated.LineLayer
                    style={layerStyles.route}
                id='mapbox-directions-line'/>
              </MapboxGL.Animated.ShapeSource>
            </MapboxGL.MapView>

          </View>
      );
    }
  }

}

const layerStyles = MapboxGL.StyleSheet.create({
  route: {
    lineColor: "#188def",
    lineWidth: 2,
    lineOpacity: 0.65
  },
});

const styles = StyleSheet.create({
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
  }


});