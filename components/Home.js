/* eslint-disable curly */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */

import React from 'react';
import {Text, View, TouchableOpacity, FlatList} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faImage, faFile} from '@fortawesome/free-solid-svg-icons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import {Avatar} from '../App';

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
    if (!this.props.token) this.props.navigation.replace('Login');
  }

  render() {
    // Sort by time
    var groupsSorted = Object.entries(this.props.group)
      .map(v => v[1])
      .sort((a, b) => a.lastMessage.sendDateTime < b.lastMessage.sendDateTime);

    return (
      <FlatList
        style={{backgroundColor: '#F9F9F9', padding: 10, paddingBottom: 0}}
        data={groupsSorted}
        renderItem={({item, index}) => {
          // define groupName and avatar for handling DM
          var groupName = item.groupName;
          var avatar = item.avatar;

          // handle DM
          if (item.isDM) {
            var userID = item.members.filter(
              v => v !== this.props.userInfo.id,
            )[0];
            if (!this.props.user[userID]) {
              this.props.getUserByID([userID]);
            } else {
              groupName = this.props.user[userID].username;
              avatar = this.props.user[userID].avatar;
            }
          }

          // handle last message owner
          var messageOwnerView = <View />;
          if (item.lastMessage) {
            var userID = item.lastMessage.owner;
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
          if (item.lastMessage) {
            var sendTime = new Date(item.lastMessage.sendDateTime);
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
          return (
            <>
              <TouchableOpacity
                key={item.id}
                style={{
                  flexDirection: 'row',
                  marginVertical: 3,
                  height: 55,
                  alignItems: 'center',
                }}
                activeOpacity={0.5}
                onPress={() =>
                  this.props.navigation.navigate('Chat', {
                    group: item.id,
                  })
                }>
                <Avatar
                  size={50}
                  uri={
                    avatar
                      ? this.props.serverUrl?.slice(0, -1) + avatar
                      : undefined
                  }
                  isGroup={!item.isDM}
                />
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
                  {item.unReadMessage ? (
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
                        {item.unReadMessage}
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
                    {item.lastMessage.deleted ? (
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          opacity: 0.9,
                        }}>
                        <Icon name="cancel" size={12} color="#8A90D5" />
                        <Text
                          style={{
                            marginLeft: 3,
                            fontSize: 12,
                            color: '#8A90D5',
                            fontWeight: '300',
                          }}>
                          Deleted Message
                        </Text>
                      </View>
                    ) : item.lastMessage?.additionImage ||
                      item.lastMessage?.additionFile ? (
                      <React.Fragment>
                        <FontAwesomeIcon
                          icon={
                            item.lastMessage?.additionImage ? faImage : faFile
                          }
                          color="#8A90D5"
                          size={item.lastMessage?.additionImage ? 15 : 12}
                        />
                        <Text
                          style={{
                            color: '#8A90D5',
                            marginLeft: 5,
                            fontWeight: '600',
                            fontSize: 12,
                          }}>
                          {item.lastMessage?.additionImage ? 'Image' : 'File'}
                        </Text>
                      </React.Fragment>
                    ) : (
                      <Text
                        numberOfLines={1}
                        style={{fontSize: 12, color: '#8A90D5', width: '60%'}}>
                        {item.lastMessage?.content}
                      </Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
              <View
                style={{
                  height: 0.5,
                  backgroundColor: '#DDDDDD',
                  width: '80%',
                  alignSelf: 'center',
                  display: index === groupsSorted.length - 1 ? 'none' : 'flex',
                }}
              />
            </>
          );
        }}
      />
    );
  }
}

export default Home;
