/* eslint-disable curly */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */

import React from 'react';
import {ScrollView, Text, View, TouchableOpacity, Image} from 'react-native';
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
    this.state = {};
  }

  componentDidMount() {
    // initialize
    if (!this.props.serverInfo) this.props.getServerInfo();
    this.props.connectWS();
  }

  componentDidUpdate() {
    if (!this.props.token)
      this.props.setState({wsConnected: false}, () =>
        this.props.navigation.replace('Login'),
      );
  }

  render() {
    // define array for groups list
    var groupsListView = [];

    // loop for all groups
    for (var key in this.props.group) {
      let group = this.props.group[key];

      // define groupName and avatar for handling DM
      var groupName = group.groupName;
      var avatar = group.avatar;

      // handle DM
      if (group.isDM) {
        var userID = group.members.filter(v => v !== this.props.userInfo.id)[0];
        if (!this.props.user[userID]) {
          this.props.getUserByID([userID]);
        } else {
          groupName = this.props.user[userID].username;
          avatar = this.props.user[userID].avatar;
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
      if (group.lastMessage) {
        var userID = group.lastMessage.owner;
        if (!this.props.user[userID]) {
          this.props.getUserByID([userID]);
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
                : this.props.user[userID].username
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
              group: group.id,
            })
          }>
          {avatarView}
          <View style={{height: 40, justifyContent: 'center', flex: 1}}>
            <Text
              style={{
                position: 'absolute',
                right: 0,
                top: 5,
                fontSize: 12,
                color: '#8A90D5',
              }}>
              {sendTimeString}
            </Text>
            {group.unReadMessage ? (
              <View
                style={{
                  backgroundColor: '#8A90D5',
                  width: 16,
                  height: 16,
                  borderRadius: 13,
                  justifyContent: 'center',
                  alignItems: 'center',
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                }}>
                <Text
                  style={{
                    fontSize: 10,
                    color: '#ffffff',
                    fontWeight: '700',
                    transform: [{translateX: 0.5}],
                  }}>
                  {group.unReadMessage}
                </Text>
              </View>
            ) : (
              <View />
            )}

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
