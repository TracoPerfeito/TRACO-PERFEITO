const mysql = require('mysql2')
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    connectTimeout: 1000000
});

// Testar conexão
pool.getConnection((err, conn) => {
    if (err) {
        console.log("Erro ao conectar:", err);
    } else {
        console.log("Conectado ao SGBD!");
        conn.release(); 
    }
});

module.exports = pool.promise();



// VERSAO ANTERIOR DO POOL (Giovani no teams)

/*[[]
const mysql = require('mysql2')
require('dotenv').config();
 try {
    var pool = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });
    console.log("Conexão estabelecida!");
 } catch (e) {
     console.log("Falha ao estabelecer a conexão!");     console.log(e);
 }
 
 module.exports = pool.promise();
 
*/
