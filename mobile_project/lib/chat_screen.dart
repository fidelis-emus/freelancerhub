import 'package:flutter/material.dart';
import 'models.dart';

class ChatScreen extends StatefulWidget {
  final Booking booking;
  final UserProfile currentUser;

  const ChatScreen({super.key, required this.booking, required this.currentUser});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final List<ChatMessage> _messages = [];
  final _controller = TextEditingController();
  final _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _messages.addAll([
      ChatMessage(
        id: "msg-1",
        senderId: widget.booking.freelancerId,
        text: "Hello! Thank you for assigning the project to me. I have reviewed your guidelines.",
        timestamp: DateTime.now().subtract(const Duration(hours: 3)),
      ),
      ChatMessage(
        id: "msg-2",
        senderId: widget.booking.customerId,
        text: "Excellent! Let's ensure the escrow payment is fully secured before commencing work.",
        timestamp: DateTime.now().subtract(const Duration(hours: 2)),
      ),
    ]);
  }

  void _sendMessage() {
    final text = _controller.text.trim();
    if (text.isEmpty) return;

    setState(() {
      _messages.add(
        ChatMessage(
          id: "msg-${DateTime.now().millisecondsSinceEpoch}",
          senderId: widget.currentUser.id,
          text: text,
          timestamp: DateTime.now(),
        ),
      );
    });

    _controller.clear();
    Future.delayed(const Duration(milliseconds: 100), () {
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    final isCustomer = widget.currentUser.role == "customer";
    final counterpartName = isCustomer ? widget.booking.freelancerName : widget.booking.customerName;

    return Scaffold(
      appBar: AppBar(
        title: Column(
          children: [
            Text("SECURE ROOM: $counterpartName"),
            const SizedBox(height: 2),
            Text(
              "Escrow Protection Active • Contract #${widget.booking.id.substring(0, 8).toUpperCase()}",
              style: const TextStyle(fontSize: 8, color: Colors.emeraldAccent),
            )
          ],
        ),
      ),
      body: Column(
        children: [
          // Project State Banner
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            color: const Color(0xFF1E293B),
            border: const Border(bottom: BorderSide(color: Color(0xFF334155), width: 1)),
            child: Row(
              children: [
                const Icon(Icons.info_outline_rounded, color: Colors.emerald, size: 16),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    "Milestone Escrow: ₦${widget.booking.price.toStringAsFixed(2)} - Status: ${widget.booking.paymentStatus.toUpperCase()}",
                    style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: Colors.emerald.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: const Text(
                    "PROTECTED",
                    style: TextStyle(color: Colors.emerald, fontSize: 8, fontWeight: FontWeight.bold),
                  ),
                )
              ],
            ),
          ),

          // Messages List
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final msg = _messages[index];
                final isMe = msg.senderId == widget.currentUser.id;
                final bubbleBg = isMe ? Colors.emerald.shade800 : const Color(0xFF1E293B);
                final align = isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start;

                return Align(
                  alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    decoration: BoxDecoration(
                      color: bubbleBg,
                      borderRadius: BorderRadius.only(
                        topLeft: const Radius.circular(12),
                        topRight: const Radius.circular(12),
                        bottomLeft: Radius.circular(isMe ? 12 : 0),
                        bottomRight: Radius.circular(isMe ? 0 : 12),
                      ),
                      border: Border.all(
                        color: isMe ? Colors.emerald.shade700 : const Color(0xFF334155),
                        width: 1,
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: align,
                      children: [
                        Text(
                          msg.text,
                          style: const TextStyle(fontSize: 12, height: 1.4, color: Colors.white),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          "${msg.timestamp.hour.toString().padLeft(2, '0')}:${msg.timestamp.minute.toString().padLeft(2, '0')}",
                          style: const TextStyle(fontSize: 8, color: Colors.grey),
                        )
                      ],
                    ),
                  ),
                );
              },
            ),
          ),

          // Message Input Panel
          Container(
            padding: const EdgeInsets.all(12),
            decoration: const BoxDecoration(
              color: Color(0xFF0F172A),
              border: Border(top: BorderSide(color: Color(0xFF334155), width: 1)),
            ),
            child: Row(
              children: [
                IconButton(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text("Mock File Upload: Base64 media converter successfully attached.")),
                    );
                  },
                  icon: const Icon(Icons.add_photo_alternate_outlined, color: Colors.grey),
                ),
                Expanded(
                  child: TextField(
                    controller: _controller,
                    style: const TextStyle(fontSize: 12),
                    decoration: const InputDecoration(
                      hintText: "Type message or contract change request...",
                      border: InputBorder.none,
                      enabledBorder: InputBorder.none,
                      focusedBorder: InputBorder.none,
                      contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    ),
                    onSubmitted: (val) => _sendMessage(),
                  ),
                ),
                const SizedBox(width: 8),
                CircleAvatar(
                  backgroundColor: Colors.emerald,
                  radius: 20,
                  child: IconButton(
                    onPressed: _sendMessage,
                    icon: const Icon(Icons.send_rounded, size: 16, color: Colors.white),
                  ),
                )
              ],
            ),
          )
        ],
      ),
    );
  }
}
