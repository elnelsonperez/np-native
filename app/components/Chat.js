import React, { Component } from 'react';
// import { Text,View } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat'
import {observer,inject} from 'mobx-react'
// import {autorun} from 'mobx'
import {Send} from 'react-native-gifted-chat'

@inject('store')
@observer
export default class Chat extends Component {
  constructor (props) {
    super(props);
    this.renderSend = this.renderSend.bind(this)
  }

  componentWillMount() {

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


  render() {
    return (
        <GiftedChat
            messages={this.props.store.mensajes.slice()}
            placeholder={"Escriba su mensaje..."}
            renderSend={this.renderSend}
            onSend={messages => this.onSend(messages)}
            user={{_id: this.props.store.userId}}
        />

    )
  }
}
