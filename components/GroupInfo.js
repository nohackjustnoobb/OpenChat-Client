/* eslint-disable curly */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */

import React from 'react';
import {View, TouchableOpacity, Text, ScrollView, Image} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {Button} from 'react-native-elements';
import {faChevronLeft, faUser} from '@fortawesome/free-solid-svg-icons';
import FitImage from 'react-native-fit-image';

function GroupInfoHeaderLeft(props) {
  return (
    <View style={{flexDirection: 'row', alignItems: 'center'}}>
      <TouchableOpacity
        style={{flexDirection: 'row', alignItems: 'center'}}
        onPress={() => props.goBack()}>
        <FontAwesomeIcon
          icon={faChevronLeft}
          size={21}
          style={{marginRight: 5, marginLeft: 10}}
          color="#6873F2"
        />
        <Text
          numberOfLines={1}
          style={{color: '#6873F2', fontSize: 16, width: '70%'}}>
          {props.groupName}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

class GroupInfo extends React.Component {
  constructor(props) {
    super(props);
    this.group = props.group[props.route.params.group];
    var groupName = this.group.groupName;
    var avatar = this.group.avatar;

    if (this.group.isDM) {
      this.userID = this.group.members.filter(v => v !== props.userInfo.id)[0];
      groupName = props.user[this.userID].username;
      avatar = props.user[this.userID].avatar;
    }

    this.state = {
      groupName: groupName,
      avatar: props.serverUrl?.slice(0, -1) + avatar,
    };
  }

  componentDidMount() {
    this.props.navigation.setOptions({
      headerLeft: () => (
        <GroupInfoHeaderLeft
          groupName={this.state.groupName}
          goBack={() => this.props.navigation.goBack()}
        />
      ),
      title: this.group.isDM ? 'Contact Info' : 'Group Info',
    });
  }

  ExitGroup() {
    this.props.navigation.pop(2);
    if (this.group.isDM) return this.props.toggleUserBlock(this.userID);
    return this.group.owner === this.props.userInfo.id
      ? this.props.deleteGroupByID(this.group.id)
      : this.props.exitGroupByID(this.group.id);
  }

  render() {
    var membersList = this.group.members.map((v, i) => {
      if (!this.props.user[v]) return this.props.getUserByID([v]);
      return (
        <React.Fragment key={this.props.user[v].id}>
          <View
            style={{
              marginVertical: 5,
              marginHorizontal: 10,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
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
              }}>
              {this.props.user[v].avatar ? (
                <Image
                  source={{
                    uri:
                      this.props.serverUrl?.slice(0, -1) +
                      this.props.user[v].avatar,
                  }}
                  style={{height: 35, width: 35}}
                />
              ) : (
                <FontAwesomeIcon icon={faUser} color="#ffffff" size={12} />
              )}
            </View>
            <Text>{this.props.user[v].username}</Text>
            <Text style={{position: 'absolute', right: 10, color: '#888888'}}>
              {this.group.owner === v
                ? 'Owner'
                : this.group.groupAdmins.find(id => id === v)
                ? 'Admin'
                : ''}
            </Text>
          </View>
          {i !== this.group.members.length - 1 ? (
            <View
              style={{
                backgroundColor: '#eeeeee',
                height: 1,
                width: '100%',
                alignSelf: 'center',
              }}
            />
          ) : (
            <></>
          )}
        </React.Fragment>
      );
    });

    return (
      <ScrollView style={{backgroundColor: '#F9F9F9'}}>
        <FitImage
          source={{
            uri: this.state.avatar,
          }}
          resizeMode="contain"
        />
        <View
          style={{
            marginVertical: 20,
            marginTop: 0,
            borderBottomWidth: 1,
            borderTopWidth: 1,
            borderColor: '#dddddd',
          }}>
          <View
            style={{
              backgroundColor: '#ffffff',
              padding: 10,
            }}>
            <Text>{this.state.groupName}</Text>
            {this.group.isDM && this.props.user[this.userID].email ? (
              <Text style={{color: '#888888', fontSize: 11}}>
                {this.props.user[this.userID].email}
              </Text>
            ) : (
              <></>
            )}
          </View>
          {this.group.isDM && this.props.user[this.userID].bio ? (
            <>
              <View
                style={{
                  backgroundColor: '#eeeeee',
                  height: 1,
                  width: '100%',
                  alignSelf: 'center',
                }}
              />
              <View
                style={{
                  backgroundColor: '#ffffff',
                  padding: 10,
                }}>
                <Text>{this.props.user[this.userID].bio}</Text>
              </View>
            </>
          ) : (
            <></>
          )}
        </View>
        {this.group.isDM ? (
          <></>
        ) : (
          <View>
            <Text style={{marginLeft: 10, marginBottom: 3}}>
              {this.group.members.length} Participants
            </Text>
            <View
              style={{
                backgroundColor: '#ffffff',
                borderBottomWidth: 1,
                borderTopWidth: 1,
                borderColor: '#dddddd',
              }}>
              {membersList}
            </View>
          </View>
        )}
        <Button
          title={
            this.group.isDM
              ? `${
                  this.props.blocked.find(v => v === this.userID)
                    ? 'Unblock'
                    : 'Block'
                } ${this.props.user[this.userID].username}`
              : this.group.owner === this.props.userInfo.id
              ? 'Delete Group'
              : 'Exit Group'
          }
          containerStyle={{
            borderBottomWidth: 1,
            borderTopWidth: 1,
            borderColor: '#dddddd',
            marginTop: 20,
          }}
          buttonStyle={{backgroundColor: '#ffffff'}}
          titleStyle={{color: '#ff0000'}}
          onPress={() => this.ExitGroup()}
        />
      </ScrollView>
    );
  }
}

export default GroupInfo;
