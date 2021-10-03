/* eslint-disable curly */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faChevronLeft,
  faCamera,
  faImage,
  faThumbtack,
  faReply,
  faCopy,
  faInfo,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import {
  SafeAreaView,
  SafeAreaInsetsContext,
} from 'react-native-safe-area-context';
import DropShadow from 'react-native-drop-shadow';
import FitImage from 'react-native-fit-image';
import ImageView from 'react-native-image-viewing';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import ModalSelector from 'react-native-modal-selector';
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

      <TouchableOpacity
        style={{flexDirection: 'row', alignItems: 'center'}}
        onPress={() => props.groupInfo()}>
        <Avatar
          size={35}
          uri={
            props.avatar
              ? props.serverUrl?.slice(0, -1) + props.avatar
              : undefined
          }
          isGroup={!props.isDM}
        />
        <View>
          <Text style={{fontWeight: '600', fontSize: 13}}>
            {props.groupName}
          </Text>
        </View>
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
        <FontAwesomeIcon
          icon={props.icon}
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

// Chat Page
class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      imageView: '',
      content: '',
      imageContent: '',
      imagePreview: null,
      imageSelector: false,
      confirm: false,
      refresh: false,
      reply: null,
    };

    this.lastMessage = false;
  }

  componentDidMount() {
    this.group = this.props.group[this.props.route.params.group];
    var groupName = this.group.groupName;
    var avatar = this.group.avatar;

    if (this.group.isDM) {
      var userID = this.group.members.filter(
        v => v !== this.props.userInfo.id,
      )[0];
      groupName = this.props.user[userID].username;
      avatar = this.props.user[userID].avatar;
    }

    this.props.navigation.setOptions({
      headerLeft: () => (
        <ChatHeaderLeft
          groupName={groupName}
          avatar={avatar}
          isDM={this.group.isDM}
          serverUrl={this.props.serverUrl}
          goBack={() => this.props.navigation.goBack()}
          groupInfo={() =>
            this.props.navigation.navigate('GroupInfo', {
              group: this.group.id,
            })
          }
        />
      ),
    });

    if (
      !this.props.message[this.group.id] ||
      this.props.message[this.group.id].length < 50
    ) {
      this.getGroupMessage();
    }

    this.keyboardDidShowSubscription = Keyboard.addListener(
      'keyboardWillShow',
      e => this.setState({keyboardHeight: e.endCoordinates.height}),
    );
    this.keyboardDidHideSubscription = Keyboard.addListener(
      'keyboardWillHide',
      () => this.setState({keyboardHeight: 0}),
    );
  }

  componentWillUnmount() {
    this.keyboardDidShowSubscription.remove();
    this.keyboardDidHideSubscription.remove();
  }

  async getGroupMessage() {
    this.setState({refresh: true});
    if (!this.lastMessage && !this.state.refresh) {
      this.lastMessage = await this.props.getGroupMessageByID(this.group.id);
    }
    this.setState({refresh: false});
    return;
  }

  getImage(useCamera) {
    let getMethod = useCamera ? launchCamera : launchImageLibrary;
    this.setState({imageContent: ''});
    setTimeout(
      () =>
        getMethod({mediaType: 'photo'}, response => {
          if (response.assets) {
            this.setState({imagePreview: response.assets[0]});
          }
        }),
      500,
    );
  }

  render() {
    this.group = this.props.group[this.props.route.params.group];
    var messagesSort = this.props.message[this.group.id]?.sort(
      (a, b) => b.id - a.id,
    );

    if (this.group.unReadMessage) {
      this.props.setReadByID(this.group.id);
      var group = this.props.group;
      group[this.group.id].unReadMessage = null;
      this.props.setState({group: group});
    }

    // prevent error from ImageView
    if (!messagesSort) messagesSort = {};

    var additionselectorData = [
      {
        key: 0,
        label: 'Camera',
        component: (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <FontAwesomeIcon icon={faCamera} size={21} color="#6873F2" />
            <Text style={{marginLeft: 10, fontSize: 16, color: '#6873F2'}}>
              Camera
            </Text>
          </View>
        ),
        onPress: () => this.getImage(true),
      },
      {
        key: 1,
        label: 'Image Library',
        component: (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <FontAwesomeIcon icon={faImage} size={21} color="#6873F2" />
            <Text style={{marginLeft: 10, fontSize: 16, color: '#6873F2'}}>
              Image Library
            </Text>
          </View>
        ),
        onPress: () => this.getImage(false),
      },
    ];

    var replyMessage = this.props.message[this.group.id]?.filter(
      v => v.id === this.state.reply,
    )[0];

    return (
      <SafeAreaView
        style={{flex: 1, backgroundColor: '#ffffff'}}
        edges={['right', 'bottom', 'left']}>
        <SafeAreaInsetsContext.Consumer>
          {insets => (
            <KeyboardAvoidingView
              behavior="padding"
              style={{flex: 1}}
              keyboardVerticalOffset={insets.bottom + 60}
              enabled={!this.state.imageView && !this.state.imagePreview}>
              <ImageView
                animationType="fade"
                images={[
                  {
                    uri: this.state.imageView
                      ? this.props.serverUrl?.slice(0, -1) +
                        messagesSort[this.state.imageView]?.additionImage
                      : this.state.imagePreview?.uri,
                  },
                ]}
                visible={Boolean(
                  this.state.imageView ||
                    (this.state.imagePreview && !this.state.confirm),
                )}
                imageIndex={0}
                swipeToCloseEnabled={Boolean(this.state.imageView)}
                onRequestClose={() =>
                  this.setState({imageView: '', imagePreview: null})
                }
                backgroundColor="#ffffff"
                {...(this.state.imagePreview
                  ? {
                      HeaderComponent: () => (
                        <SafeAreaView>
                          <View
                            style={{
                              flex: 1,
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              marginHorizontal: 20,
                            }}>
                            <TouchableOpacity
                              onPress={() =>
                                this.setState({
                                  imageView: '',
                                  imagePreview: null,
                                  reply: null,
                                })
                              }>
                              <Text
                                style={{
                                  color: '#ff0000',
                                  fontSize: 18,
                                }}>
                                Cancel
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => this.setState({confirm: true})}>
                              <Text
                                style={{
                                  color: '#6873F2',
                                  fontSize: 18,
                                }}>
                                Confirm
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </SafeAreaView>
                      ),
                    }
                  : {})}
              />
              <Modal visible={this.state.confirm} transparent>
                <View
                  style={{
                    backgroundColor: '#00000066',
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <TouchableWithoutFeedback
                    onPress={() =>
                      this.setState({
                        imageView: '',
                        imagePreview: null,
                        confirm: false,
                      })
                    }>
                    <View
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                      }}
                    />
                  </TouchableWithoutFeedback>
                  <KeyboardAvoidingView
                    behavior="position"
                    style={{width: '100%'}}
                    keyboardVerticalOffset={-10}>
                    <View
                      style={{
                        zIndex: 2,
                        width: '90%',
                        padding: 15,
                        backgroundColor: '#ffffff',
                        borderRadius: 10,
                        alignSelf: 'center',
                      }}>
                      <FitImage
                        source={{uri: this.state.imagePreview?.uri}}
                        style={{borderRadius: 5, overflow: 'hidden'}}
                        resizeMode="contain"
                      />
                      <View
                        style={{flexDirection: 'row', alignItems: 'center'}}>
                        <TextInput
                          style={{
                            flex: 1,
                            height: 30,
                            backgroundColor: '#eeeeee',
                            borderRadius: 10,
                            paddingHorizontal: 10,
                            marginTop: 10,
                          }}
                          placeholder="Message With Image"
                          placeholderTextColor="#aaaaaa"
                          onChangeText={v => this.setState({imageContent: v})}
                          value={this.state.imageContent}
                        />
                        <TouchableOpacity
                          style={{marginLeft: 10, transform: [{translateY: 5}]}}
                          onPress={() => {
                            var imageContent = this.state.imageContent;
                            var image = this.state.imagePreview;
                            var reply = this.state.reply;
                            this.setState({
                              imageContent: '',
                              imagePreview: null,
                              confirm: false,
                              reply: null,
                            });
                            this.props.sendMessage(
                              this.group.id,
                              imageContent,
                              image,
                              reply,
                            );
                          }}>
                          <Icon name={'send'} size={22} color="#6873F2" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </KeyboardAvoidingView>
                </View>
              </Modal>
              <FlatList
                ref={ref => {
                  this.messagesFlatList = ref;
                }}
                style={{backgroundColor: '#F9F9F9'}}
                contentContainerStyle={{
                  flexGrow: 1,
                  justifyContent: 'flex-end',
                }}
                data={messagesSort}
                inverted
                ListFooterComponent={
                  <ActivityIndicator
                    style={{
                      display: this.state.refresh ? 'flex' : 'none',
                      margin: 20,
                    }}
                  />
                }
                onEndReached={() => this.getGroupMessage()}
                renderItem={({item, index}) => {
                  // get user info that is not exists
                  if (!this.props.user[item.owner]) {
                    this.props.getUserByID([item.owner]);
                  }

                  // check if user info need to be display
                  var displayUser =
                    index === messagesSort.lenghth - 1 ||
                    item.owner !== messagesSort[index + 1]?.owner;

                  // handle message date
                  var messageDate = new Date(item.sendDateTime);
                  var previousMessageDate = new Date(
                    messagesSort[index + 1]?.sendDateTime,
                  );
                  var displayDate =
                    messageDate.getUTCFullYear() !==
                      previousMessageDate.getUTCFullYear() ||
                    messageDate.getUTCMonth() !==
                      previousMessageDate.getUTCMonth() ||
                    messageDate.getUTCDate() !==
                      previousMessageDate.getUTCDate();

                  // handle message with image
                  const AdditionImage = withMenuContext(props => (
                    <TouchableWithoutFeedback
                      onPress={() => this.setState({imageView: index})}
                      onLongPress={() =>
                        props.ctx.menuActions.openMenu(`${item.id}`)
                      }>
                      <FastImage
                        source={{
                          uri:
                            this.props.serverUrl?.slice(0, -1) +
                            item.additionImage,
                        }}
                        style={{
                          marginBottom: 3,
                          overflow: 'hidden',
                          borderRadius: 3,
                          width: Dimensions.get('window').width - 80,
                          height:
                            ((Dimensions.get('window').width - 80) * 9) / 16,
                        }}
                      />
                    </TouchableWithoutFeedback>
                  ));

                  return (
                    <View>
                      <DropShadow
                        style={{
                          display: displayDate ? 'flex' : 'none',
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
                            display:
                              displayUser || displayDate ? 'flex' : 'none',
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
                              display:
                                displayUser || displayDate ? 'flex' : 'none',
                            }}>
                            {this.props.user[item.owner]?.username}
                          </Text>
                          <Menu
                            name={`${item.id}`}
                            renderer={renderers.Popover}
                            rendererProps={{
                              preferredPlacement: 'right',
                              anchorStyle: {
                                zIndex: 2,
                                marginLeft:
                                  displayDate || displayUser ? -70 : undefined,
                              },
                            }}>
                            <MenuTrigger
                              disabled={item.deleted}
                              triggerOnLongPress
                              customStyles={{
                                TriggerTouchableComponent:
                                  TouchableWithoutFeedback,
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
                                    marginLeft:
                                      displayUser || displayDate ? 0 : 55,
                                    paddingBottom: 2,
                                    maxWidth:
                                      Dimensions.get('window').width - 70,
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
                                            item.owner ===
                                            this.props.userInfo.id
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
                                          display: item.replyTo
                                            ? 'flex'
                                            : 'none',
                                          flexDirection: 'row',
                                          marginBottom: 5,
                                          backgroundColor:
                                            item.owner !==
                                            this.props.userInfo.id
                                              ? '#00000010'
                                              : '#00000025',
                                          borderRadius: 5,
                                          overflow: 'hidden',
                                        }}>
                                        <View
                                          style={{
                                            backgroundColor:
                                              item.owner !==
                                              this.props.userInfo.id
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
                                                  item.owner !==
                                                  this.props.userInfo.id
                                                    ? '#6873F2'
                                                    : '#ffffff',
                                                fontWeight: '500',
                                              }}>
                                              {
                                                this.props.user[
                                                  item.replyTo?.owner
                                                ]?.username
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
                                                  item.owner !==
                                                  this.props.userInfo.id
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
                                                    Dimensions.get('window')
                                                      .width - 154,
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
                                              display: item.replyTo
                                                ?.additionImage
                                                ? 'flex'
                                                : 'none',
                                              marginHorizontal: 5,
                                            }}
                                            source={{
                                              uri:
                                                this.props.serverUrl?.slice(
                                                  0,
                                                  -1,
                                                ) + item.replyTo?.additionImage,
                                            }}
                                          />
                                        </View>
                                      </View>

                                      {item.additionImage ? (
                                        <AdditionImage />
                                      ) : (
                                        <></>
                                      )}
                                      <View
                                        style={{
                                          display: item.additionFile
                                            ? 'flex'
                                            : 'none',
                                        }}>
                                        <Text style={{color: 'red'}}>File</Text>
                                      </View>

                                      <Text
                                        style={{
                                          display: item.content
                                            ? 'flex'
                                            : 'none',
                                          color:
                                            item.owner ===
                                            this.props.userInfo.id
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
                                  marginLeft:
                                    displayDate || displayUser ? 0 : undefined,
                                },
                                optionWrapper: {padding: 0},
                                OptionTouchableComponent: TouchableOpacity,
                              }}>
                              <MenuOption>
                                <MenuItem
                                  title="Pin"
                                  icon={faThumbtack}
                                  isDisable={
                                    !this.group.isDM &&
                                    Boolean(
                                      this.group.groupAdmins.find(
                                        id => id !== this.props.userInfo.id,
                                      ) === undefined &&
                                        this.group.owner !==
                                          this.props.userInfo.id,
                                    )
                                  }
                                />
                              </MenuOption>
                              <MenuOption
                                onSelect={() =>
                                  this.setState({reply: item.id})
                                }>
                                <MenuItem title="Reply" icon={faReply} />
                              </MenuOption>
                              <MenuOption
                                onSelect={() =>
                                  Clipboard.setString(item.content)
                                }>
                                <MenuItem
                                  title="Copy"
                                  icon={faCopy}
                                  underline={
                                    item.owner === this.props.userInfo.id
                                  }
                                />
                              </MenuOption>
                              <MenuOption
                                onSelect={() =>
                                  this.props.navigation.navigate(
                                    'MessageInfo',
                                    {
                                      group: this.group.id,
                                      message: item.id,
                                    },
                                  )
                                }>
                                <MenuItem
                                  title="Info"
                                  icon={faInfo}
                                  isDisable={
                                    item.owner !== this.props.userInfo.id
                                  }
                                />
                              </MenuOption>
                              <MenuOption
                                onSelect={() =>
                                  this.props.deleteMessageByID(
                                    this.group.id,
                                    item.id,
                                  )
                                }>
                                <MenuItem
                                  title="Delete"
                                  icon={faTrash}
                                  color="#ff6666"
                                  underline={false}
                                  isDisable={
                                    item.owner !== this.props.userInfo.id
                                  }
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
              <View
                style={{
                  backgroundColor: '#ffffff',
                  minHeight: 50,
                  width: '100%',
                  borderColor: '#DDDDDD',
                  borderTopWidth: 0.5,
                }}>
                <View
                  style={{
                    display: this.state.reply ? 'flex' : 'none',
                    flexDirection: 'row',
                    marginBottom: 5,
                    justifyContent: 'space-between',
                  }}>
                  <View style={{flexDirection: 'row', flex: 1}}>
                    <View
                      style={{
                        backgroundColor: '#6873F2',
                        width: 5,
                      }}
                    />
                    <View style={{marginHorizontal: 10, marginVertical: 7}}>
                      <Text style={{color: '#6873F2', fontWeight: '500'}}>
                        {this.props.user[replyMessage?.owner]?.username}
                      </Text>
                      <View
                        style={{flexDirection: 'row', alignItems: 'center'}}>
                        <FontAwesomeIcon
                          icon={faImage}
                          size={15}
                          style={{
                            marginRight: 5,
                            display:
                              !replyMessage?.content &&
                              replyMessage?.additionImage
                                ? 'flex'
                                : 'none',
                          }}
                        />
                        <Text numberOfLines={1}>
                          {!replyMessage?.content && replyMessage?.additionImage
                            ? 'Image'
                            : replyMessage?.content}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <FastImage
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 5,
                      alignSelf: 'center',
                      display: replyMessage?.additionImage ? 'flex' : 'none',
                    }}
                    source={{
                      uri:
                        this.props.serverUrl?.slice(0, -1) +
                        replyMessage?.additionImage,
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => this.setState({reply: null})}
                    style={{alignSelf: 'center', marginHorizontal: 10}}>
                    <Icon
                      name={'close-circle-outline'}
                      size={22}
                      color="#6873F2"
                    />
                  </TouchableOpacity>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                    flex: this.state.reply ? 0 : 1,
                  }}>
                  <ModalSelector
                    data={additionselectorData}
                    animationType={'fade'}
                    backdropPressToClose={true}
                    overlayStyle={{
                      justifyContent: 'flex-end',
                      paddingBottom: insets.bottom + 30,
                    }}
                    style={{transform: [{scale: 1.4}]}}
                    cancelTextStyle={{color: '#ff0000'}}
                    onModalClose={i => (i.onPress ? i.onPress() : undefined)}>
                    <Icon name={'plus'} size={26} color="#6873F2" />
                  </ModalSelector>
                  <TextInput
                    style={{
                      width: Dimensions.get('window').width * 0.7,
                      minHeight: 35,
                      backgroundColor: '#eeeeee',
                      borderRadius: 10,
                      paddingHorizontal: 10,
                    }}
                    placeholder="New Message"
                    placeholderTextColor="#aaaaaa"
                    onChangeText={v => this.setState({content: v})}
                    value={this.state.content}
                    onFocus={() =>
                      this.messagesFlatList.scrollToIndex({index: 0})
                    }
                    returnKeyType="send"
                    onSubmitEditing={() => {
                      this.props.sendMessage(
                        this.group.id,
                        this.state.content,
                        null,
                        this.state.reply,
                      );
                      this.setState({content: '', reply: null});
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => {
                      this.props.sendMessage(
                        this.group.id,
                        this.state.content,
                        null,
                        this.state.reply,
                      );
                      this.setState({content: '', reply: null});
                    }}>
                    <Icon name={'send'} size={26} color="#6873F2" />
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          )}
        </SafeAreaInsetsContext.Consumer>
      </SafeAreaView>
    );
  }
}

export default Chat;
