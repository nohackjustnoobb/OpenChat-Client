import 'package:flutter/material.dart';
import 'package:flex_color_picker/flex_color_picker.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:material_design_icons_flutter/material_design_icons_flutter.dart';
import 'package:provider/provider.dart';

import '../classes.dart';

class ColorSelecter extends StatefulWidget {
  const ColorSelecter({Key? key}) : super(key: key);

  @override
  ColorSelecterState createState() => ColorSelecterState();
}

class ColorSelecterState extends State<ColorSelecter> {
  Color? pickerColor;

  @override
  Widget build(BuildContext context) {
    final bottom = MediaQuery.of(context).viewInsets.bottom;

    return Material(
      child: SafeArea(
          top: false,
          child: SingleChildScrollView(
            physics: const NeverScrollableScrollPhysics(),
            child: Stack(children: [
              Positioned(
                right: 5,
                top: 5,
                child: IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(MdiIcons.closeCircleOutline),
                  iconSize: 27,
                  color: pickerColor ?? Theme.of(context).primaryColor,
                  splashRadius: 20,
                  splashColor: (pickerColor ?? Theme.of(context).primaryColor)
                      .withOpacity(.3),
                  highlightColor:
                      (pickerColor ?? Theme.of(context).primaryColor)
                          .withOpacity(.14),
                ),
              ),
              Padding(
                padding: EdgeInsets.only(bottom: bottom),
                child: Column(mainAxisSize: MainAxisSize.min, children: [
                  ColorPicker(
                    color: pickerColor ?? Theme.of(context).primaryColor,
                    pickersEnabled: const {
                      ColorPickerType.wheel: true,
                      ColorPickerType.accent: false
                    },
                    onColorChanged: (Color color) =>
                        setState(() => pickerColor = color),
                    enableShadesSelection: true,
                    showColorName: true,
                    colorCodeHasColor: true,
                    showColorCode: true,
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    heading: Text(
                      AppLocalizations.of(context)!.themeColor,
                      style: Theme.of(context).textTheme.headline5,
                    ),
                    subheading: Text(
                      AppLocalizations.of(context)!.selectColorShade,
                      style: Theme.of(context).textTheme.subtitle1,
                    ),
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      Expanded(
                          child: Container(
                        padding: const EdgeInsets.only(left: 20, right: 10),
                        child: OutlinedButton(
                            onPressed: () => setState(
                                (() => pickerColor = ThemeModel.defaultColor)),
                            style: ButtonStyle(
                                side: MaterialStateProperty.all<BorderSide>(
                                    const BorderSide(
                                        color: Colors.redAccent, width: 1.5)),
                                foregroundColor:
                                    MaterialStateProperty.all<Color>(
                                        Colors.redAccent),
                                overlayColor:
                                    MaterialStateProperty.resolveWith<Color?>(
                                  (Set<MaterialState> states) {
                                    if (states
                                        .contains(MaterialState.hovered)) {
                                      return Colors.redAccent.withOpacity(0.04);
                                    }
                                    if (states
                                            .contains(MaterialState.focused) ||
                                        states
                                            .contains(MaterialState.pressed)) {
                                      return Colors.redAccent.withOpacity(0.12);
                                    }
                                    return null;
                                  },
                                ),
                                padding: MaterialStateProperty.all<
                                        EdgeInsetsGeometry>(
                                    const EdgeInsets.symmetric(vertical: 12))),
                            child: Text(
                              AppLocalizations.of(context)!.reset,
                              style: const TextStyle(
                                  fontSize: 18, fontWeight: FontWeight.w400),
                            )),
                      )),
                      Expanded(
                          child: Container(
                        padding: const EdgeInsets.only(left: 10, right: 20),
                        child: Consumer<ThemeModel>(
                            builder: (BuildContext context, themeModel,
                                    child) =>
                                TextButton(
                                    onPressed: () {
                                      themeModel.changeThemeColor(pickerColor ??
                                          Theme.of(context).primaryColor);
                                      Navigator.pop(context);
                                    },
                                    style: ButtonStyle(
                                        foregroundColor:
                                            MaterialStateProperty.all<Color>(
                                                Colors.white),
                                        backgroundColor:
                                            MaterialStateProperty.all<Color>(
                                                pickerColor ??
                                                    Theme.of(context)
                                                        .primaryColor),
                                        overlayColor: MaterialStateProperty
                                            .resolveWith<Color?>(
                                          (Set<MaterialState> states) {
                                            if (states.contains(
                                                MaterialState.hovered)) {
                                              return Colors.white
                                                  .withOpacity(0.04);
                                            }
                                            if (states.contains(
                                                    MaterialState.focused) ||
                                                states.contains(
                                                    MaterialState.pressed)) {
                                              return Colors.white
                                                  .withOpacity(0.12);
                                            }
                                            return null;
                                          },
                                        ),
                                        padding: MaterialStateProperty.all<
                                                EdgeInsetsGeometry>(
                                            const EdgeInsets.symmetric(vertical: 12))),
                                    child: Text(
                                      AppLocalizations.of(context)!.confirm,
                                      style: const TextStyle(
                                          fontSize: 18,
                                          fontWeight: FontWeight.w400),
                                    ))),
                      ))
                    ],
                  )
                ]),
              )
            ]),
          )),
    );
  }
}
