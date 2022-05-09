import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:material_design_icons_flutter/material_design_icons_flutter.dart';

Map<dynamic, dynamic> replaceColor(
    Color sourceColor, Color targetColor, Map<dynamic, dynamic> lottieObj) {
  double round(num num) {
    return (num * 100).round() / 100;
  }

  List<double> convertColorToLottieColor(Color color) {
    return [
      round(color.red / 255),
      round(color.green / 255),
      round(color.blue / 255)
    ];
  }

  dynamic doReplace(List<double> sourceLottieColor,
      List<double> targetLottieColor, dynamic obj) {
    if (obj is! List &&
        obj['s'] is List &&
        !obj['s'].isEmpty &&
        obj['s']?.length == 4) {
      if (sourceLottieColor[0] == obj['s'][0] &&
          sourceLottieColor[1] == obj['s'][1] &&
          sourceLottieColor[2] == obj['s'][2]) {
        obj['s'] = [...targetLottieColor, 1];
      }
    } else if (obj != null &&
        obj is Map &&
        obj['c'] != null &&
        obj['c'] is Map &&
        obj['c']['k'] != null) {
      if (obj['c']['k'] is List && obj['c']['k'][0] is! num) {
        doReplace(sourceLottieColor, targetLottieColor, obj['c']['k']);
      } else if (sourceLottieColor[0] == round(obj['c']['k'][0]) &&
          sourceLottieColor[1] == round(obj['c']['k'][1]) &&
          sourceLottieColor[2] == round(obj['c']['k'][2])) {
        obj['c']['k'] = targetLottieColor;
      }
    } else {
      dynamic objKeys =
          obj is Map ? obj.keys : [for (var i = 0; i < obj.length; i++) i];

      for (dynamic key in objKeys) {
        if (obj[key] is List || obj[key] is Map) {
          doReplace(sourceLottieColor, targetLottieColor, obj[key]);
        }
      }
    }

    return obj;
  }

  List<double> genSourceLottieColor = convertColorToLottieColor(sourceColor);
  List<double> genTargetLottieColor = convertColorToLottieColor(targetColor);

  return doReplace(genSourceLottieColor, genTargetLottieColor, lottieObj);
}

void showLoading(BuildContext context) => showDialog(
      barrierDismissible: false,
      context: context,
      builder: (BuildContext context) => Center(
        child: Container(
          decoration: const BoxDecoration(
            borderRadius: BorderRadius.all(Radius.circular(20)),
            color: Colors.white,
          ),
          width: 200,
          height: 75,
          child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
            CircularProgressIndicator(
              color: Theme.of(context).primaryColor,
            ),
            Container(
              margin: const EdgeInsets.only(left: 20),
              child: Text(
                AppLocalizations.of(context)!.loading,
                style: TextStyle(
                    color: Theme.of(context).primaryColor.withOpacity(0.8),
                    fontWeight: FontWeight.w500,
                    fontSize: 18,
                    decoration: TextDecoration.none),
              ),
            )
          ]),
        ),
      ),
    );

void showError(BuildContext context,
        {required String message,
        IconData icon = MdiIcons.alertCircle,
        Color iconColor = Colors.redAccent}) =>
    showDialog(
        context: context,
        builder: (BuildContext context) => CupertinoAlertDialog(
              title: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: <Widget>[
                  Icon(
                    icon,
                    color: iconColor,
                    size: 40,
                  ),
                  Text(message),
                ],
              ),
              actions: <Widget>[
                CupertinoDialogAction(
                    child: Text(AppLocalizations.of(context)!.ok),
                    onPressed: () => Navigator.pop(context)),
              ],
            ));
