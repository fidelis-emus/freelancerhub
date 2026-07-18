class UserProfile {
  final String id;
  final String role;
  final String firstName;
  final String lastName;
  final String email;
  final String phone;
  final String state;
  final String city;
  final String address;
  final String kycStatus;
  final double rating;
  final int ratingCount;
  final String? bio;
  final String? avatarUrl;
  final double walletBalance;
  final double pendingBalance;

  UserProfile({
    required this.id,
    required this.role,
    required this.firstName,
    required this.lastName,
    required this.email,
    required this.phone,
    required this.state,
    required this.city,
    required this.address,
    required this.kycStatus,
    required this.rating,
    required this.ratingCount,
    this.bio,
    this.avatarUrl,
    required this.walletBalance,
    required this.pendingBalance,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      id: json['id'] ?? '',
      role: json['role'] ?? 'customer',
      firstName: json['firstName'] ?? '',
      lastName: json['lastName'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone'] ?? '',
      state: json['state'] ?? '',
      city: json['city'] ?? '',
      address: json['address'] ?? '',
      kycStatus: json['kycStatus'] ?? 'unverified',
      rating: (json['rating'] ?? 0.0).toDouble(),
      ratingCount: json['ratingCount'] ?? 0,
      bio: json['bio'],
      avatarUrl: json['avatarUrl'],
      walletBalance: (json['walletBalance'] ?? 0.0).toDouble(),
      pendingBalance: (json['pendingBalance'] ?? 0.0).toDouble(),
    );
  }
}

class ServicePackage {
  final String id;
  final String name;
  final String category;
  final String description;
  final double price;
  final String estimatedTime;

  ServicePackage({
    required this.id,
    required this.name,
    required this.category,
    required this.description,
    required this.price,
    required this.estimatedTime,
  });
}

class ChatMessage {
  final String id;
  final String senderId;
  final String text;
  final DateTime timestamp;
  final String? mediaUrl;

  ChatMessage({
    required this.id,
    required this.senderId,
    required this.text,
    required this.timestamp,
    this.mediaUrl,
  });
}

class Booking {
  final String id;
  final String customerId;
  final String customerName;
  final String freelancerId;
  final String freelancerName;
  final String category;
  final String subcategory;
  final String title;
  final String description;
  final double price;
  final String status; // pending, accepted, started, completed, cancelled
  final String paymentStatus; // pending, escrow, released
  final int currentStep; // 0: Assigned, 1: En Route, 2: Arrived, 3: In Progress, 4: Finished
  final List<ChatMessage> chatHistory;

  Booking({
    required this.id,
    required this.customerId,
    required this.customerName,
    required this.freelancerId,
    required this.freelancerName,
    required this.category,
    required this.subcategory,
    required this.title,
    required this.description,
    required this.price,
    required this.status,
    required this.paymentStatus,
    required this.currentStep,
    required this.chatHistory,
  });
}
