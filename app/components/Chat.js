import React, { Component } from 'react';
import { Text } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat'

export default class Chat extends Component {

  constructor (props) {
    super(props);
    this.state = {
      messages: [],
    }

  }
  componentWillMount() {
    this.setState({
      messages: [
        {
          _id: 1,
          text: 'Mensaje hardcodeado de prueba. Yey!',
          createdAt: new Date(),
          user: {
            _id: 2,
            name: 'React Native'
          },
        },
      ],
    })

  }


  onSend(messages = []) {
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }))
  }

  render() {
    return (
        <GiftedChat
            messages={this.state.messages}
            onSend={messages => this.onSend(messages)}
            user={{
              _id: 1,
            }}
        />
    )
  }
}
