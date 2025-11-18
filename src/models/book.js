const { getConnection } = require("../config/database");

class Book {
  static async findAll(filters = {}, page = 1, limit = 10) {
    const pool = await getConnection();
    const offset = (page - 1) * limit;

    let whereClause = "";
    const params = [];

    if (filters.title) {
      params.push(`%${filters.title}%`);
      whereClause += ` AND title LIKE '%' + @title + '%'`;
    }

    if (filters.author) {
      params.push(`%${filters.author}%`);
      whereClause += ` AND author LIKE '%' + @author + '%'`;
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

    const request = pool.request();

    if (filters.title) request.input("title", sql.NVarChar, filters.title);
    if (filters.author) request.input("author", sql.NVarChar, filters.author);

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
      .input("id", sql.UniqueIdentifier, id)
      .query("SELECT * FROM books WHERE id = @id");

    return result.recordset[0];
  }

  static async updateStock(id, newStock) {
    const pool = await getConnection();
    await pool
      .request()
      .input("id", sql.UniqueIdentifier, id)
      .input("stock", sql.Int, newStock)
      .query(
        "UPDATE books SET stock = @stock, updated_at = GETDATE() WHERE id = @id"
      );
  }
}

module.exports = Book;
