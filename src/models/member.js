const { getConnection, mssql } = require("../config/database");

class Member {
  static async create(memberData) {
    const pool = await getConnection();
    const { name, email, phone, address } = memberData;

    const result = await pool
      .request()
      .input("name", mssql.NVarChar, name)
      .input("email", mssql.NVarChar, email)
      .input("phone", mssql.NVarChar, phone)
      .input("address", mssql.NVarChar, address).query(`
        INSERT INTO members (name, email, phone, address) 
        OUTPUT INSERTED.*
        VALUES (@name, @email, @phone, @address)
      `);

    return result.recordset[0];
  }

  static async findByEmail(email) {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("email", mssql.NVarChar, email)
      .query("SELECT * FROM members WHERE email = @email");

    return result.recordset[0];
  }

  static async findById(id) {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("id", mssql.UniqueIdentifier, id)
      .query("SELECT * FROM members WHERE id = @id");

    return result.recordset[0];
  }

  static async getBorrowingCount(memberId) {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("memberId", mssql.UniqueIdentifier, memberId).query(`
        SELECT COUNT(*) as count 
        FROM borrowings 
        WHERE member_id = @memberId AND status = 'BORROWED'
      `);

    return result.recordset[0].count;
  }
}

module.exports = Member;
