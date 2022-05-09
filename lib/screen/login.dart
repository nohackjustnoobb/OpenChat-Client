import 'dart:convert';
import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:lottie/lottie.dart';
import 'package:material_design_icons_flutter/material_design_icons_flutter.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:provider/provider.dart';

import '../classes.dart';
import '../tools.dart';
import 'home.dart';

class LogIn extends StatefulWidget {
  const LogIn({Key? key}) : super(key: key);

  @override
  LogInState createState() => LogInState();
}

class LogInState extends State<LogIn> {
  final TextEditingController emailController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();
  final FocusNode focusNode = FocusNode();

  void logIn(OpenChat client) async {
    if (emailController.text == '' || passwordController.text == '') {
      return showError(context,
          message: AppLocalizations.of(context)!.wrongEmailOrPassword);
    }

    showLoading(context);
    try {
      bool isValid = await client.logInWithEmailAndPassword(
          emailController.text, passwordController.text);

      Navigator.pop(context);

      if (isValid) {
        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(builder: (context) => const Home()),
          (route) => false,
        );
      } else {
        passwordController.clear();
        showError(context,
            message: AppLocalizations.of(context)!.wrongEmailOrPassword);
      }
    } catch (e) {
      Navigator.pop(context);
      showError(context,
          message: AppLocalizations.of(context)!.cantConnectToServer);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.white,
      child: SafeArea(
          bottom: false,
          child: Stack(
            children: [
              Positioned(
                  left: 5,
                  child: TextButton(
                    style: TextButton.styleFrom(
                        primary: Theme.of(context).primaryColor,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(25),
                        )),
                    onPressed: () => Navigator.pop(context),
                    child: Row(mainAxisSize: MainAxisSize.min, children: [
                      const Icon(
                        MdiIcons.chevronLeft,
                        size: 30,
                      ),
                      Padding(
                        padding: const EdgeInsets.only(right: 5),
                        child: Text(
                          AppLocalizations.of(context)!.back,
                          style: const TextStyle(
                              fontSize: 20, fontWeight: FontWeight.w400),
                        ),
                      )
                    ]),
                  )),
              Consumer<OpenChat>(
                  builder: (context, client, child) => Column(
                        mainAxisSize: MainAxisSize.max,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                'Open',
                                style: TextStyle(
                                    color: Theme.of(context).primaryColor,
                                    fontWeight: FontWeight.w600,
                                    decoration: TextDecoration.none,
                                    fontSize: 40),
                              ),
                              const Text(
                                'Chat',
                                style: TextStyle(
                                    color: Colors.black,
                                    fontWeight: FontWeight.w600,
                                    decoration: TextDecoration.none,
                                    fontSize: 40),
                              )
                            ],
                          ),
                          Padding(
                            padding: const EdgeInsets.only(
                                left: 30, right: 30, bottom: 20, top: 50),
                            child: Column(
                              children: [
                                Material(
                                  color: Colors.transparent,
                                  child: TextFormField(
                                    controller: emailController,
                                    cursorColor: Theme.of(context).primaryColor,
                                    textInputAction: TextInputAction.next,
                                    enableSuggestions: false,
                                    autocorrect: false,
                                    keyboardType: TextInputType.emailAddress,
                                    onFieldSubmitted: (_) =>
                                        focusNode.nextFocus(),
                                    maxLength: 100,
                                    decoration: InputDecoration(
                                      icon: Icon(
                                        MdiIcons.at,
                                        color: Theme.of(context).primaryColor,
                                      ),
                                      labelStyle: TextStyle(
                                          color:
                                              Theme.of(context).primaryColor),
                                      labelText:
                                          AppLocalizations.of(context)!.email,
                                      suffixIcon: IconButton(
                                        onPressed: () =>
                                            emailController.clear(),
                                        icon: Icon(
                                          MdiIcons.close,
                                          color: Theme.of(context).primaryColor,
                                        ),
                                        splashRadius: 20,
                                      ),
                                      enabledBorder: UnderlineInputBorder(
                                        borderSide: BorderSide(
                                            color:
                                                Theme.of(context).primaryColor),
                                      ),
                                      focusedBorder: UnderlineInputBorder(
                                        borderSide: BorderSide(
                                            color:
                                                Theme.of(context).primaryColor),
                                      ),
                                    ),
                                  ),
                                ),
                                Material(
                                  color: Colors.transparent,
                                  child: TextFormField(
                                    controller: passwordController,
                                    focusNode: focusNode,
                                    obscureText: true,
                                    enableSuggestions: false,
                                    autocorrect: false,
                                    cursorColor: Theme.of(context).primaryColor,
                                    textInputAction: TextInputAction.done,
                                    onFieldSubmitted: (_) => logIn(client),
                                    maxLength: 100,
                                    decoration: InputDecoration(
                                      icon: Icon(
                                        MdiIcons.lock,
                                        color: Theme.of(context).primaryColor,
                                      ),
                                      labelStyle: TextStyle(
                                          color:
                                              Theme.of(context).primaryColor),
                                      labelText: AppLocalizations.of(context)!
                                          .password,
                                      suffixIcon: IconButton(
                                        onPressed: () =>
                                            passwordController.clear(),
                                        icon: Icon(
                                          MdiIcons.close,
                                          color: Theme.of(context).primaryColor,
                                        ),
                                        splashRadius: 20,
                                      ),
                                      enabledBorder: UnderlineInputBorder(
                                        borderSide: BorderSide(
                                            color:
                                                Theme.of(context).primaryColor),
                                      ),
                                      focusedBorder: UnderlineInputBorder(
                                        borderSide: BorderSide(
                                            color:
                                                Theme.of(context).primaryColor),
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Row(
                            children: [
                              Expanded(
                                child: Padding(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 100),
                                    child: TextButton(
                                        onPressed: () => logIn(client),
                                        style: TextButton.styleFrom(
                                            primary: Colors.white,
                                            backgroundColor:
                                                Theme.of(context).primaryColor,
                                            padding: const EdgeInsets.symmetric(
                                                vertical: 12)),
                                        child: Text(
                                          AppLocalizations.of(context)!.logIn,
                                          style: const TextStyle(
                                              fontSize: 18,
                                              fontWeight: FontWeight.w400),
                                        ))),
                              )
                            ],
                          ),
                          Container(
                            height: 150,
                          )
                        ],
                      )),
              const Positioned(bottom: -150, left: -500, child: Animation())
            ],
          )),
    );
  }
}

class Animation extends StatefulWidget {
  const Animation({Key? key}) : super(key: key);

  @override
  AnimationState createState() => AnimationState();
}

class AnimationState extends State<Animation> {
  late LottieComposition composition;
  Color? perviousColor;

  Future<LottieComposition> _loadComposition(Color color) async {
    if (perviousColor == null || perviousColor != color) {
      String jsonString =
          await rootBundle.loadString('assets/89984-waves.json');
      Map<dynamic, dynamic> obj =
          replaceColor(const Color(0xFF28B4D2), color, jsonDecode(jsonString));

      composition = await LottieComposition.fromBytes(
          Uint8List.fromList(utf8.encode(jsonEncode(obj))));
    }

    perviousColor = color;

    return composition;
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<ThemeModel>(
        builder: (BuildContext context, themeModel, child) =>
            FutureBuilder<LottieComposition>(
              future: _loadComposition(themeModel.themeColor),
              builder: (context, snapshot) {
                var composition = snapshot.data;
                if (composition != null) {
                  return Lottie(
                    composition: composition,
                    height: 400,
                    fit: BoxFit.fitHeight,
                  );
                } else {
                  return Center(
                      child: CircularProgressIndicator(
                    color: Theme.of(context).primaryColor,
                  ));
                }
              },
            ));
  }
}
