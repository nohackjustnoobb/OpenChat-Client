/* eslint-disable curly */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */

import React from 'react';
import {
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faUser,
  faTimesCircle,
  faCheckCircle,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import {Button} from 'react-native-elements';

class Friends extends React.Component {
  constructor(props) {
    super(props);
    this.state = {modal: null};
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
            {this.props.user[user]?.avatar ? (
              <Image
                source={{
                  uri:
                    this.props.serverUrl?.slice(0, -1) +
                    this.props.user[user].avatar,
                }}
                style={{height: 35, width: 35}}
              />
            ) : (
              <FontAwesomeIcon icon={faUser} color="#ffffff" size={12} />
            )}
          </View>
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

    var friendsView = this.props.friends.map(v => {
      if (!this.props.user[v]) this.props.getUserByID([v]);
      return (
        <View
          style={{flexDirection: 'row', alignItems: 'center', marginBottom: 5}}
          key={v.id}>
          <TouchableOpacity
            style={{flexDirection: 'row'}}
            onPress={() => this.setState({modal: v})}>
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
              {this.props.user[v]?.avatar ? (
                <Image
                  source={{
                    uri:
                      this.props.serverUrl?.slice(0, -1) +
                      this.props.user[v].avatar,
                  }}
                  style={{height: 35, width: 35}}
                />
              ) : (
                <FontAwesomeIcon icon={faUser} color="#ffffff" size={18} />
              )}
            </View>
            <View style={{justifyContent: 'center', alignContent: 'center'}}>
              <Text>{this.props.user[v]?.username}</Text>
              <Text style={{color: '#888888', fontSize: 11}}>
                {this.props.user[v]?.email}
              </Text>
            </View>
          </TouchableOpacity>

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
        <Modal
          visible={Boolean(this.state.modal)}
          presentationStyle="formSheet"
          animationType="slide">
          <TouchableOpacity
            onPress={() => this.setState({modal: null})}
            style={{position: 'absolute', right: 15, top: 15, zIndex: 1}}>
            <FontAwesomeIcon icon={faTimes} color="#ff0000" size={26} />
          </TouchableOpacity>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignContent: 'center',
              marginBottom: 100,
            }}>
            <View
              style={{
                backgroundColor: '#CCCCCC',
                height: 150,
                width: 150,
                borderRadius: 75,
                justifyContent: 'center',
                alignItems: 'center',
                alignSelf: 'center',
                overflow: 'hidden',
              }}>
              {this.props.user[this.state.modal]?.avatar ? (
                <Image
                  source={{
                    uri:
                      this.props.serverUrl?.slice(0, -1) +
                      this.props.user[this.state.modal].avatar,
                  }}
                  style={{height: 150, width: 150}}
                />
              ) : (
                <FontAwesomeIcon icon={faUser} color="#ffffff" size={75} />
              )}
            </View>
            <Text
              style={{
                fontSize: 20,
                fontWeight: '600',
                textAlign: 'center',
                marginTop: 10,
              }}>
              {this.props.user[this.state.modal]?.username}
            </Text>
            <Text
              style={{
                fontSize: 12,
                textAlign: 'center',
                color: '#888888',
              }}>
              {this.props.user[this.state.modal]?.email}
            </Text>
            <View style={{marginTop: 20}}>
              <Button
                type="clear"
                titleStyle={{color: '#6873F2'}}
                title={`Message ${this.props.user[this.state.modal]?.username}`}
                onPress={async () => {
                  var group = await this.props.createDM(this.state.modal);
                  this.setState({modal: null});
                  this.props.navigation.navigate('Chat', {group: group.id});
                }}
              />
              <Button
                type="clear"
                titleStyle={{color: '#ff0000', fontWeight: '600'}}
                title={`Unfriend ${
                  this.props.user[this.state.modal]?.username
                }`}
                onPress={() => {
                  this.props.removeFriend(this.state.modal);
                  this.setState({modal: null});
                }}
              />
              <Button
                type="clear"
                titleStyle={{color: '#ff0000', fontWeight: '600'}}
                title={`Block ${this.props.user[this.state.modal]?.username}`}
                onPress={() => {
                  this.props.toggleUserBlock(this.state.modal);
                  this.setState({modal: null});
                }}
              />
            </View>
          </View>
        </Modal>
        {this.props.friendRequest.length ? (
          <>
            <Text>Friend Request</Text>
            <View
              style={{
                backgroundColor: '#6873F2',
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
                backgroundColor: '#6873F2',
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
