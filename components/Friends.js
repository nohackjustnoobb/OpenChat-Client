/* eslint-disable curly */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */

import React from 'react';
import {ScrollView, View, Text, TouchableOpacity, Alert} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faTimesCircle, faCheckCircle} from '@fortawesome/free-solid-svg-icons';
import {Button} from 'react-native-elements';
import ModalSelector from 'react-native-modal-selector';
import {SafeAreaInsetsContext} from 'react-native-safe-area-context';

import {Avatar} from '../App';

class Friends extends React.Component {
  constructor(props) {
    super(props);
    this.state = {modal: null};
    this.themeColor = props.themeColor;
  }

  render() {
    var friendRequestView = this.props.friendRequest.map(v => {
      var user = [v.fromUser, v.toUser].filter(
        _ => _ !== this.props.userInfo.id,
      );
      if (!this.props.user[user]) this.props.getUserByID(user);
      return (
        <View
          style={{flexDirection: 'row', alignItems: 'center', marginBottom: 5}}
          key={`_${v.id}`}>
          <Avatar
            size={35}
            uri={
              this.props.user[user]?.avatar
                ? this.props.serverUrl?.slice(0, -1) +
                  this.props.user[user].avatar
                : undefined
            }
          />
          <View style={{justifyContent: 'center'}}>
            <Text>{this.props.user[user]?.username}</Text>
            <Text style={{color: '#888888', fontSize: 11}}>
              {new Date(v.requestDate).toLocaleString('en-GB')}
            </Text>
          </View>
          <View style={{flexDirection: 'row', position: 'absolute', right: 10}}>
            {v.fromUser === this.props.userInfo.id ? (
              <Button
                title="Cancel Request"
                type="outline"
                containerStyle={{
                  alignSelf: 'center',
                }}
                buttonStyle={{
                  paddingVertical: 2,
                  borderColor: '#ee5555',
                  borderWidth: 1,
                }}
                titleStyle={{color: '#ee5555', fontSize: 14}}
                onPress={() => this.props.cancelRequest(v.id)}
              />
            ) : (
              <>
                <TouchableOpacity
                  onPress={() => this.props.replyFriendRequest(v.id, true)}>
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    color="#55ee55"
                    size={30}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={{marginLeft: 10}}
                  onPress={() => this.props.replyFriendRequest(v.id, false)}>
                  <FontAwesomeIcon
                    icon={faTimesCircle}
                    color="#ee5555"
                    size={30}
                  />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      );
    });

    let key = 0;
    var friendsData = [
      {
        key: key++,
        label: 'userInfo',
        section: true,
        component: (
          <View style={{flexDirection: 'row', justifyContent: 'center'}}>
            <Avatar
              size={40}
              uri={
                this.props.user[this.state.modal]?.avatar
                  ? this.props.serverUrl?.slice(0, -1) +
                    this.props.user[this.state.modal].avatar
                  : undefined
              }
            />
            <View style={{marginLeft: 10, alignSelf: 'center'}}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                }}>
                {this.props.user[this.state.modal]?.username}
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  color: '#888888',
                }}>
                {this.props.user[this.state.modal]?.email}
              </Text>
            </View>
          </View>
        ),
      },
      {
        key: key++,
        label: `Message ${this.props.user[this.state.modal]?.username}`,
        onPress: async () => {
          var group = await this.props.createDM(this.state.modal);
          this.setState({modal: null});
          this.props.navigation.navigate('Chat', {group: group.id});
        },
      },
      {
        key: key++,
        label: 'Unfriend',
        component: (
          <Text style={{textAlign: 'center', color: '#ff0000', fontSize: 16}}>
            {`Unfriend ${this.props.user[this.state.modal]?.username}`}
          </Text>
        ),
        onPress: () =>
          Alert.alert(
            `Unfriend ${this.props.user[this.state.modal]?.username} ?`,
            undefined,
            [
              {text: 'Cancel', style: 'cancel'},
              {
                text: 'Yes',
                style: 'destructive',
                onPress: () => {
                  this.props.removeFriend(this.state.modal);
                  this.setState({modal: null});
                },
              },
            ],
          ),
      },
      {
        key: key++,
        label: 'Block',
        component: (
          <Text style={{textAlign: 'center', color: '#ff0000', fontSize: 16}}>
            {`Block ${this.props.user[this.state.modal]?.username}`}
          </Text>
        ),
        onPress: () =>
          Alert.alert(
            `Block ${this.props.user[this.state.modal]?.username} ?`,
            undefined,
            [
              {text: 'Cancel', style: 'cancel'},
              {
                text: 'Yes',
                style: 'destructive',
                onPress: () => {
                  this.props.toggleUserBlock(this.state.modal);
                  this.setState({modal: null});
                },
              },
            ],
          ),
      },
    ];

    var friendsView = this.props.friends.map(v => {
      if (!this.props.user[v]) this.props.getUserByID([v]);
      return (
        <View
          style={{flexDirection: 'row', alignItems: 'center', marginBottom: 5}}
          key={v.id}>
          <SafeAreaInsetsContext.Consumer>
            {insets => (
              <ModalSelector
                data={friendsData}
                animationType={'fade'}
                backdropPressToClose={true}
                onModalOpen={() => this.setState({modal: v})}
                overlayStyle={{
                  justifyContent: 'flex-end',
                  paddingBottom: insets.bottom + 30,
                }}
                cancelTextStyle={{color: '#ff0000'}}
                onModalClose={i => (i.onPress ? i.onPress() : undefined)}>
                <View style={{flexDirection: 'row'}}>
                  <Avatar
                    size={35}
                    uri={
                      this.props.user[v]?.avatar
                        ? this.props.serverUrl?.slice(0, -1) +
                          this.props.user[v].avatar
                        : undefined
                    }
                  />
                  <View
                    style={{justifyContent: 'center', alignContent: 'center'}}>
                    <Text>{this.props.user[v]?.username}</Text>
                    <Text style={{color: '#888888', fontSize: 11}}>
                      {this.props.user[v]?.email}
                    </Text>
                  </View>
                </View>
              </ModalSelector>
            )}
          </SafeAreaInsetsContext.Consumer>

          <View style={{flexDirection: 'row', position: 'absolute', right: 10}}>
            <Button
              title="Remove"
              type="outline"
              containerStyle={{
                alignSelf: 'center',
              }}
              buttonStyle={{
                paddingVertical: 2,
                borderColor: '#ee5555',
                borderWidth: 1,
              }}
              titleStyle={{color: '#ee5555', fontSize: 14}}
              onPress={() => this.props.removeFriend(v)}
            />
          </View>
        </View>
      );
    });

    return (
      <ScrollView style={{backgroundColor: '#F9F9F9', padding: 10}}>
        {this.props.friendRequest.length ? (
          <>
            <Text>Friend Request</Text>
            <View
              style={{
                backgroundColor: this.themeColor,
                height: 2,
                width: 65,
                marginTop: 3,
                marginBottom: 10,
              }}
            />
          </>
        ) : (
          <></>
        )}
        {friendRequestView}
        {this.props.friends.length ? (
          <>
            <Text style={{marginTop: this.props.friendRequest.length ? 20 : 0}}>
              Friends
            </Text>
            <View
              style={{
                backgroundColor: this.themeColor,
                height: 2,
                width: 65,
                marginTop: 3,
                marginBottom: 10,
              }}
            />
          </>
        ) : (
          <></>
        )}
        {friendsView}
      </ScrollView>
    );
  }
}

export default Friends;
