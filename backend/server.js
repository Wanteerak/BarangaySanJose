// ============================================================
// Barangay San Jose System - Express Backend
// Database: barangay_san_jose (MySQL sa XAMPP, port 3306)
// Server: http://localhost:3001
// ============================================================

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
require('dotenv').config();

const nodemailer = require('nodemailer');

// Mailer (Gmail SMTP with App Password) — configure via backend/.env
const mailer = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || '',
    pass: process.env.GMAIL_APP_PASSWORD || '',
  },
});

async function sendOtpEmail(to, otp) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn('GMAIL_USER / GMAIL_APP_PASSWORD not set — OTP not emailed. OTP:', otp);
    return false;
  }
  try {
    await mailer.sendMail({
      from: `"Barangay San Jose" <${process.env.GMAIL_USER}>`,
      to,
      subject: 'Barangay San Jose — Email Verification OTP',
      html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#ea580c">Barangay San Jose — Main Hall</h2>
        <p>Your one-time password (OTP) for email verification is:</p>
        <div style="font-size:2rem;font-weight:800;letter-spacing:6px;color:#ea580c;text-align:center;padding:1rem;background:#fff7f2;border-radius:10px">${otp}</div>
        <p style="color:#64748b;font-size:0.9rem">This code expires in 10 minutes. Do not share it with anyone.</p>
      </div>`,
    });
    return true;
  } catch (e) {
    console.error('sendOtpEmail error:', e.message);
    return false;
  }
}
const PORT = 3001;
const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ------------------------------------------------------------
// MySQL connection pool
// ------------------------------------------------------------
const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'barangay_san_jose',
  waitForConnections: true,
  connectionLimit: 10,
});

// ------------------------------------------------------------
// Simple in-memory session tokens (sapat na para sa demo/capstone)
// ------------------------------------------------------------
const sessions = new Map(); // token -> user_id

function makeToken() {
  return crypto.randomBytes(24).toString('hex');
}

function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.replace(/^Bearer\s+/i, '');
  const userId = sessions.get(token);
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Not logged in.' });
  }
  req.userId = userId;
  next();
}

async function getUserById(userId) {
  const [rows] = await pool.query(
    'SELECT user_id, full_name, email, role, address, purok, birthdate, civil_status FROM users WHERE user_id = ?',
    [userId]
  );
  return rows[0] || null;
}

// strips password hash
function publicUser(u) {
  if (!u) return null;
  const { password, ...rest } = u;
  return rest;
}

// ============================================================
// AUTH
// ============================================================

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { full_name, email, password, role, address, purok, birthdate, civil_status, id_photo } = req.body;

    if (!full_name || !email || !password) {
      return res.json({ success: false, message: 'Full name, email, and password are required.' });
    }
    if (role !== 'admin' && !id_photo) {
      return res.json({ success: false, message: 'Valid ID (proof of identity) is required for registration.' });
    }

    const [existing] = await pool.query('SELECT user_id, is_verified FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      if (existing[0].is_verified === 0) {
        // Re-send OTP for unverified account
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        const expires = new Date(Date.now() + 10 * 60 * 1000);
        await pool.query('UPDATE users SET otp_code = ?, otp_expires = ? WHERE email = ?', [otp, expires, email]);
        await sendOtpEmail(email, otp);
        return res.json({ success: true, pending: true, message: 'Account exists but unverified. A new OTP has been sent to your email.' });
      }
      return res.json({ success: false, message: 'Email is already registered.' });
    }

    const hash = await bcrypt.hash(password, 10);
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    const [result] = await pool.query(
      `INSERT INTO users (full_name, email, password, role, address, purok, birthdate, civil_status, id_photo, is_verified, otp_code, otp_expires, account_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)`,
      [full_name, email, hash, role === 'admin' ? 'admin' : 'resident', address || '', purok || '', birthdate || null, civil_status || null, id_photo || null, otp, expires, role === 'admin' ? 'approved' : 'pending']
    );

    await sendOtpEmail(email, otp);

    const msg = (role === 'admin')
      ? 'Registration successful. Please verify your email using the OTP sent to ' + email + '.'
      : 'Registration submitted. Please verify your email using the OTP sent to ' + email + '. Your account will be reviewed by the admin before you can log in.';

    return res.json({
      success: true,
      pending: true,
      message: msg,
      data: { user_id: result.insertId, email },
    });
  } catch (err) {
    console.error('register error:', err);
    return res.status(500).json({ success: false, message: 'Registration failed.' });
  }
});

// POST /api/auth/verify-otp
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.json({ success: false, message: 'Email and OTP are required.' });
    }
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];
    if (!user) return res.json({ success: false, message: 'Account not found.' });
    if (user.is_verified === 1) return res.json({ success: true, message: 'Account already verified. You can login.' });
    if (!user.otp_code || user.otp_code !== String(otp).trim()) {
      return res.json({ success: false, message: 'Invalid OTP code.' });
    }
    if (!user.otp_expires || new Date(user.otp_expires) < new Date()) {
      return res.json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }
    await pool.query('UPDATE users SET is_verified = 1, otp_code = NULL, otp_expires = NULL WHERE email = ?', [email]);
    return res.json({ success: true, message: 'Email verified successfully. You can now login.' });
  } catch (err) {
    console.error('verify-otp error:', err);
    return res.status(500).json({ success: false, message: 'Verification failed.' });
  }
});

// POST /api/auth/resend-otp
app.post('/api/auth/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.json({ success: false, message: 'Email is required.' });
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];
    if (!user) return res.json({ success: false, message: 'Account not found.' });
    if (user.is_verified === 1) return res.json({ success: true, message: 'Account already verified.' });
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expires = new Date(Date.now() + 10 * 60 * 1000);
    await pool.query('UPDATE users SET otp_code = ?, otp_expires = ? WHERE email = ?', [otp, expires, email]);
    await sendOtpEmail(email, otp);
    return res.json({ success: true, message: 'A new OTP has been sent to your email.' });
  } catch (err) {
    console.error('resend-otp error:', err);
    return res.status(500).json({ success: false, message: 'Failed to resend OTP.' });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];
    if (!user) {
      return res.json({ success: false, message: 'Invalid email or password.' });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.json({ success: false, message: 'Invalid email or password.' });
    }

    if (user.is_verified === 0) {
      return res.json({ success: false, pending: true, message: 'Your email is not verified yet. Please enter the OTP sent to your email.', email: user.email });
    }

    if (user.account_status === 'pending') {
      return res.json({ success: false, message: 'Your account is pending admin approval. Please wait for the administrator to review your registration.' });
    }
    if (user.account_status === 'rejected') {
      return res.json({ success: false, message: 'Your registration was declined.' + (user.decline_reason ? ' Reason: ' + user.decline_reason : '') });
    }

    const token = makeToken();
    sessions.set(token, user.user_id);

    return res.json({
      success: true,
      data: { token, user: publicUser(user) },
    });
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ success: false, message: 'Login failed.' });
  }
});

// ============================================================
// REQUESTS
// ============================================================

// ============================================================
// USER MANAGEMENT (admin: approve/decline registrations)
// ============================================================

// GET /api/users/pending  (admin)
app.get('/api/users/pending', auth, async (req, res) => {
  try {
    const user = await getUserById(req.userId);
    if (!user || user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin only.' });
    const [rows] = await pool.query(
      `SELECT user_id, full_name, email, address, purok, birthdate, civil_status, id_photo, is_verified, account_status, decline_reason, created_at
       FROM users WHERE account_status = 'pending' ORDER BY created_at DESC`
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('pending users error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load pending users.' });
  }
});

// GET /api/users  (admin) — lahat ng users
app.get('/api/users', auth, async (req, res) => {
  try {
    const user = await getUserById(req.userId);
    if (!user || user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin only.' });
    const [rows] = await pool.query(
      `SELECT user_id, full_name, email, role, address, purok, birthdate, civil_status, id_photo, is_verified, account_status, decline_reason, created_at
       FROM users ORDER BY created_at DESC`
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('all users error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load users.' });
  }
});

// PUT /api/users/approve  (admin)
app.put('/api/users/approve', auth, async (req, res) => {
  try {
    const user = await getUserById(req.userId);
    if (!user || user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin only.' });
    const { user_id } = req.body;
    if (!user_id) return res.json({ success: false, message: 'user_id is required.' });
    const [result] = await pool.query(
      "UPDATE users SET account_status = 'approved', decline_reason = NULL WHERE user_id = ?",
      [user_id]
    );
    if (result.affectedRows === 0) return res.json({ success: false, message: 'User not found.' });
    return res.json({ success: true, message: 'Account approved.' });
  } catch (err) {
    console.error('approve user error:', err);
    return res.status(500).json({ success: false, message: 'Failed to approve.' });
  }
});

// PUT /api/users/decline  (admin)
app.put('/api/users/decline', auth, async (req, res) => {
  try {
    const user = await getUserById(req.userId);
    if (!user || user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin only.' });
    const { user_id, reason } = req.body;
    if (!user_id) return res.json({ success: false, message: 'user_id is required.' });
    const [result] = await pool.query(
      "UPDATE users SET account_status = 'rejected', decline_reason = ? WHERE user_id = ?",
      [reason || 'Registration declined by administrator.', user_id]
    );
    if (result.affectedRows === 0) return res.json({ success: false, message: 'User not found.' });
    return res.json({ success: true, message: 'Account declined.' });
  } catch (err) {
    console.error('decline user error:', err);
    return res.status(500).json({ success: false, message: 'Failed to decline.' });
  }
});

// ============================================================
// REQUESTS
// ============================================================

function makeRequestCode() {
  return 'BSJ-' + Math.floor(100000 + Math.random() * 900000);
}

// POST /api/requests  (resident submits)
app.post('/api/requests', auth, async (req, res) => {
  try {
    const { type, purpose, id_request_type, is_voter, first_name, middle_name, surname, birth_place, contact_number, emergency_contact_name, emergency_contact_number, requirement_type, id_photo, front_photo, back_photo, hoa_cert, requirement_doc, complete_name, complete_address, date_of_birth, priority, certified, office_agency, beneficiary_name, beneficiary_relation, child_name, father_name, mother_name, guardian_name, relationship, partner1_name, partner1_birthday, partner2_name, partner2_birthday, shared_residence, years_living, cohabitation_started, children_info } = req.body;
    if (!type || !purpose) {
      return res.json({ success: false, message: 'Type and purpose are required.' });
    }

    const code = makeRequestCode();
    await pool.query(
      `INSERT INTO requests (request_code, user_id, type, id_request_type, is_voter, purpose, first_name, middle_name, surname, birth_place, contact_number, emergency_contact_name, emergency_contact_number, requirement_type, id_photo, front_photo, back_photo, hoa_cert, requirement_doc, complete_name, complete_address, date_of_birth, priority, certified, office_agency, beneficiary_name, beneficiary_relation, child_name, father_name, mother_name, guardian_name, relationship, partner1_name, partner1_birthday, partner2_name, partner2_birthday, shared_residence, years_living, cohabitation_started, children_info)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [code, req.userId, type, id_request_type || null, is_voter === true || is_voter === 'true' || is_voter === 1 || is_voter === '1' ? 1 : (is_voter === false || is_voter === 'false' || is_voter === 0 || is_voter === '0' ? 0 : null), purpose, first_name || null, middle_name || null, surname || null, birth_place || null, contact_number || null, emergency_contact_name || null, emergency_contact_number || null, requirement_type || null, id_photo || null, front_photo || null, back_photo || null, hoa_cert || null, requirement_doc || null, complete_name || null, complete_address || null, date_of_birth || null, priority || null, certified === true || certified === 'true' || certified === 1 ? 1 : null, office_agency || null, beneficiary_name || null, beneficiary_relation || null, child_name || null, father_name || null, mother_name || null, guardian_name || null, relationship || null, partner1_name || null, partner1_birthday || null, partner2_name || null, partner2_birthday || null, shared_residence || null, years_living || null, cohabitation_started || null, children_info || null]
    );

    const [rows] = await pool.query('SELECT * FROM requests WHERE request_code = ?', [code]);
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('submit request error:', err);
    return res.status(500).json({ success: false, message: 'Failed to submit request.' });
  }
});

// GET /api/requests/my  (resident's own requests)
app.get('/api/requests/my', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT request_id AS id, request_code, user_id, type, id_request_type, is_voter, purpose, first_name, middle_name, surname, birth_place, contact_number, emergency_contact_name, emergency_contact_number, requirement_type, id_photo, front_photo, back_photo, hoa_cert, requirement_doc, complete_name, complete_address, date_of_birth, priority, certified, office_agency, beneficiary_name, beneficiary_relation, child_name, father_name, mother_name, guardian_name, relationship, partner1_name, partner1_birthday, partner2_name, partner2_birthday, shared_residence, years_living, cohabitation_started, children_info, reject_reason, status, scheduled_date, created_at FROM requests WHERE user_id = ? ORDER BY created_at DESC',
      [req.userId]
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('my requests error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load requests.' });
  }
});

// GET /api/requests  (admin: all requests, with resident names)
app.get('/api/requests', auth, async (req, res) => {
  try {
    const user = await getUserById(req.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin only.' });
    }

    const [rows] = await pool.query(
      `SELECT r.request_id AS id, r.request_code, r.user_id, u.full_name,
              r.type, r.id_request_type, r.is_voter, r.purpose, r.first_name, r.middle_name, r.surname, r.birth_place, r.contact_number, r.emergency_contact_name, r.emergency_contact_number,
              r.requirement_type, r.id_photo, r.front_photo, r.back_photo, r.hoa_cert, r.requirement_doc,
              r.complete_name, r.complete_address, r.date_of_birth, r.priority, r.certified, r.office_agency, r.beneficiary_name, r.beneficiary_relation,
              r.child_name, r.father_name, r.mother_name, r.guardian_name, r.relationship,
              r.partner1_name, r.partner1_birthday, r.partner2_name, r.partner2_birthday, r.shared_residence, r.years_living, r.cohabitation_started, r.children_info,
              r.reject_reason, r.status, r.scheduled_date, r.created_at
       FROM requests r
       JOIN users u ON u.user_id = r.user_id
       ORDER BY r.created_at DESC`
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('all requests error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load requests.' });
  }
});

// PUT /api/requests/action  (admin: approve / reject / schedule-release)
app.put('/api/requests/action', auth, async (req, res) => {
  try {
    const user = await getUserById(req.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin only.' });
    }

    const { action, request_id, schedule_date, reject_reason } = req.body;

    let status;
    let scheduled = null;
    if (action === 'approve') status = 'approved';
    else if (action === 'reject') {
      status = 'rejected';
      if (!reject_reason || !String(reject_reason).trim()) {
        return res.json({ success: false, message: 'Reject reason (comment) is required.' });
      }
    }
    else if (action === 'schedule') {
      status = 'released';
      scheduled = schedule_date || new Date();
    } else {
      return res.json({ success: false, message: 'Unknown action.' });
    }

    const [result] = await pool.query(
      `UPDATE requests SET status = ?, scheduled_date = COALESCE(?, scheduled_date), reject_reason = ${action === 'reject' ? '?' : 'reject_reason'} WHERE request_id = ?`,
      action === 'reject'
        ? [status, null, String(reject_reason).trim(), request_id]
        : [status, scheduled, request_id]
    );
    if (result.affectedRows === 0) {
      return res.json({ success: false, message: 'Request not found.' });
    }

    const [rows] = await pool.query('SELECT * FROM requests WHERE request_id = ?', [request_id]);
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('admin action error:', err);
    return res.status(500).json({ success: false, message: 'Action failed.' });
  }
});

// ============================================================
// PROFILE
// ============================================================

// GET /api/profile
app.get('/api/profile', auth, async (req, res) => {
  try {
    const user = await getUserById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    return res.json({ success: true, data: user });
  } catch (err) {
    console.error('get profile error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load profile.' });
  }
});

// PUT /api/profile
app.put('/api/profile', auth, async (req, res) => {
  try {
    const { full_name, email, address, purok, birthdate, civil_status } = req.body;

    const [result] = await pool.query(
      `UPDATE users SET full_name = ?, email = ?, address = ?, purok = ?, birthdate = ?, civil_status = ?
       WHERE user_id = ?`,
      [full_name, email, address || '', purok || '', birthdate || null, civil_status || null, req.userId]
    );

    const user = await getUserById(req.userId);
    return res.json({ success: true, data: user, affected: result.affectedRows });
  } catch (err) {
    console.error('update profile error:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.json({ success: false, message: 'Email is already in use.' });
    }
    return res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
});

// ============================================================
// MESSAGES (Live Chat)
// ============================================================

// GET /api/messages/:partnerId
app.get('/api/messages/:partnerId', auth, async (req, res) => {
  try {
    const partnerId = Number(req.params.partnerId);
    const [rows] = await pool.query(
      `SELECT message_id AS id, sender_id, receiver_id, message, created_at
       FROM messages
       WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
       ORDER BY created_at ASC`,
      [req.userId, partnerId, partnerId, req.userId]
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('get messages error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load messages.' });
  }
});

// POST /api/messages
app.post('/api/messages', auth, async (req, res) => {
  try {
    const { receiver_id, message } = req.body;
    if (!receiver_id || !message) {
      return res.json({ success: false, message: 'Receiver and message are required.' });
    }

    const [result] = await pool.query(
      'INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)',
      [req.userId, receiver_id, message]
    );

    const [rows] = await pool.query('SELECT * FROM messages WHERE message_id = ?', [result.insertId]);
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('send message error:', err);
    return res.status(500).json({ success: false, message: 'Failed to send message.' });
  }
});

// ============================================================
// STATS (dashboards)
// ============================================================

app.get('/api/stats', auth, async (req, res) => {
  try {
    const user = await getUserById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    if (user.role === 'admin') {
      const [counts] = await pool.query(
        `SELECT
           COUNT(*) AS total_requests,
           SUM(status = 'pending') AS pending,
           SUM(status = 'approved') AS approved,
           SUM(status = 'released') AS released,
           SUM(status = 'rejected') AS rejected
         FROM requests`
      );
      const [residents] = await pool.query(
        "SELECT COUNT(*) AS total_residents FROM users WHERE role = 'resident'"
      );
      const [byService] = await pool.query(
        `SELECT type, COUNT(*) AS count FROM requests GROUP BY type ORDER BY count DESC`
      );
      return res.json({
        success: true,
        data: {
          total_requests: counts[0].total_requests || 0,
          pending: counts[0].pending || 0,
          approved: counts[0].approved || 0,
          released: counts[0].released || 0,
          rejected: counts[0].rejected || 0,
          total_residents: residents[0].total_residents || 0,
          by_service: byService,
        },
      });
    }

    const [counts] = await pool.query(
      `SELECT
         COUNT(*) AS total_requests,
         SUM(status = 'pending') AS pending,
         SUM(status IN ('approved','released')) AS approved_released
       FROM requests WHERE user_id = ?`,
      [req.userId]
    );
    return res.json({
      success: true,
      data: {
        total_requests: counts[0].total_requests || 0,
        pending: counts[0].pending || 0,
        approved_released: counts[0].approved_released || 0,
      },
    });
  } catch (err) {
    console.error('stats error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load stats.' });
  }
});

// ============================================================
// USERS (admin: list residents)
// ============================================================

// GET /api/users/residents  (admin only)
app.get('/api/users/residents', auth, async (req, res) => {
  try {
    const user = await getUserById(req.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin only.' });
    }
    const [rows] = await pool.query(
      "SELECT user_id, full_name, email FROM users WHERE role = 'resident' ORDER BY full_name ASC"
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('residents list error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load residents.' });
  }
});

// GET /api/requests/status/:code  (check a request by its BSJ-XXXXXX code)
app.get('/api/requests/status/:code', auth, async (req, res) => {
  try {
    const code = String(req.params.code || '').trim().toUpperCase();
    const user = await getUserById(req.userId);

    let sql = `SELECT r.request_id AS id, r.request_code, r.user_id, u.full_name,
                      r.type, r.id_request_type, r.is_voter, r.purpose, r.first_name, r.middle_name, r.surname, r.birth_place, r.contact_number, r.emergency_contact_name, r.emergency_contact_number,
                      r.requirement_type, r.id_photo, r.front_photo, r.back_photo, r.hoa_cert, r.requirement_doc, r.status, r.scheduled_date, r.created_at
               FROM requests r JOIN users u ON u.user_id = r.user_id
               WHERE r.request_code = ?`;
    const params = [code];
    if (user.role !== 'admin') {
      sql += ' AND r.user_id = ?';
      params.push(req.userId);
    }
    const [rows] = await pool.query(sql, params);
    if (rows.length === 0) {
      return res.json({ success: false, message: 'Request ID not found.' });
    }
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('check status error:', err);
    return res.status(500).json({ success: false, message: 'Failed to check status.' });
  }
});

app.listen(PORT, () => {
  console.log(`Barangay backend running at http://localhost:${PORT}`);
});
