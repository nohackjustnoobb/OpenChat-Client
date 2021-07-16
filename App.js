/* eslint-disable curly */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */

import React from 'react';
import {Text, View, TouchableOpacity, Alert} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import MMKVStorage from 'react-native-mmkv-storage';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faCog, faUserPlus} from '@fortawesome/free-solid-svg-icons';
import {getStatusBarHeight} from 'react-native-status-bar-height';

// components
import Home from './components/Home';
import Login from './components/Login';
import Settings from './components/Settings';
import Chat from './components/Chat';

const Stack = createStackNavigator();

// Title
function HomeHeaderTitle() {
  return (
    <View>
      <View style={{alignItems: 'center'}}>
        <Text style={{fontSize: 21, fontWeight: '600'}}>
          <Text style={{color: '#6873F2'}}>Open</Text>Chat
        </Text>
        <View
          style={{
            height: 2,
            width: 80,
            backgroundColor: 'black',
            marginTop: 2,
          }}
        />
      </View>
    </View>
  );
}

// Settings Button
function HomeHeaderLeft(props) {
  return (
    <TouchableOpacity
      onPress={() => props.navigation.navigation.navigate('Settings')}>
      <FontAwesomeIcon
        icon={faCog}
        size={25}
        style={{marginLeft: 30}}
        color="#6873F2"
      />
    </TouchableOpacity>
  );
}

// Friends List Button
function HomeHeaderRight() {
  return (
    <TouchableOpacity>
      <FontAwesomeIcon
        icon={faUserPlus}
        size={25}
        style={{marginRight: 30}}
        color="#6873F2"
      />
    </TouchableOpacity>
  );
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.MMKV = new MMKVStorage.Loader().initialize();
    var token = this.MMKV.getString('token');
    var serverUrl = this.MMKV.getString('serverUrl');
    if (!serverUrl && token) {
      this.MMKV.removeItem('token');
      token = null;
    }

    this.state = {
      token: token,
      serverUrl: serverUrl,
      userInfo: null,
      serverInfo: null,
    };
  }

  async getServerInfo() {
    try {
      var response = await fetch(this.state.serverUrl);
      if (!response.ok) throw 'Cannot connect to server';
      var jsonResult = await response.json();
      this.setState({serverInfo: jsonResult});
    } catch (e) {
      Alert.alert('Cannot connect to server');
      this.MMKV.removeItem('token');
      this.MMKV.removeItem('serverUrl');
      this.setState({serverUrl: null, token: null});
      // todo: navigate to Login
    }
  }

  // clear server and token
  disconnectServer() {
    this.MMKV.removeItem('token');
    this.MMKV.removeItem('serverUrl');
    this.setState({serverUrl: null, token: null});
  }

  // clear token
  logout() {
    this.MMKV.removeItem('token');
    this.setState({token: null});
  }

  render() {
    return (
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName={this.state.token ? 'Home' : 'Login'}
            headerMode="screen">
            <Stack.Screen
              name="Home"
              options={navigation => ({
                headerTitle: props => <HomeHeaderTitle {...props} />,
                headerLeft: props => (
                  <HomeHeaderLeft navigation={navigation} {...props} />
                ),
                headerRight: props => <HomeHeaderRight {...props} />,
                headerStyle: {
                  height: getStatusBarHeight() + 70,
                },
              })}>
              {props => (
                <Home
                  {...props}
                  setState={this.setState.bind(this)}
                  serverUrl={this.state.serverUrl}
                  userInfo={this.state.userInfo}
                  token={this.state.token}
                  disconnectServer={this.disconnectServer.bind(this)}
                  serverInfo={this.state.serverInfo}
                  getServerInfo={this.getServerInfo.bind(this)}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Login" options={{headerShown: false}}>
              {props => (
                <Login
                  {...props}
                  setState={this.setState.bind(this)}
                  serverUrl={this.state.serverUrl}
                  serverInfo={this.state.serverInfo}
                  getServerInfo={this.getServerInfo.bind(this)}
                  token={this.state.token}
                />
              )}
            </Stack.Screen>
            <Stack.Screen
              name="Settings"
              options={{
                headerBackTitleStyle: {
                  color: '#6873F2',
                },
                headerTintColor: '#6873F2',
                headerTitleStyle: {color: '#000000', fontSize: 21},
              }}>
              {props => (
                <Settings
                  userInfo={this.state.userInfo}
                  serverInfo={this.state.serverInfo}
                  serverUrl={this.state.serverUrl}
                  setState={this.setState.bind(this)}
                  disconnectServer={this.disconnectServer.bind(this)}
                  logout={this.logout.bind(this)}
                  {...props}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Chat">
              {props => (
                <Chat
                  token={this.state.token}
                  serverUrl={this.state.serverUrl}
                  setState={this.setState.bind(this)}
                  {...props}
                />
              )}
            </Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    );
  }
}

export default App;
