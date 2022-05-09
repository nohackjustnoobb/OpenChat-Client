import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:provider/provider.dart';

import './screen/start.dart';
import './classes.dart';
import './screen/home.dart';

void main() async {
  ThemeModel themeModel = await ThemeModel.getFromStorage();
  OpenChat client = OpenChat();
  await client.readFromStorage();

  runApp(MultiProvider(
    providers: [
      ChangeNotifierProvider.value(value: themeModel),
      ChangeNotifierProvider.value(value: client)
    ],
    child: const App(),
  ));
}

class App extends StatelessWidget {
  const App({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Consumer<ThemeModel>(
        builder: (BuildContext context, themeModel, child) => MaterialApp(
              title: 'OpenChat',
              theme: ThemeData(
                primaryColor: themeModel.themeColor,
              ),
              localizationsDelegates: AppLocalizations.localizationsDelegates,
              supportedLocales: AppLocalizations.supportedLocales,
              home: Consumer<OpenChat>(
                builder: (context, client, child) =>
                    client.isLoggedIn ? const Home() : const Start(),
              ),
            ));
  }
}
