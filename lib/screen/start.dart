import 'dart:convert';
import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:openchat/classes.dart';
import 'package:provider/provider.dart';
import 'package:lottie/lottie.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:material_design_icons_flutter/material_design_icons_flutter.dart';
import 'package:modal_bottom_sheet/modal_bottom_sheet.dart';

import '../tools.dart';
import '../classes.dart';
import 'color_selecter.dart';
import 'server_config.dart';
import 'login.dart';

class Start extends StatelessWidget {
  const Start({Key? key}) : super(key: key);

  void showNoConnectedServer(BuildContext context) => showError(context,
      message: AppLocalizations.of(context)!.noConnectedServer);

  @override
  Widget build(BuildContext context) {
    return Container(
        color: Colors.white,
        child: SafeArea(
            bottom: false,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                Column(
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
                    Container(
                      height: 3,
                      width: 120,
                      decoration: const BoxDecoration(
                          color: Colors.black,
                          borderRadius:
                              BorderRadius.all(Radius.elliptical(3, 3))),
                    )
                  ],
                ),
                const Animation(),
                Consumer<OpenChat>(
                    builder: (BuildContext context, client, child) => Column(
                          children: [
                            Container(
                              margin: const EdgeInsets.only(bottom: 3),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Text(
                                    '${AppLocalizations.of(context)!.serverState}: ',
                                    style: TextStyle(
                                        color: Colors.black.withOpacity(.3),
                                        fontSize: 10,
                                        decoration: TextDecoration.none,
                                        fontWeight: FontWeight.w600),
                                  ),
                                  Text(
                                    client.isServerConnected
                                        ? AppLocalizations.of(context)!
                                            .connected
                                        : AppLocalizations.of(context)!
                                            .disconnected,
                                    style: TextStyle(
                                      color: Colors.black.withOpacity(.3),
                                      fontSize: 10,
                                      decoration: TextDecoration.none,
                                    ),
                                  )
                                ],
                              ),
                            ),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Padding(
                                  padding: const EdgeInsets.only(
                                      bottom: 5, right: 5),
                                  child: TextButton(
                                      onPressed: () =>
                                          showCupertinoModalBottomSheet(
                                              context: context,
                                              builder: (BuildContext context) =>
                                                  const ColorSelecter()),
                                      style: OutlinedButton.styleFrom(
                                          side: BorderSide(
                                              color: Theme.of(context)
                                                  .primaryColor,
                                              width: 1.5),
                                          shape: RoundedRectangleBorder(
                                            borderRadius:
                                                BorderRadius.circular(25),
                                          ),
                                          primary:
                                              Theme.of(context).primaryColor,
                                          padding: const EdgeInsets.symmetric(
                                              vertical: 8.5)),
                                      child: const Icon(
                                        MdiIcons.palette,
                                        size: 30,
                                      )),
                                ),
                                Padding(
                                  padding:
                                      const EdgeInsets.only(bottom: 5, left: 5),
                                  child: TextButton(
                                      onPressed: () =>
                                          showCupertinoModalBottomSheet(
                                              context: context,
                                              builder: (BuildContext context) =>
                                                  const ServerConfig()),
                                      style: TextButton.styleFrom(
                                          primary: Colors.white,
                                          backgroundColor:
                                              Theme.of(context).primaryColor,
                                          shape: RoundedRectangleBorder(
                                            borderRadius:
                                                BorderRadius.circular(25),
                                          )),
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(
                                            vertical: 2.5),
                                        child: const Icon(
                                          MdiIcons.server,
                                          size: 25,
                                        ),
                                      )),
                                )
                              ],
                            ),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                              children: [
                                Expanded(
                                    child: Padding(
                                  padding: const EdgeInsets.only(
                                      left: 20, right: 10),
                                  child: TextButton(
                                      onPressed: () {
                                        if (!client.isServerConnected) {
                                          showNoConnectedServer(context);
                                        } else {
                                          Navigator.push(
                                            context,
                                            MaterialPageRoute(
                                                builder: (context) =>
                                                    const LogIn()),
                                          );
                                        }
                                      },
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
                                      )),
                                )),
                                Expanded(
                                    child: Padding(
                                  padding: const EdgeInsets.only(
                                      left: 10, right: 20),
                                  child: OutlinedButton(
                                      onPressed: () {},
                                      style: OutlinedButton.styleFrom(
                                          side: BorderSide(
                                              color: Theme.of(context)
                                                  .primaryColor,
                                              width: 1.5),
                                          primary:
                                              Theme.of(context).primaryColor,
                                          padding: const EdgeInsets.symmetric(
                                              vertical: 12)),
                                      child: Text(
                                        AppLocalizations.of(context)!.signUp,
                                        style: const TextStyle(
                                            fontSize: 18,
                                            fontWeight: FontWeight.w400),
                                      )),
                                ))
                              ],
                            )
                          ],
                        ))
              ],
            )));
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
          await rootBundle.loadString('assets/58728-contact-chat.json');
      Map<dynamic, dynamic> obj =
          replaceColor(const Color(0xFF4F89BE), color, jsonDecode(jsonString));

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
                  return Lottie(composition: composition);
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
