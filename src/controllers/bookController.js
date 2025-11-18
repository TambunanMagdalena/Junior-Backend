const BookService = require("../services/bookService");

class BookController {
  static async getAllBooks(req, res) {
    try {
      const { title, author, page = 1, limit = 10 } = req.query;

      const filters = {};
      if (title) filters.title = title;
      if (author) filters.author = author;

      const result = await BookService.getAllBooks(
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
      console.error("BookController - getAllBooks error:", error);
      res.status(500).json({
        error: "Internal server error",
      });
    }
  }

  static async getBookById(req, res) {
    try {
      const { id } = req.params;

      const result = await BookService.getBookById(id);

      if (!result.success) {
        return res.status(404).json({
          error: result.error,
        });
      }

      res.json({
        data: result.data,
      });
    } catch (error) {
      console.error("BookController - getBookById error:", error);
      res.status(500).json({
        error: "Internal server error",
      });
    }
  }

  static async createBook(req, res) {
    try {
      const { title, author, published_year, stock = 0, isbn } = req.body;

      const result = await BookService.createBook({
        title,
        author,
        published_year,
        stock,
        isbn,
      });

      if (!result.success) {
        return res.status(400).json({
          error: result.error,
        });
      }

      res.status(201).json({
        message: "Book created successfully",
        data: result.data,
      });
    } catch (error) {
      console.error("BookController - createBook error:", error);
      res.status(500).json({
        error: "Internal server error",
      });
    }
  }
}

module.exports = BookController;
