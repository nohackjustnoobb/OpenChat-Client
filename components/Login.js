/* eslint-disable curly */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */

import React from 'react';
import {
  Alert,
  Text,
  View,
  KeyboardAvoidingView,
  Dimensions,
} from 'react-native';
import MMKVStorage from 'react-native-mmkv-storage';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Input, Button} from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faChevronLeft} from '@fortawesome/free-solid-svg-icons';
import LottieView from 'lottie-react-native';

// Login Page
class Login extends React.Component {
  constructor(props) {
    super(props);
    // initialize MMKVStorage
    this.MMKV = new MMKVStorage.Loader().initialize();

    this.state = {
      email: '',
      password: '',
    };

    if (!props.serverInfo && props.serverUrl) {
      props.getServerInfo();
    }
  }

  // handle login
  async login() {
    // check if password or email if empty
    if (!this.state.password || !this.state.email) {
      return Alert.alert('Please enter your email and password');
    }

    // get token from server
    try {
      var response = await fetch(this.props.serverUrl + 'token/', {
        method: 'POST',
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({
          email: this.state.email,
          password: this.state.password,
        }),
      });

      if (response.ok) {
        var jsonResult = await response.json();
        var token = jsonResult.token;
        // save token
        this.MMKV.setString('token', token);
        this.props.setState({token: token}, () =>
          // navigate to Home page
          this.props.navigation.replace('Home'),
        );
      } else {
        Alert.alert('Email or Password is incorrect');
        this.setState({password: ''});
      }
    } catch (e) {
      Alert.alert('Server Error');
    }
  }

  render() {
    return (
      <SafeAreaView
        style={{flex: 1, backgroundColor: '#F9F9F9'}}
        edges={['right', 'top', 'left']}>
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
        <KeyboardAvoidingView
          behavior={'padding'}
          keyboardVerticalOffset={-100}
          style={{
            flex: 1,
            justifyContent: 'center',
            alignSelf: 'center',
          }}>
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
          <Input
            containerStyle={{
              width: 300,
              padding: 5,
            }}
            label="Email"
            placeholder="email"
            value={this.state.email}
            leftIcon={<Icon name="email" size={21} color="#6873F2" />}
            autoCompleteType="email"
            onChangeText={v => this.setState({email: v})}
            autoCorrect={false}
          />
          <Input
            containerStyle={{
              width: 300,
              padding: 5,
            }}
            autoCompleteType="password"
            onChangeText={v => this.setState({password: v})}
            leftIcon={<Icon name="lock" size={21} color="#6873F2" />}
            value={this.state.password}
            secureTextEntry={true}
            label="Password"
            placeholder="password"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={this.login.bind(this)}
          />
          <Button
            title="Log In"
            buttonStyle={{
              marginTop: 10,
              backgroundColor: '#6873F2',
              width: 250,
              alignSelf: 'center',
            }}
            onPress={this.login.bind(this)}
          />
          <View style={{height: 85}} />
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }
}

export default Login;
