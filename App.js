/* eslint-disable curly */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */

import React from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  Alert,
  Platform,
  Modal,
  Image,
  TextInput,
} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import MMKVStorage from 'react-native-mmkv-storage';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faCog,
  faUserPlus,
  faUserFriends,
  faBan,
  faChevronLeft,
  faSearch,
  faPlus,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import {getStatusBarHeight} from 'react-native-status-bar-height';
import {Button, CheckBox} from 'react-native-elements';

// components
import Home from './components/Home';
import Login from './components/Login';
import Settings from './components/Settings';
import Chat from './components/Chat';
import GroupInfo from './components/GroupInfo';
import Friends from './components/Friends';
import Blocked from './components/Blocked';
import Search from './components/Search';
import {ScrollView} from 'react-native-gesture-handler';

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
    <View style={{flexDirection: 'row'}}>
      <TouchableOpacity
        style={{flexDirection: 'row', alignItems: 'center', marginRight: 15}}
        onPress={() =>
          props.setState({modal: true, selectedUser: [], next: false})
        }>
        <FontAwesomeIcon icon={faPlus} size={21} color="#6873F2" />
      </TouchableOpacity>
      <TouchableOpacity
        style={{flexDirection: 'row', alignItems: 'center', marginRight: 20}}
        onPress={() => props.navigation.navigation.navigate('Search')}>
        <FontAwesomeIcon icon={faSearch} size={21} color="#6873F2" />
      </TouchableOpacity>
    </View>
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
      searchResult: [],
      modal: false,
      selectedUser: [],
      next: false,
      groupName: '',
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
          var reconnect = setInterval(() => {
            if (this.state.wsConnected) {
              clearInterval(reconnect);
            } else {
              this.connectWS();
            }
          }, 3000);
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

  createFormData(image, body, name) {
    const data = new FormData();

    data.append(name, {
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

  async sendMessage(
    groupID,
    content = null,
    additionImage = null,
    replyID = null,
  ) {
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
            ? this.createFormData(additionImage, sendData, 'additionImage')
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

  async searchUser(keyword) {
    if (keyword) {
      try {
        var response = await fetch(
          `${this.state.serverUrl}user/?search=${keyword}`,
          {headers: new Headers({Authorization: `token ${this.state.token}`})},
        );
        if (!response.ok) throw 'Failed To Search';

        this.setState({searchResult: await response.json()});
      } catch (e) {
        Alert.alert('Failed To Search');
      }
    } else {
      this.setState({searchResult: []});
    }
  }

  async replyFriendRequest(id, accept) {
    try {
      var response = await fetch(
        `${this.state.serverUrl}user/friend-request/${id}/?reply=${
          accept ? 'accept' : 'decline'
        }`,
        {headers: new Headers({Authorization: `token ${this.state.token}`})},
      );
      if (!response.ok) throw 'Fail To Reply Friend Request';
    } catch (e) {
      Alert.alert('Fail To Reply Friend Request');
    }
  }

  async removeFriend(id) {
    try {
      var response = await fetch(
        `${this.state.serverUrl}user/${id}/remove-friend/`,
        {
          headers: new Headers({Authorization: `token ${this.state.token}`}),
          method: 'DELETE',
        },
      );
      if (!response.ok) throw 'Fail To Remove Friend';
    } catch (e) {
      Alert.alert('Fail To Remove Friend');
    }
  }

  async sendFriendRequest(id) {
    try {
      var response = await fetch(
        `${this.state.serverUrl}user/${id}/create-friend-request/`,
        {
          headers: new Headers({Authorization: `token ${this.state.token}`}),
          method: 'POST',
        },
      );
      if (!response.ok) throw 'Fail To Send Friend Request';
    } catch (e) {
      Alert.alert('Fail To Send Friend Request');
    }
  }

  async cancelRequest(id) {
    try {
      var response = await fetch(
        `${this.state.serverUrl}user/friend-request/${id}/`,
        {
          headers: new Headers({Authorization: `token ${this.state.token}`}),
          method: 'DELETE',
        },
      );
      if (!response.ok) throw 'Fail To Cancel Friend Request';
    } catch (e) {
      Alert.alert('Fail To Cancel Friend Request');
    }
  }

  async toggleUserBlock(id) {
    try {
      var response = await fetch(`${this.state.serverUrl}user/${id}/block/`, {
        headers: new Headers({Authorization: `token ${this.state.token}`}),
        method: this.state.blocked.find(v => v === id) ? 'DELETE' : 'GET',
      });
      if (!response.ok) throw 'Fail To Toggle Block';
    } catch (e) {
      Alert.alert('Fail To Toggle Block');
    }
  }

  async patchUserInfo(username, bio, avatar) {
    try {
      var patchData = {username: username, bio: bio};
      for (var i in patchData) {
        if (i === 'username' && patchData[i] === this.state.userInfo.username) {
          delete patchData[i];
        }
        if (i === 'bio' && patchData[i] === this.state.userInfo.bio) {
          delete patchData[i];
        }
      }
      var response = await fetch(`${this.state.serverUrl}user/me/`, {
        headers: new Headers({
          Authorization: `token ${this.state.token}`,
          'Content-Type': 'application/json',
        }),
        method: 'PATCH',
        body: avatar
          ? this.createFormData(avatar, patchData, 'avatar')
          : JSON.stringify(patchData),
      });
      if (!response.ok) throw 'Fail To Update User Info';

      var userInfo = await response.json();
      this.setState({userInfo: userInfo});
      return userInfo;
    } catch (e) {
      Alert.alert('Fail To Update User Info');
    }
  }

  async patchGroupInfo(id, groupName, avatar) {
    try {
      var patchData = groupName ? {groupName: groupName} : {};

      var response = await fetch(`${this.state.serverUrl}group/${id}/`, {
        headers: new Headers({
          Authorization: `token ${this.state.token}`,
          'Content-Type': 'application/json',
        }),
        method: 'PATCH',
        body: avatar
          ? this.createFormData(avatar, patchData, 'avatar')
          : JSON.stringify(patchData),
      });

      if (!response.ok) throw 'Fail To Update Group Info';
      return await response.json();
    } catch (e) {
      Alert.alert('Fail To Update Group Info');
    }
  }

  async createGroup() {
    try {
      var response = await fetch(`${this.state.serverUrl}group/create/`, {
        headers: new Headers({
          Authorization: `token ${this.state.token}`,
          'Content-Type': 'application/json',
        }),
        method: 'POST',
        body: JSON.stringify({
          members: this.state.selectedUser,
          groupName: this.state.groupName,
        }),
      });
      if (!response.ok) throw 'Fail To Create Group';
    } catch (e) {
      Alert.alert('Fail To Create Group');
    }
  }

  async createDM(id) {
    try {
      var response = await fetch(`${this.state.serverUrl}dm/create/`, {
        headers: new Headers({
          Authorization: `token ${this.state.token}`,
          'Content-Type': 'application/json',
        }),
        method: 'POST',
        body: JSON.stringify({
          friend: id,
        }),
      });

      if (!response.ok) throw 'Fail To Create DM';
      return await response.json();
    } catch (e) {
      Alert.alert('Fail To Create DM');
    }
  }

  async toggleAdmin(groupID, userID) {
    try {
      if (this.state.group[groupID].groupAdmins.find(e => userID === e)) {
        var response = await fetch(
          `${this.state.serverUrl}group/${groupID}/admins/${userID}/`,
          {
            headers: new Headers({
              Authorization: `token ${this.state.token}`,
            }),
            method: 'DELETE',
          },
        );
      } else {
        var response = await fetch(
          `${this.state.serverUrl}group/${groupID}/admins/`,
          {
            headers: new Headers({
              Authorization: `token ${this.state.token}`,
              'Content-Type': 'application/json',
            }),
            method: 'POST',
            body: JSON.stringify({
              admins: [userID],
            }),
          },
        );
      }

      if (!response.ok) throw 'Fail To Toggle Admin';
    } catch (e) {
      Alert.alert('Fail To Toggle Admin');
    }
  }

  async kickUser(groupID, userID) {
    try {
      var response = await fetch(
        `${this.state.serverUrl}group/${groupID}/members/${userID}/`,
        {
          headers: new Headers({
            Authorization: `token ${this.state.token}`,
          }),
          method: 'DELETE',
        },
      );

      if (!response.ok) throw 'Fail To Kick User';
    } catch (e) {
      Alert.alert('Fail To Kick User');
    }
  }

  async addUsers(groupID, usersID) {
    try {
      var response = await fetch(
        `${this.state.serverUrl}group/${groupID}/members/`,
        {
          headers: new Headers({
            Authorization: `token ${this.state.token}`,
            'Content-Type': 'application/json',
          }),
          method: 'POST',
          body: JSON.stringify({
            members: usersID,
          }),
        },
      );

      if (!response.ok) throw 'Fail To Add Users';
    } catch (e) {
      Alert.alert('Fail To Add Users');
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
                  patchUserInfo={this.patchUserInfo.bind(this)}
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
                  friends={this.state.friends}
                  blocked={this.state.blocked}
                  patchGroupInfo={this.patchGroupInfo.bind(this)}
                  getUserByID={this.getUserByID.bind(this)}
                  deleteGroupByID={this.deleteGroupByID.bind(this)}
                  toggleUserBlock={this.toggleUserBlock.bind(this)}
                  exitGroupByID={this.exitGroupByID.bind(this)}
                  toggleAdmin={this.toggleAdmin.bind(this)}
                  kickUser={this.kickUser.bind(this)}
                  addUsers={this.addUsers.bind(this)}
                  {...props}
                />
              )}
            </Stack.Screen>
            <Stack.Screen
              name="Relationship"
              options={navigation => ({
                headerLeft: props => <BackHeaderLeft {...props} />,
                headerRight: props => (
                  <RelationshipHeaderRight
                    navigation={navigation}
                    setState={this.setState.bind(this)}
                    {...props}
                  />
                ),
              })}>
              {props => (
                <>
                  <Modal
                    visible={this.state.modal}
                    presentationStyle="formSheet"
                    animationType="slide"
                    style={{flex: 1}}>
                    <SafeAreaView style={{flex: 1}}>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}>
                        <Button
                          title="Cancel"
                          type="clear"
                          containerStyle={{marginLeft: 15, marginTop: 10}}
                          titleStyle={{color: '#ff0000'}}
                          onPress={() => {
                            this.setState({
                              modal: false,
                              selectedUser: [],
                              next: false,
                            });
                          }}
                        />
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: '600',
                          }}>
                          Add Participants
                        </Text>
                        <Button
                          title={this.state.next ? 'Create' : 'Next'}
                          type="clear"
                          containerStyle={{marginRight: 15, marginTop: 10}}
                          titleStyle={{color: '#6873F2'}}
                          disabled={!this.state.selectedUser.length}
                          onPress={() => {
                            if (this.state.next) {
                              if (this.state.groupName) {
                                this.createGroup();
                                this.setState({
                                  modal: false,
                                  selectedUser: [],
                                  next: false,
                                });
                              } else {
                                Alert.alert('Please enter group name');
                              }
                            } else {
                              this.setState({next: true});
                            }
                          }}
                        />
                      </View>
                      {this.state.next ? (
                        <View style={{flex: 1}}>
                          <TextInput
                            style={{
                              width: '90%',
                              minHeight: 35,
                              backgroundColor: '#eeeeee',
                              borderRadius: 10,
                              padding: 10,
                              alignSelf: 'center',
                              marginTop: 10,
                            }}
                            placeholder="Group Name"
                            placeholderTextColor="#aaaaaa"
                            onChangeText={v => this.setState({groupName: v})}
                            value={this.state.groupName}
                          />
                        </View>
                      ) : (
                        <ScrollView
                          style={{
                            flex: 1,
                            padding: 10,
                          }}>
                          {this.state.friends.map(v => (
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
                                {this.state.user[v]?.avatar ? (
                                  <Image
                                    source={{
                                      uri:
                                        this.state.serverUrl?.slice(0, -1) +
                                        this.state.user[v].avatar,
                                    }}
                                    style={{height: 35, width: 35}}
                                  />
                                ) : (
                                  <FontAwesomeIcon
                                    icon={faUser}
                                    color="#ffffff"
                                    size={18}
                                  />
                                )}
                              </View>
                              <View
                                style={{
                                  justifyContent: 'center',
                                  alignContent: 'center',
                                }}>
                                <Text>{this.state.user[v]?.username}</Text>
                                <Text style={{color: '#888888', fontSize: 11}}>
                                  {this.state.user[v]?.email}
                                </Text>
                              </View>
                              <CheckBox
                                checkedIcon="dot-circle-o"
                                uncheckedIcon="circle-o"
                                checkedColor="#6873F2"
                                containerStyle={{
                                  position: 'absolute',
                                  right: -5,
                                }}
                                checked={Boolean(
                                  this.state.selectedUser.find(e => e === v),
                                )}
                                onPress={() => {
                                  var selectedUser = this.state.selectedUser;
                                  if (
                                    this.state.selectedUser.find(e => e === v)
                                  ) {
                                    selectedUser.pop(v);
                                  } else {
                                    selectedUser.push(v);
                                  }
                                  this.setState({selectedUser: selectedUser});
                                }}
                              />
                            </View>
                          ))}
                        </ScrollView>
                      )}
                    </SafeAreaView>
                  </Modal>
                  <Tab.Navigator>
                    <Tab.Screen
                      name="Friends"
                      options={{
                        headerShown: false,
                        tabBarActiveTintColor: '#6873F2',
                        tabBarIcon: iconProps => (
                          <FontAwesomeIcon
                            icon={faUserFriends}
                            {...iconProps}
                          />
                        ),
                      }}>
                      {tabProps => (
                        <Friends
                          friends={this.state.friends}
                          friendRequest={this.state.friendRequest}
                          user={this.state.user}
                          userInfo={this.state.userInfo}
                          serverUrl={this.state.serverUrl}
                          cancelRequest={this.cancelRequest.bind(this)}
                          removeFriend={this.removeFriend.bind(this)}
                          replyFriendRequest={this.replyFriendRequest.bind(
                            this,
                          )}
                          toggleUserBlock={this.toggleUserBlock.bind(this)}
                          createDM={this.createDM.bind(this)}
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
                          toggleUserBlock={this.toggleUserBlock.bind(this)}
                          getUserByID={this.getUserByID.bind(this)}
                          {...tabProps}
                          {...props}
                        />
                      )}
                    </Tab.Screen>
                  </Tab.Navigator>
                </>
              )}
            </Stack.Screen>
            <Stack.Screen
              name="Search"
              options={{headerLeft: props => <BackHeaderLeft {...props} />}}>
              {props => (
                <Search
                  friends={this.state.friends}
                  blocked={this.state.blocked}
                  friendRequest={this.state.friendRequest}
                  serverUrl={this.state.serverUrl}
                  userInfo={this.state.userInfo}
                  searchResult={this.state.searchResult}
                  setState={this.setState.bind(this)}
                  sendFriendRequest={this.sendFriendRequest.bind(this)}
                  replyFriendRequest={this.replyFriendRequest.bind(this)}
                  searchUser={this.searchUser.bind(this)}
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
