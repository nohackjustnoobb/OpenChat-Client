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
      wsConnected: false,
      message: {},
      group: {},
      user: {},
    };
  }

  // check if server working and also get info
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
    }
  }

  // clear server and token
  disconnectServer() {
    this.MMKV.removeItem('token');
    this.MMKV.removeItem('serverUrl');
    this.setState({
      serverUrl: null,
      token: null,
      group: {},
      message: {},
      user: {},
    });
  }

  // clear token
  logout() {
    this.MMKV.removeItem('token');
    this.setState({token: null, group: {}, message: {}});
  }

  // WS message handler
  WSHandler(e) {
    function yourInfoHandler(info) {
      setState({userInfo: info});
      var user = {};
      user[info.id] = info;
      setState({user: user});
    }

    function groupHandler(groupList) {
      var addGroup = groupList.reduce((map, value) => {
        map[value.id] = value;
        return map;
      }, {});
      var group = {...state.group, ...addGroup};
      setState({group: group});
    }

    function usersHandler(userList) {
      var addUser = userList.reduce((map, value) => {
        map[value.id] = value;
        return map;
      }, {});
      var user = {...state.user, ...addUser};
      setState({user: user});
    }

    function messageHandler(message) {
      var [group, message] = Object.entries(message)[0];
      if (state.message[group]) {
        var groupMessage = state.message[group];
        groupMessage.push(message);
        var addMessage = {};
        addMessage[group] = groupMessage;
        setState({message: {...state.message, ...addMessage}});
      } else {
        var groupMessage = {};
        groupMessage[group] = [message];
        setState({message: {...state.message, ...groupMessage}});
      }
    }

    // decode
    var data = JSON.parse(e.data);

    // define event and its handler
    var handler = {
      yourInfo: yourInfoHandler,
      group: groupHandler,
      users: usersHandler,
      message: messageHandler,
    };

    // variable for functions
    var setState = this.setState.bind(this);
    var state = this.state;

    // check event and use its handler
    for (let eventType in data) {
      for (let [key, handlerFunction] of Object.entries(handler)) {
        if (eventType === key) {
          handlerFunction(data[eventType]);
        }
      }
    }
  }

  // connect or reconnect to WS
  connectWS() {
    // initialize WS
    this.ws = new WebSocket(this.state.serverUrl.replace('http', 'ws'));

    // authorization
    this.ws.onopen = e => {
      this.setState({wsConnected: true});
      this.ws.send(
        JSON.stringify({Authorization: `token ${this.state.token}`}),
      );
    };

    // handle reconnect or disconnect
    this.ws.onclose = e => {
      this.setState({wsConnected: false}, () => {
        Alert.alert('Cannot connect to server', '', [
          {
            text: 'Reconnect',
            onPress: () => {
              this.connectWS();
              this.setState({wsConnected: true});
            },
          },
          {text: 'Disconnect', onPress: () => this.disconnectServer()},
        ]);
      });
    };

    // define WS handler
    this.ws.onmessage = this.WSHandler.bind(this);
  }

  // get user info via WS
  getUserByID(ids) {
    this.ws.send(JSON.stringify({users: ids}));
  }

  async getGroupMessageByID(id) {
    try {
      var response = await fetch(
        `${this.state.serverUrl}${
          this.state.group[id].isDM ? 'dm' : 'group'
        }/${id}/messages/?all=true&start=${
          this.state.message[id] ? this.state.message[id].length : 0
        }`,
        {headers: new Headers({Authorization: `token ${this.state.token}`})},
      );
      if (!response.ok) throw 'Failed To Get Messages From Server';

      var jsonResult = await response.json();
      var message = this.state.message;
      message[id] = message[id]
        ? [...message[id], ...jsonResult]
        : [...jsonResult];

      var group = this.state.group;
      group[id].unReadMessage = null;
      this.setState({message: message, group: group});
    } catch (e) {
      Alert.alert('Failed To Get Messages From Server');
    }
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
                gestureEnabled: false,
              })}>
              {props => (
                <Home
                  {...props}
                  setState={this.setState.bind(this)}
                  serverUrl={this.state.serverUrl}
                  userInfo={this.state.userInfo}
                  token={this.state.token}
                  wsConnected={this.state.wsConnected}
                  serverInfo={this.state.serverInfo}
                  user={this.state.user}
                  group={this.state.group}
                  message={this.state.message}
                  disconnectServer={this.disconnectServer.bind(this)}
                  getServerInfo={this.getServerInfo.bind(this)}
                  connectWS={this.connectWS.bind(this)}
                  getUserByID={this.getUserByID.bind(this)}
                />
              )}
            </Stack.Screen>
            <Stack.Screen
              name="Login"
              options={{headerShown: false, gestureEnabled: false}}>
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
            <Stack.Screen
              name="Chat"
              options={{
                headerTitle: '',
              }}>
              {props => (
                <Chat
                  setState={this.setState.bind(this)}
                  getGroupMessageByID={this.getGroupMessageByID.bind(this)}
                  token={this.state.token}
                  serverUrl={this.state.serverUrl}
                  group={this.state.group}
                  user={this.state.user}
                  message={this.state.message}
                  userInfo={this.state.userInfo}
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
