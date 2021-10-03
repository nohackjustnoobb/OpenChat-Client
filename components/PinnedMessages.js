/* eslint-disable curly */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
  FlatList,
} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faChevronLeft,
  faImage,
  faThumbtack,
  faCopy,
} from '@fortawesome/free-solid-svg-icons';
import DropShadow from 'react-native-drop-shadow';
import {
  Menu,
  MenuOptions,
  MenuTrigger,
  renderers,
  MenuOption,
  withMenuContext,
} from 'react-native-popup-menu';
import FastImage from 'react-native-fast-image';
import Clipboard from '@react-native-clipboard/clipboard';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import {Avatar} from '../App';

function PinnedMessagesHeaderLeft(props) {
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
          style={{color: '#6873F2', fontSize: 16, width: '60%'}}>
          {props.groupName}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function MenuItem(props) {
  return (
    <View style={{display: props.isDisable ? 'none' : 'flex'}}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingHorizontal: 3,
        }}>
        <Text
          style={{
            color: props.color === undefined ? '#6873F2' : props.color,
            fontWeight: '300',
          }}>
          {props.title}
        </Text>
        <Icon
          size={21}
          name={props.icon}
          color={props.color === undefined ? '#6873F2' : props.color}
        />
      </View>
      <View
        style={{
          backgroundColor: '#eeeeee',
          height: 1,
          width: '100%',
          alignSelf: 'center',
          margin: 5,
          display:
            props.underline === undefined || props.underline ? 'flex' : 'none',
        }}
      />
    </View>
  );
}

class PinnedMessages extends React.Component {
  constructor(props) {
    super(props);
    this.group = props.group[props.route.params.group];
    this.groupName = this.group.groupName;

    if (this.group.isDM) {
      this.userID = this.group.members.filter(v => v !== props.userInfo.id)[0];
      this.groupName = props.user[this.userID].username;
    }
  }

  async componentDidMount() {
    this.props.navigation.setOptions({
      headerLeft: () => (
        <PinnedMessagesHeaderLeft
          groupName={this.groupName}
          goBack={() => this.props.navigation.goBack()}
        />
      ),
    });

    this.pinnedMessages = await this.props.getPinnedMessageByID(this.group.id);
    this.forceUpdate();
  }

  render() {
    return (
      <FlatList
        ref={ref => {
          this.messagesFlatList = ref;
        }}
        style={{backgroundColor: '#F9F9F9'}}
        data={this.pinnedMessages}
        renderItem={({item, index}) => {
          // get user info that is not exists
          if (!this.props.user[item.owner]) {
            this.props.getUserByID([item.owner]);
          }

          // handle message date
          var messageDate = new Date(item.sendDateTime);

          // handle message with image
          const AdditionImage = withMenuContext(props => (
            <TouchableWithoutFeedback
              onPress={() => this.setState({imageView: index})}
              onLongPress={() =>
                props.ctx.menuActions.openMenu(`pin_${item.id}`)
              }>
              <FastImage
                source={{
                  uri: this.props.serverUrl?.slice(0, -1) + item.additionImage,
                }}
                style={{
                  marginBottom: 3,
                  overflow: 'hidden',
                  borderRadius: 3,
                  width: Dimensions.get('window').width - 80,
                  height: ((Dimensions.get('window').width - 80) * 9) / 16,
                }}
              />
            </TouchableWithoutFeedback>
          ));

          return (
            <View>
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
                    marginLeft: 10,
                  }}>
                  <Avatar
                    size={35}
                    uri={
                      this.props.user[item.owner]?.avatar
                        ? this.props.serverUrl?.slice(0, -1) +
                          this.props.user[item.owner].avatar
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
                    {this.props.user[item.owner]?.username}
                  </Text>
                  <Menu
                    name={`pin_${item.id}`}
                    renderer={renderers.Popover}
                    rendererProps={{
                      preferredPlacement: 'right',
                      anchorStyle: {
                        zIndex: 2,
                      },
                    }}>
                    <MenuTrigger
                      disabled={item.deleted}
                      triggerOnLongPress
                      customStyles={{
                        TriggerTouchableComponent: TouchableWithoutFeedback,
                      }}>
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
                            padding: item.additionImage ? 5 : 7,
                            borderRadius: 7,
                            backgroundColor:
                              item.owner === this.props.userInfo.id
                                ? '#6873F2'
                                : '#ffffff',

                            paddingBottom: 2,
                            maxWidth: Dimensions.get('window').width - 70,
                          }}>
                          {item.deleted ? (
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                opacity: 0.6,
                              }}>
                              <Icon
                                name="cancel"
                                size={16}
                                color={
                                  item.owner === this.props.userInfo.id
                                    ? '#ffffff'
                                    : '#000000'
                                }
                              />
                              <Text
                                style={{
                                  color:
                                    item.owner === this.props.userInfo.id
                                      ? '#ffffff'
                                      : '#000000',
                                  marginLeft: 5,
                                }}>
                                Deleted Message
                              </Text>
                            </View>
                          ) : (
                            <>
                              <View
                                style={{
                                  display: item.replyTo ? 'flex' : 'none',
                                  flexDirection: 'row',
                                  marginBottom: 5,
                                  backgroundColor:
                                    item.owner !== this.props.userInfo.id
                                      ? '#00000010'
                                      : '#00000025',
                                  borderRadius: 5,
                                  overflow: 'hidden',
                                }}>
                                <View
                                  style={{
                                    backgroundColor:
                                      item.owner !== this.props.userInfo.id
                                        ? '#6873F2'
                                        : '#ffffff',
                                    width: 5,
                                  }}
                                />
                                <View
                                  style={{
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
                                        color:
                                          item.owner !== this.props.userInfo.id
                                            ? '#6873F2'
                                            : '#ffffff',
                                        fontWeight: '500',
                                      }}>
                                      {
                                        this.props.user[item.replyTo?.owner]
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
                                            !item.replyTo?.content &&
                                            item.replyTo?.additionImage
                                              ? 'flex'
                                              : 'none',
                                        }}
                                        color={
                                          item.owner !== this.props.userInfo.id
                                            ? '#000000'
                                            : '#ffffff'
                                        }
                                      />
                                      <Text
                                        style={{
                                          color:
                                            item.owner !==
                                            this.props.userInfo.id
                                              ? '#000000'
                                              : '#ffffff',
                                          maxWidth:
                                            Dimensions.get('window').width -
                                            154,
                                        }}>
                                        {!item.replyTo?.content &&
                                        item.replyTo?.additionImage
                                          ? 'Image'
                                          : item.replyTo?.content}
                                      </Text>
                                    </View>
                                  </View>
                                  <FastImage
                                    style={{
                                      width: 35,
                                      height: 35,
                                      borderRadius: 5,
                                      alignSelf: 'center',
                                      display: item.replyTo?.additionImage
                                        ? 'flex'
                                        : 'none',
                                      marginHorizontal: 5,
                                    }}
                                    source={{
                                      uri:
                                        this.props.serverUrl?.slice(0, -1) +
                                        item.replyTo?.additionImage,
                                    }}
                                  />
                                </View>
                              </View>

                              {item.additionImage ? <AdditionImage /> : <></>}
                              <View
                                style={{
                                  display: item.additionFile ? 'flex' : 'none',
                                }}>
                                <Text style={{color: 'red'}}>File</Text>
                              </View>

                              <Text
                                style={{
                                  display: item.content ? 'flex' : 'none',
                                  color:
                                    item.owner === this.props.userInfo.id
                                      ? '#ffffff'
                                      : '#000000',
                                }}>
                                {item.content}
                              </Text>
                            </>
                          )}
                          <Text
                            style={{
                              fontSize: 10,
                              opacity: 0.6,
                              fontWeight: '300',
                              color:
                                item.owner === this.props.userInfo.id
                                  ? '#ffffff'
                                  : '#000000',
                              marginTop: 3,
                            }}>
                            {messageDate.toLocaleString('en-US', {
                              hour: 'numeric',
                              minute: 'numeric',
                              hour12: true,
                            })}
                          </Text>
                        </View>
                        <View style={{flex: 1}} />
                      </DropShadow>
                    </MenuTrigger>
                    <MenuOptions
                      customStyles={{
                        optionsContainer: {
                          shadowColor: '#000000',
                          shadowOffset: {
                            width: 1,
                            height: 1,
                          },
                          shadowOpacity: 0.1,
                          shadowRadius: 2,
                          borderRadius: 10,
                          width: 150,
                          padding: 10,
                        },
                        optionWrapper: {padding: 0},
                        OptionTouchableComponent: TouchableOpacity,
                      }}>
                      <MenuOption
                        onSelect={() => {
                          this.props.togglePinByID(this.group.id, item.id);
                          this.pinnedMessages = this.pinnedMessages.filter(
                            v => v.id !== item.id,
                          );
                        }}>
                        <MenuItem
                          title="Unpin"
                          icon="pin-off-outline"
                          isDisable={
                            !this.group.isDM &&
                            Boolean(
                              this.group.groupAdmins.find(
                                id => id !== this.props.userInfo.id,
                              ) === undefined &&
                                this.group.owner !== this.props.userInfo.id,
                            )
                          }
                        />
                      </MenuOption>
                      <MenuOption
                        onSelect={() => Clipboard.setString(item.content)}>
                        <MenuItem
                          title="Copy"
                          icon="content-copy"
                          underline={false}
                        />
                      </MenuOption>
                    </MenuOptions>
                  </Menu>
                </View>
              </View>
            </View>
          );
        }}
      />
    );
  }
}

export default PinnedMessages;
