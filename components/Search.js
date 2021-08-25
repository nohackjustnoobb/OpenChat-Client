/* eslint-disable curly */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */

import React from 'react';
import {ScrollView, View, Text, Image} from 'react-native';
import {SearchBar} from 'react-native-elements';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faUser} from '@fortawesome/free-solid-svg-icons';
import {Button} from 'react-native-elements';

class Search extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      search: '',
    };
  }

  componentDidMount() {
    this.props.setState({searchResult: []});
  }

  render() {
    var resultView = this.props.searchResult
      .filter(v => v.id !== this.props.userInfo.id)
      .map(v => (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginHorizontal: 10,
            marginBottom: 10,
          }}
          key={v.id}>
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
            {v.avatar ? (
              <Image
                source={{
                  uri: this.props.serverUrl?.slice(0, -1) + v.avatar,
                }}
                style={{height: 35, width: 35}}
              />
            ) : (
              <FontAwesomeIcon icon={faUser} color="#ffffff" size={12} />
            )}
          </View>
          <View style={{justifyContent: 'center'}}>
            <Text>{v.username}</Text>
            <Text style={{color: '#888888', fontSize: 11}}>
              {'# ' + `${v.id}`.padStart(4, '0')}
            </Text>
          </View>
          <Button
            title={
              this.props.friends.find(e => e === v.id)
                ? 'Friend'
                : this.props.blocked.find(e => e === v.id)
                ? 'Blocked'
                : this.props.friendRequest
                    .map(_ => _.toUser)
                    .find(e => e === v.id)
                ? 'Requested'
                : this.props.friendRequest
                    .map(_ => _.fromUser)
                    .find(e => e === v.id)
                ? 'Accept'
                : 'Add Friend'
            }
            type="outline"
            disabled={
              this.props.friends.find(e => e === v.id) ||
              this.props.blocked.find(e => e === v.id) ||
              this.props.friendRequest.map(_ => _.toUser).find(e => e === v.id)
            }
            containerStyle={{
              alignSelf: 'center',
              position: 'absolute',
              right: 5,
            }}
            buttonStyle={{
              paddingVertical: 2,
              borderColor: '#6873F2',
              borderWidth: 1,
            }}
            titleStyle={{color: '#6873F2', fontSize: 14}}
            onPress={() => {
              if (
                this.props.friendRequest
                  .map(_ => _.fromUser)
                  .find(e => e === v.id)
              ) {
                this.props.replyFriendRequest(v.id, true);
              } else {
                this.props.sendFriendRequest(v.id);
              }
            }}
          />
        </View>
      ));

    return (
      <ScrollView style={{backgroundColor: '#F9F9F9'}}>
        <SearchBar
          placeholder="Username or ID"
          value={this.state.search}
          onChangeText={v => this.setState({search: v})}
          platform="ios"
          containerStyle={{backgroundColor: '#F9F9F9'}}
          inputContainerStyle={{backgroundColor: '#eaeaea'}}
          placeholderTextColor="#aaaaaa"
          cancelButtonProps={{color: '#6873F2'}}
          returnKeyType="search"
          autoCorrect={false}
          onClear={() => this.props.setState({searchResult: []})}
          onSubmitEditing={() => this.props.searchUser(this.state.search)}
        />
        {this.props.searchResult.length ? (
          resultView
        ) : (
          <Text
            style={{
              alignSelf: 'center',
              color: '#888888',
              fontSize: 16,
              marginTop: 10,
            }}>
            No Result
          </Text>
        )}
      </ScrollView>
    );
  }
}

export default Search;
