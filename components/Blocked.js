/* eslint-disable curly */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */

import React from 'react';
import {ScrollView, View, Text} from 'react-native';
import {Button} from 'react-native-elements';

import {Avatar} from '../App';

class Blocked extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <ScrollView style={{backgroundColor: '#F9F9F9', padding: 10}}>
        {this.props.blocked.map(v => {
          if (!this.props.user[v]) this.props.getUserByID([v]);
          return (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 5,
              }}
              key={v.id}>
              <Avatar
                size={35}
                uri={
                  this.props.user[v].avatar
                    ? this.props.serverUrl?.slice(0, -1) +
                      this.props.user[v].avatar
                    : undefined
                }
              />
              <View style={{justifyContent: 'center', alignContent: 'center'}}>
                <Text>{this.props.user[v].username}</Text>
              </View>
              <View
                style={{flexDirection: 'row', position: 'absolute', right: 10}}>
                <Button
                  title="Unblock"
                  type="outline"
                  containerStyle={{
                    alignSelf: 'center',
                  }}
                  buttonStyle={{
                    paddingVertical: 2,
                    borderColor: '#ee5555',
                    borderWidth: 1,
                  }}
                  titleStyle={{color: '#ee5555', fontSize: 14}}
                  onPress={() => this.props.toggleUserBlock(v)}
                />
              </View>
            </View>
          );
        })}
      </ScrollView>
    );
  }
}

export default Blocked;
