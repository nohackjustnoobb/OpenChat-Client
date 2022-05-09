import 'dart:async';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import 'package:web_socket_channel/web_socket_channel.dart';

class OpenChat extends ChangeNotifier {
  String? serverIP;
  Map? serverInfo;
  String? token;
  WebSocketChannel? channel;

  bool get isServerConnected => serverIP != null;
  bool get isLoggedIn => token != null;
  bool get isWebSocketConnected => channel != null;

  void connectWebSocketChannel() {
    if (serverIP == null || token == null) return;

    Uri uri = Uri.parse(serverIP!);

    channel = WebSocketChannel.connect(
        uri.replace(scheme: uri.scheme.replaceAll('http', 'ws')));

    channel!.sink.add(jsonEncode({"Authorization": 'token $token'}));

    channel!.stream.listen((rawData) {
      Map<String, Function> dataHandler = {
        'me': (data) => print(data),
        'group': (data) => print(data),
        'relationship': (data) => print(data)
      };

      Map jsonData = jsonDecode(rawData);

      for (String i in jsonData.keys
          .where((element) => dataHandler.keys.contains(element))) {
        dataHandler[i]!(jsonData[i]);
      }
    },
        onDone: () =>
            Timer(const Duration(seconds: 3), () => connectWebSocketChannel()),
        onError: (_) {});
  }

  Future<void> readFromStorage() async {
    WidgetsFlutterBinding.ensureInitialized();
    SharedPreferences prefs = await SharedPreferences.getInstance();

    serverIP = prefs.getString('serverIP');
    token = prefs.getString('token');
  }

  Future<bool> logInWithEmailAndPassword(String email, String password) async {
    if (!isServerConnected) throw ServerErrorException();

    try {
      Uri uri = Uri.parse(serverIP!);

      final response = await http.post(
          Uri(
              scheme: uri.scheme,
              host: uri.host,
              port: uri.port,
              path: 'token/'),
          body: {'email': email, 'password': password});

      if (response.statusCode == 200) {
        Map body = jsonDecode(response.body);
        token = body['token'];

        SharedPreferences prefs = await SharedPreferences.getInstance();
        prefs.setString('token', token!);

        notifyListeners();

        return true;
      } else if (response.statusCode == 400 || response.statusCode == 404) {
        return false;
      }

      throw Exception();
    } catch (e) {
      throw ServerErrorException();
    }
  }

  void removeServerIP() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    prefs.remove('serverIP');
    serverIP = null;
    serverInfo = null;

    removeToken(prefs);
  }

  void removeToken(SharedPreferences? prefs) async {
    prefs ??= await SharedPreferences.getInstance();
    prefs.remove('token');
    token = null;

    notifyListeners();
  }

  Future<bool> checkServerAccessibility({String? ip}) async {
    // check null
    ip ??= serverIP;
    if (ip == null) return false;

    // check protocol
    if (!(ip.startsWith('http://') || ip.startsWith('https://'))) {
      if (await checkServerAccessibility(ip: 'https://$ip') ||
          await checkServerAccessibility(ip: 'http://$ip')) return true;

      return false;
    }

    // try to fetch serverInfo
    try {
      final response = await http.get(Uri.parse(ip));

      // check if server is vaild
      if (response.statusCode == 200) {
        Map body = jsonDecode(response.body);
        if (body['appName'] != null && body['appName'] == 'OpenChat') {
          serverInfo = body;
        }

        SharedPreferences prefs = await SharedPreferences.getInstance();
        serverIP = ip;

        prefs.setString('serverIP', serverIP!);

        notifyListeners();
        return true;
      }

      throw Exception();
    } catch (e) {
      return false;
    }
  }
}

class ServerErrorException implements Exception {
  late String message;

  ServerErrorException({String message = 'Server Error'});

  @override
  String toString() {
    return message;
  }
}

class ThemeModel extends ChangeNotifier {
  late Color themeColor;
  static const defaultColor = Color(0xFF6A73EA);

  static Future<ThemeModel> getFromStorage() async {
    WidgetsFlutterBinding.ensureInitialized();
    SharedPreferences prefs = await SharedPreferences.getInstance();
    ThemeModel themeModel = ThemeModel();
    int? value = prefs.getInt('themeColor');
    try {
      if (value != null) {
        Color color = Color(value);
        // ignore: unnecessary_null_comparison
        if (color != null && color.alpha == 0xFF) {
          themeModel.themeColor = color;
        } else {
          throw Exception();
        }
      } else {
        throw Exception();
      }
    } catch (e) {
      themeModel.themeColor = defaultColor;
    }

    prefs.setInt('themeColor', themeModel.themeColor.value);

    return themeModel;
  }

  Future<void> changeThemeColor(Color color) async {
    WidgetsFlutterBinding.ensureInitialized();
    SharedPreferences prefs = await SharedPreferences.getInstance();

    if (color.alpha == 0xFF) {
      themeColor = color;
    } else {
      themeColor = defaultColor;
    }

    prefs.setInt('themeColor', color.value);

    notifyListeners();
  }
}
