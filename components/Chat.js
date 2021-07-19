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
      this.props.message[group.id].length <= 50
    ) {
      this.props.getGroupMessageByID(group.id);
    }
  }

  render() {
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
              <ScrollView style={{backgroundColor: '#F9F9F9'}}></ScrollView>
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
