const MemberService = require("../services/memberService");

class MemberController {
  static async createMember(req, res) {
    try {
      const { name, email, phone, address } = req.body;

      const result = await MemberService.createMember({
        name,
        email,
        phone,
        address,
      });

      if (!result.success) {
        return res.status(400).json({
          error: result.error,
        });
      }

      res.status(201).json({
        message: "Member created successfully",
        data: result.data,
      });
    } catch (error) {
      console.error("MemberController - createMember error:", error);
      res.status(500).json({
        error: "Internal server error",
      });
    }
  }

  static async getMemberById(req, res) {
    try {
      const { id } = req.params;

      const result = await MemberService.getMemberById(id);

      if (!result.success) {
        return res.status(404).json({
          error: result.error,
        });
      }

      res.json({
        data: result.data,
      });
    } catch (error) {
      console.error("MemberController - getMemberById error:", error);
      res.status(500).json({
        error: "Internal server error",
      });
    }
  }
}

module.exports = MemberController;
