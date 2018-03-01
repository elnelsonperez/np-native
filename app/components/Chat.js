import React, { Component } from 'react';
import { View,Text,StyleSheet } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat'
import {observer,inject} from 'mobx-react'
import {autorun} from 'mobx'
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

    this._disposer = autorun(() => {

      if (unread.length > 0) {
        this.props.store.markUnreadMessagesAsRead()
      }
    })
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
    return  (
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
    )
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