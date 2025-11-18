const Book = require("../models/book");

class BookService {
  static async getAllBooks(filters = {}, page = 1, limit = 10) {
    try {
      const result = await Book.findAll(filters, page, limit);

      return {
        success: true,
        data: result.data.map((book) => ({
          id: book.id,
          title: book.title,
          author: book.author,
          published_year: book.published_year,
          stock: book.stock,
          isbn: book.isbn,
          available: book.available === 1,
        })),
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      };
    } catch (error) {
      console.error("BookService - getAllBooks error:", error);
      throw new Error("Failed to fetch books");
    }
  }

  static async getBookById(id) {
    try {
      const book = await Book.findById(id);
      if (!book) {
        return {
          success: false,
          error: "Book not found",
        };
      }

      return {
        success: true,
        data: {
          ...book,
          available: book.stock > 0,
        },
      };
    } catch (error) {
      console.error("BookService - getBookById error:", error);
      throw new Error("Failed to fetch book");
    }
  }

  static async decreaseStock(bookId) {
    try {
      const book = await Book.findById(bookId);
      if (!book) {
        throw new Error("Book not found");
      }

      if (book.stock <= 0) {
        throw new Error("Book out of stock");
      }

      await Book.updateStock(bookId, book.stock - 1);
      return { success: true };
    } catch (error) {
      console.error("BookService - decreaseStock error:", error);
      throw error;
    }
  }

  static async increaseStock(bookId) {
    try {
      const book = await Book.findById(bookId);
      if (!book) {
        throw new Error("Book not found");
      }

      await Book.updateStock(bookId, book.stock + 1);
      return { success: true };
    } catch (error) {
      console.error("BookService - increaseStock error:", error);
      throw error;
    }
  }
}

module.exports = BookService;
