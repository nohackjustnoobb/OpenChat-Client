/* eslint-disable curly */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */

import React from 'react';
import MMKVStorage from 'react-native-mmkv-storage';
import {
  Alert,
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Image,
} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faUser,
  faUsers,
  faImage,
  faFile,
} from '@fortawesome/free-solid-svg-icons';

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
    if (!this.props.serverInfo) this.props.getServerInfo();
    this.connectWS();
  }

  componentDidUpdate() {
    if (!this.props.token && this.state.connected)
      this.setState({connected: false}, () =>
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
          {text: 'Disconnect', onPress: () => this.props.disconnectServe()},
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
          {avatar ? (
            <Image
              source={{
                uri: this.props.serverUrl?.slice(0, -1) + avatar,
              }}
              style={{height: 50, width: 50}}
            />
          ) : (
            <FontAwesomeIcon
              icon={group.isDM ? faUser : faUsers}
              color="#ffffff"
              size={25}
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
              }}>{`${
              userID === this.props.userInfo.id
                ? 'You'
                : this.state.user[userID].username
            }: `}</Text>
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
        <TouchableOpacity
          key={group.id}
          style={{
            flexDirection: 'row',
            marginVertical: 3,
            height: 55,
            alignItems: 'center',
          }}
          activeOpacity={0.5}
          onPress={() =>
            this.props.navigation.navigate('Chat', {
              group: group,
              user: this.state.user,
              messages: this.state.message[key],
            })
          }>
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
        </TouchableOpacity>,
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

export default Home;
