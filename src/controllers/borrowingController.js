const BorrowingService = require("../services/borrowingService");

class BorrowingController {
  static async borrowBook(req, res) {
    try {
      const { book_id, member_id } = req.body;

      if (!book_id || !member_id) {
        return res.status(400).json({
          error: "book_id and member_id are required",
        });
      }

      const result = await BorrowingService.borrowBook({ book_id, member_id });

      if (!result.success) {
        return res.status(400).json({
          error: result.error,
        });
      }

      res.status(201).json({
        message: "Book borrowed successfully",
        data: result.data,
      });
    } catch (error) {
      console.error("BorrowingController - borrowBook error:", error);
      res.status(500).json({
        error: "Internal server error",
      });
    }
  }

  static async returnBook(req, res) {
    try {
      const { id } = req.params;

      const result = await BorrowingService.returnBook(id);

      if (!result.success) {
        return res.status(400).json({
          error: result.error,
        });
      }

      res.json({
        message: result.message,
      });
    } catch (error) {
      console.error("BorrowingController - returnBook error:", error);
      res.status(500).json({
        error: "Internal server error",
      });
    }
  }

  static async getMemberBorrowings(req, res) {
    try {
      const { id } = req.params;
      const { status, page = 1, limit = 10 } = req.query;

      const filters = {};
      if (status) filters.status = status;

      const result = await BorrowingService.getMemberBorrowings(
        id,
        filters,
        parseInt(page),
        parseInt(limit)
      );

      if (!result.success) {
        return res.status(404).json({
          error: result.error,
        });
      }

      res.json({
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error("BorrowingController - getMemberBorrowings error:", error);
      res.status(500).json({
        error: "Internal server error",
      });
    }
  }
}

module.exports = BorrowingController;
