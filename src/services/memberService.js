const Member = require("../models/member");

class MemberService {
  static async createMember(memberData) {
    try {
      if (
        !memberData.name ||
        !memberData.email ||
        !memberData.phone ||
        !memberData.address
      ) {
        return {
          success: false,
          error: "All fields are required: name, email, phone, address",
        };
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(memberData.email)) {
        return {
          success: false,
          error: "Invalid email format",
        };
      }

      const phoneRegex = /^[0-9+\-\s()]{10,15}$/;
      if (!phoneRegex.test(memberData.phone)) {
        return {
          success: false,
          error: "Invalid phone format",
        };
      }

      const existingMember = await Member.findByEmail(memberData.email);
      if (existingMember) {
        return {
          success: false,
          error: "Email already registered",
        };
      }

      const newMember = await Member.create(memberData);

      return {
        success: true,
        data: newMember,
      };
    } catch (error) {
      console.error("MemberService - createMember error:", error);

      if (error.message.includes("UNIQUE constraint")) {
        return {
          success: false,
          error: "Email already registered",
        };
      }

      throw new Error("Failed to create member");
    }
  }

  static async getMemberById(id) {
    try {
      const member = await Member.findById(id);
      if (!member) {
        return {
          success: false,
          error: "Member not found",
        };
      }

      return {
        success: true,
        data: member,
      };
    } catch (error) {
      console.error("MemberService - getMemberById error:", error);
      throw new Error("Failed to fetch member");
    }
  }

  static async canBorrowBooks(memberId) {
    try {
      const borrowingCount = await Member.getBorrowingCount(memberId);
      return borrowingCount < 3;
    } catch (error) {
      console.error("MemberService - canBorrowBooks error:", error);
      throw new Error("Failed to check member borrowing status");
    }
  }

  static async getBorrowingCount(memberId) {
    try {
      return await Member.getBorrowingCount(memberId);
    } catch (error) {
      console.error("MemberService - getBorrowingCount error:", error);
      throw new Error("Failed to get borrowing count");
    }
  }
}

module.exports = MemberService;
