/* eslint-disable curly */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */

import React from 'react';
import {ScrollView, View, Text, Image} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faUser} from '@fortawesome/free-solid-svg-icons';
import {Button} from 'react-native-elements';

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
              <View
                style={{
                  backgroundColor: '#CCCCCC',
                  height: 35,
                  width: 35,
                  borderRadius: 25,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 10,
                  overflow: 'hidden',
                }}>
                {this.props.user[v].avatar ? (
                  <Image
                    source={{
                      uri:
                        this.props.serverUrl?.slice(0, -1) +
                        this.props.user[v].avatar,
                    }}
                    style={{height: 35, width: 35}}
                  />
                ) : (
                  <FontAwesomeIcon icon={faUser} color="#ffffff" size={18} />
                )}
              </View>
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
