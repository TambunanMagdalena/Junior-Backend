const { getConnection, closeConnection } = require("./config/database");

async function testConnection() {
  let connection;
  try {
    connection = await getConnection();

    const dbResult = await connection
      .request()
      .query("SELECT DB_NAME() as dbname");
    console.log("Current database:", dbResult.recordset[0].dbname);

    const versionResult = await connection
      .request()
      .query("SELECT @@VERSION as version");
    console.log(" SQL Server connection successful");

    const dbsResult = await connection.request().query(`
      SELECT name FROM sys.databases 
      WHERE name NOT IN ('master', 'tempdb', 'model', 'msdb')
    `);
    console.log(
      " Available databases:",
      dbsResult.recordset.map((db) => db.name)
    );
  } catch (err) {
    console.error(" Database test failed:", err.message);

    if (err.code) {
      console.error("Error code:", err.code);
    }
    if (err.number) {
      console.error("SQL Server error number:", err.number);
    }
  } finally {
    if (connection) {
      await closeConnection();
    }
  }
}

testConnection();
