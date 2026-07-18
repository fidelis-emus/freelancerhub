import 'package:flutter/material.dart';

class AppTheme {
  static const Color darkSlate = Color(0xFF0F172A);
  static const Color cardSlate = Color(0xFF1E293B);
  static const Color accentEmerald = Color(0xFF10B981);
  static const Color borderSlate = Color(0xFF334155);

  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
      primaryColor: accentEmerald,
      scaffoldBackgroundColor: darkSlate,
      cardColor: cardSlate,
      colorScheme: const ColorScheme.dark(
        primary: accentEmerald,
        secondary: accentEmerald,
        background: darkSlate,
        surface: cardSlate,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: darkSlate,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: TextStyle(
          color: Colors.white,
          fontSize: 16,
          fontWeight: FontWeight.bold,
          letterSpacing: 0.5,
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: accentEmerald,
          foregroundColor: Colors.white,
          elevation: 2,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: const TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.bold,
            letterSpacing: 0.5,
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: cardSlate,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: borderSlate, width: 1),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: accentEmerald, width: 1.5),
        ),
        labelStyle: const TextStyle(color: Colors.grey, fontSize: 13),
      ),
    );
  }
}
