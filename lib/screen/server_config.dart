import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:provider/provider.dart';
import 'package:material_design_icons_flutter/material_design_icons_flutter.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

import '../classes.dart';
import '../tools.dart';

class ServerConfig extends StatelessWidget {
  const ServerConfig({Key? key}) : super(key: key);
  @override
  Widget build(BuildContext context) {
    final bottom = MediaQuery.of(context).viewInsets.bottom;

    return Material(
      child: SafeArea(
          top: false,
          child: Stack(
            children: [
              Positioned(
                right: 5,
                top: 5,
                child: IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(MdiIcons.closeCircleOutline),
                  iconSize: 27,
                  color: Theme.of(context).primaryColor,
                  splashRadius: 20,
                  splashColor: Theme.of(context).primaryColor.withOpacity(.3),
                  highlightColor:
                      Theme.of(context).primaryColor.withOpacity(.14),
                ),
              ),
              Container(
                margin: const EdgeInsets.only(top: 15),
                padding: EdgeInsets.only(bottom: bottom + 10),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Center(
                      child: Text(
                        AppLocalizations.of(context)!.serverConfig,
                        style: Theme.of(context).textTheme.headline5,
                      ),
                    ),
                    Consumer<OpenChat>(
                        builder: (context, client, child) =>
                            client.isServerConnected
                                ? const ServerInfo()
                                : const IPInput())
                  ],
                ),
              )
            ],
          )),
    );
  }
}

class IPInput extends StatefulWidget {
  const IPInput({Key? key}) : super(key: key);

  @override
  IPInputState createState() => IPInputState();
}

class IPInputState extends State<IPInput> {
  final TextEditingController controller = TextEditingController();

  void connect(OpenChat client) async {
    showLoading(context);

    bool isValid = await client.checkServerAccessibility(ip: controller.text);
    Navigator.pop(context);

    if (isValid) {
      Navigator.pop(context);
    } else {
      controller.clear();

      showError(context,
          message: AppLocalizations.of(context)!.cantConnectToServer);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<OpenChat>(
        builder: (BuildContext context, client, child) => Column(
              children: [
                Container(
                  margin:
                      const EdgeInsets.symmetric(horizontal: 20, vertical: 5),
                  child: Material(
                    color: Colors.transparent,
                    child: TextFormField(
                      controller: controller,
                      cursorColor: Theme.of(context).primaryColor,
                      textInputAction: TextInputAction.done,
                      onFieldSubmitted: (_) => connect(client),
                      maxLength: 100,
                      decoration: InputDecoration(
                        icon: Icon(
                          MdiIcons.server,
                          color: Theme.of(context).primaryColor,
                        ),
                        labelStyle:
                            TextStyle(color: Theme.of(context).primaryColor),
                        labelText: AppLocalizations.of(context)!.serverIP,
                        suffixIcon: IconButton(
                          onPressed: () => controller.clear(),
                          icon: Icon(
                            MdiIcons.close,
                            color: Theme.of(context).primaryColor,
                          ),
                          splashRadius: 20,
                        ),
                        enabledBorder: UnderlineInputBorder(
                          borderSide:
                              BorderSide(color: Theme.of(context).primaryColor),
                        ),
                        focusedBorder: UnderlineInputBorder(
                          borderSide:
                              BorderSide(color: Theme.of(context).primaryColor),
                        ),
                      ),
                    ),
                  ),
                ),
                Row(
                  children: [
                    Expanded(
                        child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 100),
                      child: TextButton(
                          onPressed: () => connect(client),
                          style: TextButton.styleFrom(
                              primary: Colors.white,
                              backgroundColor: Theme.of(context).primaryColor,
                              padding:
                                  const EdgeInsets.symmetric(vertical: 12)),
                          child: Text(
                            AppLocalizations.of(context)!.connect,
                            style: const TextStyle(
                                fontSize: 18, fontWeight: FontWeight.w400),
                          )),
                    ))
                  ],
                )
              ],
            ));
  }
}

class ServerInfo extends StatelessWidget {
  const ServerInfo({Key? key}) : super(key: key);

  getServerInfo(BuildContext context, OpenChat client) async {
    if (!(await client.checkServerAccessibility())) {
      showDialog(
          context: context,
          builder: (BuildContext context) => CupertinoAlertDialog(
                title: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: <Widget>[
                    const Icon(
                      MdiIcons.alertCircle,
                      color: Colors.red,
                      size: 40,
                    ),
                    Text(AppLocalizations.of(context)!.cantConnectToServer),
                  ],
                ),
                actions: <Widget>[
                  CupertinoDialogAction(
                      child: Text(AppLocalizations.of(context)!.ok),
                      onPressed: () => Navigator.pop(context)),
                ],
              ));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<OpenChat>(builder: (BuildContext context, client, child) {
      TextStyle keyStyle = TextStyle(
          color: Theme.of(context).primaryColor, fontWeight: FontWeight.w400);
      TextStyle valueStyle = TextStyle(
          color: Theme.of(context).primaryColor.withOpacity(.6),
          fontWeight: FontWeight.w400,
          fontStyle: FontStyle.italic);

      if (client.serverInfo == null) {
        getServerInfo(context, client);

        return Container(
          margin: const EdgeInsets.only(top: 15),
          child: CircularProgressIndicator(
            color: Theme.of(context).primaryColor,
          ),
        );
      }

      return Container(
        margin: const EdgeInsets.only(left: 30, right: 30, top: 10),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  AppLocalizations.of(context)!.serverIP + ': ',
                  style: keyStyle,
                ),
                SelectableText(
                  client.serverIP ?? '',
                  style: valueStyle,
                  toolbarOptions:
                      const ToolbarOptions(selectAll: true, copy: true),
                )
              ],
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(AppLocalizations.of(context)!.serverName + ': ',
                    style: keyStyle),
                SelectableText(client.serverInfo!['serverName'] ?? '',
                    style: valueStyle)
              ],
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(AppLocalizations.of(context)!.serverType + ': ',
                    style: keyStyle),
                SelectableText(client.serverInfo!['serverType'] ?? '',
                    style: valueStyle)
              ],
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(AppLocalizations.of(context)!.serverVersion + ': ',
                    style: keyStyle),
                SelectableText(client.serverInfo!['serverVersion'] ?? '',
                    style: valueStyle)
              ],
            ),
            Row(
              children: [
                Expanded(
                    child: Container(
                  padding: const EdgeInsets.only(top: 10, left: 10, right: 10),
                  child: OutlinedButton(
                      onPressed: () {
                        client.removeServerIP();
                        Navigator.pop(context);
                      },
                      style: OutlinedButton.styleFrom(
                          side: const BorderSide(
                              color: Colors.redAccent, width: 1.5),
                          primary: Colors.redAccent,
                          padding: const EdgeInsets.symmetric(vertical: 12)),
                      child: Text(
                        AppLocalizations.of(context)!.disconnect,
                        style: const TextStyle(
                            fontSize: 18, fontWeight: FontWeight.w400),
                      )),
                ))
              ],
            )
          ],
        ),
      );
    });
  }
}
