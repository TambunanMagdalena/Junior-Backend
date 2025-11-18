const { getConnection, mssql } = require("../config/database");

class Book {
  static async findAll(filters = {}, page = 1, limit = 10) {
    const pool = await getConnection();
    const offset = (page - 1) * limit;

    let whereClause = "";

    const request = pool.request();

    if (filters.title) {
      request.input("title", mssql.NVarChar, `%${filters.title}%`);
      whereClause += ` AND title LIKE @title`;
    }

    if (filters.author) {
      request.input("author", mssql.NVarChar, `%${filters.author}%`);
      whereClause += ` AND author LIKE @author`;
    }

    const query = `
      SELECT 
        id, title, author, published_year, stock, isbn,
        created_at, updated_at,
        CASE WHEN stock > 0 THEN 1 ELSE 0 END as available
      FROM books 
      WHERE 1=1 ${whereClause}
      ORDER BY title
      OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY
    `;

    const countQuery = `
      SELECT COUNT(*) as total FROM books WHERE 1=1 ${whereClause}
    `;

    const [booksResult, countResult] = await Promise.all([
      request.query(query),
      request.query(countQuery),
    ]);

    return {
      data: booksResult.recordset,
      total: countResult.recordset[0].total,
      page,
      limit,
      totalPages: Math.ceil(countResult.recordset[0].total / limit),
    };
  }

  static async findById(id) {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("id", mssql.UniqueIdentifier, id)
      .query("SELECT * FROM books WHERE id = @id");

    return result.recordset[0];
  }

  static async updateStock(id, newStock) {
    const pool = await getConnection();
    await pool
      .request()
      .input("id", mssql.UniqueIdentifier, id)
      .input("stock", mssql.Int, newStock)
      .query(
        "UPDATE books SET stock = @stock, updated_at = GETDATE() WHERE id = @id"
      );
  }

  static async create(bookData) {
    const pool = await getConnection();
    const { title, author, published_year, stock, isbn } = bookData;

    const result = await pool
      .request()
      .input("title", mssql.NVarChar, title)
      .input("author", mssql.NVarChar, author)
      .input("published_year", mssql.Int, published_year)
      .input("stock", mssql.Int, stock)
      .input("isbn", mssql.NVarChar, isbn).query(`
        INSERT INTO books (title, author, published_year, stock, isbn) 
        OUTPUT INSERTED.*
        VALUES (@title, @author, @published_year, @stock, @isbn)
      `);

    return result.recordset[0];
  }
}

module.exports = Book;
