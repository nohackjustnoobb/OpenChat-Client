/* eslint-disable curly */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */

import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  ScrollView,
  Image,
  Modal,
  Alert,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
  TextInput,
} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {Button, CheckBox} from 'react-native-elements';
import {
  faChevronLeft,
  faUsers,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';
import FitImage from 'react-native-fit-image';
import {launchImageLibrary} from 'react-native-image-picker';
import ModalSelector from 'react-native-modal-selector';
import {
  SafeAreaView,
  SafeAreaInsetsContext,
} from 'react-native-safe-area-context';
import ImageView from 'react-native-image-viewing';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

import {Avatar} from '../App';

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
      avatar: avatar ? props.serverUrl?.slice(0, -1) + avatar : null,
      newAvatar: null,
      addUsers: false,
      selectedUser: [],
      imageView: false,
      edit: false,
      confirm: false,
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
      headerRight: undefined,
    });
  }

  ExitGroup() {
    this.props.navigation.pop(2);
    if (this.group.isDM) return this.props.toggleUserBlock(this.userID);
    return this.group.owner === this.props.userInfo.id
      ? this.props.deleteGroupByID(this.group.id)
      : this.props.exitGroupByID(this.group.id);
  }

  chooseAvatar() {
    launchImageLibrary({mediaType: 'photo'}, response => {
      if (!response.didCancel)
        this.setState({newAvatar: response.assets[0], imageView: false});
    });
  }

  updateHeader() {
    function Header(props) {
      return (
        <TouchableOpacity onPress={props.onPress}>
          <Text
            style={{
              color: props.titleColor,
              fontSize: 18,
              marginHorizontal: 15,
            }}>
            {props.title}
          </Text>
        </TouchableOpacity>
      );
    }

    this.props.navigation.setOptions({
      headerLeft: props => (
        <Header
          {...props}
          title="Cancel"
          titleColor="#ff0000"
          onPress={() => {
            Keyboard.dismiss();
            this.componentDidMount();
            this.setState({
              newAvatar: null,
              groupName: this.group.groupName,
              confirm: false,
              edit: false,
              imageView: false,
            });
          }}
        />
      ),
      headerRight: props => (
        <Header
          {...props}
          title="Done"
          titleColor="#6873F2"
          onPress={async () => {
            var groupInfo = await this.props.patchGroupInfo(
              this.group.id,
              this.state.groupName,
              this.state.newAvatar,
            );
            if (groupInfo) {
              this.setState({
                newAvatar: null,
                groupName: groupInfo?.groupName,
                avatar: this.props.serverUrl?.slice(0, -1) + groupInfo?.avatar,
                edit: false,
                imageView: false,
                confirm: false,
              });
            }
            Keyboard.dismiss();
            this.componentDidMount();
          }}
        />
      ),
    });
  }

  render() {
    if (this.state.edit) this.updateHeader();
    this.group = this.props.group[this.props.route.params.group];

    var membersList = this.group.members.map((v, i) => {
      if (!this.props.user[v]) return this.props.getUserByID([v]);
      var selectorData = [
        {
          key: 1,
          label: 'kick',
          component: (
            <Text
              style={{
                textAlign: 'center',
                color: '#ff0000',
                fontWeight: '500',
                fontSize: 16,
              }}>{`Kick ${this.props.user[v].username}`}</Text>
          ),
          onPress: () => this.props.kickUser(this.group.id, v),
        },
      ];
      if (this.group.owner === this.props.userInfo.id) {
        selectorData.unshift({
          key: 0,
          label: `${
            this.group.groupAdmins.find(id => id === v) ? 'Dismiss' : 'Admit'
          } As Admins`,
          onPress: () => this.props.toggleAdmin(this.group.id, v),
        });
      }

      return (
        <SafeAreaInsetsContext.Consumer>
          {insets => (
            <ModalSelector
              disabled={
                this.group.groupAdmins.find(
                  id => id !== this.props.userInfo.id,
                ) ||
                this.group.owner !== this.props.userInfo.id ||
                v === this.props.userInfo.id
              }
              data={selectorData}
              animationType={'fade'}
              backdropPressToClose={true}
              overlayStyle={{
                justifyContent: 'flex-end',
                paddingBottom: insets.bottom + 30,
              }}
              cancelTextStyle={{color: '#ff0000'}}
              onModalClose={_ => (_.onPress ? _.onPress() : undefined)}
              key={this.props.user[v].id}>
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
                  style={{position: 'absolute', right: 10, color: '#888888'}}>
                  {this.group.owner === v
                    ? 'Owner'
                    : this.group.groupAdmins.find(id => id === v)
                    ? 'Admin'
                    : ''}
                </Text>
              </View>
              {!(
                this.group.groupAdmins.find(
                  id => id === this.props.userInfo.id,
                ) || this.group.owner === this.props.userInfo.id
              ) && i === this.group.members.length - 1 ? (
                <></>
              ) : (
                <View
                  style={{
                    backgroundColor: '#eeeeee',
                    height: 1,
                    width: '100%',
                    alignSelf: 'center',
                  }}
                />
              )}
            </ModalSelector>
          )}
        </SafeAreaInsetsContext.Consumer>
      );
    });

    if (
      this.group.groupAdmins.find(id => id === this.props.userInfo.id) ||
      this.group.owner === this.props.userInfo.id
    ) {
      membersList.push(
        <TouchableOpacity
          style={{
            marginVertical: 10,
            marginHorizontal: 10,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={() => this.setState({addUsers: true})}>
          <FontAwesomeIcon icon={faPlus} color="#6873F2" size={22} />
          <Text
            style={{
              color: '#6873F2',
              fontWeight: '600',
              fontSize: 16,
              marginLeft: 5,
            }}>
            Add Participants
          </Text>
        </TouchableOpacity>,
      );
    }

    return (
      <KeyboardAwareScrollView
        style={{backgroundColor: '#F9F9F9'}}
        extraScrollHeight={10}>
        <ImageView
          images={[
            {
              uri: this.state.newAvatar
                ? this.state.newAvatar.uri
                : this.state.avatar,
            },
          ]}
          imageIndex={0}
          backgroundColor="#ffffff"
          visible={
            (this.state.imageView || this.state.newAvatar) &&
            !this.state.confirm
          }
          onRequestClose={() =>
            this.setState({imageView: false, newAvatar: null})
          }
          {...((!this.group.isDM &&
            this.group.groupAdmins.find(e => e === this.props.userInfo.id)) ||
          this.group.owner === this.props.userInfo.id
            ? {
                HeaderComponent: () => (
                  <SafeAreaView
                    style={{
                      flexDirection: this.state.newAvatar
                        ? 'row-reverse'
                        : 'row',
                      justifyContent: 'space-between',
                    }}>
                    <TouchableOpacity
                      onPress={() => {
                        if (this.state.newAvatar) {
                          this.setState({
                            confirm: true,
                            edit: true,
                            imageView: false,
                          });
                        } else {
                          this.chooseAvatar();
                        }
                      }}>
                      <Text
                        style={{
                          color: '#6873F2',
                          fontSize: 18,
                          marginHorizontal: 20,
                          marginVertical: 5,
                        }}>
                        {this.state.newAvatar ? 'Confirm' : 'Edit'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() =>
                        this.setState({imageView: false, newAvatar: null})
                      }>
                      <Text
                        style={{
                          color: '#ff0000',
                          fontSize: 18,
                          marginHorizontal: 20,
                          marginVertical: 5,
                        }}>
                        {this.state.newAvatar ? 'Cancel' : 'Close'}
                      </Text>
                    </TouchableOpacity>
                  </SafeAreaView>
                ),
              }
            : {})}
        />
        <Modal
          visible={this.state.addUsers}
          presentationStyle="formSheet"
          animationType="slide">
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#ffffff',
            }}>
            <Button
              title="Cancel"
              type="clear"
              containerStyle={{marginLeft: 15, marginTop: 10}}
              titleStyle={{color: '#ff0000'}}
              onPress={() =>
                this.setState({
                  modal: false,
                  newGroupName: this.state.groupName,
                  newAvatar: null,
                  addUsers: false,
                  selectedUser: [],
                })
              }
            />
            <View style={{alignItems: 'center'}}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                }}>
                {'Add Participants'}
              </Text>
            </View>
            <Button
              title={'Done'}
              type="clear"
              containerStyle={{marginRight: 15, marginTop: 10}}
              titleStyle={{color: '#6873F2'}}
              onPress={() => {
                this.props.addUsers(this.group.id, this.state.selectedUser);
                this.setState({addUsers: false, selectedUser: []});
              }}
            />
          </View>

          <ScrollView
            style={{
              flex: 1,
              padding: 10,
            }}>
            {this.props.friends.filter(
              v => !this.group.members.find(e => e === v),
            ).length ? (
              this.props.friends
                .filter(v => !this.group.members.find(e => e === v))
                .map(v => (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 5,
                    }}
                    key={v.id}>
                    <Avatar
                      size={35}
                      uri={
                        this.props.user[v]?.avatar
                          ? this.props.serverUrl?.slice(0, -1) +
                            this.props.user[v].avatar
                          : undefined
                      }
                    />
                    <View
                      style={{
                        justifyContent: 'center',
                        alignContent: 'center',
                      }}>
                      <Text>{this.props.user[v]?.username}</Text>
                      <Text style={{color: '#888888', fontSize: 11}}>
                        {this.props.user[v]?.email}
                      </Text>
                    </View>
                    <CheckBox
                      checkedIcon="dot-circle-o"
                      uncheckedIcon="circle-o"
                      checkedColor="#6873F2"
                      containerStyle={{
                        position: 'absolute',
                        right: -5,
                      }}
                      checked={Boolean(
                        this.state.selectedUser.find(e => e === v),
                      )}
                      onPress={() => {
                        var selectedUser = this.state.selectedUser;
                        if (this.state.selectedUser.find(e => e === v)) {
                          selectedUser.pop(v);
                        } else {
                          selectedUser.push(v);
                        }
                        this.setState({selectedUser: selectedUser});
                      }}
                    />
                  </View>
                ))
            ) : (
              <Text
                style={{
                  alignSelf: 'center',
                  color: '#888888',
                  fontSize: 14,
                }}>
                No Result
              </Text>
            )}
          </ScrollView>
        </Modal>
        <TouchableWithoutFeedback
          onPress={() => {
            if (this.state.avatar) {
              this.setState({imageView: true});
            } else if (
              this.group.groupAdmins.find(e => e === this.props.userInfo.id) ||
              this.group.owner === this.props.userInfo.id
            ) {
              this.chooseAvatar();
            }
          }}>
          {this.state.avatar || this.state.newAvatar ? (
            this.state.confirm ? (
              <Image
                source={{uri: this.state.newAvatar?.uri}}
                style={{
                  width: '100%',
                  height:
                    this.state.newAvatar.height *
                    (Dimensions.get('screen').width /
                      this.state.newAvatar.width),
                }}
              />
            ) : (
              <FitImage
                source={{
                  uri: this.state.avatar,
                }}
                resizeMode="contain"
              />
            )
          ) : (
            <View
              style={{
                width: Dimensions.get('screen').width,
                height: Dimensions.get('screen').width,
                backgroundColor: '#CCCCCC',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <FontAwesomeIcon
                icon={faUsers}
                size={Dimensions.get('screen').width / 2}
                color="#ffffff"
              />
            </View>
          )}
        </TouchableWithoutFeedback>
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
              flexDirection: this.group.isDM ? 'column' : 'row',
            }}>
            <TextInput
              value={this.state.groupName}
              onChangeText={v =>
                this.setState({
                  edit: true,
                  groupName: v.length <= 50 ? v : this.state.groupName,
                })
              }
              style={{flex: 1}}
              editable={
                !this.group.isDM &&
                (this.group.groupAdmins.find(
                  e => e === this.props.userInfo.id,
                ) ||
                  this.group.owner === this.props.userInfo.id)
              }
            />
            {this.group.isDM && this.props.user[this.userID].email ? (
              <Text style={{color: '#888888', fontSize: 11}}>
                {this.props.user[this.userID].email}
              </Text>
            ) : this.state.groupName !== this.group.groupName ? (
              <Text style={{color: '#888888', fontSize: 16}}>
                {50 - this.state.groupName.length}
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
          onPress={() =>
            Alert.alert(
              `${
                this.group.isDM
                  ? `${
                      this.props.blocked.find(v => v === this.userID)
                        ? 'Unblock'
                        : 'Block'
                    } ${this.props.user[this.userID].username}`
                  : this.group.owner === this.props.userInfo.id
                  ? 'Delete Group'
                  : 'Exit Group'
              } ?`,
              undefined,
              [
                {text: 'Cancel', style: 'cancel'},
                {
                  text: 'Yes',
                  style: 'destructive',
                  onPress: () => this.ExitGroup(),
                },
              ],
            )
          }
        />
      </KeyboardAwareScrollView>
    );
  }
}

export default GroupInfo;
