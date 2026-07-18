import 'package:flutter/material.dart';
import 'models.dart';
import 'chat_screen.dart';
import 'wallet_screen.dart';

class HomeScreen extends StatefulWidget {
  final UserProfile user;
  const HomeScreen({super.key, required this.user});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;
  late List<Booking> _mockBookings;

  @override
  void initState() {
    super.initState();
    _mockBookings = [
      Booking(
        id: "BOOK-20492",
        customerId: "cust-1",
        customerName: "Chidi Okonkwo",
        freelancerId: "free-1",
        freelancerName: "Funke Adebayo",
        category: "Creative Services",
        subcategory: "UI Redesign",
        title: "React Full Stack Dashboard Revamp",
        description: "Need full-scale UX rework for client portals and payment gateway configurations.",
        price: 115000.00,
        status: "accepted",
        paymentStatus: "escrow",
        currentStep: 2,
        chatHistory: [],
      ),
      Booking(
        id: "BOOK-84920",
        customerId: "cust-1",
        customerName: "Chidi Okonkwo",
        freelancerId: "free-1",
        freelancerName: "Funke Adebayo",
        category: "Technical Services",
        subcategory: "Database Migration",
        title: "Drizzle Schema Mapping Configuration",
        description: "Map current local SQLite collections to secure Postgres Cloud SQL nodes.",
        price: 180000.00,
        status: "started",
        paymentStatus: "escrow",
        currentStep: 3,
        chatHistory: [],
      )
    ];
  }

  void _updateBookingStep(Booking b, int step) {
    setState(() {
      final index = _mockBookings.indexOf(b);
      if (index != -1) {
        _mockBookings[index] = Booking(
          id: b.id,
          customerId: b.customerId,
          customerName: b.customerName,
          freelancerId: b.freelancerId,
          freelancerName: b.freelancerName,
          category: b.category,
          subcategory: b.subcategory,
          title: b.title,
          description: b.description,
          price: b.price,
          status: step >= 4 ? "completed" : b.status,
          paymentStatus: step >= 4 ? "released" : b.paymentStatus,
          currentStep: step,
          chatHistory: b.chatHistory,
        );
      }
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text("Step progression logged! Current state: Milestone Step $step"),
        backgroundColor: Colors.emerald,
      ),
    );
  }

  Widget _buildDashboard() {
    final isFreelancer = widget.user.role == "freelancer";
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Greeting card
          Row(
            children: [
              CircleAvatar(
                backgroundColor: Colors.emerald.withOpacity(0.15),
                radius: 20,
                child: Text(
                  widget.user.firstName[0],
                  style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.emerald),
                ),
              ),
              const SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "Welcome back, ${widget.user.firstName}!",
                    style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                  ),
                  Row(
                    children: [
                      const Icon(Icons.verified_user_rounded, color: Colors.emerald, size: 12),
                      const SizedBox(width: 4),
                      Text(
                        "${widget.user.role.toUpperCase()} • KYC VERIFIED",
                        style: const TextStyle(fontSize: 8, color: Colors.emerald, fontWeight: FontWeight.bold),
                      )
                    ],
                  )
                ],
              ),
              const Spacer(),
              IconButton(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => WalletScreen(user: widget.user)),
                  );
                },
                icon: const Icon(Icons.account_balance_wallet, color: Colors.emerald),
              )
            ],
          ),
          const SizedBox(height: 24),

          // Search banner
          TextField(
            decoration: InputDecoration(
              hintText: "Search certified freelancers and active tasks...",
              prefixIcon: const Icon(Icons.search_rounded, size: 18),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
            ),
          ),
          const SizedBox(height: 24),

          // Quick category chips
          const Text("CATEGORIES IN DEMAND", style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey)),
          const SizedBox(height: 10),
          SizedBox(
            height: 38,
            child: ListView(
              scrollDirection: Axis.horizontal,
              children: [
                "🚀 All Services",
                "💻 Web Engineering",
                "🎨 UI/UX Design",
                "🔌 API Integration",
                "🛡️ Database Admin",
                "📦 Logistics & Delivery"
              ].map((cat) {
                return Container(
                  margin: const EdgeInsets.only(right: 8),
                  child: Chip(
                    backgroundColor: const Color(0xFF1E293B),
                    label: Text(cat, style: const TextStyle(fontSize: 11, color: Colors.white)),
                    side: const BorderSide(color: Color(0xFF334155)),
                  ),
                );
              }).toList(),
            ),
          ),
          const SizedBox(height: 24),

          // Active tasks list header
          const Text("ACTIVE BOOKING CONTRACTS", style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey)),
          const SizedBox(height: 12),

          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _mockBookings.length,
            itemBuilder: (context, index) {
              final b = _mockBookings[index];
              final otherParty = isFreelancer ? b.customerName : b.freelancerName;

              return Card(
                margin: const EdgeInsets.only(bottom: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                color: const Color(0xFF1E293B),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.between,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: Colors.emerald.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              b.subcategory,
                              style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.emeraldAccent),
                            ),
                          ),
                          Text(
                            "₦${b.price.toStringAsFixed(0)}",
                            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.black, color: Colors.white),
                          )
                        ],
                      ),
                      const SizedBox(height: 12),
                      Text(b.title, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 4),
                      Text(b.description, style: const TextStyle(fontSize: 11, color: Colors.grey)),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          const Icon(Icons.person, size: 14, color: Colors.grey),
                          const SizedBox(width: 4),
                          Text(
                            "With: $otherParty",
                            style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
                          ),
                          const Spacer(),
                          const Icon(Icons.shield_outlined, size: 14, color: Colors.emerald),
                          const SizedBox(width: 4),
                          Text(
                            b.paymentStatus.toUpperCase(),
                            style: const TextStyle(fontSize: 9, fontWeight: FontWeight.black, color: Colors.emerald),
                          )
                        ],
                      ),
                      const SizedBox(height: 12),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          OutlinedButton(
                            style: OutlinedButton.styleFrom(
                              side: const BorderSide(color: Color(0xFF334155)),
                            ),
                            onPressed: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => ChatScreen(booking: b, currentUser: widget.user),
                                ),
                              );
                            },
                            child: const Text("CHAT ROOM", style: TextStyle(fontSize: 10, color: Colors.white)),
                          ),
                          const SizedBox(width: 8),
                          ElevatedButton(
                            onPressed: () {
                              if (isFreelancer) {
                                if (b.currentStep < 4) {
                                  _updateBookingStep(b, b.currentStep + 1);
                                }
                              } else {
                                if (b.currentStep < 4) {
                                  _updateBookingStep(b, 4); // release milestone escrow
                                }
                              }
                            },
                            child: Text(
                              isFreelancer
                                  ? (b.currentStep >= 3 ? "FINISH TASK" : "NEXT MILESTONE")
                                  : (b.currentStep >= 4 ? "RELEASED" : "APPROVE & PAY"),
                              style: const TextStyle(fontSize: 10),
                            ),
                          )
                        ],
                      )
                    ],
                  ),
                ),
              );
            },
          )
        ],
      ),
    );
  }

  Widget _buildEscrowPanel() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text(
            "ESCROW RECONCILIATIONS",
            style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey),
          ),
          const SizedBox(height: 14),
          ..._mockBookings.map((b) {
            return Card(
              margin: const EdgeInsets.only(bottom: 12),
              color: const Color(0xFF1E293B),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: ListTile(
                title: Text(b.title, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                subtitle: Text("Step ${b.currentStep}/4 - Escrow Pool: ₦${b.price.toStringAsFixed(0)}", style: const TextStyle(fontSize: 9, color: Colors.grey)),
                trailing: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: b.paymentStatus == "released" ? Colors.emerald.withOpacity(0.15) : Colors.orange.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    b.paymentStatus.toUpperCase(),
                    style: TextStyle(color: b.paymentStatus == "released" ? Colors.emeraldAccent : Colors.orangeAccent, fontSize: 8, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
            );
          }).toList()
        ],
      ),
    );
  }

  Widget _buildKYCOverview() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Center(
            child: CircleAvatar(
              radius: 40,
              backgroundColor: Colors.emerald.withOpacity(0.15),
              child: const Icon(Icons.fingerprint_rounded, size: 40, color: Colors.emerald),
            ),
          ),
          const SizedBox(height: 16),
          Text(
            "${widget.user.firstName} ${widget.user.lastName}",
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 4),
          Text(
            widget.user.email,
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 11, color: Colors.grey),
          ),
          const SizedBox(height: 24),

          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF1E293B),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text("KYC LEVEL 2 STATUS", style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.emerald)),
                const SizedBox(height: 12),
                _buildKYCField("National Identity Card", "VERIFIED"),
                _buildKYCField("Facial Biometric Selfie Match", "VERIFIED"),
                _buildKYCField("IP Integrity Fingerprint", "SECURED"),
              ],
            ),
          ),
          const SizedBox(height: 24),

          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red.shade900),
            child: const Text("SECURE COGNITIVE SHUTDOWN (LOG OUT)"),
          )
        ],
      ),
    );
  }

  Widget _buildKYCField(String name, String status) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.between,
        children: [
          Text(name, style: const TextStyle(fontSize: 11, color: Colors.white70)),
          Text(status, style: const TextStyle(fontSize: 11, color: Colors.emeraldAccent, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final List<Widget> panels = [
      _buildDashboard(),
      _buildEscrowPanel(),
      WalletScreen(user: widget.user),
      _buildKYCOverview(),
    ];

    return Scaffold(
      appBar: _currentIndex == 2 ? null : AppBar(
        title: const Text("P2P COGNITIVE GIG PANEL"),
        automaticallyImplyLeading: false,
      ),
      body: panels[_currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        type: BottomNavigationBarType.fixed,
        backgroundColor: const Color(0xFF0F172A),
        selectedItemColor: Colors.emeraldAccent,
        unselectedItemColor: Colors.grey,
        selectedFontSize: 9,
        unselectedFontSize: 9,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.dashboard_outlined), label: "Cockpit"),
          BottomNavigationBarItem(icon: Icon(Icons.shield_outlined), label: "Escrows"),
          BottomNavigationBarItem(icon: Icon(Icons.account_balance_wallet_outlined), label: "Wallet"),
          BottomNavigationBarItem(icon: Icon(Icons.fingerprint_rounded), label: "Verification"),
        ],
      ),
    );
  }
}
