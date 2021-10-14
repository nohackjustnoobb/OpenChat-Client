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
import Swipeable from 'react-native-gesture-handler/Swipeable';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

import {Avatar, datetimeToString, fixHermesTime, shareImage} from '../App';

function ChatHeaderLeft(props) {
  return (
    <View style={{flexDirection: 'row', alignItems: 'center'}}>
      <TouchableOpacity onPress={props.goBack}>
        <FontAwesomeIcon
          icon={faChevronLeft}
          size={21}
          style={{marginRight: 5, marginLeft: 10}}
          color={props.themeColor}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={{flexDirection: 'row', alignItems: 'center'}}
        onPress={props.groupInfo}>
        <Avatar
          size={35}
          uri={
            props.avatar
              ? props.serverUrl?.slice(0, -1) + props.avatar
              : undefined
          }
          isGroup={!props.isDM}
        />
        <View style={{maxWidth: '80%'}}>
          <Text style={{fontWeight: '600', fontSize: 13}}>
            {props.groupName}
          </Text>
          <Text
            numberOfLines={1}
            style={{
              color: '#888888',
              width: '100%',
              fontSize: 11,
              display: !props.last_login && props.isDM ? 'none' : 'flex',
            }}>
            {props.isDM
              ? props.isOnline
                ? 'Online'
                : `last seen at ${datetimeToString(props.last_login)}`
              : props.groupMembers}
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
            color: props.color === undefined ? props.themeColor : props.color,
            fontWeight: '300',
          }}>
          {props.title}
        </Text>
        <Icon
          size={21}
          name={props.icon}
          color={props.color === undefined ? props.themeColor : props.color}
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

function datesEqual(a, b) {
  return !(a > b || b > a);
}

function withActions(component, options) {
  return (
    <Menu
      name={`${options.id}`}
      renderer={renderers.Popover}
      onOpen={() => ReactNativeHapticFeedback.trigger('impactMedium')}
      rendererProps={{
        preferredPlacement: 'right',
        anchorStyle: {
          zIndex: 2,
        },
      }}>
      <MenuTrigger
        triggerOnLongPress
        customStyles={{
          TriggerTouchableComponent: TouchableWithoutFeedback,
        }}>
        <Swipeable
          friction={3}
          containerStyle={{overflow: 'visible'}}
          onSwipeableLeftWillOpen={() => {
            ReactNativeHapticFeedback.trigger('impactMedium');
            options.reply();
          }}
          renderLeftActions={() => <View style={{width: 0.5}} />}>
          {component}
        </Swipeable>
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
            marginLeft: options.display,
          },
          optionWrapper: {padding: 0},
          OptionTouchableComponent: TouchableOpacity,
        }}>
        <MenuOption onSelect={options.pin}>
          <MenuItem
            themeColor={options.themeColor}
            title={options.pinned ? 'Unpin' : 'Pin'}
            icon={options.pinned ? 'pin-off-outline' : 'pin-outline'}
            isDisable={options.pinIsDisable}
          />
        </MenuOption>
        <MenuOption onSelect={options.reply}>
          <MenuItem
            title="Reply"
            icon="reply-outline"
            themeColor={options.themeColor}
          />
        </MenuOption>
        <MenuOption onSelect={() => Clipboard.setString(options.content)}>
          <MenuItem
            title="Copy"
            icon="content-copy"
            underline={!options.ownMessage}
            themeColor={options.themeColor}
          />
        </MenuOption>
        <MenuOption onSelect={options.messageInfo}>
          <MenuItem
            title="Info"
            icon="information-outline"
            themeColor={options.themeColor}
            isDisable={options.ownMessage}
          />
        </MenuOption>
        <MenuOption onSelect={options.deleteMessage}>
          <MenuItem
            title="Delete"
            icon="delete-outline"
            color="#ff6666"
            underline={false}
            themeColor={options.themeColor}
            isDisable={options.ownMessage}
          />
        </MenuOption>
      </MenuOptions>
    </Menu>
  );
}

const Message = React.memo(
  function Message({
    item,
    displayUser,
    previousMessageDate,
    onPressImageView,
    serverUrl,
    avatar,
    username,
    reply,
    ownID,
    replyToUsername,
    pin,
    messageInfo,
    deleteMessage,
    pinIsDisable,
    themeColor,
  }) {
    // handle message date
    var messageDate = new Date(item.sendDateTime);
    var displayDate =
      messageDate.getUTCFullYear() !== previousMessageDate.getUTCFullYear() ||
      messageDate.getUTCMonth() !== previousMessageDate.getUTCMonth() ||
      messageDate.getUTCDate() !== previousMessageDate.getUTCDate();

    // handle message with image
    const AdditionImage = withMenuContext(props => (
      <TouchableWithoutFeedback
        onPress={onPressImageView}
        onLongPress={() => props.ctx.menuActions.openMenu(`${item.id}`)}>
        <FastImage
          source={{
            uri: serverUrl?.slice(0, -1) + item.additionImage,
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

    const message = (
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
            backgroundColor: item.owner === ownID ? themeColor : '#ffffff',
            marginLeft: displayUser || displayDate ? 0 : 55,
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
                color={item.owner === ownID ? '#ffffff' : '#000000'}
              />
              <Text
                style={{
                  color: item.owner === ownID ? '#ffffff' : '#000000',
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
                    item.owner !== ownID ? '#00000010' : '#00000025',
                  borderRadius: 5,
                  overflow: 'hidden',
                }}>
                <View
                  style={{
                    backgroundColor:
                      item.owner !== ownID ? themeColor : '#ffffff',
                    width: 5,
                  }}
                />
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    flexGrow: 1,
                  }}>
                  <View
                    style={{
                      marginHorizontal: 10,
                      marginVertical: 7,
                    }}>
                    <Text
                      style={{
                        color: item.owner !== ownID ? themeColor : '#ffffff',
                        fontWeight: '500',
                      }}>
                      {replyToUsername}
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        opacity:
                          !item.replyTo?.content && item.replyTo?.additionImage
                            ? 0.6
                            : 1,
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
                        color={item.owner !== ownID ? '#000000' : '#ffffff'}
                      />
                      <Text
                        style={{
                          color: item.owner !== ownID ? '#000000' : '#ffffff',
                          maxWidth: Dimensions.get('window').width - 154,
                        }}>
                        {!item.replyTo?.content && item.replyTo?.additionImage
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
                      display: item.replyTo?.additionImage ? 'flex' : 'none',
                      marginHorizontal: 5,
                    }}
                    source={{
                      uri:
                        serverUrl?.slice(0, -1) + item.replyTo?.additionImage,
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
                  color: item.owner === ownID ? '#ffffff' : '#000000',
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
              color: item.owner === ownID ? '#ffffff' : '#000000',
              marginTop: 3,
            }}>
            {fixHermesTime(messageDate)}
          </Text>
        </View>
      </DropShadow>
    );

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
              backgroundColor: themeColor,
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
              display: displayUser || displayDate ? 'flex' : 'none',
            }}>
            <Avatar
              size={35}
              uri={avatar ? serverUrl?.slice(0, -1) + avatar : undefined}
            />
          </View>
          <View>
            <Text
              style={{
                fontWeight: '500',
                marginBottom: 3,
                display: displayUser || displayDate ? 'flex' : 'none',
              }}>
              {username}
            </Text>
            {item.deleted
              ? message
              : withActions(message, {
                  id: item.id,
                  reply: reply,
                  display: displayDate || displayUser ? 0 : undefined,
                  pin: pin,
                  pinned: item.pinned,
                  pinIsDisable: pinIsDisable,
                  ownMessage: item.owner !== ownID,
                  content: item.content,
                  messageInfo: messageInfo,
                  deleteMessage: deleteMessage,
                  themeColor: themeColor,
                })}
          </View>
        </View>
      </View>
    );
  },
  (prevProps, nextProps) => {
    var isChange = false;
    for (const [key, value] of Object.entries(prevProps)) {
      if (typeof value === 'function') continue;

      if (value !== nextProps[key]) {
        var date = new Date(value);
        if (
          !isNaN(date.getTime()) &&
          datesEqual(date, new Date(nextProps[key]))
        ) {
          continue;
        } else {
          isChange = true;
          break;
        }
      }
    }

    return !isChange;
  },
);

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
      toBottom: false,
    };

    this.themeColor = props.themeColor;
    this.lastMessage = false;
  }

  componentDidMount() {
    this.group = this.props.group[this.props.route.params.group];
    this.groupName = this.group.groupName;
    this.avatar = this.group.avatar;

    if (this.group.isDM) {
      this.userID = this.group.members.filter(
        v => v !== this.props.userInfo.id,
      )[0];
      this.groupName = this.props.user[this.userID].username;
      this.avatar = this.props.user[this.userID].avatar;
    }

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

    if (this.userID) {
      this.props.toggleTrackByID(this.userID, false);
    }
  }

  componentWillUnmount() {
    this.keyboardDidShowSubscription.remove();
    this.keyboardDidHideSubscription.remove();

    if (this.userID) {
      this.props.toggleTrackByID(this.userID, true);
    }
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
    // update headers
    this.props.navigation.setOptions({
      headerLeft: () => (
        <ChatHeaderLeft
          groupName={this.groupName}
          themeColor={this.themeColor}
          avatar={this.avatar}
          isDM={this.group.isDM}
          serverUrl={this.props.serverUrl}
          goBack={() => this.props.navigation.goBack()}
          groupInfo={() =>
            this.props.navigation.navigate('GroupInfo', {
              group: this.group.id,
            })
          }
          {...(this.group.isDM
            ? {
                isOnline: this.props.user[this.userID]?.isOnline,
                last_login: this.props.user[this.userID]?.last_login,
              }
            : {
                groupMembers: this.group.members
                  .reduce((p, c) => `${p}, ${this.props.user[c]?.username}`, '')
                  .slice(2),
              })}
        />
      ),
      headerRight: () => (
        <TouchableOpacity
          style={{marginRight: 10}}
          onPress={() =>
            this.props.navigation.navigate('PinnedMessages', {
              group: this.group.id,
            })
          }>
          <FontAwesomeIcon
            icon={faThumbtack}
            color={this.themeColor}
            size={21}
          />
        </TouchableOpacity>
      ),
    });

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
            <FontAwesomeIcon
              icon={faCamera}
              size={21}
              color={this.themeColor}
            />
            <Text
              style={{marginLeft: 10, fontSize: 16, color: this.themeColor}}>
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
            <FontAwesomeIcon icon={faImage} size={21} color={this.themeColor} />
            <Text
              style={{marginLeft: 10, fontSize: 16, color: this.themeColor}}>
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
              keyboardVerticalOffset={
                insets.bottom + (this.state.reply ? 70 : 55)
              }
              enabled={!this.state.imageView && !this.state.imagePreview}>
              <ImageView
                animationType="fade"
                onLongPress={shareImage}
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
                                  color: this.themeColor,
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
                          <Icon
                            name={'send'}
                            size={22}
                            color={this.themeColor}
                          />
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
                onScroll={e => {
                  if (
                    e.nativeEvent.contentOffset.y >= 1000 &&
                    !this.state.toBottom
                  ) {
                    this.setState({toBottom: true});
                  } else if (
                    e.nativeEvent.contentOffset.y < 1000 &&
                    this.state.toBottom
                  ) {
                    this.setState({toBottom: false});
                  }
                }}
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

                  var previousMessage = messagesSort[index + 1];
                  var owner = this.props.user[item.owner];
                  var ownID = this.props.userInfo.id;

                  return (
                    <Message
                      item={item}
                      themeColor={this.themeColor}
                      displayUser={
                        index === messagesSort.lenghth - 1 ||
                        item.owner !== previousMessage?.owner
                      }
                      previousMessageDate={
                        new Date(previousMessage?.sendDateTime)
                      }
                      onPressImageView={() => this.setState({imageView: index})}
                      serverUrl={this.props.serverUrl}
                      avatar={owner?.avatar}
                      username={owner?.username}
                      ownID={ownID}
                      replyToUsername={
                        this.props.user[item.replyTo?.owner]?.username
                      }
                      reply={() => this.setState({reply: item.id})}
                      pin={() =>
                        this.props.togglePinByID(this.group.id, item.id)
                      }
                      messageInfo={() =>
                        this.props.navigation.navigate('MessageInfo', {
                          group: this.group.id,
                          message: item.id,
                        })
                      }
                      deleteMessage={() =>
                        this.props.deleteMessageByID(this.group.id, item.id)
                      }
                      pinIsDisable={
                        !this.group.isDM &&
                        Boolean(
                          this.group.groupAdmins.find(id => id !== ownID) ===
                            undefined && this.group.owner !== ownID,
                        )
                      }
                    />
                  );
                }}
              />
              <TouchableWithoutFeedback
                onPress={() => this.messagesFlatList.scrollToIndex({index: 0})}>
                <View
                  style={{
                    position: 'absolute',
                    bottom: insets.bottom + 70,
                    right: 13,
                    display: this.state.toBottom ? 'flex' : 'none',
                    borderRadius: 10,
                    padding: 3,
                    overflow: 'hidden',
                    backgroundColor: '#ffffff',
                    borderColor: this.themeColor,
                    borderWidth: 0.5,
                  }}>
                  <Icon
                    name="arrow-down-circle-outline"
                    size={30}
                    color={this.themeColor}
                  />
                </View>
              </TouchableWithoutFeedback>
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
                        backgroundColor: this.themeColor,
                        width: 5,
                      }}
                    />
                    <View
                      style={{
                        marginHorizontal: 10,
                        marginVertical: 7,
                      }}>
                      <Text style={{color: this.themeColor, fontWeight: '500'}}>
                        {this.props.user[replyMessage?.owner]?.username}
                      </Text>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          opacity:
                            !replyMessage?.content &&
                            replyMessage?.additionImage
                              ? 0.6
                              : 1,
                        }}>
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
                      color={this.themeColor}
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
                    <Icon name={'plus'} size={26} color={this.themeColor} />
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
                    <Icon name={'send'} size={26} color={this.themeColor} />
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
