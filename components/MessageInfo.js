/* eslint-disable curly */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */

import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  Dimensions,
  ScrollView,
} from 'react-native';
import {Button} from 'react-native-elements';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faChevronLeft, faImage} from '@fortawesome/free-solid-svg-icons';
import FastImage from 'react-native-fast-image';
import DropShadow from 'react-native-drop-shadow';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {SafeAreaInsetsContext} from 'react-native-safe-area-context';

import {Avatar, fixHermesTime} from '../App';

function MessageInfoHeaderLeft(props) {
  return (
    <View style={{flexDirection: 'row', alignItems: 'center'}}>
      <TouchableOpacity
        style={{flexDirection: 'row', alignItems: 'center'}}
        onPress={() => props.goBack()}>
        <FontAwesomeIcon
          icon={faChevronLeft}
          size={21}
          style={{marginRight: 5, marginLeft: 10}}
          color={props.themeColor}
        />
        <Text
          numberOfLines={1}
          style={{color: props.themeColor, fontSize: 16, width: '70%'}}>
          {props.groupName}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

class MessageInfo extends React.Component {
  constructor(props) {
    super(props);
    this.group = props.group[props.route.params.group];
    this.groupName = this.group.groupName;
    this.themeColor = props.themeColor;

    if (this.group.isDM) {
      this.userID = this.group.members.filter(v => v !== props.userInfo.id)[0];
      this.groupName = props.user[this.userID].username;
    }
  }

  async componentDidMount() {
    this.props.navigation.setOptions({
      headerLeft: () => (
        <MessageInfoHeaderLeft
          groupName={this.groupName}
          themeColor={this.themeColor}
          goBack={() => this.props.navigation.goBack()}
        />
      ),
    });
    this.message = await this.props.getMessageInfoByID(
      this.group.id,
      this.props.route.params.message,
    );
    this.forceUpdate();
  }

  render() {
    var memberReadList = this.message?.memberRead?.filter(
      v => v !== this.props.userInfo.id,
    );

    var sentList = this.group.members?.filter(
      v => !this.message?.memberRead?.find(_ => _ === v),
    );
    return (
      <ScrollView
        style={{
          backgroundColor: '#F9F9F9',
        }}>
        <DropShadow
          style={{
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
              backgroundColor: this.themeColor,
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
            {new Date(this.message?.sendDateTime).toLocaleDateString('en-GB')}
          </Text>
        </DropShadow>
        <View
          style={{
            flexDirection: 'row',
            marginBottom: 25,
          }}>
          <View
            style={{
              marginLeft: 10,
            }}>
            <Avatar
              size={35}
              uri={
                this.props.user[this.message?.owner]?.avatar
                  ? this.props.serverUrl?.slice(0, -1) +
                    this.props.user[this.message?.owner].avatar
                  : undefined
              }
            />
          </View>
          <View>
            <Text
              style={{
                fontWeight: '500',
                marginBottom: 3,
              }}>
              {this.props.user[this.message?.owner]?.username}
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
                flexDirection: 'row',
              }}>
              <View
                style={{
                  padding: this.message?.additionImage ? 5 : 7,
                  borderRadius: 7,
                  backgroundColor: this.themeColor,
                  paddingBottom: 2,
                  maxWidth: Dimensions.get('window').width - 70,
                }}>
                {this.message?.deleted ? (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      opacity: 0.6,
                    }}>
                    <Icon name="cancel" size={16} color={'#000000'} />
                    <Text
                      style={{
                        color: '#000000',
                        marginLeft: 5,
                      }}>
                      Deleted Message
                    </Text>
                  </View>
                ) : (
                  <>
                    <View
                      style={{
                        display: this.message?.replyTo ? 'flex' : 'none',
                        flexDirection: 'row',
                        marginBottom: 5,
                        backgroundColor: '#00000025',
                        borderRadius: 5,
                        overflow: 'hidden',
                      }}>
                      <View
                        style={{
                          backgroundColor: '#ffffff',
                          width: 5,
                        }}
                      />
                      <View
                        style={{
                          flexGrow: 1,
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <View
                          style={{
                            marginHorizontal: 10,
                            marginVertical: 7,
                          }}>
                          <Text
                            style={{
                              color: '#ffffff',
                              fontWeight: '500',
                            }}>
                            {
                              this.props.user[this.message?.replyTo?.owner]
                                ?.username
                            }
                          </Text>
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                            }}>
                            <FontAwesomeIcon
                              icon={faImage}
                              size={15}
                              style={{
                                marginRight: 5,
                                display:
                                  !this.message?.replyTo?.content &&
                                  this.message?.replyTo?.additionImage
                                    ? 'flex'
                                    : 'none',
                              }}
                              color={'#ffffff'}
                            />
                            <Text
                              style={{
                                color: '#ffffff',
                                maxWidth: Dimensions.get('window').width - 154,
                              }}>
                              {!this.message?.replyTo?.content &&
                              this.message?.replyTo?.additionImage
                                ? 'Image'
                                : this.message?.replyTo?.content}
                            </Text>
                          </View>
                        </View>
                        <FastImage
                          style={{
                            width: 35,
                            height: 35,
                            borderRadius: 5,
                            alignSelf: 'center',
                            display: this.message?.replyTo?.additionImage
                              ? 'flex'
                              : 'none',
                            marginHorizontal: 5,
                          }}
                          source={{
                            uri:
                              this.props.serverUrl?.slice(0, -1) +
                              this.message?.replyTo?.additionImage,
                          }}
                        />
                      </View>
                    </View>
                    <FastImage
                      source={{
                        uri:
                          this.props.serverUrl?.slice(0, -1) +
                          this.message?.additionImage,
                      }}
                      style={{
                        marginBottom: 3,
                        overflow: 'hidden',
                        borderRadius: 3,
                        width: Dimensions.get('window').width - 80,
                        height:
                          ((Dimensions.get('window').width - 80) * 9) / 16,
                        display: this.message?.additionImage ? 'flex' : 'none',
                      }}
                    />
                    <View
                      style={{
                        display: this.message?.additionFile ? 'flex' : 'none',
                      }}>
                      <Text style={{color: 'red'}}>File</Text>
                    </View>
                    <Text
                      style={{
                        display: this.message?.content ? 'flex' : 'none',
                        color: '#ffffff',
                      }}>
                      {this.message?.content}
                    </Text>
                  </>
                )}
                <Text
                  style={{
                    fontSize: 10,
                    opacity: 0.6,
                    fontWeight: '300',
                    color: '#ffffff',
                    marginTop: 3,
                  }}>
                  {fixHermesTime(new Date(this.message?.sendDateTime))}
                </Text>
              </View>
            </DropShadow>
          </View>
        </View>

        <View
          style={{
            marginBottom: 20,
            display: memberReadList?.length ? 'flex' : 'none',
          }}>
          <Text style={{marginLeft: 10}}>Read By</Text>
          <View
            style={{
              backgroundColor: '#ffffff',
              borderBottomWidth: 1,
              borderTopWidth: 1,
              borderColor: '#dddddd',
            }}>
            {memberReadList?.map((v, i) => (
              <>
                <View
                  style={{
                    marginVertical: 5,
                    marginHorizontal: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <Avatar
                    size={35}
                    uri={
                      this.props.user[v].avatar
                        ? this.props.serverUrl?.slice(0, -1) +
                          this.props.user[v].avatar
                        : undefined
                    }
                  />
                  <Text>{this.props.user[v].username}</Text>
                  <Text
                    style={{
                      position: 'absolute',
                      right: 10,
                      color: '#888888',
                    }}>
                    {this.group.owner === v
                      ? 'Owner'
                      : this.group.groupAdmins.find(id => id === v)
                      ? 'Admin'
                      : ''}
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: '#eeeeee',
                    height: 1,
                    width: '100%',
                    alignSelf: 'center',
                    display: i === memberReadList.length - 1 ? 'none' : 'flex',
                  }}
                />
              </>
            ))}
          </View>
        </View>
        <View
          style={{
            display: sentList.length ? 'flex' : 'none',
            marginBottom: 20,
          }}>
          <Text style={{marginLeft: 10}}>Sent To</Text>
          <View
            style={{
              backgroundColor: '#ffffff',
              borderBottomWidth: 1,
              borderTopWidth: 1,
              borderColor: '#dddddd',
            }}>
            {sentList.map((v, i) => (
              <>
                <View
                  style={{
                    marginVertical: 5,
                    marginHorizontal: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <Avatar
                    size={35}
                    uri={
                      this.props.user[v].avatar
                        ? this.props.serverUrl?.slice(0, -1) +
                          this.props.user[v].avatar
                        : undefined
                    }
                  />
                  <Text>{this.props.user[v].username}</Text>
                  <Text
                    style={{
                      position: 'absolute',
                      right: 10,
                      color: '#888888',
                    }}>
                    {this.group.owner === v
                      ? 'Owner'
                      : this.group.groupAdmins.find(id => id === v)
                      ? 'Admin'
                      : ''}
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: '#eeeeee',
                    height: 1,
                    width: '100%',
                    alignSelf: 'center',
                    display: i === sentList.length - 1 ? 'none' : 'flex',
                  }}
                />
              </>
            ))}
          </View>
        </View>

        <Button
          title="Delete This Message"
          buttonStyle={{backgroundColor: '#ffffff'}}
          containerStyle={{
            borderBottomWidth: 1,
            borderTopWidth: 1,
            borderColor: '#dddddd',
          }}
          titleStyle={{color: '#ff0000'}}
          onPress={() => {
            this.props.deleteMessageByID(this.group.id, this.message.id);
            this.props.navigation.goBack();
          }}
        />
        <SafeAreaInsetsContext.Consumer>
          {insets => <View style={{height: insets.bottom}} />}
        </SafeAreaInsetsContext.Consumer>
      </ScrollView>
    );
  }
}

export {MessageInfoHeaderLeft};
export default MessageInfo;
