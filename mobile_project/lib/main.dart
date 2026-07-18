import 'package:flutter/material.dart';
import 'theme.dart';
import 'login_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const FreelanceHubApp());
}

class FreelanceHubApp extends StatelessWidget {
  const FreelanceHubApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'FreelanceHub Africa',
      theme: AppTheme.darkTheme,
      debugShowCheckedModeBanner: false,
      home: const LoginScreen(),
    );
  }
}
