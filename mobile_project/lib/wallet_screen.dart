import 'package:flutter/material.dart';
import 'models.dart';

class WalletScreen extends StatefulWidget {
  final UserProfile user;
  const WalletScreen({super.key, required this.user});

  @override
  State<WalletScreen> createState() => _WalletScreenState();
}

class _WalletScreenState extends State<WalletScreen> {
  late double _balance;
  late double _pending;
  final List<Map<String, dynamic>> _mockTransactions = [];

  @override
  void initState() {
    super.initState();
    _balance = widget.user.walletBalance;
    _pending = widget.user.pendingBalance;

    // Load custom initial transaction logs
    _mockTransactions.addAll([
      {
        "id": "TXN-739281",
        "type": "deposit",
        "desc": "Funding via GTBank Transfer",
        "amount": 150000.00,
        "status": "completed",
        "date": "July 15, 2026"
      },
      {
        "id": "TXN-102948",
        "type": "escrow_lock",
        "desc": "Escrow held: UI Redesign Project",
        "amount": -55000.00,
        "status": "escrow",
        "date": "July 12, 2026"
      },
      {
        "id": "TXN-902184",
        "type": "payout",
        "desc": "Escrow released: API integration",
        "amount": 95000.00,
        "status": "completed",
        "date": "July 08, 2026"
      }
    ]);
  }

  void _triggerWithdrawal() {
    final amountController = TextEditingController();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        backgroundColor: const Color(0xFF1E293B),
        title: const Text("Initiate Payout", style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              "Withdraw your funds natively to your linked bank account. Average processing speed: 2 minutes.",
              style: TextStyle(fontSize: 11, color: Colors.grey, height: 1.4),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: amountController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: "Amount (₦)",
                prefixIcon: Icon(Icons.account_balance_wallet_outlined, size: 18),
              ),
            )
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text("CANCEL", style: TextStyle(color: Colors.grey, fontSize: 11, fontWeight: FontWeight.bold)),
          ),
          ElevatedButton(
            onPressed: () {
              final val = double.tryParse(amountController.text) ?? 0.0;
              if (val <= 0 || val > _balance) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text("Invalid withdrawal amount or insufficient balance!"), backgroundColor: Colors.red),
                );
                return;
              }
              setState(() {
                _balance -= val;
                _mockTransactions.insert(0, {
                  "id": "TXN-${DateTime.now().millisecondsSinceEpoch.toString().substring(6)}",
                  "type": "withdrawal",
                  "desc": "Linked GTBank Withdrawal",
                  "amount": -val,
                  "status": "completed",
                  "date": "Just now"
                });
              });
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text("Payout of ₦${val.toStringAsFixed(2)} successfully queued for settlement!"),
                  backgroundColor: Colors.emerald,
                ),
              );
            },
            child: const Text("WITHDRAW"),
          )
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("SECURE COGNITIVE WALLET"),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Balance Card
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF064E3B), Color(0xFF0F172A)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.emerald.withOpacity(0.3), width: 1.5),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    "TOTAL AVAILABLE BALANCE",
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1,
                      color: Colors.emeraldAccent,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    "₦${_balance.toStringAsFixed(2)}",
                    style: const TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.black,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.between,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            "HELD IN ESCROW (PENDING)",
                            style: TextStyle(fontSize: 9, color: Colors.grey, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            "₦${_pending.toStringAsFixed(2)}",
                            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.orangeAccent),
                          ),
                        ],
                      ),
                      ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.emerald,
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                        ),
                        onPressed: _triggerWithdrawal,
                        icon: const Icon(Icons.arrow_upward_rounded, size: 14),
                        label: const Text("WITHDRAW FUNDS", style: TextStyle(fontSize: 10)),
                      )
                    ],
                  )
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Escrow explanation notice
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B).withOpacity(0.5),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFF334155), width: 1),
              ),
              child: Row(
                children: [
                  const Icon(Icons.gavel_rounded, color: Colors.amber, size: 20),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Text(
                      "Our smart escrows secure client deposits. Payouts are auto-released instantly once the customer signs off on milestone completions.",
                      style: TextStyle(fontSize: 10, color: Colors.grey, height: 1.4),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Ledger title
            const Text(
              "TRANSACTION LEDGER & COGNITIVE TRACES",
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.black,
                letterSpacing: 0.5,
                color: Colors.grey,
              ),
            ),
            const SizedBox(height: 12),

            // Transaction List
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _mockTransactions.length,
              itemBuilder: (context, index) {
                final txn = _mockTransactions[index];
                final isNegative = txn['amount'] < 0;
                final sign = isNegative ? "" : "+";
                final amtColor = isNegative ? Colors.orangeAccent : Colors.emeraldAccent;

                return Card(
                  margin: const EdgeInsets.only(bottom: 10),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  color: const Color(0xFF1E293B),
                  child: Padding(
                    padding: const EdgeInsets.all(14.0),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.between,
                      children: [
                        Row(
                          children: [
                            CircleAvatar(
                              backgroundColor: Colors.slate.shade800,
                              radius: 16,
                              child: Icon(
                                isNegative ? Icons.payment_rounded : Icons.add_circle_outline,
                                size: 14,
                                color: amtColor,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  txn['desc'],
                                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  "${txn['date']} • ${txn['id']}",
                                  style: const TextStyle(fontSize: 9, color: Colors.grey),
                                )
                              ],
                            )
                          ],
                        ),
                        Text(
                          "$sign₦${txn['amount'].abs().toStringAsFixed(2)}",
                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.black, color: amtColor),
                        )
                      ],
                    ),
                  ),
                );
              },
            )
          ],
        ),
      ),
    );
  }
}
