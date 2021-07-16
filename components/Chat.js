/* eslint-disable curly */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */

import React from 'react';
import {View} from 'react-native';

// Chat Page
class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    console.log(this.props.route.params);
    return <View></View>;
  }
}

export default Chat;
