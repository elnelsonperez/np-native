import React from 'react'
import {View, Text} from 'react-native'

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

export default Field