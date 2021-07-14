/* eslint-disable curly */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */

import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  TouchableOpacity,
  Image,
} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import MMKVStorage from 'react-native-mmkv-storage';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {Input, Button, Overlay} from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import LinearGradient from 'react-native-linear-gradient';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faCog,
  faUserPlus,
  faUser,
  faUsers,
  faImage,
  faFile,
} from '@fortawesome/free-solid-svg-icons';
import {getStatusBarHeight} from 'react-native-status-bar-height';

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

// Main Page
class Home extends React.Component {
  constructor(props) {
    super(props);
    var wsUrl = null;
    // gernerate WS url with http/https url
    if (props.serverUrl) {
      wsUrl = props.serverUrl.replace('http', 'ws');
    }
    // initialize MMKVStorage
    this.MMKV = new MMKVStorage.Loader().initialize();
    this.state = {
      wsUrl: wsUrl,
      connected: false,
      message: {},
      group: {},
      user: {},
    };
  }

  componentDidMount() {
    // initialize
    this.getServerInfo();
    this.connectWS();
  }

  // check if server working
  async getServerInfo() {
    try {
      var response = await fetch(this.props.serverUrl);
      if (!response.ok) throw 'Cannot connect to server';
      var jsonResult = await response.json();
      this.props.setState({serverInfo: jsonResult});
    } catch (e) {
      Alert.alert('Cannot connect to server');
      this.disconnectServer();
    }
  }

  // clear server and token
  disconnectServer() {
    this.MMKV.removeItem('token');
    this.MMKV.removeItem('serverUrl');
    this.props.setState({serverUrl: null, token: null}, () =>
      this.props.navigation.replace('Login'),
    );
  }

  // get user info via WS
  getUserByID(ids) {
    this.ws.send(JSON.stringify({users: ids}));
  }

  // WS message handler
  WSHandler(e) {
    function yourInfoHandler(info) {
      setAppState({userInfo: info});
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

    // decode
    var data = JSON.parse(e.data);

    // define event and its handler
    var handler = {
      yourInfo: yourInfoHandler,
      group: groupHandler,
      users: usersHandler,
    };

    // variable for functions
    var setState = this.setState.bind(this);
    var state = this.state;
    var setAppState = this.props.setState;

    // check event and use its handler
    for (var eventType in data) {
      for (const [key, handlerFunction] of Object.entries(handler)) {
        if (eventType === key) {
          handlerFunction(data[eventType]);
        }
      }
    }
  }

  // connect or reconnect to WS
  connectWS() {
    // initialize WS
    this.ws = new WebSocket(this.state.wsUrl);

    // authorization
    this.ws.onopen = e => {
      this.setState({connected: true});
      this.ws.send(
        JSON.stringify({Authorization: `token ${this.props.token}`}),
      );
    };

    // handle reconnect or disconnect
    this.ws.onclose = e => {
      this.setState({connected: false}, () => {
        Alert.alert('Cannot connect to server', '', [
          {
            text: 'Reconnect',
            onPress: () => {
              this.connectWS();
              this.setState({connected: true});
            },
          },
          {text: 'Disconnect', onPress: this.disconnectServer.bind(this)},
        ]);
      });
    };

    // define WS handler
    this.ws.onmessage = this.WSHandler.bind(this);
  }

  render() {
    // define array for groups list
    var groupsListView = [];

    // loop for all groups
    for (var key in this.state.group) {
      var group = this.state.group[key];

      // define groupName and avatar for handling DM
      var groupName = group.groupName;
      var avatar = group.avatar;

      // handle DM
      if (group.isDM) {
        var userID = group.members.filter(v => v !== this.props.userInfo.id)[0];
        if (!this.state.user[userID]) {
          this.getUserByID([userID]);
        } else {
          groupName = this.state.user[userID].username;
          avatar = this.state.user[userID].avatar;
        }
      }

      // map avatar view
      var avatarView = (
        <View
          style={{
            backgroundColor: '#CCCCCC',
            height: 50,
            width: 50,
            borderRadius: 25,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 10,
            overflow: 'hidden',
          }}>
          {!avatar ? (
            <FontAwesomeIcon
              icon={group.isDM ? faUser : faUsers}
              color="#ffffff"
              size={25}
            />
          ) : (
            <Image
              source={{uri: this.props.serverUrl.slice(0, -1) + avatar}}
              style={{height: 50, width: 50}}
            />
          )}
        </View>
      );

      // handle last message owner
      var messageOwnerView = <View />;
      if (group.lastMessage && !group.isDM) {
        var userID = group.lastMessage.owner;
        if (!this.state.user[userID]) {
          this.getUserByID([userID]);
        } else {
          messageOwnerView = (
            <Text
              style={{
                fontSize: 12,
                color: '#8A90D5',
                fontWeight: '500',
              }}>{`${this.state.user[userID].username}: `}</Text>
          );
        }
      }

      //handle last message sent time
      var sendTimeString = '';
      if (group.lastMessage) {
        var sendTime = new Date(group.lastMessage.sendDateTime);
        var now = new Date();
        var diff = new Date(now.getTime() - sendTime.getTime());
        sendTimeString = sendTime.toLocaleDateString('en-GB');

        if (
          diff.getUTCFullYear() - 1970 === 0 &&
          diff.getUTCMonth() === 0 &&
          diff.getUTCDate() <= 7
        ) {
          var weekday = [
            'Sunday',
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
          ];
          sendTimeString = weekday[sendTime.getDay()];
          if (diff.getUTCDate() - 1 <= 1) {
            sendTimeString = 'Yesterday';
            if (diff.getUTCDate() - 1 === 0) {
              sendTimeString = sendTime.toLocaleString('en-US', {
                hour: 'numeric',
                minute: 'numeric',
                hour12: true,
              });
            }
          }
        }
      }

      // map all information together
      groupsListView.push(
        <View
          key={group.id}
          style={{
            flexDirection: 'row',
            marginVertical: 3,
            height: 55,
            alignItems: 'center',
          }}>
          {avatarView}
          <View style={{height: 40, justifyContent: 'center', flex: 1}}>
            <Text
              style={{
                position: 'absolute',
                right: 0,
                top: 10,
                fontSize: 12,
                color: '#8A90D5',
              }}>
              {sendTimeString}
            </Text>
            <Text style={{fontWeight: '600', marginBottom: 2}}>
              {groupName}
            </Text>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              {messageOwnerView}
              {group.lastMessage?.additionImage ||
              group.lastMessage?.additionFile ? (
                <React.Fragment>
                  <FontAwesomeIcon
                    icon={group.lastMessage?.additionImage ? faImage : faFile}
                    color="#8A90D5"
                    size={group.lastMessage?.additionImage ? 15 : 12}
                  />
                  <Text
                    style={{
                      color: '#8A90D5',
                      marginLeft: 5,
                      fontWeight: '600',
                      fontSize: 12,
                    }}>
                    {group.lastMessage?.additionImage ? 'Image' : 'File'}
                  </Text>
                </React.Fragment>
              ) : (
                <Text style={{fontSize: 12, color: '#8A90D5'}}>
                  {group.lastMessage?.content}
                </Text>
              )}
            </View>
          </View>
        </View>,
        <View
          key={`_${key}`}
          style={{
            height: 0.5,
            backgroundColor: '#DDDDDD',
            width: '80%',
            alignSelf: 'center',
          }}
        />,
      );
    }
    groupsListView.pop();

    return (
      <ScrollView
        style={{backgroundColor: '#F9F9F9', padding: 10, paddingBottom: 0}}>
        {groupsListView}
      </ScrollView>
    );
  }
}

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
      serverInfo: null,
    };
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
        this.props.setState({token: token});
        // navigate to Home page
        this.props.navigation.replace('Home');
      } else {
        Alert.alert('Username or Password is incorrect');
      }
    } catch (e) {
      Alert.alert('Unknown Error');
    }
  }

  // connect to server
  async setServerUrl() {
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
          serverInfo: jsonResult,
          connected: true,
          setServerMenu: false,
        });
      } else {
        throw 'Cannot connect to server';
      }
    } catch (e) {
      this.props.setState({serverUrl: ''});
      Alert.alert('Cannot connect to server');
    }
  }

  async getServerInfo() {
    try {
      var response = await fetch(this.props.serverUrl);
      var jsonResult = await response.json();
      this.setState({serverInfo: jsonResult});
    } catch (e) {
      Alert.alert('Connection Error');
      this.setState({connected: false});
      this.props.setState({serverUrl: ''});
      // remove server url
      this.MMKV.removeItem('serverUrl');
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

    // get server info if connected
    if (this.state.connected) {
      if (!this.props.serverUrl) {
        this.setState({connected: false});
      } else if (!this.state.serverInfo) {
        this.getServerInfo();
      }
    }

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
                    {this.state.serverInfo?.serverName}
                  </Text>
                </Text>
                <Text>
                  Type:{' '}
                  <Text style={{fontWeight: '700'}}>
                    {this.state.serverInfo?.serverType}
                  </Text>
                </Text>
                <Text>
                  Version:{' '}
                  <Text style={{fontWeight: '700'}}>
                    {this.state.serverInfo?.serverVersion}
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
                  onPress={() => this.setServerUrl()}
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

class Settings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return <ScrollView style={{backgroundColor: '#F9F9F9'}}></ScrollView>;
  }
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
                  serverInfo={this.state.serverInfo}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Login" options={{headerShown: false}}>
              {props => (
                <Login
                  {...props}
                  setState={this.setState.bind(this)}
                  serverUrl={this.state.serverUrl}
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
