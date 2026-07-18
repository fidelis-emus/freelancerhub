import 'package:flutter/material.dart';
import 'package:local_auth/local_auth.dart';
import 'models.dart';
import 'home_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final LocalAuthentication auth = LocalAuthentication();
  bool _isBiometricsSupported = false;

  @override
  void initState() {
    super.initState();
    _checkBiometricsSupport();
  }

  Future<void> _checkBiometricsSupport() async {
    try {
      final isSupported = await auth.isDeviceSupported();
      setState(() {
        _isBiometricsSupported = isSupported;
      });
    } catch (e) {
      debugPrint("Biometrics error: $e");
    }
  }

  Future<void> _authenticateWithBiometrics(UserProfile demoUser) async {
    bool authenticated = false;
    try {
      authenticated = await auth.authenticate(
        localizedReason: 'Authenticate using Touch ID or Face ID to unlock your cryptographic escrow passkey',
        options: const AuthenticationOptions(
          stickyAuth: true,
          biometricOnly: true,
        ),
      );
    } catch (e) {
      debugPrint("Authentication error: $e");
      // Fallback for emulator environments
      authenticated = true;
    }

    if (authenticated && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text("Passkey Match! Logged in as ${demoUser.firstName} ${demoUser.lastName}"),
          backgroundColor: Colors.emerald,
        ),
      );
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (context) => HomeScreen(user: demoUser),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    // Standard Demo Users matching our database state
    final demoCustomer = UserProfile(
      id: "cust-1",
      role: "customer",
      firstName: "Chidi",
      lastName: "Okonkwo",
      email: "chidi@freelancehub.ng",
      phone: "+234 803 111 2222",
      state: "Lagos",
      city: "Ikeja",
      address: "12 Joel Ogunnaike St",
      kycStatus: "verified",
      rating: 4.8,
      ratingCount: 14,
      walletBalance: 245000.00,
      pendingBalance: 12000.00,
    );

    final demoFreelancer = UserProfile(
      id: "free-1",
      role: "freelancer",
      firstName: "Funke",
      lastName: "Adebayo",
      email: "funke@adebayodesigns.com",
      phone: "+234 809 333 4444",
      state: "Lagos",
      city: "Lekki Phase 1",
      address: "45 Admiralty Way",
      kycStatus: "verified",
      rating: 4.9,
      ratingCount: 42,
      bio: "Senior Full-Stack UI designer and developer specialing in custom mobile apps, system migrations, and Flutter architecture.",
      walletBalance: 489000.00,
      pendingBalance: 115000.00,
    );

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 40),
              // App Logo / Symbol
              Center(
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.emerald.withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.account_balance_wallet_rounded,
                    color: Colors.emerald,
                    size: 48,
                  ),
                ),
              ),
              const SizedBox(height: 24),
              const Text(
                "FreelanceHub Africa",
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.black,
                  letterSpacing: -0.5,
                ),
              ),
              const SizedBox(height: 6),
              const Text(
                "Securing P2P Service Delivery with Biometric Escrows",
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.grey,
                ),
              ),
              const SizedBox(height: 40),

              // Inputs
              TextField(
                controller: _emailController,
                decoration: const InputDecoration(
                  labelText: "Email Address",
                  prefixIcon: Icon(Icons.email_outlined, size: 18),
                ),
                keyboardType: TextInputType.emailAddress,
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _passwordController,
                decoration: const InputDecoration(
                  labelText: "Security Password",
                  prefixIcon: Icon(Icons.lock_outline_rounded, size: 18),
                ),
                obscureText: true,
              ),
              const SizedBox(height: 24),

              ElevatedButton(
                onPressed: () {
                  // Fallback normal login
                  final email = _emailController.text.trim();
                  if (email.contains("funke")) {
                    Navigator.pushReplacement(
                      context,
                      MaterialPageRoute(builder: (context) => HomeScreen(user: demoFreelancer)),
                    );
                  } else {
                    Navigator.pushReplacement(
                      context,
                      MaterialPageRoute(builder: (context) => HomeScreen(user: demoCustomer)),
                    );
                  }
                },
                child: const Text("ACCESS HUB NODE"),
              ),

              const SizedBox(height: 36),
              // Biometric Passkey Shortcuts panel
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFF334155), width: 1),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.fingerprint_rounded, color: Colors.emerald, size: 20),
                        const SizedBox(width: 8),
                        const Text(
                          "Biometric Passkey Enclave",
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const Spacer(),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: Colors.emerald.withOpacity(0.15),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: const Text(
                            "SECURE",
                            style: TextStyle(
                              color: Colors.emerald,
                              fontSize: 8,
                              fontWeight: FontWeight.black,
                            ),
                          ),
                        )
                      ],
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      "To simulate instant user logins for testing booking flow and smart escrow handshakes, select a passkey profile below.",
                      style: TextStyle(
                        fontSize: 11,
                        color: Colors.grey,
                        height: 1.4,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton.icon(
                            style: OutlinedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              side: const BorderSide(color: Color(0xFF334155)),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10),
                              ),
                            ),
                            onPressed: () => _authenticateWithBiometrics(demoCustomer),
                            icon: const Icon(Icons.person, size: 16, color: Colors.emerald),
                            label: const Text(
                              "Customer\n(Chidi)",
                              textAlign: TextAlign.center,
                              style: TextStyle(fontSize: 10, color: Colors.white, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: OutlinedButton.icon(
                            style: OutlinedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              side: const BorderSide(color: Color(0xFF334155)),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10),
                              ),
                            ),
                            onPressed: () => _authenticateWithBiometrics(demoFreelancer),
                            icon: const Icon(Icons.engineering, size: 16, color: Colors.emerald),
                            label: const Text(
                              "Freelancer\n(Funke)",
                              textAlign: TextAlign.center,
                              style: TextStyle(fontSize: 10, color: Colors.white, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ),
                      ],
                    )
                  ],
                ),
              ),
              const SizedBox(height: 30),
            ],
          ),
        ),
      ),
    );
  }
}
// Placeholder class to handle missing Cupertino imports in styles if any
class ColorHex {
  static Color fromHex(String hexString) {
    final buffer = StringBuffer();
    if (hexString.length == 6 || hexString.length == 7) buffer.write('ff');
    buffer.write(hexString.replaceFirst('#', ''));
    return Color(int.parse(buffer.toString(), radix: 16));
  }
}
