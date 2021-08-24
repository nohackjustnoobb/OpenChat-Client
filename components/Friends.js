/* eslint-disable curly */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */

import React from 'react';
import {ScrollView, View, Text, Image, TouchableOpacity} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faUser,
  faTimesCircle,
  faCheckCircle,
} from '@fortawesome/free-solid-svg-icons';
import {Button} from 'react-native-elements';

class Friends extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    var friendRequestView = this.props.friendRequest.map(v => {
      var user = [v.fromUser, v.toUser].filter(
        _ => _ !== this.props.userInfo.id,
      );
      if (!this.props.user[user]) this.props.getUserByID([user]);
      return (
        <View style={{flexDirection: 'row', alignItems: 'center'}} key={v.id}>
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
            {this.props.user[user].avatar ? (
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
            <Text>{this.props.user[user].username}</Text>
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
              />
            ) : (
              <>
                <TouchableOpacity>
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    color="#55ee55"
                    size={30}
                  />
                </TouchableOpacity>
                <TouchableOpacity style={{marginLeft: 10}}>
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
        <View style={{flexDirection: 'row', alignItems: 'center'}} key={v.id}>
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
