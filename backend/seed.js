// ============================================================
// Seed script - gumagawa ng demo accounts sa barangay_san_jose
// Run: npm run seed   (sa backend folder)
// ============================================================

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function main() {
  const pool = mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'barangay_san_jose',
  });

  const adminHash = await bcrypt.hash('admin123', 10);
  const residentHash = await bcrypt.hash('123456', 10);

  const [existing] = await pool.query('SELECT user_id FROM users LIMIT 1');
  if (existing.length > 0) {
    console.log('May users na — hindi na muli ang seeding.');
    await pool.end();
    return;
  }

  await pool.query(
    `INSERT INTO users (full_name, email, password, role, address, purok, birthdate, civil_status, is_verified)
     VALUES
       ('Barangay Administrator', 'admin@barangay.gov', ?, 'admin', '', '', NULL, NULL, 1),
       ('Juan Dela Cruz', 'juan@demo.com', ?, 'resident', 'Purok 2, Barangay San Jose', '2', '1995-06-15', 'Single', 1)`,
    [adminHash, residentHash]
  );

  console.log('Seed OK: admin@barangay.gov / admin123 at juan@demo.com / 123456');
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
