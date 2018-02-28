import React, { Component } from 'react';
import { View,Text,StyleSheet } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat'
import {observer,inject} from 'mobx-react'
// import {autorun} from 'mobx'
import {Send} from 'react-native-gifted-chat'
import Snackbar from 'react-native-snackbar';
@inject('store')
@observer
export default class Chat extends Component {
  constructor (props) {
    super(props);
    this.renderSend = this.renderSend.bind(this)
    this.sortMessages = this.sortMessages.bind(this)
    this.avatarPressed = this.avatarPressed.bind(this)
  }


  componentDidMount () {
    this.props.store.resetUnread()
  }

  onSend(mensajes = []) {
    this.props.store.sendMessagesToServer(mensajes)
  }

  renderSend(props) {
    return (
        <Send
            {...props}
            label={"Enviar"}
        >
        </Send>
    );
  }

  avatarPressed (user) {
    Snackbar.show({
      title: user.name,
      duration: Snackbar.LENGTH_SHORT,
    });
  }

  sortMessages (array) {
    return array.sort((a,b) => {
      return b.createdAt - a.createdAt
    })
  }

  render() {
    let toRender =
        <View style={{ flex: 1 , justifyContent: "center", alignItems:"center"}}>
          <Text style={{color: '#1976D2', fontSize: 17}}>Cargando mensajes...</Text>
        </View>

    if (this.props.store.mensajes.length > 0) {
      toRender =
          <GiftedChat
              messages={this.sortMessages(this.props.store.mensajes.slice())}
              placeholder={"Escriba su mensaje..."}
              renderSend={this.renderSend}
              onSend={messages => this.onSend(messages)}
              user={{_id: this.props.store.userId}}
              onPressAvatar={this.avatarPressed}
              showAvatarForEveryMessage={true}
              keyboardShouldPersistTaps={'never'}
          />
    }
    return toRender
  }
}

const styles = StyleSheet.create({
  loading: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center'
  }
})