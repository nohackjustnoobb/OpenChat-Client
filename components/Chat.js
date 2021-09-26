/* eslint-disable curly */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  TextInput,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Image,
} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faChevronLeft,
  faPlus,
  faPaperPlane,
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
    <>
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
    </>
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
    };
    this.messageCounter = 0;
    this.scrollHeight = [];
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
          groupInfo={() =>
            this.props.navigation.navigate('GroupInfo', {
              group: this.props.route.params.group,
            })
          }
        />
      ),
    });

    if (
      !this.props.message[group.id] ||
      this.props.message[group.id].length < 50
    ) {
      this.getGroupMessageByID(group.id, false);
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

  async getGroupMessageByID(id, undate = true) {
    this.newMessage = await this.props.getGroupMessageByID(id);
    if (undate && (this.newMessage || this.messageCounter === 0)) {
      this.messageCounter++;
    }
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
    var messagesSort = this.props.message[this.props.route.params.group]?.sort(
      (a, b) => a.id - b.id,
    );

    if (this.props.group[this.props.route.params.group].unReadMessage) {
      this.props.setReadByID(this.props.route.params.group);
      var group = this.props.group;
      group[this.props.route.params.group].unReadMessage = null;
      this.props.setState({group: group});
    }

    var messagesView = messagesSort?.map((v, i) => {
      if (!this.props.user[v.owner]) this.props.getUserByID([v.owner]);
      var userDisplay =
        i === 0
          ? 'flex'
          : v.owner === messagesSort[i - 1].owner
          ? 'none'
          : 'flex';

      var messageDate = new Date(v.sendDateTime);
      var newDate = false;

      if (i !== 0) {
        var previousMessageDate = new Date(messagesSort[i - 1].sendDateTime);
        newDate =
          messageDate.getUTCFullYear() !==
            previousMessageDate.getUTCFullYear() ||
          messageDate.getUTCMonth() !== previousMessageDate.getUTCMonth() ||
          messageDate.getUTCDate() !== previousMessageDate.getUTCDate();
      }

      const AdditionImage = withMenuContext(props => (
        <TouchableWithoutFeedback
          onPress={() => this.setState({imageView: i})}
          onLongPress={() => props.ctx.menuActions.openMenu(`${v.id}`)}>
          <Image
            source={{
              uri: this.props.serverUrl?.slice(0, -1) + v.additionImage,
            }}
            style={{
              marginBottom: 3,
              overflow: 'hidden',
              borderRadius: 3,
              width: Dimensions.get('window').width - 75,
              height: ((Dimensions.get('window').width - 75) * 10) / 16,
            }}
            resizeMode="cover"
          />
        </TouchableWithoutFeedback>
      ));

      return (
        <React.Fragment key={v.id}>
          <DropShadow
            style={{
              display: newDate ? 'flex' : 'none',
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
              style={{marginLeft: 10, display: newDate ? 'flex' : userDisplay}}>
              <Avatar
                size={35}
                uri={
                  this.props.user[v.owner]?.avatar
                    ? this.props.serverUrl?.slice(0, -1) +
                      this.props.user[v.owner].avatar
                    : undefined
                }
              />
            </View>
            <View>
              <Text
                style={{
                  fontWeight: '500',
                  marginBottom: 3,
                  display: newDate ? 'flex' : userDisplay,
                }}>
                {this.props.user[v.owner]?.username}
              </Text>
              <Menu
                name={`${v.id}`}
                renderer={renderers.Popover}
                rendererProps={{
                  preferredPlacement: 'right',
                  anchorStyle: {zIndex: 2, backgroundColor: '#ffffffee'},
                }}>
                <MenuTrigger
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
                    }}>
                    <View
                      style={{
                        padding: v.additionImage ? 5 : 7,
                        borderRadius: 7,
                        backgroundColor:
                          v.owner === this.props.userInfo.id
                            ? '#ffffff'
                            : '#6873F2',
                        marginLeft:
                          userDisplay === 'none' ? (newDate ? 0 : 55) : 0,
                        marginRight: newDate ? 70 : 15,
                        paddingBottom: 2,
                      }}>
                      {v.additionImage ? <AdditionImage /> : <View />}
                      {v.additionFile ? (
                        <View>
                          <Text style={{color: 'red'}}>I am File</Text>
                        </View>
                      ) : (
                        <View />
                      )}
                      {v.content ? (
                        <Text
                          style={{
                            color:
                              v.owner === this.props.userInfo.id
                                ? '#000000'
                                : '#ffffff',
                          }}>
                          {v.content}
                        </Text>
                      ) : (
                        <View />
                      )}
                      <Text
                        style={{
                          fontSize: 10,
                          opacity: 0.6,
                          fontWeight: '300',
                          color:
                            v.owner === this.props.userInfo.id
                              ? '#000000'
                              : '#ffffff',
                          marginTop: 3,
                        }}>
                        {messageDate.toLocaleString('en-US', {
                          hour: 'numeric',
                          minute: 'numeric',
                          hour12: true,
                        })}
                      </Text>
                    </View>
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
                      backgroundColor: '#ffffffee',
                    },
                    optionWrapper: {padding: 0},
                    OptionTouchableComponent: TouchableOpacity,
                  }}>
                  <MenuOption>
                    <MenuItem title="Pin" icon={faThumbtack} />
                  </MenuOption>
                  <MenuOption>
                    <MenuItem title="Reply" icon={faReply} />
                  </MenuOption>
                  <MenuOption>
                    <MenuItem title="Copy" icon={faCopy} />
                  </MenuOption>
                  <MenuOption>
                    <MenuItem title="Info" icon={faInfo} />
                  </MenuOption>
                  <MenuOption>
                    <MenuItem
                      title="Delete"
                      icon={faTrash}
                      color="#ff6666"
                      underline={false}
                    />
                  </MenuOption>
                </MenuOptions>
              </Menu>
            </View>
          </View>
        </React.Fragment>
      );
    });

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
                            paddingLeft: 10,
                            marginTop: 10,
                          }}
                          placeholder="Message With Image"
                          placeholderTextColor="#aaaaaa"
                          onChangeText={v => this.setState({imageContent: v})}
                          value={this.state.imageContent}
                        />
                        <TouchableOpacity
                          style={{marginLeft: 10, transform: [{translateY: 3}]}}
                          onPress={() => {
                            var imageContent = this.state.imageContent;
                            var image = this.state.imagePreview;
                            this.setState({
                              imageContent: '',
                              imagePreview: null,
                              confirm: false,
                            });
                            this.props.sendMessage(
                              this.props.route.params.group,
                              imageContent,
                              image,
                            );
                          }}>
                          <FontAwesomeIcon
                            icon={faPaperPlane}
                            size={20}
                            color="#6873F2"
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </KeyboardAvoidingView>
                </View>
              </Modal>
              <ScrollView
                ref={ref => {
                  this.messageScrollView = ref;
                }}
                style={{
                  backgroundColor: '#F9F9F9',
                }}
                scrollEventThrottle={1600}
                onScroll={async e => {
                  if (e.nativeEvent.contentOffset.y <= 0) {
                    if (!this.getMessage) {
                      this.getMessage = true;
                      await this.getGroupMessageByID(
                        this.props.route.params.group,
                      );
                    }
                    setTimeout(() => (this.getMessage = false), 1000);
                  }
                }}
                contentContainerStyle={{paddingVertical: 5}}
                onContentSizeChange={(w, h) => {
                  if (this.messageCounter === 0) {
                    this.messageScrollView.scrollToEnd({animated: false});
                  } else if (this.newMessage) {
                    this.messageScrollView.scrollTo({
                      y: h - this.scrollHeight[this.scrollHeight.length - 1],
                      animated: false,
                    });
                  }
                  this.scrollHeight[this.messageCounter] = h;
                }}>
                {messagesView}
              </ScrollView>
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
                <ModalSelector
                  data={additionselectorData}
                  animationType={'fade'}
                  backdropPressToClose={true}
                  overlayStyle={{
                    justifyContent: 'flex-end',
                    paddingBottom: insets.bottom + 30,
                  }}
                  cancelTextStyle={{color: '#ff0000'}}
                  onModalClose={i => (i.onPress ? i.onPress() : undefined)}>
                  <FontAwesomeIcon icon={faPlus} size={25} color="#6873F2" />
                </ModalSelector>
                <TextInput
                  style={{
                    width: Dimensions.get('window').width * 0.7,
                    minHeight: 35,
                    backgroundColor: '#eeeeee',
                    borderRadius: 10,
                    padding: 10,
                  }}
                  placeholder="New Message"
                  placeholderTextColor="#aaaaaa"
                  onChangeText={v => this.setState({content: v})}
                  value={this.state.content}
                  onFocus={() =>
                    setTimeout(
                      () =>
                        this.messageScrollView.scrollToEnd({
                          animated: true,
                        }),
                      50,
                    )
                  }
                />
                <TouchableOpacity
                  onPress={() => {
                    this.props.sendMessage(
                      this.props.route.params.group,
                      this.state.content,
                    );
                    this.setState({content: ''});
                  }}>
                  <FontAwesomeIcon
                    icon={faPaperPlane}
                    size={25}
                    color="#6873F2"
                  />
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          )}
        </SafeAreaInsetsContext.Consumer>
      </SafeAreaView>
    );
  }
}

export default Chat;
