/* eslint-disable curly */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */

import React from 'react';
import {ScrollView, Text, View, Image, TouchableOpacity} from 'react-native';
import MMKVStorage from 'react-native-mmkv-storage';
import {Button} from 'react-native-elements';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faUser, faChevronLeft} from '@fortawesome/free-solid-svg-icons';

// Settings Page
class Settings extends React.Component {
  constructor(props) {
    super(props);
    this.MMKV = new MMKVStorage.Loader().initialize();
    this.state = {};
  }

  render() {
    return (
      <ScrollView
        style={{backgroundColor: '#F9F9F9'}}
        contentContainerStyle={{justifyContent: 'center'}}>
        <View
          style={{
            backgroundColor: '#ffffff',
            marginVertical: 20,
            borderBottomWidth: 1,
            borderTopWidth: 1,
            borderColor: '#dddddd',
          }}>
          <View style={{alignItems: 'center', flexDirection: 'row'}}>
            <View
              style={{
                width: 70,
                height: 70,
                borderRadius: 35,
                overflow: 'hidden',
                backgroundColor: '#CCCCCC',
                justifyContent: 'center',
                margin: 10,
                marginRight: 10,
                marginLeft: 20,
              }}>
              {this.props.userInfo.avatar ? (
                <Image
                  source={{
                    uri:
                      this.props.serverUrl?.slice(0, -1) +
                      this.props.userInfo?.avatar,
                  }}
                  style={{width: 70, height: 70}}
                />
              ) : (
                <FontAwesomeIcon
                  icon={faUser}
                  color="#ffffff"
                  size={35}
                  style={{alignSelf: 'center'}}
                />
              )}
            </View>
            <Text style={{fontSize: 16, fontWeight: '600'}}>
              {this.props.userInfo.username}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: '#eeeeee',
              height: 1,
              width: '100%',
              alignSelf: 'center',
            }}
          />
          <View style={{backgroundColor: '#ffffff'}}>
            <Text style={{margin: 7, marginHorizontal: 20, color: '#888888'}}>
              {this.props.userInfo.bio
                ? this.props.userInfo.bio
                : 'Add your biography'}
            </Text>
          </View>
        </View>
        <View
          style={{
            borderBottomWidth: 1,
            borderTopWidth: 1,
            borderColor: '#dddddd',
          }}>
          <Button
            title="Log Out"
            buttonStyle={{backgroundColor: '#ffffff'}}
            titleStyle={{color: '#ff0000'}}
            onPress={() => this.props.logout()}
          />
          <View
            style={{
              backgroundColor: '#eeeeee',
              height: 1,
              width: '100%',
              alignSelf: 'center',
            }}
          />
          <Button
            title="Disconnect From Server"
            buttonStyle={{backgroundColor: '#ffffff'}}
            titleStyle={{color: '#ff0000'}}
            onPress={() => this.props.disconnectServer()}
          />
        </View>
      </ScrollView>
    );
  }
}

export default Settings;
