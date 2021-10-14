/* eslint-disable curly */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */

import React from 'react';
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Modal,
  TextInput,
  Keyboard,
  Alert,
} from 'react-native';
import MMKVStorage from 'react-native-mmkv-storage';
import {Button} from 'react-native-elements';
import {launchImageLibrary} from 'react-native-image-picker';
import {BackHeaderLeft} from '../App';
import ImageView from 'react-native-image-viewing';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ColorPicker from 'react-native-wheel-color-picker';

import {Avatar} from '../App';

// Settings Page
class Settings extends React.Component {
  constructor(props) {
    super(props);
    this.MMKV = new MMKVStorage.Loader().initialize();
    this.themeColor = props.themeColor;
    this.state = {
      edit: false,
      username: this.props.userInfo?.username,
      bio: this.props.userInfo?.bio ? this.props.userInfo?.bio : '',
      avatar: this.props.userInfo?.avatar,
      modal: false,
      avatarView: false,
      picker: false,
      currentColor: this.themeColor,
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
          titleColor={this.themeColor}
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

    const defaultColor = [
      '#F26868',
      '#F2BCD1',
      '#deceb4',
      '#6dc2c9',
      '#6873F2',
      '#c28ef9',
    ];

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
          HeaderComponent={() => (
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
                    color: this.themeColor,
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
                titleStyle={{color: this.themeColor}}
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
                margin: 10,
                marginRight: 10,
                marginLeft: 20,
              }}>
              <Avatar
                size={70}
                uri={
                  this.state.avatar
                    ? this.state.avatar === this.props.userInfo?.avatar
                      ? this.props.serverUrl?.slice(0, -1) + this.state.avatar
                      : this.state.avatar.uri
                    : undefined
                }
              />
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
            backgroundColor: '#ffffff',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 5,
          }}>
          <Text style={{padding: 10}}>Theme Color:</Text>
          <Modal
            visible={this.state.picker}
            presentationStyle="fullScreen"
            animationType="slide">
            <SafeAreaView style={{flex: 1}}>
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
                  onPress={() => this.setState({picker: false})}
                />
                <View
                  style={{
                    backgroundColor: this.state.currentColor,
                    padding: 10,
                    paddingHorizontal: 15,
                    borderRadius: 10,
                  }}>
                  <Text style={{color: '#ffffff'}}>
                    {this.state.currentColor}
                  </Text>
                </View>
                <Button
                  title={'Done'}
                  type="clear"
                  containerStyle={{marginRight: 15, marginTop: 10}}
                  titleStyle={{color: this.themeColor}}
                  onPress={() => {
                    this.themeColor = this.state.currentColor;
                    this.props.changeThemeColor(this.state.currentColor);
                    this.setState({picker: false});
                  }}
                />
              </View>
              <View style={{flex: 1, marginHorizontal: 30, marginBottom: 30}}>
                <ColorPicker
                  color={this.state.currentColor}
                  onColorChange={c => this.setState({currentColor: c})}
                  onColorChangeComplete={this.onColorChangeComplete}
                />
              </View>
            </SafeAreaView>
          </Modal>
          <View style={{flexDirection: 'row'}}>
            <TouchableOpacity
              onPress={() => this.setState({picker: true})}
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 10,
                width: 30,
                height: 30,
                borderRadius: 7,
                backgroundColor: this.themeColor,
              }}>
              <Icon
                name="brush"
                style={{
                  opacity: 0.7,
                }}
                size={22}
              />
            </TouchableOpacity>
            {defaultColor.map(v => (
              <TouchableOpacity
                key={v}
                onPress={() => {
                  this.themeColor = v;
                  this.props.changeThemeColor(v);
                }}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 7,
                  backgroundColor: v,
                  marginRight: 10,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Icon
                  name="check-bold"
                  style={{
                    opacity: 0.5,
                    display: v === this.themeColor ? 'flex' : 'none',
                  }}
                  size={18}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View
          style={{
            marginTop: 20,
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
                  onPress: this.props.logout,
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
                  onPress: this.props.disconnectServer,
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
