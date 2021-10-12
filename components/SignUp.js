/* eslint-disable curly */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */

import React from 'react';
import {View, Text, Dimensions, Alert} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Input, Button} from 'react-native-elements';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faChevronLeft} from '@fortawesome/free-solid-svg-icons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import LottieView from 'lottie-react-native';

class SignUp extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      email: '',
      password: '',
      username: '',
      confirmPassword: '',
    };
    this.sending = false;
  }

  async signup() {
    if (this.sending) return;

    if (
      !this.state.password ||
      !this.state.email ||
      !this.state.username ||
      !this.state.confirmPassword
    ) {
      return Alert.alert('Please enter all infomations');
    }

    if (this.state.password !== this.state.confirmPassword) {
      return Alert.alert('Password is not matched');
    }

    try {
      this.sending = true;
      var response = await fetch(this.props.serverUrl + 'user/create/', {
        method: 'POST',
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({
          email: this.state.email,
          password: this.state.password,
          username: this.state.username,
        }),
      });
      this.sending = false;
      if (response.ok) {
        this.props.navigation.goBack();
        Alert.alert('Check your email to activate your account');
      } else {
        var error = await response.json();
        Alert.alert(error.error);
        this.setState({password: ''});
      }
    } catch (e) {
      Alert.alert('Server Error');
    }
  }

  render() {
    return (
      <SafeAreaView
        edges={['right', 'top', 'left']}
        style={{flex: 1, backgroundColor: '#F9F9F9'}}>
        <LottieView
          style={{
            transform: [
              {translateY: Dimensions.get('window').height / 5.5},
              {scale: 2},
            ],
          }}
          source={require('../LottieAnimations/50949-waves.json')}
          autoPlay
          loop
        />
        <Button
          title="Back"
          type="clear"
          icon={
            <FontAwesomeIcon icon={faChevronLeft} size={20} color="#6873F2" />
          }
          titleStyle={{color: '#6873F2', paddingLeft: 5}}
          containerStyle={{alignSelf: 'flex-start'}}
          onPress={() => this.props.navigation.goBack()}
        />
        <KeyboardAwareScrollView
          contentContainerStyle={{flex: 1, justifyContent: 'center'}}>
          <View style={{justifyContent: 'center', flex: 1}}>
            <View>
              <Text
                style={{fontSize: 31, fontWeight: '600', alignSelf: 'center'}}>
                <Text style={{color: '#6873F2'}}>Open</Text>Chat
              </Text>
              <View
                style={{
                  backgroundColor: '#000000',
                  height: 2,
                  width: 100,
                  marginTop: 3,
                  alignSelf: 'center',
                  marginBottom: 25,
                }}
              />
            </View>
            <View
              style={{
                justifyContent: 'center',
                alignSelf: 'center',
              }}>
              <Input
                containerStyle={{
                  width: 300,
                  padding: 5,
                }}
                label="Username"
                placeholder="username"
                value={this.state.username}
                leftIcon={<Icon name="account" size={21} color="#6873F2" />}
                onChangeText={v => this.setState({username: v})}
                autoCorrect={false}
              />
              <Input
                containerStyle={{
                  width: 300,
                  padding: 5,
                }}
                label="Email"
                placeholder="email"
                value={this.state.email}
                leftIcon={<Icon name="email" size={21} color="#6873F2" />}
                onChangeText={v => this.setState({email: v})}
                autoCorrect={false}
              />
              <Input
                containerStyle={{
                  width: 300,
                  padding: 5,
                }}
                onChangeText={v => this.setState({password: v})}
                leftIcon={<Icon name="lock" size={21} color="#6873F2" />}
                value={this.state.password}
                secureTextEntry={true}
                label="Password"
                placeholder="password"
                autoCorrect={false}
              />
              <Input
                containerStyle={{
                  width: 300,
                  padding: 5,
                }}
                onChangeText={v => this.setState({confirmPassword: v})}
                leftIcon={<Icon name="lock" size={21} color="#6873F2" />}
                value={this.state.confirmPassword}
                secureTextEntry={true}
                label="Confirm Password"
                placeholder="confirm password"
                autoCorrect={false}
              />
            </View>
            <Button
              title="Sign Up"
              buttonStyle={{
                backgroundColor: '#6873F2',
                width: 250,
                alignSelf: 'center',
              }}
              onPress={this.signup.bind(this)}
            />
          </View>
          <View style={{height: 100}} />
        </KeyboardAwareScrollView>
      </SafeAreaView>
    );
  }
}

export default SignUp;
