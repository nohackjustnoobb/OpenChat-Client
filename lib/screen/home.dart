import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:material_design_icons_flutter/material_design_icons_flutter.dart';
import 'package:provider/provider.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

import '../classes.dart';
import '../tools.dart';
import 'start.dart';

class Home extends StatefulWidget {
  const Home({Key? key}) : super(key: key);

  @override
  HomeState createState() => HomeState();
}

class HomeState extends State<Home> {
  @override
  void initState() {
    super.initState();
    OpenChat client = context.read<OpenChat>();
    client.connectWebSocketChannel();

    WidgetsBinding.instance!.addPostFrameCallback((_) => isServerAccessible());
  }

  void showServerError(OpenChat client) => showDialog(
      barrierDismissible: false,
      context: context,
      builder: (BuildContext context) => CupertinoAlertDialog(
            title: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: <Widget>[
                const Icon(
                  MdiIcons.alertCircle,
                  color: Colors.redAccent,
                  size: 40,
                ),
                Text(AppLocalizations.of(context)!.cantConnectToServer),
              ],
            ),
            actions: <Widget>[
              CupertinoDialogAction(
                  child: Text(AppLocalizations.of(context)!.tryAgain),
                  onPressed: () {
                    Navigator.pop(context);
                    isServerAccessible();
                  }),
              CupertinoDialogAction(
                  isDestructiveAction: true,
                  child: Text(AppLocalizations.of(context)!.disconnect),
                  onPressed: () {
                    client.removeServerIP();
                    Navigator.pushAndRemoveUntil(
                      context,
                      MaterialPageRoute(builder: (context) => const Start()),
                      (route) => false,
                    );
                  }),
            ],
          ));

  void isServerAccessible() async {
    OpenChat client = context.read<OpenChat>();

    if (client.serverInfo != null) return;

    showLoading(context);
    bool isAccessible = await client.checkServerAccessibility();
    Navigator.pop(context);

    if (!isAccessible) showServerError(client);
  }

  _appBar(height) => PreferredSize(
      preferredSize: Size(MediaQuery.of(context).size.width, height + 15),
      child: Container(
        color: Colors.white,
        child: SafeArea(
            child: Column(
                mainAxisSize: MainAxisSize.max,
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
              Padding(
                padding: const EdgeInsets.only(bottom: 12.5),
                child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      Material(
                        color: Colors.transparent,
                        child: IconButton(
                          onPressed: () {},
                          icon: const Icon(MdiIcons.cog),
                          iconSize: 27,
                          color: Theme.of(context).primaryColor,
                          splashRadius: 20,
                          splashColor:
                              Theme.of(context).primaryColor.withOpacity(.3),
                          highlightColor:
                              Theme.of(context).primaryColor.withOpacity(.14),
                        ),
                      ),
                      Column(
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                'Open',
                                style: TextStyle(
                                    color: Theme.of(context).primaryColor,
                                    fontWeight: FontWeight.w500,
                                    decoration: TextDecoration.none,
                                    fontSize: 25),
                              ),
                              const Text(
                                'Chat',
                                style: TextStyle(
                                    color: Colors.black,
                                    fontWeight: FontWeight.w500,
                                    decoration: TextDecoration.none,
                                    fontSize: 25),
                              )
                            ],
                          ),
                          Container(
                            height: 2,
                            width: 80,
                            decoration: const BoxDecoration(
                                color: Colors.black,
                                borderRadius:
                                    BorderRadius.all(Radius.elliptical(3, 3))),
                          )
                        ],
                      ),
                      Material(
                        color: Colors.transparent,
                        child: IconButton(
                          onPressed: () {},
                          icon: const Icon(MdiIcons.accountPlus),
                          iconSize: 27,
                          color: Theme.of(context).primaryColor,
                          splashRadius: 20,
                          splashColor:
                              Theme.of(context).primaryColor.withOpacity(.3),
                          highlightColor:
                              Theme.of(context).primaryColor.withOpacity(.14),
                        ),
                      )
                    ]),
              ),
              Container(
                height: .5,
                color: Colors.black.withOpacity(.1),
              )
            ])),
      ));

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.white,
      child: Scaffold(
          appBar: _appBar(AppBar().preferredSize.height),
          body: Container(
            color: const Color(0xFFF9F9F9),
            child: ListView.separated(
              itemCount: 0,
              itemBuilder: (context, index) => Row(),
              separatorBuilder: (BuildContext context, int index) =>
                  const Divider(),
            ),
          )),
    );
  }
}
