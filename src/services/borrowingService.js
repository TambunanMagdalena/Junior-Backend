const { getConnection, mssql } = require("../config/database");
const Borrowing = require("../models/borrowing");
const BookService = require("./bookService");
const MemberService = require("./memberService");

class BorrowingService {
  static async borrowBook(borrowData) {
    const { book_id, member_id } = borrowData;
    const pool = await getConnection();
    const transaction = new mssql.Transaction(pool);

    try {
      await transaction.begin();

      const bookResult = await transaction
        .request()
        .input("book_id", mssql.UniqueIdentifier, book_id)
        .query("SELECT * FROM books WHERE id = @book_id");

      if (bookResult.recordset.length === 0) {
        await transaction.rollback();
        return {
          success: false,
          error: "Book not found",
        };
      }

      const book = bookResult.recordset[0];
      if (book.stock <= 0) {
        await transaction.rollback();
        return {
          success: false,
          error: "Book is out of stock",
        };
      }

      const memberResult = await transaction
        .request()
        .input("member_id", mssql.UniqueIdentifier, member_id)
        .query("SELECT * FROM members WHERE id = @member_id");

      if (memberResult.recordset.length === 0) {
        await transaction.rollback();
        return {
          success: false,
          error: "Member not found",
        };
      }

      const borrowingCountResult = await transaction
        .request()
        .input("member_id", mssql.UniqueIdentifier, member_id).query(`
          SELECT COUNT(*) as count 
          FROM borrowings 
          WHERE member_id = @member_id AND status = 'BORROWED'
        `);

      const borrowingCount = borrowingCountResult.recordset[0].count;
      if (borrowingCount >= 3) {
        await transaction.rollback();
        return {
          success: false,
          error: "Member cannot borrow more than 3 books",
        };
      }

      await transaction
        .request()
        .input("book_id", mssql.UniqueIdentifier, book_id)
        .query(
          "UPDATE books SET stock = stock - 1, updated_at = GETDATE() WHERE id = @book_id"
        );

      const borrowingResult = await transaction
        .request()
        .input("book_id", mssql.UniqueIdentifier, book_id)
        .input("member_id", mssql.UniqueIdentifier, member_id).query(`
          INSERT INTO borrowings (book_id, member_id, borrow_date) 
          OUTPUT INSERTED.*
          VALUES (@book_id, @member_id, CAST(GETDATE() AS DATE))
        `);

      await transaction.commit();

      return {
        success: true,
        data: borrowingResult.recordset[0],
      };
    } catch (error) {
      await transaction.rollback();
      console.error("BorrowingService - borrowBook error:", error);

      if (error.message.includes("FOREIGN KEY constraint")) {
        return {
          success: false,
          error: "Invalid book or member ID",
        };
      }

      throw new Error("Failed to borrow book");
    }
  }

  static async returnBook(borrowingId) {
    const pool = await getConnection();
    const transaction = new mssql.Transaction(pool);

    try {
      await transaction.begin();

      const borrowingResult = await transaction
        .request()
        .input("id", mssql.UniqueIdentifier, borrowingId).query(`
          SELECT b.*, bk.title 
          FROM borrowings b
          JOIN books bk ON b.book_id = bk.id
          WHERE b.id = @id
        `);

      if (borrowingResult.recordset.length === 0) {
        await transaction.rollback();
        return {
          success: false,
          error: "Borrowing record not found",
        };
      }

      const borrowing = borrowingResult.recordset[0];

      if (borrowing.status === "RETURNED") {
        await transaction.rollback();
        return {
          success: false,
          error: "Book already returned",
        };
      }

      await transaction
        .request()
        .input("book_id", mssql.UniqueIdentifier, borrowing.book_id)
        .query(
          "UPDATE books SET stock = stock + 1, updated_at = GETDATE() WHERE id = @book_id"
        );

      await transaction
        .request()
        .input("id", mssql.UniqueIdentifier, borrowingId).query(`
          UPDATE borrowings 
          SET status = 'RETURNED', return_date = CAST(GETDATE() AS DATE), updated_at = GETDATE()
          WHERE id = @id
        `);

      await transaction.commit();

      return {
        success: true,
        message: "Book returned successfully",
      };
    } catch (error) {
      await transaction.rollback();
      console.error("BorrowingService - returnBook error:", error);
      throw new Error("Failed to return book");
    }
  }

  static async getMemberBorrowings(
    memberId,
    filters = {},
    page = 1,
    limit = 10
  ) {
    try {
      // Check if member exists
      const member = await MemberService.getMemberById(memberId);
      if (!member.success) {
        return member;
      }

      const result = await Borrowing.findByMemberId(
        memberId,
        filters,
        page,
        limit
      );

      return {
        success: true,
        data: result.data.map((borrowing) => ({
          id: borrowing.id,
          book_id: borrowing.book_id,
          member_id: borrowing.member_id,
          book_title: borrowing.title,
          book_author: borrowing.author,
          book_isbn: borrowing.isbn,
          member_name: borrowing.member_name,
          borrow_date: borrowing.borrow_date,
          return_date: borrowing.return_date,
          status: borrowing.status,
          created_at: borrowing.created_at,
        })),
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      };
    } catch (error) {
      console.error("BorrowingService - getMemberBorrowings error:", error);
      throw new Error("Failed to fetch member borrowings");
    }
  }

  static async getBorrowingById(id) {
    try {
      const borrowing = await Borrowing.findById(id);
      if (!borrowing) {
        return {
          success: false,
          error: "Borrowing record not found",
        };
      }

      return {
        success: true,
        data: borrowing,
      };
    } catch (error) {
      console.error("BorrowingService - getBorrowingById error:", error);
      throw new Error("Failed to fetch borrowing record");
    }
  }
}

module.exports = BorrowingService;
