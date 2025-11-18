const { getConnection, mssql } = require("../config/database");

class Borrowing {
  static async create(borrowingData) {
    const pool = await getConnection();
    const { book_id, member_id } = borrowingData;

    const result = await pool
      .request()
      .input("book_id", mssql.UniqueIdentifier, book_id)
      .input("member_id", mssql.UniqueIdentifier, member_id).query(`
        INSERT INTO borrowings (book_id, member_id, borrow_date) 
        OUTPUT INSERTED.*
        VALUES (@book_id, @member_id, CAST(GETDATE() AS DATE))
      `);

    return result.recordset[0];
  }

  static async findById(id) {
    const pool = await getConnection();
    const result = await pool.request().input("id", mssql.UniqueIdentifier, id)
      .query(`
        SELECT b.*, bk.title, bk.author, m.name as member_name
        FROM borrowings b
        JOIN books bk ON b.book_id = bk.id
        JOIN members m ON b.member_id = m.id
        WHERE b.id = @id
      `);

    return result.recordset[0];
  }

  static async updateReturn(id) {
    const pool = await getConnection();
    await pool.request().input("id", mssql.UniqueIdentifier, id).query(`
        UPDATE borrowings 
        SET status = 'RETURNED', return_date = CAST(GETDATE() AS DATE)
        WHERE id = @id
      `);
  }

  static async findByMemberId(memberId, filters = {}, page = 1, limit = 10) {
    const pool = await getConnection();
    const offset = (page - 1) * limit;

    let whereClause = "WHERE b.member_id = @memberId";
    if (filters.status) {
      whereClause += " AND b.status = @status";
    }

    const query = `
      SELECT 
        b.*, 
        bk.title, 
        bk.author,
        bk.isbn,
        m.name as member_name
      FROM borrowings b
      JOIN books bk ON b.book_id = bk.id
      JOIN members m ON b.member_id = m.id
      ${whereClause}
      ORDER BY b.borrow_date DESC
      OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY
    `;

    const countQuery = `
      SELECT COUNT(*) as total 
      FROM borrowings b
      ${whereClause}
    `;

    const request = pool
      .request()
      .input("memberId", mssql.UniqueIdentifier, memberId);

    if (filters.status) {
      request.input("status", mssql.NVarChar, filters.status);
    }

    const [borrowingsResult, countResult] = await Promise.all([
      request.query(query),
      request.query(countQuery),
    ]);

    return {
      data: borrowingsResult.recordset,
      total: countResult.recordset[0].total,
      page,
      limit,
      totalPages: Math.ceil(countResult.recordset[0].total / limit),
    };
  }
}

module.exports = Borrowing;
