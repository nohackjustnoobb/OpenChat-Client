/* eslint-disable curly */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Dimensions,
  KeyboardAvoidingView,
} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faChevronLeft,
  faUser,
  faUsers,
  faPlus,
  faPaperPlane,
} from '@fortawesome/free-solid-svg-icons';
import {SafeAreaView} from 'react-native-safe-area-context';
import {SafeAreaInsetsContext} from 'react-native-safe-area-context';
import DropShadow from 'react-native-drop-shadow';

function ChatHeaderLeft(props) {
  return (
    <View style={{flexDirection: 'row', alignItems: 'center'}}>
      <TouchableOpacity onPress={() => props.goBack()}>
        <FontAwesomeIcon
          icon={faChevronLeft}
          size={21}
          style={{marginRight: 5, marginLeft: 10}}
          color="#6873F2"
        />
      </TouchableOpacity>

      <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}}>
        <View
          style={{
            backgroundColor: '#CCCCCC',
            height: 35,
            width: 35,
            borderRadius: 17.5,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 10,
            overflow: 'hidden',
            marginLeft: 15,
          }}>
          {props.avatar ? (
            <Image
              source={{
                uri: props.serverUrl?.slice(0, -1) + props.avatar,
              }}
              style={{height: 35, width: 35}}
            />
          ) : (
            <FontAwesomeIcon
              icon={props.isDM ? faUser : faUsers}
              color="#ffffff"
              size={18}
            />
          )}
        </View>
        <View>
          <Text style={{fontWeight: '600', fontSize: 13}}>
            {props.groupName}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

// Chat Page
class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    var group = this.props.group[this.props.route.params.group];
    var groupName = group.groupName;
    var avatar = group.avatar;

    if (group.isDM) {
      var userID = group.members.filter(v => v !== this.props.userInfo.id)[0];
      groupName = this.props.user[userID].username;
      avatar = this.props.user[userID].avatar;
    }

    this.props.navigation.setOptions({
      headerLeft: () => (
        <ChatHeaderLeft
          groupName={groupName}
          avatar={avatar}
          isDM={group.isDM}
          serverUrl={this.props.serverUrl}
          goBack={() => this.props.navigation.goBack()}
        />
      ),
    });

    if (
      !this.props.message[group.id] ||
      this.props.message[group.id].length < 50
    ) {
      this.props.getGroupMessageByID(group.id);
    }
  }

  render() {
    var messsagesSort = this.props.message[this.props.route.params.group]?.sort(
      (a, b) => a.id - b.id,
    );
    var messsagesView = messsagesSort?.map((v, i) => {
      if (!this.props.user[v.owner]) this.getUserByID([v.owner]);
      var userDisplay =
        i === 0
          ? 'flex'
          : v.owner === messsagesSort[i - 1].owner
          ? 'none'
          : 'flex';

      var messageDate = new Date(v.sendDateTime);
      var newDate = false;

      if (i !== 0) {
        var previousMessageDate = new Date(messsagesSort[i - 1].sendDateTime);
        newDate =
          messageDate.getUTCFullYear() !==
            previousMessageDate.getUTCFullYear() ||
          messageDate.getUTCMonth() !== previousMessageDate.getUTCMonth() ||
          messageDate.getUTCDate() !== previousMessageDate.getUTCDate() ||
          i === 0;
      }

      return (
        <React.Fragment key={v.id}>
          <DropShadow
            style={{
              display: newDate ? 'flex' : 'none',
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#000000',
              shadowOffset: {
                width: -1,
                height: 1,
              },
              shadowOpacity: 0.1,
              shadowRadius: 1,
            }}>
            <Text
              style={{
                backgroundColor: '#6873F2',
                color: '#ffffff',
                fontWeight: '600',
                padding: 2,
                paddingHorizontal: 6,
                borderRadius: 7,
                overflow: 'hidden',
                opacity: 0.6,
                margin: 5,
                fontSize: 11,
              }}>
              {messageDate.toLocaleDateString('en-GB')}
            </Text>
          </DropShadow>
          <View
            style={{
              flexDirection: 'row',
              marginBottom: 5,
            }}>
            <View
              style={{
                backgroundColor: '#CCCCCC',
                height: 35,
                width: 35,
                borderRadius: 17.5,
                justifyContent: 'center',
                alignItems: 'center',
                margin: 10,
                marginTop: 2,
                overflow: 'hidden',
                display: newDate ? 'flex' : userDisplay,
              }}>
              {this.props.user[v.owner].avatar ? (
                <Image
                  source={{
                    uri:
                      this.props.serverUrl?.slice(0, -1) +
                      this.props.user[v.owner].avatar,
                  }}
                  style={{height: 35, width: 35}}
                />
              ) : (
                <FontAwesomeIcon icon={faUser} color="#ffffff" size={15} />
              )}
            </View>
            <View>
              <Text
                style={{
                  fontWeight: '500',
                  marginBottom: 3,
                  display: newDate ? 'flex' : userDisplay,
                }}>
                {this.props.user[v.owner]?.username}
              </Text>
              <DropShadow
                style={{
                  shadowColor: '#000000',
                  shadowOffset: {
                    width: -1,
                    height: 1,
                  },
                  shadowOpacity: 0.1,
                  shadowRadius: 1,
                }}>
                <View
                  style={{
                    padding: 7,
                    borderRadius: 7,
                    backgroundColor:
                      v.owner === this.props.userInfo.id
                        ? '#ffffff'
                        : '#6873F2',
                    marginLeft: userDisplay === 'none' ? (newDate ? 0 : 55) : 0,
                    marginRight: newDate ? 70 : 15,
                  }}>
                  <Text
                    style={{
                      color:
                        v.owner === this.props.userInfo.id
                          ? '#000000'
                          : '#ffffff',
                    }}>
                    {v.content}
                  </Text>
                  <Text
                    style={{
                      fontSize: 10,
                      opacity: 0.6,
                      fontWeight: '300',
                      color:
                        v.owner === this.props.userInfo.id
                          ? '#000000'
                          : '#ffffff',
                    }}>
                    {messageDate.toLocaleString('en-US', {
                      hour: 'numeric',
                      minute: 'numeric',
                      hour12: true,
                    })}
                  </Text>
                </View>
              </DropShadow>
            </View>
          </View>
        </React.Fragment>
      );
    });

    return (
      <SafeAreaView
        style={{flex: 1, backgroundColor: '#ffffff'}}
        edges={['right', 'bottom', 'left']}>
        <SafeAreaInsetsContext.Consumer>
          {insets => (
            <KeyboardAvoidingView
              behavior="padding"
              keyboardVerticalOffset={insets.bottom + 60}
              style={{flex: 1}}>
              <ScrollView
                ref={ref => {
                  this.scrollView = ref;
                }}
                style={{
                  backgroundColor: '#F9F9F9',
                }}
                contentContainerStyle={{paddingVertical: 5}}
                onContentSizeChange={() =>
                  this.scrollView.scrollToEnd({animated: false})
                }>
                {messsagesView}
              </ScrollView>
              <View
                style={{
                  backgroundColor: '#ffffff',
                  height: 50,
                  width: '100%',
                  borderColor: '#DDDDDD',
                  borderTopWidth: 0.5,
                  flexDirection: 'row',
                  justifyContent: 'space-around',
                  alignItems: 'center',
                }}>
                <FontAwesomeIcon icon={faPlus} size={25} color="#6873F2" />
                <TextInput
                  style={{
                    width: Dimensions.get('window').width * 0.7,
                    height: 35,
                    backgroundColor: '#eeeeee',
                    borderRadius: 10,
                    padding: 10,
                  }}
                  placeholder="New Message"
                  placeholderTextColor="#aaaaaa"
                />
                <FontAwesomeIcon
                  icon={faPaperPlane}
                  size={25}
                  color="#6873F2"
                />
              </View>
            </KeyboardAvoidingView>
          )}
        </SafeAreaInsetsContext.Consumer>
      </SafeAreaView>
    );
  }
}

export default Chat;
