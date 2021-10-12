/* eslint-disable curly */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */

import React from 'react';
import {View, Text, Alert} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Button, Overlay, Input} from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import LottieView from 'lottie-react-native';
import MMKVStorage from 'react-native-mmkv-storage';

class Start extends React.Component {
  constructor(props) {
    super(props);
    // initialize MMKVStorage
    this.MMKV = new MMKVStorage.Loader().initialize();

    this.state = {
      serverMenu: false,
      connected: Boolean(props.serverUrl),
    };
  }

  // connect to server
  async connectToServer() {
    try {
      // add '/' at the end for url
      if (!this.props.serverUrl.endsWith('/')) {
        this.props.setState({serverUrl: this.props.serverUrl + '/'});
      }

      var response = await fetch(this.props.serverUrl);
      if (response.ok) {
        // save server url
        this.MMKV.setString('serverUrl', this.props.serverUrl);
        var jsonResult = await response.json();
        Alert.alert('Server Connected');
        this.setState({
          connected: true,
          serverMenu: false,
        });
        this.props.setState({serverInfo: jsonResult});
      } else {
        throw 'Cannot connect to server';
      }
    } catch (e) {
      this.props.setState({serverUrl: ''});
      Alert.alert('Cannot connect to server');
    }
  }

  render() {
    if (this.state.connected && !this.props.serverUrl) {
      this.setState({connected: false});
    }

    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: 'space-between',
          backgroundColor: '#F9F9F9',
        }}>
        <View style={{alignSelf: 'center', marginTop: 40}}>
          <Text style={{fontSize: 40, fontWeight: '600', alignSelf: 'center'}}>
            <Text style={{color: '#6873F2'}}>Open</Text>Chat
          </Text>
          <View
            style={{
              backgroundColor: '#000000',
              height: 3,
              width: 120,
              marginTop: 3,
              alignSelf: 'center',
              marginBottom: 25,
            }}
          />
        </View>
        <LottieView
          style={{transform: [{translateX: 5}]}}
          source={require('../LottieAnimations/lf30_editor_fvfgscyp.json')}
          autoPlay
          loop
        />
        <View style={{width: '100%'}}>
          <Button
            title=""
            icon={<Icon name="server" size={20} color="#ffffff" />}
            titleStyle={{color: '#ffffff', paddingLeft: 6}}
            buttonStyle={{
              backgroundColor: '#6873F2',
              width: 80,
              height: 40,
              borderRadius: 20,
            }}
            containerStyle={{alignSelf: 'center'}}
            onPress={() => {
              if (!this.props.serverInfo && this.props.serverUrl) {
                this.props.getServerInfo();
              }
              this.setState({serverMenu: true});
            }}
          />
          <View
            style={{
              flexDirection: 'row',
              paddingHorizontal: 20,
              marginVertical: 20,
            }}>
            <Button
              title="Log In"
              containerStyle={{flex: 1}}
              buttonStyle={{
                backgroundColor: '#6873F2',
                alignSelf: 'center',
                width: '90%',
              }}
              onPress={() => {
                if (!this.props.serverUrl) {
                  this.setState({serverMenu: true});
                } else {
                  this.props.navigation.navigate('LogIn');
                }
              }}
            />
            <Button
              title="Sign Up"
              titleStyle={{color: '#6873F2'}}
              containerStyle={{flex: 1}}
              type="outline"
              buttonStyle={{
                borderColor: '#6873F2',
                alignSelf: 'center',
                width: '90%',
              }}
              onPress={() => {
                if (!this.props.serverUrl) {
                  this.setState({serverMenu: true});
                } else {
                  this.props.navigation.navigate('SignUp');
                }
              }}
            />
          </View>
        </View>
        <Overlay
          isVisible={this.state.serverMenu}
          onBackdropPress={() => this.setState({serverMenu: false})}>
          {this.state.connected ? (
            <View
              style={{
                alignItems: 'center',
                padding: 10,
                paddingHorizontal: 20,
              }}>
              <Text style={{fontSize: 21, fontWeight: '600', marginBottom: 10}}>
                Server Info
              </Text>
              <View>
                <Text>
                  Address:{' '}
                  <Text style={{fontWeight: '700'}}>
                    {this.props.serverUrl}
                  </Text>
                </Text>
                <Text>
                  Name:{' '}
                  <Text style={{fontWeight: '700'}}>
                    {this.props.serverInfo?.serverName}
                  </Text>
                </Text>
                <Text>
                  Type:{' '}
                  <Text style={{fontWeight: '700'}}>
                    {this.props.serverInfo?.serverType}
                  </Text>
                </Text>
                <Text>
                  Version:{' '}
                  <Text style={{fontWeight: '700'}}>
                    {this.props.serverInfo?.serverVersion}
                  </Text>
                </Text>
              </View>

              <View style={{flexDirection: 'row', marginTop: 20}}>
                <Button
                  title="Disconnect"
                  buttonStyle={{
                    backgroundColor: '#6873F2',
                    width: 110,
                    marginRight: 5,
                  }}
                  onPress={() => {
                    this.MMKV.removeItem('serverUrl');
                    this.props.setState({serverUrl: ''});
                    this.setState({connected: false});
                  }}
                />
                <Button
                  title="Cancel"
                  titleStyle={{color: '#6873F2'}}
                  type="outline"
                  buttonStyle={{
                    width: 110,
                    marginLeft: 5,
                    borderColor: '#6873F2',
                  }}
                  onPress={() => this.setState({serverMenu: false})}
                />
              </View>
            </View>
          ) : (
            <React.Fragment>
              <Input
                containerStyle={{
                  width: 300,
                  padding: 5,
                }}
                onChangeText={v => this.props.setState({serverUrl: v})}
                leftIcon={<Icon name="server" size={21} color="#6873F2" />}
                value={this.props.serverUrl}
                label="Server Address"
                autoCorrect={false}
              />
              <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                <Button
                  title="Apply"
                  buttonStyle={{
                    backgroundColor: '#6873F2',
                    width: 100,
                    marginRight: 5,
                  }}
                  onPress={this.connectToServer.bind(this)}
                />
                <Button
                  title="Cancel"
                  titleStyle={{color: '#6873F2'}}
                  type="outline"
                  buttonStyle={{
                    width: 100,
                    marginLeft: 5,
                    borderColor: '#6873F2',
                  }}
                  onPress={() => this.setState({serverMenu: false})}
                />
              </View>
            </React.Fragment>
          )}
        </Overlay>
      </SafeAreaView>
    );
  }
}

export default Start;
