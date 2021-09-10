/* eslint-disable curly */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */

import React from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
} from 'react-native';
import MMKVStorage from 'react-native-mmkv-storage';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Input, Button, Overlay} from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import LinearGradient from 'react-native-linear-gradient';

// Login Page
class Login extends React.Component {
  constructor(props) {
    super(props);
    // initialize MMKVStorage
    this.MMKV = new MMKVStorage.Loader().initialize();

    this.state = {
      username: '',
      password: '',
      setServerMenu: false,
      connected: Boolean(props.serverUrl),
    };

    if (!props.serverInfo && props.serverUrl) {
      props.getServerInfo();
    }
  }

  componentDidUpdate() {
    if (this.state.connected && !this.props.serverUrl) {
      this.setState({connected: false, username: '', password: ''});
    }
  }

  // handle login
  async login() {
    // check if server connected
    if (!this.props.serverUrl) {
      return this.setState({setServerMenu: true});
    }

    // check if password or username if empty
    if (!this.state.password || !this.state.username) {
      return Alert.alert('Please enter your username and password');
    }

    // get token from server
    try {
      var response = await fetch(this.props.serverUrl + 'token/', {
        method: 'POST',
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({
          username: this.state.username,
          password: this.state.password,
        }),
      });

      if (response.ok) {
        var jsonResult = await response.json();
        var token = jsonResult.token;
        // save token
        this.MMKV.setString('token', token);
        this.props.setState({token: token}, () =>
          // navigate to Home page
          this.props.navigation.replace('Home'),
        );
      } else {
        Alert.alert('Username or Password is incorrect');
      }
    } catch (e) {
      Alert.alert('Unknown Error');
    }
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
          setServerMenu: false,
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
    const styles = StyleSheet.create({
      title: {
        fontSize: 31,
        fontWeight: '600',
        alignSelf: 'center',
      },
      input: {
        width: 300,
        padding: 5,
      },
    });

    return (
      <SafeAreaView
        style={{flex: 1, backgroundColor: '#ffffff'}}
        edges={['right', 'top', 'left']}>
        <KeyboardAvoidingView
          behavior={this.state.setServerMenu ? '' : 'padding'}
          keyboardVerticalOffset={-100}
          style={{
            flex: 1,
            justifyContent: 'center',
            alignSelf: 'center',
          }}>
          <View>
            <Text style={styles.title}>
              <Text style={{color: '#6873F2'}}>Open</Text>Chat
            </Text>
            <View
              style={{
                backgroundColor: '#000000',
                height: 2,
                width: 100,
                marginTop: 3,
                alignSelf: 'center',
                marginBottom: 25,
              }}
            />
          </View>
          <Input
            containerStyle={styles.input}
            label="Username"
            placeholder="username"
            value={this.state.username}
            leftIcon={<Icon name="user" size={21} color="#6873F2" />}
            autoCompleteType="username"
            onChangeText={v => this.setState({username: v})}
            autoCorrect={false}
          />

          <Input
            containerStyle={styles.input}
            autoCompleteType="password"
            onChangeText={v => this.setState({password: v})}
            leftIcon={<Icon name="lock" size={21} color="#6873F2" />}
            value={this.state.password}
            secureTextEntry={true}
            label="Password"
            placeholder="password"
            autoCorrect={false}
          />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
            }}>
            <Button
              title="Log In"
              buttonStyle={{
                marginTop: 10,
                backgroundColor: '#6873F2',
                width: 200,
                alignSelf: 'center',
              }}
              onPress={() => this.login()}
            />
            <Button
              title=""
              icon={<Icon name="server" size={20} color="#ffffff" />}
              titleStyle={{color: '#ffffff', paddingLeft: 6}}
              buttonStyle={{
                backgroundColor: '#6873F2',
                width: 40,
                height: 40,
                borderRadius: 20,
                margin: 10,
              }}
              onPress={async () => this.setState({setServerMenu: true})}
            />
          </View>
          <View style={{height: 85}} />
        </KeyboardAvoidingView>
        <LinearGradient
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          colors={['#c9b9f9', '#6873F2']}
          style={{
            position: 'absolute',
            height: 150,
            width: 150,
            borderRadius: 75,
            zIndex: -1,
            right: 120,
            bottom: -50,
          }}
        />
        <LinearGradient
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          colors={['#c9b9f9', '#6873F2']}
          style={{
            position: 'absolute',
            height: 300,
            width: 300,
            borderRadius: 150,
            zIndex: -1,
            right: -130,
            bottom: -80,
          }}
        />
        <Overlay
          isVisible={this.state.setServerMenu}
          onBackdropPress={() => this.setState({setServerMenu: false})}>
          {this.state.connected ? (
            <View
              style={{
                alignItems: 'center',
                padding: 10,
                paddingHorizontal: 20,
              }}>
              <Text style={{fontSize: 21, fontWeight: '600', marginBottom: 10}}>
                Connected Server Info
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
                  onPress={() => this.setState({setServerMenu: false})}
                />
              </View>
            </View>
          ) : (
            <React.Fragment>
              <Input
                containerStyle={styles.input}
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
                  onPress={() => this.connectToServer()}
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
                  onPress={() => this.setState({setServerMenu: false})}
                />
              </View>
            </React.Fragment>
          )}
        </Overlay>
      </SafeAreaView>
    );
  }
}

export default Login;
