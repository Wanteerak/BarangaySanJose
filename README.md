# Barangay San Jose System — Capstone Project

Buong system ng **Barangay San Jose — Main Hall**. Isang folder lang ito — i-open sa VS Code.

## 📂 Saan nakalocate ang lahat

**Pangunahing folder:** `C:\Users\Mico\Desktop\CaptoneSystem`

```
C:\Users\Mico\Desktop\CaptoneSystem\
│
├── backend\               → SERVER (Node.js + Express + MySQL)
│   ├── server.js            ← lahat ng API endpoints (login, requests, chat…)
│   ├── schema.sql           ← database schema (users, requests, messages)
│   ├── seed.js              ← demo accounts (npm run seed)
│   └── package.json
│
├── barangay-web\          → WEB APP (React + Vite) — Resident & Admin portal
│   └── src\
│       ├── components\
│       │   ├── Home.jsx          ← resident home + SERVICES list
│       │   ├── RequestForm.jsx   ← forms per serbisyo (SERVICE_FORMS config)
│       │   ├── MyRequests.jsx    ← tracking + reject reason display
│       │   ├── AdminDashboard.jsx← admin home (m-design)
│       │   ├── AdminRequests.jsx ← admin: detail view, reject, PRINT
│       │   ├── PrintDocument.jsx ← official barangay document (auto-print PDF)
│       │   └── Navbar.jsx, Login.jsx, Register.jsx, CheckStatus.jsx, LiveChat.jsx
│       ├── api.js          ← kumokonekta sa backend (localhost:3001)
│       └── index.css       ← lahat ng styles (m- design classes)
│
├── barangay-promo\        → PROMOTIONAL WEBSITE (ang bagong revsion)
│   └── src\
│       ├── App.jsx          ← BUONG promo site (ito ang i-edit mo)
│       └── index.css        ← styles ng promo (promo- classes)
│   └── public\download\     ← desktop installer para sa Download button
│
├── barangay-mobile\       → MOBILE APP (React Native + Expo) — Android/iOS
│   └── App.js               ← buong mobile app (LAPTOP_IP naka-hardcode)
│
├── barangay-desktop\      → WINDOWS DESKTOP APP (.exe)
│   ├── main.js              ← Electron wrapper ng web app
│   ├── package.json         ← output dir: release10
│   └── release10\           ← "Barangay San Jose Setup 1.0.0.exe" (installer)
│
├── RUN-SYSTEM.bat         → One-click launcher ng backend + web + promo
├── backup-barangay_san_jose.sql → Safety backup ng database (buo, may data)
└── README.md              → itong file na ito
```

## 💻 Paano i-open sa VS Code

1. I-double-click ang folder na **CaptoneSystem** sa Desktop
2. Sa loob, **i-right-click ang blangkong bahagi** → **Open with Code**
   (o buksan ang VS Code → File → Open Folder → piliin ang `CaptoneSystem`)

**Kung gusto mo lang i-edit ang PROMO WEBSITE:**
- Buksan: `barangay-promo\src\App.jsx` (lahat ng laman nandoon)
- Styles: `barangay-promo\src\index.css`

**Kung gusto mo lang i-edit ang WEB APP (resident/admin):**
- Components: `barangay-web\src\components\`
- Styles: `barangay-web\src\index.css`

## 🚀 Paano i-run lahat

### 1. I-on ang MySQL (XAMPP)
- Buksan ang **XAMPP Control Panel** → click **Start** sa **MySQL**

### 2. Double-click: `RUN-SYSTEM.bat`
- Bubuksan ang **BACKEND** (port 3001)
- Bubuksan ang **WEB APP** (port 5173)
- Bubuksan ang **PROMO SITE** (port 5174)
- Awtomatikong bubuksan ang browser
- ⚠️ **Huwag isara** ang mga command window habang gumagamit

### 3. Mobile App (opsyonal)
```powershell
cd barangay-mobile
npm start
```
- **Android at iOS (PWA):** I-install bilang PWA direkta sa browser (walang APK download)
  - Android (Chrome): Buksan ang portal → menu (⋮) → "Add to Home screen" / "Install app"
  - iPhone/iPad (Safari): Buksan ang portal → Share → "Add to Home Screen" → Add
- ⚠️ Same Wi-Fi dapat ang phone at laptop (para sa local dev mode)

### 3.1 HTTPS Tunnel (para maka-install bilang PWA sa phone)
Kailangan ng **HTTPS** ang browser para lumabas ang "Install app" — kaya may tunnel:
```powershell
# I-double click lang:
START-TUNNEL.bat
```
- Lalabas sa console ang **HTTPS link** (hal. `https://xxxx.trycloudflare.com`)
- I-type ang link sa browser ng phone → i-install bilang PWA (tingnan sa itaas)
- ⚠️ **Palit-palit ang URL** tuwing i-restart ang tunnel — i-run muli ang `START-TUNNEL.bat` para makuha ang bagong link
- Gumagana kahit **hindi same Wi-Fi** (internet-based ang tunnel)
- Tumatakbo ang `START-TUNNEL.bat` **kasabay** ng `RUN-SYSTEM.bat`

### 4. Desktop App (opsyonal)
- Naka-install na! Hanapin sa Start Menu: **Barangay San Jose**
- Kung gusto i-rebuild:
  ```powershell
  cd barangay-desktop
  npm run build
  # installer: release10\Barangay San Jose Setup 1.0.0.exe
  ```

## 🌐 Mga URL

| Website | URL |
|---|---|
| **Promotional Website** | http://localhost:5174 |
| **Web App (Login / Portal)** | http://localhost:5173 |
| **Backend API** | http://localhost:3001/api |

## 👤 Demo Accounts

| Role | Email | Password |
|---|---|---|
| **Admin** | admin@barangay.gov | admin123 |
| Resident | juan@demo.com | 123456 |
| Resident | maria@demo.com | maria123 |

## 🗄️ Database (MySQL sa XAMPP, port 3306)

- **Database name:** `barangay_san_jose`
- **Tables:** `users`, `requests`, `messages`
- **Schema file:** `backend\schema.sql`
- **phpMyAdmin:** http://localhost/phpmyadmin (kailangan naka-Start ang Apache sa XAMPP)
- **Safety backup:** `backup-barangay_san_jose.sql` (i-import ito kapag may problema)

## ✅ Kung ano na ang nagawa (v2)

**Web App (Resident side):**
- Login / Register / Profile edit
- Home page na may orange design + stats + popular services
- 6 services na may sariling form bawat isa (config-driven: SERVICE_FORMS)
  - Barangay Clearance ₱50 — may Priority chips (Senior/PWD/Pregnant)
  - Certificate of Indigency — Free
  - Low Income Certificate (BIR) ₱50
  - Guardianship Certificate ₱50
  - Cohabitation Certificate ₱50
  - Barangay ID — Free (New/Renew + voter oo/hindi flow)
- Proof of identity upload (JPG/PNG/PDF, max 5MB)
- Certification checkbox (required bago mag-submit)
- Double-check preview bago mag-submit
- My Requests tracking + **reject reason display** (kapag nag-reject ang admin)

**Web App (Admin side):**
- Dashboard na may stats (m-design)
- **Manage Requests** — filter (All/Pending/Approved/Rejected/Released)
- **Detail view** — lahat ng sagot ng resident + uploaded documents (images/PDF)
- **Reject na may REQUIRED na dahilan (comment)** — nakikita ng resident
- Approve → schedule release (date picker)
- **🖨️ Print Document** — official barangay document (Republic of the Philippines header,
  Main Hall, auto-generated legal text, signature blocks, request code) — auto window.print()

**Mobile App:** kapareho ng web (Home, Services, Apply, Requests, Profile, Chat) + file upload + iOS/Android PWA support (Add to Home Screen)
**Logo/Icon:** bilog na seal (inalis ang puting background), inilagay sa mobile, desktop, web, at promo
**EAS Build:** @wanteerak/barangay-san-jose — Android APK (preview profile)
**Desktop App:** pareho ng web app, naka-install na sa PC
**Promo Website:** revised — puro Barangay San Jose Main Hall, totoong 6 services na may presyo,
  3 ways to use (Web / Mobile QR / Desktop .exe download), updated FAQs

**Backend:** Express + MySQL — auth, requests (approve/reject/schedule), profile,
  live chat, stats. Reject reason REQUIRED sa reject action.

## 🆘 Mga Karaniwang Problema

| Problema | Solusyon |
|---|---|
| Hindi gumagana ang login | Tumatakbo ba ang MySQL (XAMPP) at backend? |
| "Cannot reach server" | Backend dapat naka-run (`RUN-SYSTEM.bat`) |
| Mobile "Network error" | Tama ba ang `LAPTOP_IP` sa `barangay-mobile\App.js`? Same Wi-Fi ba? |
| Hindi gumagana ang desktop app | Kailangan naka-ON ang backend + MySQL |
| Port 5173/5174 in-use | Isara ang lumang node windows, i-run ulit |
| Sira ang MySQL pagkatapos mag-restart ng PC | XAMPP Control Panel → MySQL → Start |

## 🔜 Kung gusto i-deploy (online)

- **Railway** o **TiDB Cloud** (libre) — para gumana kahit hindi same Wi-Fi
- Balik mo lang ang "BASE" sa `barangay-web\src\api.js` at `barangay-mobile\App.js`
  papunta sa public URL ng backend
