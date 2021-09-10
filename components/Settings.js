/* eslint-disable curly */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */

import React from 'react';
import {
  ScrollView,
  Text,
  View,
  Image,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import MMKVStorage from 'react-native-mmkv-storage';
import {Button} from 'react-native-elements';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faUser, faEdit} from '@fortawesome/free-solid-svg-icons';
import {launchImageLibrary} from 'react-native-image-picker';

// Settings Page
class Settings extends React.Component {
  constructor(props) {
    super(props);
    this.MMKV = new MMKVStorage.Loader().initialize();
    this.state = {
      modal: false,
      username: props.userInfo?.username,
      bio: props.userInfo?.bio,
      avatar: null,
    };
  }

  render() {
    return (
      <ScrollView
        style={{backgroundColor: '#F9F9F9'}}
        contentContainerStyle={{justifyContent: 'center'}}>
        <Modal
          visible={this.state.modal}
          presentationStyle="formSheet"
          animationType="slide">
          <View style={{backgroundColor: '#F9F9F9', flex: 1}}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#ffffff',
              }}>
              <Button
                title="Cancel"
                type="clear"
                containerStyle={{marginLeft: 15, marginTop: 10}}
                titleStyle={{color: '#ff0000'}}
                onPress={() =>
                  this.setState({
                    modal: false,
                    username: this.props.userInfo?.username,
                    bio: this.props.userInfo?.bio,
                    avatar: null,
                  })
                }
              />
              <View style={{alignItems: 'center'}}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '600',
                  }}>
                  Edit Profile
                </Text>
                <Text
                  style={{color: '#888888', fontWeight: '400', fontSize: 10}}>
                  Click To Edit
                </Text>
              </View>
              <Button
                title={'Done'}
                type="clear"
                containerStyle={{marginRight: 15, marginTop: 10}}
                titleStyle={{color: '#6873F2'}}
                onPress={() => {
                  this.props.patchUserInfo(
                    this.state.username,
                    this.state.bio,
                    this.state.avatar,
                  );
                  this.setState({
                    modal: false,
                    username: this.props.userInfo?.username,
                    bio: this.props.userInfo?.bio,
                    avatar: null,
                  });
                }}
              />
            </View>
            <View
              style={{
                backgroundColor: '#dddddd',
                height: 1,
                width: '100%',
                alignSelf: 'center',
              }}
            />
            <View
              style={{
                backgroundColor: '#dddddd',
                height: 1,
                width: '100%',
                alignSelf: 'center',
                marginTop: 20,
              }}
            />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                padding: 5,
                backgroundColor: '#ffffff',
              }}>
              <TouchableOpacity
                style={{
                  backgroundColor: '#CCCCCC',
                  height: 60,
                  width: 60,
                  borderRadius: 30,
                  justifyContent: 'center',
                  alignItems: 'center',
                  alignSelf: 'center',
                  overflow: 'hidden',
                }}
                onPress={() =>
                  launchImageLibrary({mediaType: 'photo'}, response => {
                    if (!response.didCancel)
                      this.setState({avatar: response.assets[0]});
                  })
                }>
                {this.props.userInfo?.avatar || this.state.avatar ? (
                  <Image
                    source={{
                      uri: this.state.avatar
                        ? this.state.avatar.uri
                        : this.props.serverUrl?.slice(0, -1) +
                          this.props.userInfo.avatar,
                    }}
                    style={{height: 60, width: 60}}
                  />
                ) : (
                  <FontAwesomeIcon icon={faUser} color="#ffffff" size={30} />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={{marginLeft: 15}}
                onPress={() =>
                  Alert.prompt('Username', undefined, v => {
                    if (v) this.setState({username: v});
                  })
                }>
                <Text style={{fontSize: 18}}>{this.state.username}</Text>
              </TouchableOpacity>
            </View>
            <View
              style={{
                backgroundColor: '#dddddd',
                height: 1,
                width: '100%',
                alignSelf: 'center',
                marginBottom: 20,
              }}
            />
            <Text style={{marginLeft: 10, marginBottom: 3, fontWeight: '500'}}>
              biography
            </Text>
            <View
              style={{
                backgroundColor: '#dddddd',
                height: 1,
                width: '100%',
                alignSelf: 'center',
              }}
            />
            <TouchableOpacity
              style={{
                backgroundColor: '#ffffff',
                padding: 5,
                paddingHorizontal: 10,
              }}
              onPress={() =>
                Alert.prompt('Biography', undefined, v => {
                  if (v) this.setState({bio: v});
                })
              }>
              <Text style={{color: '#888888'}}>
                {this.state.bio ? this.state.bio : 'Add your biography'}
              </Text>
            </TouchableOpacity>
            <View
              style={{
                backgroundColor: '#dddddd',
                height: 1,
                width: '100%',
                alignSelf: 'center',
              }}
            />
          </View>
        </Modal>
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
            <TouchableOpacity
              style={{position: 'absolute', right: 15}}
              onPress={() => this.setState({modal: true})}>
              <FontAwesomeIcon icon={faEdit} color="#6873F2" size={26} />
            </TouchableOpacity>
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
