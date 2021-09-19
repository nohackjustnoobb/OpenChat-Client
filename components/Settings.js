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
  Modal,
  TextInput,
  Keyboard,
  Alert,
} from 'react-native';
import MMKVStorage from 'react-native-mmkv-storage';
import {Button} from 'react-native-elements';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faUser} from '@fortawesome/free-solid-svg-icons';
import {launchImageLibrary} from 'react-native-image-picker';
import {BackHeaderLeft} from '../App';
import ImageView from 'react-native-image-viewing';
import {SafeAreaView} from 'react-native-safe-area-context';

// Settings Page
class Settings extends React.Component {
  constructor(props) {
    super(props);
    this.MMKV = new MMKVStorage.Loader().initialize();
    this.state = {
      edit: false,
      username: this.props.userInfo?.username,
      bio: this.props.userInfo?.bio ? this.props.userInfo?.bio : '',
      avatar: this.props.userInfo?.avatar,
      modal: false,
      avatarView: false,
    };
  }

  updateHeader() {
    function Header(props) {
      return (
        <TouchableOpacity onPress={props.onPress}>
          <Text
            style={{
              color: props.titleColor,
              fontSize: 18,
              marginHorizontal: 15,
            }}>
            {props.title}
          </Text>
        </TouchableOpacity>
      );
    }

    this.props.navigation.setOptions({
      headerLeft: props => (
        <Header
          {...props}
          title="Cancel"
          titleColor="#ff0000"
          onPress={() => {
            Keyboard.dismiss();
            this.props.navigation.setOptions({
              headerLeft: headerProps => <BackHeaderLeft {...headerProps} />,
              headerRight: undefined,
            });
            this.setState({
              edit: false,
              username: this.props.userInfo?.username,
              bio: this.props.userInfo?.bio ? this.props.userInfo?.bio : '',
              avatar: this.props.userInfo.avatar,
            });
          }}
        />
      ),
      headerRight: props => (
        <Header
          {...props}
          title="Done"
          titleColor="#6873F2"
          onPress={() => {
            this.props.patchUserInfo(
              this.state.username,
              this.state.bio,
              this.state.avatar === this.props.userInfo?.avatar
                ? null
                : this.state.avatar,
            );
            this.setState({edit: false});
            Keyboard.dismiss();
            this.props.navigation.setOptions({
              headerLeft: headerProps => <BackHeaderLeft {...headerProps} />,
              headerRight: undefined,
            });
          }}
        />
      ),
    });
  }

  render() {
    if (this.state.edit) this.updateHeader();

    return (
      <ScrollView
        style={{backgroundColor: '#F9F9F9'}}
        contentContainerStyle={{justifyContent: 'center'}}>
        <ImageView
          images={[
            {
              uri:
                this.state.avatar === this.props.userInfo?.avatar
                  ? this.props.serverUrl?.slice(0, -1) + this.state.avatar
                  : this.state.avatar.uri,
            },
          ]}
          imageIndex={0}
          backgroundColor="#ffffff"
          visible={this.state.avatarView}
          HeaderComponent={props => (
            <SafeAreaView
              style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <TouchableOpacity
                onPress={() =>
                  launchImageLibrary({mediaType: 'photo'}, response => {
                    if (!response.didCancel)
                      this.setState({
                        avatar: response.assets[0],
                        avatarView: false,
                        edit: true,
                      });
                  })
                }>
                <Text
                  style={{
                    color: '#6873F2',
                    fontSize: 18,
                    marginHorizontal: 20,
                    marginVertical: 5,
                  }}>
                  Edit
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => this.setState({avatarView: false})}>
                <Text
                  style={{
                    color: '#ff0000',
                    fontSize: 18,
                    marginHorizontal: 20,
                    marginVertical: 5,
                  }}>
                  Close
                </Text>
              </TouchableOpacity>
            </SafeAreaView>
          )}
          onRequestClose={() => this.setState({avatarView: false})}
        />
        <Modal
          visible={this.state.modal}
          presentationStyle="formSheet"
          animationType="slide">
          <View style={{flex: 1, backgroundColor: '#F9F9F9'}}>
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
                    bio: this.props.userInfo?.bio,
                    modal: false,
                  })
                }
              />
              <View style={{alignItems: 'center'}}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '600',
                  }}>
                  Biography
                </Text>
                <Text
                  style={{color: '#888888', fontWeight: '400', fontSize: 10}}>
                  {`${this.state.bio.length}/500`}
                </Text>
              </View>
              <Button
                title={'Done'}
                type="clear"
                containerStyle={{marginRight: 15, marginTop: 10}}
                titleStyle={{color: '#6873F2'}}
                onPress={() => {
                  this.setState({
                    modal: false,
                    edit: true,
                  });
                }}
              />
            </View>
            <View
              style={{
                backgroundColor: '#eeeeee',
                height: 1,
                width: '100%',
                alignSelf: 'center',
              }}
            />
            <View style={{flex: 1, backgroundColor: '#ffffff', marginTop: 20}}>
              <View
                style={{
                  backgroundColor: '#eeeeee',
                  height: 1,
                  width: '100%',
                  alignSelf: 'center',
                }}
              />
              <TextInput
                multiline
                style={{padding: 10, width: '100%', height: '100%'}}
                value={this.state.bio}
                onChangeText={v => {
                  if (v.length <= 500) this.setState({bio: v});
                }}
              />
            </View>
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
            <TouchableOpacity
              onPress={() => this.setState({avatarView: true})}
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
              {this.state.avatar ? (
                <Image
                  source={{
                    uri:
                      this.state.avatar === this.props.userInfo?.avatar
                        ? this.props.serverUrl?.slice(0, -1) + this.state.avatar
                        : this.state.avatar.uri,
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
            </TouchableOpacity>
            <TextInput
              numberOfLines={1}
              value={this.state.username}
              onChangeText={v => {
                if (v.length <= 20) this.setState({edit: true, username: v});
              }}
              autoCorrect={false}
              style={{fontSize: 16, fontWeight: '600', flex: 1}}
            />
            <Text style={{color: '#888888', marginRight: 10, fontSize: 16}}>
              {this.state.edit ? 20 - this.state.username.length : ''}
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
          <TouchableOpacity
            style={{backgroundColor: '#ffffff'}}
            onPress={() => this.setState({modal: true})}>
            <Text style={{margin: 7, marginHorizontal: 20, color: '#888888'}}>
              {this.state.bio ? this.state.bio : 'Add your biography'}
            </Text>
          </TouchableOpacity>
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
            onPress={() =>
              Alert.alert('Log Out ?', undefined, [
                {text: 'Cancel', style: 'cancel'},
                {
                  text: 'Yes',
                  style: 'destructive',
                  onPress: () => this.props.logout(),
                },
              ])
            }
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
            onPress={() =>
              Alert.alert('Disconnect From Server ?', undefined, [
                {text: 'Cancel', style: 'cancel'},
                {
                  text: 'Yes',
                  style: 'destructive',
                  onPress: () => this.props.disconnectServer(),
                },
              ])
            }
          />
        </View>
      </ScrollView>
    );
  }
}

export default Settings;
