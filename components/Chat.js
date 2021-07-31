/* eslint-disable curly */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image,
  ScrollView,
  TextInput,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  LogBox,
} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faChevronLeft,
  faUser,
  faUsers,
  faPlus,
  faPaperPlane,
  faCamera,
  faImage,
} from '@fortawesome/free-solid-svg-icons';
import {SafeAreaView} from 'react-native-safe-area-context';
import {SafeAreaInsetsContext} from 'react-native-safe-area-context';
import DropShadow from 'react-native-drop-shadow';
import FitImage from 'react-native-fit-image';
import ImageView from 'react-native-image-view';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import ModalSelector from 'react-native-modal-selector';

// disable warning from react-native-image-view
LogBox.ignoreAllLogs();

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

      <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}}>
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
            marginLeft: 15,
          }}>
          {props.avatar ? (
            <Image
              source={{
                uri: props.serverUrl?.slice(0, -1) + props.avatar,
              }}
              style={{height: 35, width: 35}}
            />
          ) : (
            <FontAwesomeIcon
              icon={props.isDM ? faUser : faUsers}
              color="#ffffff"
              size={18}
            />
          )}
        </View>
        <View>
          <Text style={{fontWeight: '600', fontSize: 13}}>
            {props.groupName}
          </Text>
        </View>
      </TouchableOpacity>
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
      messageScrollView: null,
      imageSelector: false,
      keyboardHeight: 0,
    };
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
        />
      ),
    });

    if (
      !this.props.message[group.id] ||
      this.props.message[group.id].length < 50
    ) {
      this.props.getGroupMessageByID(group.id);
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

    var messagesView = messagesSort?.map((v, i) => {
      if (!this.props.user[v.owner]) this.getUserByID([v.owner]);
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
              style={{
                backgroundColor: '#CCCCCC',
                height: 35,
                width: 35,
                borderRadius: 17.5,
                justifyContent: 'center',
                alignItems: 'center',
                margin: 10,
                marginTop: 2,
                overflow: 'hidden',
                display: newDate ? 'flex' : userDisplay,
              }}>
              {this.props.user[v.owner].avatar ? (
                <Image
                  source={{
                    uri:
                      this.props.serverUrl?.slice(0, -1) +
                      this.props.user[v.owner].avatar,
                  }}
                  style={{height: 35, width: 35}}
                />
              ) : (
                <FontAwesomeIcon icon={faUser} color="#ffffff" size={15} />
              )}
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
                    marginLeft: userDisplay === 'none' ? (newDate ? 0 : 55) : 0,
                    marginRight: newDate ? 70 : 15,
                    width: v.additionImage
                      ? Dimensions.get('window').width - 75
                      : undefined,
                    paddingBottom: 2,
                  }}>
                  {v.additionImage ? (
                    <React.Fragment>
                      <TouchableWithoutFeedback
                        onPress={() => this.setState({imageView: i})}>
                        <FitImage
                          source={{
                            uri:
                              this.props.serverUrl?.slice(0, -1) +
                              v.additionImage,
                          }}
                          style={{
                            marginBottom: 3,
                            overflow: 'hidden',
                            borderRadius: 3,
                          }}
                          resizeMode="contain"
                        />
                      </TouchableWithoutFeedback>
                    </React.Fragment>
                  ) : (
                    <View />
                  )}
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
                    source: {
                      uri: this.state.imageView
                        ? this.props.serverUrl?.slice(0, -1) +
                          messagesSort[this.state.imageView]?.additionImage
                        : this.state.imagePreview?.uri,
                    },
                  },
                ]}
                isVisible={Boolean(
                  this.state.imageView || this.state.imagePreview,
                )}
                imageIndex={0}
                isSwipeCloseEnabled={Boolean(this.state.imageView)}
                onClose={() =>
                  this.setState({imageView: '', imagePreview: null})
                }
                renderFooter={() =>
                  this.state.imagePreview ? (
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        alignSelf: 'center',
                        marginBottom: this.state.keyboardHeight
                          ? this.state.keyboardHeight + 10
                          : insets.bottom,
                      }}>
                      <TextInput
                        style={{
                          width: Dimensions.get('window').width * 0.75,
                          height: 35,
                          backgroundColor: '#eeeeee',
                          borderRadius: 10,
                          padding: 10,
                        }}
                        placeholder="Message With Image"
                        placeholderTextColor="#aaaaaa"
                        onChangeText={v => this.setState({imageContent: v})}
                        value={this.state.imageContent}
                      />
                      <TouchableOpacity
                        style={{marginLeft: 10}}
                        onPress={() => {
                          var imageContent = this.state.imageContent;
                          var image = this.state.imagePreview;
                          this.setState({
                            imageContent: '',
                            imagePreview: null,
                          });
                          this.props.sendMessage(
                            this.props.route.params.group,
                            imageContent,
                            image,
                          );
                        }}>
                        <FontAwesomeIcon
                          icon={faPaperPlane}
                          size={25}
                          color="#ffffff"
                        />
                      </TouchableOpacity>
                    </View>
                  ) : undefined
                }
              />
              <ScrollView
                ref={ref => {
                  this.setState({messageScrollView: ref});
                }}
                style={{
                  backgroundColor: '#F9F9F9',
                }}
                contentContainerStyle={{paddingVertical: 5}}
                onContentSizeChange={() =>
                  this.state.messageScrollView.scrollToEnd({animated: false})
                }>
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
                        this.state.messageScrollView.scrollToEnd({
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
