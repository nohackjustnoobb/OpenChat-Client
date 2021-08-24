/* eslint-disable curly */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */

import React from 'react';
import {Text, View, TouchableOpacity, Alert, Platform} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import MMKVStorage from 'react-native-mmkv-storage';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faCog,
  faUserPlus,
  faUserFriends,
  faBan,
  faChevronLeft,
  faSearch,
} from '@fortawesome/free-solid-svg-icons';
import {getStatusBarHeight} from 'react-native-status-bar-height';

// components
import Home from './components/Home';
import Login from './components/Login';
import Settings from './components/Settings';
import Chat from './components/Chat';
import GroupInfo from './components/GroupInfo';
import Friends from './components/Friends';
import Blocked from './components/Blocked';
import Search from './components/Search';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

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

// Relationship Button
function HomeHeaderRight(props) {
  return (
    <TouchableOpacity
      onPress={() => props.navigation.navigation.navigate('Relationship')}>
      <FontAwesomeIcon
        icon={faUserPlus}
        size={25}
        style={{marginRight: 30}}
        color="#6873F2"
      />
    </TouchableOpacity>
  );
}

function BackHeaderLeft(props) {
  return (
    <TouchableOpacity
      style={{flexDirection: 'row', alignItems: 'center'}}
      onPress={props.onPress}>
      <FontAwesomeIcon
        icon={faChevronLeft}
        size={21}
        style={{marginRight: 5, marginLeft: 10}}
        color="#6873F2"
      />
      <Text style={{fontSize: 18, color: '#6873F2'}}>{props.label}</Text>
    </TouchableOpacity>
  );
}

function RelationshipHeaderRight(props) {
  return (
    <TouchableOpacity
      style={{flexDirection: 'row', alignItems: 'center', marginRight: 20}}
      onPress={() => props.navigation.navigation.navigate('Search')}>
      <FontAwesomeIcon icon={faSearch} size={21} color="#6873F2" />
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
      blocked: [],
      friends: [],
      friendRequest: [],
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
    this.setState(
      {
        serverUrl: null,
        token: null,
        group: [],
        message: {},
        user: [],
        friendRequest: [],
        serverInfo: null,
        wsConnected: false,
      },
      () => this.ws?.close(),
    );
  }

  // clear token
  logout() {
    this.MMKV.removeItem('token');
    this.setState(
      {token: null, group: {}, message: {}, wsConnected: false},
      () => this.ws?.close(),
    );
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

    function groupDeletedHandler(id) {
      var group = state.group;
      delete group[id];
      setState({group: group});
    }

    // decode
    var data = JSON.parse(e.data);

    // variable for functions
    var setState = this.setState.bind(this);
    var state = this.state;

    // define event and its handler
    var handler = {
      yourInfo: yourInfoHandler,
      group: groupHandler,
      users: usersHandler,
      message: messageHandler,
      groupDeleted: groupDeletedHandler,
      relationship: setState,
    };

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
      if (this.state.wsConnected) {
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
      }
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
      Alert.alert('Failed To Get Messages');
    }
  }

  async sendMessage(
    groupID,
    content = null,
    additionImage = null,
    replyID = null,
  ) {
    function createFormData(image, body) {
      const data = new FormData();

      data.append('additionImage', {
        name: image.fileName,
        type: image.type,
        uri:
          Platform.OS === 'android'
            ? image.uri
            : image.uri.replace('file://', ''),
      });

      Object.keys(body).forEach(key => {
        data.append(key, body[key]);
      });

      return data;
    }

    try {
      if (!content && !additionImage) return;
      var sendData = {content: content, replyTo: replyID};

      var response = await fetch(
        `${this.state.serverUrl}${
          this.state.group[groupID].isDM ? 'dm' : 'group'
        }/${groupID}/messages/`,
        {
          headers: new Headers({
            Authorization: `token ${this.state.token}`,
            'Content-Type': 'application/json',
          }),
          method: 'POST',
          body: additionImage
            ? createFormData(additionImage, sendData)
            : JSON.stringify(sendData),
        },
      );
      if (!response.ok) throw response.status;
    } catch (e) {
      Alert.alert('Failed To Send Message');
    }
  }

  async setReadByID(id) {
    try {
      var response = await fetch(
        `${this.state.serverUrl}${
          this.state.group[id].isDM ? 'dm' : 'group'
        }/${id}/messages/`,
        {headers: new Headers({Authorization: `token ${this.state.token}`})},
      );
      if (!response.ok) throw 'Failed To Get Messages From Server';
    } catch (e) {
      Alert.alert('Failed To Get Messages');
    }
  }

  async blockUserByID(id) {
    console.log('block');
  }

  async exitGroupByID(id) {
    try {
      var response = await fetch(`${this.state.serverUrl}group/${id}/leave/`, {
        headers: new Headers({Authorization: `token ${this.state.token}`}),
      });
      if (!response.ok) throw 'Fail to exit group';
      var group = this.state.group;
      delete group[id];
      this.setState({group: group});
    } catch (e) {
      Alert.alert('Fail to exit group');
    }
  }

  async deleteGroupByID(id) {
    try {
      var response = await fetch(`${this.state.serverUrl}group/${id}/`, {
        method: 'DELETE',
        headers: new Headers({Authorization: `token ${this.state.token}`}),
      });
      if (!response.ok) throw 'Fail to delete group';
      var group = this.state.group;
      delete group[id];
      this.setState({group: group});
    } catch (e) {
      Alert.alert('Fail to delete group');
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
                headerRight: props => (
                  <HomeHeaderRight navigation={navigation} {...props} />
                ),
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
                headerLeft: props => <BackHeaderLeft {...props} />,
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
                  getUserByID={this.getUserByID.bind(this)}
                  sendMessage={this.sendMessage.bind(this)}
                  setReadByID={this.setReadByID.bind(this)}
                  serverUrl={this.state.serverUrl}
                  group={this.state.group}
                  user={this.state.user}
                  message={this.state.message}
                  userInfo={this.state.userInfo}
                  {...props}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="GroupInfo">
              {props => (
                <GroupInfo
                  group={this.state.group}
                  userInfo={this.state.userInfo}
                  user={this.state.user}
                  serverUrl={this.state.serverUrl}
                  getUserByID={this.getUserByID.bind(this)}
                  deleteGroupByID={this.deleteGroupByID.bind(this)}
                  blockUserByID={this.blockUserByID.bind(this)}
                  exitGroupByID={this.exitGroupByID.bind(this)}
                  {...props}
                />
              )}
            </Stack.Screen>
            <Stack.Screen
              name="Relationship"
              options={navigation => ({
                headerLeft: props => <BackHeaderLeft {...props} />,
                headerRight: props => (
                  <RelationshipHeaderRight navigation={navigation} {...props} />
                ),
              })}>
              {props => (
                <Tab.Navigator>
                  <Tab.Screen
                    name="Friends"
                    options={{
                      headerShown: false,
                      tabBarActiveTintColor: '#6873F2',
                      tabBarIcon: iconProps => (
                        <FontAwesomeIcon icon={faUserFriends} {...iconProps} />
                      ),
                    }}>
                    {tabProps => (
                      <Friends
                        friends={this.state.friends}
                        friendRequest={this.state.friendRequest}
                        user={this.state.user}
                        userInfo={this.state.userInfo}
                        serverUrl={this.state.serverUrl}
                        getUserByID={this.getUserByID.bind(this)}
                        {...tabProps}
                        {...props}
                      />
                    )}
                  </Tab.Screen>
                  <Tab.Screen
                    name="Blocked"
                    options={{
                      headerShown: false,
                      tabBarActiveTintColor: '#6873F2',
                      tabBarIcon: iconProps => (
                        <FontAwesomeIcon icon={faBan} {...iconProps} />
                      ),
                    }}>
                    {tabProps => (
                      <Blocked
                        blocked={this.state.blocked}
                        user={this.state.user}
                        serverUrl={this.state.serverUrl}
                        getUserByID={this.getUserByID.bind(this)}
                        {...tabProps}
                        {...props}
                      />
                    )}
                  </Tab.Screen>
                </Tab.Navigator>
              )}
            </Stack.Screen>
            <Stack.Screen
              name="Search"
              options={{headerLeft: props => <BackHeaderLeft {...props} />}}>
              {props => <Search {...props} />}
            </Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    );
  }
}

export default App;
