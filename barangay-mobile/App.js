// ============================================================
// Barangay San Jose - Mobile App (React Native + Expo)
// Android / iOS - kumokonekta sa parehong backend (port 3001)
// Design: white + orange, services screen, ID Request form
// NOTE: Barangay San Jose Main Hall lang — walang ibang branding.
// ============================================================

const LAPTOP_IP = '10.23.44.44'; // IP ng laptop mo sa Wi-Fi (palitan kapag nagbago)
const BASE = `http://${LAPTOP_IP}:3001/api`;

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, StatusBar, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Animated, Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Gradient (may fallback kung hindi ma-install ang expo-linear-gradient)
let LG = null;
try { LG = require('expo-linear-gradient').LinearGradient; } catch (e) { LG = null; }
function Gradient({ colors, style, children }) {
  if (LG) {
    return <LG colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={style}>{children}</LG>;
  }
  return <View style={[style, { backgroundColor: colors[colors.length - 1] }]}>{children}</View>;
}

const COLORS = {
  primary: '#ea580c',
  dark: '#c2410c',
  accent: '#f97316',
  bg: '#fdf1e7',
  white: '#fff',
  gray: '#64748b',
  border: '#e2e8f0',
  danger: '#c62828',
};

// ---------- 6 SERVICES (Barangay San Jose Main Hall) ----------
const SERVICES = [
  {
    value: 'clearance', label: 'Barangay Clearance', price: '\u20B150', time: '3-5 min',
    icon: '📋', iconBg: '#fde8d7', iconColor: '#c2410c',
    desc: 'For employment, school, loan, travel, passport, postal ID, police/NBI, and other legal purposes.',
  },
  {
    value: 'indigency', label: 'Certificate of Indigency', price: 'Free', time: '3-5 min',
    icon: '🧾', iconBg: '#d9f2e4', iconColor: '#15803d',
    desc: 'Financial assistance certification for hospitals, schools, government offices, and social services.',
  },
  {
    value: 'low_income', label: 'Low Income Certificate (BIR)', price: '\u20B150', time: '3-5 min',
    icon: '📑', iconBg: '#dbeafe', iconColor: '#1d4ed8',
    desc: 'Certification for low-income households and BIR-related requirements.',
  },
  {
    value: 'guardianship', label: 'Guardianship Certificate', price: '\u20B150', time: '3-5 min',
    icon: '👶', iconBg: '#ede9fe', iconColor: '#6d28d9',
    desc: 'Proof of guardianship for a minor or dependent resident.',
  },
  {
    value: 'cohabitation', label: 'Cohabitation Certificate', price: '\u20B150', time: '3-5 min',
    icon: '💞', iconBg: '#ffe4e6', iconColor: '#be123c',
    desc: 'Certification for couples living together within Barangay San Jose.',
  },
  {
    value: 'id', label: 'Barangay ID Application', price: 'Free', time: '5-10 min',
    icon: '🪪', iconBg: '#fef3c7', iconColor: '#b45309',
    desc: 'New application or renewal of an official Barangay San Jose resident ID.',
  },
];

const serviceLabel = (v) => (SERVICES.find((s) => s.value === v) || {}).label || v;

// ---------- API helpers ----------
async function api(path, { method = 'GET', body } = {}) {
  const token = await AsyncStorage.getItem('bsj_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  try {
    const res = await fetch(BASE + path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    return await res.json();
  } catch {
    return { success: false, message: 'Cannot reach server. Check Wi-Fi and backend.' };
  }
}

// ---------- Reusable UI ----------
function Btn({ title, onPress, variant = 'primary', loading, style }) {
  return (
    <TouchableOpacity
      style={[styles.btn, variant === 'primary' ? styles.btnPrimary : styles.btnGhost, style]}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : COLORS.primary} />
      ) : (
        <Text style={[styles.btnText, variant === 'ghost' && { color: COLORS.primary }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

function Field({ label, children }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

const inputStyle = {
  borderWidth: 1, borderColor: COLORS.border, borderRadius: 8,
  padding: 12, backgroundColor: '#fff', fontSize: 15,
};

function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

function Badge({ status }) {
  const colors = {
    pending: ['#fff3cd', '#856404'],
    approved: ['#d4edda', '#155724'],
    released: ['#d1ecf1', '#0c5460'],
    rejected: ['#f8d7da', '#721c24'],
  };
  const [bg, fg] = colors[status] || ['#eee', '#333'];
  return (
    <View style={{ backgroundColor: bg, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' }}>
      <Text style={{ color: fg, fontWeight: '700', fontSize: 12 }}>{status}</Text>
    </View>
  );
}

// Service card na kapareho ng design (icon square + title + desc + price pill + time)
function ServiceCard({ service, onPress }) {
  return (
    <TouchableOpacity style={styles.serviceCard} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.serviceRow}>
        <View style={[styles.serviceIcon, { backgroundColor: service.iconBg }]}>
          <Text style={{ fontSize: 22 }}>{service.icon}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.serviceTitle}>{service.label}</Text>
          <Text style={styles.serviceDesc}>{service.desc}</Text>
          <View style={styles.serviceMeta}>
            <View style={[styles.pricePill, service.price === 'Free' && styles.priceFree]}>
              <Text style={[styles.priceText, service.price === 'Free' && { color: '#15803d' }]}>{service.price}</Text>
            </View>
            <Text style={styles.timeText}>🕒 {service.time}</Text>
          </View>
        </View>
        <Text style={styles.chevron}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

// ---------- Orange Header (Barangay San Jose Main Hall) ----------
function Header({ user, title, onAvatar, onMenu }) {
  const initials = user.full_name
    .split(' ').filter(Boolean).slice(0, 2)
    .map((w) => w[0].toUpperCase()).join('');
  return (
    <Gradient
      colors={[COLORS.dark, COLORS.primary]}
      style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 54 : (StatusBar.currentHeight || 24) + 12 }]}
    >
      <View style={styles.headerTop}>
        <TouchableOpacity onPress={onMenu} style={styles.menuBtn}>
          <Text style={{ color: '#fff', fontSize: 22, fontWeight: '900' }}>☰</Text>
        </TouchableOpacity>
        <View style={styles.seal}>
          <Text style={{ fontSize: 20 }}>🏛️</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.headerTitle}>BARANGAY SAN JOSE</Text>
          <Text style={styles.headerSub}>RESIDENT SERVICES</Text>
        </View>
        <TouchableOpacity style={styles.avatar} onPress={onAvatar}>
          <Text style={styles.avatarText}>{initials || 'U'}</Text>
        </TouchableOpacity>
      </View>
      {title ? <Text style={styles.headerPage}>{title}</Text> : null}
    </Gradient>
  );
}

// ---------- Auth Screen (Login + Register) ----------
function AuthScreen({ onLoggedIn }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [step, setStep] = useState('form'); // 'form' | 'otp'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [idPhoto, setIdPhoto] = useState(null);
  const [otp, setOtp] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const pickId = async () => {
    try {
      const DocumentPicker = require('expo-document-picker');
      const FileSystem = require('expo-file-system');
      const res = await DocumentPicker.getDocumentAsync({ type: ['image/*', 'application/pdf'], copyToCacheDirectory: true });
      if (res.canceled) return;
      const asset = res.assets && res.assets[0];
      if (!asset) return;
      if (asset.size && asset.size > 5 * 1024 * 1024) {
        Alert.alert('Too large', 'Max 5 MB ang file.');
        return;
      }
      const b64 = await FileSystem.readAsStringAsync(asset.uri, { encoding: FileSystem.EncodingType.Base64 });
      const mime = asset.mimeType || (asset.name && asset.name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');
      setIdPhoto(`data:${mime};base64,${b64}`);
    } catch (e) {
      Alert.alert('Upload failed', 'Hindi ma-upload ang file. Subukan ulit.');
    }
  };

  const submit = async () => {
    if (!email || !password || (mode === 'register' && !name)) {
      Alert.alert('Required', 'Punan ang lahat ng fields.');
      return;
    }
    if (mode === 'register' && !idPhoto) {
      Alert.alert('Required', 'I-upload ang valid ID (proof of identity).');
      return;
    }
    setLoading(true);
    if (mode === 'login') {
      const r = await api('/auth/login', { method: 'POST', body: { email, password } });
      setLoading(false);
      if (r.success) {
        await AsyncStorage.setItem('bsj_token', r.data.token);
        await AsyncStorage.setItem('bsj_user', JSON.stringify(r.data.user));
        onLoggedIn(r.data.user);
      } else if (r.pending) {
        setPendingEmail(r.email || email);
        setStep('otp');
        Alert.alert('Verify Email', r.message || 'Please verify your email using the OTP sent.');
      } else {
        Alert.alert('Login Failed', r.message || 'Invalid credentials');
      }
    } else {
      const r = await api('/auth/register', {
        method: 'POST',
        body: { full_name: name, email, password, role: 'resident', address, purok: '', id_photo: idPhoto },
      });
      setLoading(false);
      if (r.success && r.pending) {
        setPendingEmail(r.data?.email || email);
        setStep('otp');
        Alert.alert('OTP Sent', r.message || 'A 6-digit OTP was sent to your email.');
      } else if (r.success) {
        Alert.alert('Success', r.message || 'Account created! You can now log in.');
        setMode('login');
      } else {
        Alert.alert('Registration Failed', r.message || 'Please try again.');
      }
    }
  };

  const verifyOtp = async () => {
    if (!otp || otp.length < 4) {
      Alert.alert('Required', 'I-enter ang OTP code.');
      return;
    }
    setLoading(true);
    const r = await api('/auth/verify-otp', { method: 'POST', body: { email: pendingEmail, otp } });
    setLoading(false);
    if (r.success) {
      Alert.alert('Verified!', r.message || 'Email verified. You can now log in.');
      setStep('form');
      setOtp('');
      setPendingEmail('');
      setMode('login');
    } else {
      Alert.alert('Verification Failed', r.message || 'Invalid OTP');
    }
  };

  const resendOtp = async () => {
    setLoading(true);
    const r = await api('/auth/resend-otp', { method: 'POST', body: { email: pendingEmail } });
    setLoading(false);
    Alert.alert(r.success ? 'Sent' : 'Failed', r.message || (r.success ? 'OTP resent.' : 'Could not resend OTP.'));
  };

  // OTP step UI
  if (step === 'otp') {
    return (
      <KeyboardAvoidingView style={styles.authWrap} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Gradient colors={[COLORS.dark, COLORS.primary]} style={styles.authHeader}>
          <View style={styles.seal}>
            <Text style={{ fontSize: 26 }}>🏛️</Text>
          </View>
          <Text style={styles.authTitle}>BARANGAY SAN JOSE</Text>
          <Text style={styles.authSub}>Email Verification</Text>
        </Gradient>
        <Card style={{ marginTop: -30, marginHorizontal: 4 }}>
          <Text style={styles.cardTitle}>Verify Your Email</Text>
          <Text style={{ color: COLORS.gray, fontSize: 13, marginBottom: 12, textAlign: 'center' }}>
            Na-send na ang 6-digit OTP sa {pendingEmail}. I-enter dito (valid sa 10 minuto).
          </Text>
          <Field label="OTP Code">
            <TextInput style={[inputStyle, { letterSpacing: 6, textAlign: 'center', fontSize: 18 }]} value={otp} onChangeText={setOtp} keyboardType="number-pad" maxLength={6} placeholder="123456" />
          </Field>
          <Btn title={loading ? 'Verifying...' : 'Verify OTP'} onPress={verifyOtp} loading={loading} />
          <TouchableOpacity style={{ marginTop: 14, alignSelf: 'center' }} onPress={resendOtp} disabled={loading}>
            <Text style={{ color: COLORS.primary, fontWeight: '600' }}>Resend OTP</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ marginTop: 8, alignSelf: 'center' }} onPress={() => { setStep('form'); setOtp(''); setPendingEmail(''); }}>
            <Text style={{ color: COLORS.gray, fontWeight: '600' }}>Bumalik</Text>
          </TouchableOpacity>
        </Card>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.authWrap} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Gradient colors={[COLORS.dark, COLORS.primary]} style={styles.authHeader}>
        <View style={styles.seal}>
          <Text style={{ fontSize: 26 }}>🏛️</Text>
        </View>
        <Text style={styles.authTitle}>BARANGAY SAN JOSE</Text>
        <Text style={styles.authSub}>Resident Services - Main Hall</Text>
      </Gradient>

      <Card style={{ marginTop: -30, marginHorizontal: 4 }}>
        <Text style={styles.cardTitle}>{mode === 'login' ? 'Login' : 'Create Account'}</Text>
        {mode === 'register' && (
          <Field label="Full Name">
            <TextInput style={inputStyle} value={name} onChangeText={setName} placeholder="Juan Dela Cruz" />
          </Field>
        )}
        <Field label="Email">
          <TextInput style={inputStyle} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="you@email.com" />
        </Field>
        <Field label="Password">
          <TextInput style={inputStyle} value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••" />
        </Field>
        {mode === 'register' && (
          <>
            <Field label="Address">
              <TextInput style={inputStyle} value={address} onChangeText={setAddress} placeholder="Purok 2, Barangay San Jose" />
            </Field>
            <Field label="Valid ID (Proof of Identity) *">
              <TouchableOpacity style={styles.uploadBox} onPress={pickId}>
                <Text style={{ fontSize: 20 }}>⬆️</Text>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={{ fontWeight: '800', color: '#1e293b' }}>Upload valid ID</Text>
                  <Text style={{ fontSize: 11, color: COLORS.gray }}>JPG, PNG, or PDF • Max 5 MB</Text>
                </View>
              </TouchableOpacity>
              {idPhoto && <Text style={{ color: '#155724', fontSize: 12, marginTop: 4 }}>✔ ID uploaded</Text>}
            </Field>
          </>
        )}
        <Btn title={mode === 'login' ? 'Login' : 'Register & Send OTP'} onPress={submit} loading={loading} />
        <TouchableOpacity style={{ marginTop: 14, alignSelf: 'center' }} onPress={() => { setMode(mode === 'login' ? 'register' : 'login'); setIdPhoto(null); }}>
          <Text style={{ color: COLORS.primary, fontWeight: '600' }}>
            {mode === 'login' ? "Don't have an account? Register" : 'Already have an account? Login'}
          </Text>
        </TouchableOpacity>
      </Card>
      <Text style={styles.hint}>Resident: juan@demo.com / 123456{'\n'}Admin: admin@barangay.gov / admin123</Text>
    </KeyboardAvoidingView>
  );
}

// ---------- HOME ----------
function HomeScreen({ user, goRequest, goServices, goRequests, goChat }) {
  const [myRequests, setMyRequests] = useState([]);
  useEffect(() => {
    api('/requests/my').then((r) => r.success && setMyRequests(r.data));
  }, []);
  const readyCount = myRequests.filter((r) => r.status === 'approved' || r.status === 'released').length;
  const popular = SERVICES.slice(0, 3);

  return (
    <ScrollView contentContainerStyle={styles.page}>
      {/* Hero card */}
      <Gradient colors={[COLORS.dark, COLORS.primary]} style={styles.hero}>
        <Text style={styles.heroKicker}>BARANGAY SAN JOSE - MAIN HALL</Text>
        <Text style={styles.heroTitle}>Barangay{'\n'}documents, made{'\n'}easier.</Text>
        <Text style={styles.heroSub}>Apply online, check requirements, and track your request before visiting the barangay hall.</Text>
        <TouchableOpacity style={styles.heroBtn} onPress={goRequest}>
          <Text style={styles.heroBtnText}>Start a request</Text>
        </TouchableOpacity>
      </Gradient>

      {/* Stat cards */}
      <View style={styles.statRow}>
        <TouchableOpacity style={styles.statCard2} onPress={goServices}>
          <Text style={styles.statIcon}>🧾</Text>
          <Text style={styles.statNum}>{SERVICES.length} services</Text>
          <Text style={styles.statLabel}>View certificates</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.statCard2} onPress={goRequests}>
          <Text style={styles.statIcon}>✅</Text>
          <Text style={styles.statNum}>{readyCount} ready</Text>
          <Text style={styles.statLabel}>For pickup</Text>
        </TouchableOpacity>
      </View>

      {/* Popular services */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 6, marginBottom: 10 }}>
        <View>
          <Text style={styles.sectionTitle}>Popular services</Text>
          <Text style={styles.sectionSub}>Most requested by residents</Text>
        </View>
        <TouchableOpacity onPress={goServices}>
          <Text style={{ color: COLORS.primary, fontWeight: '800' }}>View all</Text>
        </TouchableOpacity>
      </View>

      {popular.map((s) => (
        <ServiceCard key={s.value} service={s} onPress={() => goRequest(s.value)} />
      ))}

      {/* Before you apply */}
      <View style={styles.noteCard}>
        <Text style={styles.noteTitle}>Before you apply</Text>
        <Text style={styles.noteText}>
          For Barangay ID: prepare your requirements first. For renewal, you will be asked if you are a
          registered voter (botante). Standard counter processing is 3-5 minutes after verification at
          the Barangay San Jose hall.
        </Text>
      </View>

      {/* Chat button */}
      <Btn title="💬 Chat with the Barangay Office" variant="ghost" onPress={goChat} style={{ marginTop: 4, marginBottom: 20 }} />
    </ScrollView>
  );
}

// ---------- SERVICES (with search) ----------
function ServicesScreen({ goRequest }) {
  const [q, setQ] = useState('');
  const list = SERVICES.filter((s) => s.label.toLowerCase().includes(q.toLowerCase()));
  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.searchBar}>
        <Text style={{ color: COLORS.gray, marginRight: 8 }}>🔍</Text>
        <TextInput
          style={{ flex: 1, fontSize: 15 }}
          value={q}
          onChangeText={setQ}
          placeholder="Search certificates and IDs"
          placeholderTextColor="#94a3b8"
        />
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginVertical: 10 }}>
        <View>
          <Text style={styles.sectionTitle}>Available services</Text>
          <Text style={styles.sectionSub}>For all verified Barangay San Jose residents</Text>
        </View>
        <Text style={{ color: COLORS.dark, fontWeight: '800' }}>{list.length} results</Text>
      </View>

      {list.map((s) => (
        <ServiceCard key={s.value} service={s} onPress={() => goRequest(s.value)} />
      ))}
      {list.length === 0 && <Text style={{ color: COLORS.gray, textAlign: 'center', marginTop: 20 }}>Walang nahanap na serbisyo.</Text>}
    </ScrollView>
  );
}

// ---------- Per-service form configs (kapareho ng web) ----------
const SERVICE_FORMS = {
  clearance: {
    requirements: [
      "Photocopy of Voter's ID, voter stub, COMELEC certification, or any valid government ID",
      'Applicant must be a verified Barangay San Jose resident',
    ],
    fields: [
      { key: 'purpose', label: 'Purpose / Kahiligan', placeholder: 'e.g. Local employment', required: true },
      { key: 'complete_name', label: 'Complete name', placeholder: 'Full legal name', required: true },
      { key: 'complete_address', label: 'Complete address', placeholder: 'House no., street, purok, Barangay San Jose', multiline: true },
      { key: 'date_of_birth', label: 'Date of birth', placeholder: 'mm/dd/yyyy', type: 'date', required: true },
      { key: 'birth_place', label: 'Place of birth', placeholder: 'City / municipality', required: true },
      { key: 'contact_number', label: 'Contact number', placeholder: '09XX XXX XXXX', phone: true, required: true },
    ],
    priority: true,
  },
  indigency: {
    requirements: [
      "Photocopy of Voter's ID, voter stub, COMELEC certification, or any valid government ID",
      'Applicant must be a verified Barangay San Jose resident',
    ],
    fields: [
      { key: 'purpose', label: 'Request is for', placeholder: 'Purpose of certification', required: true },
      { key: 'office_agency', label: 'Office / agency to submit to', placeholder: 'Name of office', required: true },
      { key: 'complete_name', label: 'Name of applicant', required: true },
      { key: 'complete_address', label: 'Complete address', multiline: true, required: true },
      { key: 'beneficiary_name', label: 'Name of beneficiary', required: true },
      { key: 'beneficiary_relation', label: 'Relationship to beneficiary', placeholder: 'e.g. Child', required: true },
      { key: 'contact_number', label: 'Contact number', placeholder: '09XX XXX XXXX', phone: true, required: true },
    ],
    priority: false,
  },
  low_income: {
    requirements: [
      "Photocopy of Voter's ID, voter stub, COMELEC certification, or any valid government ID",
      'Applicant must be a verified Barangay San Jose resident',
    ],
    fields: [
      { key: 'complete_name', label: 'Name of applicant', required: true },
      { key: 'child_name', label: 'Name of child', required: true },
      { key: 'complete_address', label: 'Complete address', multiline: true, required: true },
      { key: 'father_name', label: "Father's name", required: true },
      { key: 'mother_name', label: "Mother's name", required: true },
      { key: 'contact_number', label: 'Contact number', placeholder: '09XX XXX XXXX', phone: true, required: true },
    ],
    priority: false,
  },
  guardianship: {
    requirements: [
      "Photocopy of Voter's ID, voter stub, COMELEC certification, or any valid government ID",
      'Applicant must be a verified Barangay San Jose resident',
    ],
    fields: [
      { key: 'guardian_name', label: 'Name of guardian', required: true },
      { key: 'complete_address', label: 'Residence / address', multiline: true, required: true },
      { key: 'child_name', label: 'Name of child', required: true },
      { key: 'relationship', label: 'Relationship', required: true },
    ],
    priority: true,
  },
  cohabitation: {
    requirements: [
      "Photocopy of Voter's ID, voter stub, COMELEC certification, or any valid government ID",
      'Applicant must be a verified Barangay San Jose resident',
    ],
    fields: [
      { key: 'partner1_name', label: 'Partner 1 complete name', required: true },
      { key: 'partner1_birthday', label: 'Partner 1 birthday', placeholder: 'mm/dd/yyyy', type: 'date', required: true },
      { key: 'partner2_name', label: 'Partner 2 complete name', required: true },
      { key: 'partner2_birthday', label: 'Partner 2 birthday', placeholder: 'mm/dd/yyyy', type: 'date', required: true },
      { key: 'shared_residence', label: 'Shared residence', multiline: true, required: true },
      { key: 'years_living', label: 'Years living together', required: true },
      { key: 'cohabitation_started', label: 'Year cohabitation started', required: true },
      { key: 'children_info', label: "Children's names and ages", placeholder: 'One child per line, or write None', multiline: true },
    ],
    priority: true,
  },
};
const getFormCfg = (type) => SERVICE_FORMS[type] || {
  requirements: ['Any valid government ID', 'Applicant must be a verified Barangay San Jose resident'],
  fields: [
    { key: 'purpose', label: 'Purpose / Kahiligan', placeholder: 'e.g. Local employment', required: true },
    { key: 'complete_name', label: 'Complete name', placeholder: 'Full legal name', required: true },
    { key: 'complete_address', label: 'Complete address', multiline: true, required: true },
    { key: 'contact_number', label: 'Contact number', placeholder: '09XX XXX XXXX', phone: true, required: true },
  ],
  priority: false,
};
const PRIORITY_OPTIONS = ['Senior', 'PWD', 'Pregnant'];

// ---------- APPLY (config-driven certificate forms + ID Request form) ----------
function ApplyScreen({ user, goBack, preType }) {
  const [type, setType] = useState(preType || '');
  const [applicant, setApplicant] = useState({});
  const [prioritySel, setPrioritySel] = useState([]);
  const [certified, setCertified] = useState(false);
  const [proofDoc, setProofDoc] = useState(null);
  const [idRequestType, setIdRequestType] = useState('new');
  const [isVoter, setIsVoter] = useState(''); // 'yes' o 'no' (renew lang)
  const [idForm, setIdForm] = useState({
    first_name: '',
    middle_name: '',
    surname: '',
    birth_place: '',
    contact_number: '',
    emergency_contact_name: '',
    emergency_contact_number: '',
  });
  const [loading, setLoading] = useState(false);

  const formCfg = type && type !== 'id' ? getFormCfg(type) : null;

  const togglePriority = (p) => {
    setPrioritySel((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  };

  const pickProof = async () => {
    try {
      const DocumentPicker = require('expo-document-picker');
      const FileSystem = require('expo-file-system');
      const res = await DocumentPicker.getDocumentAsync({ type: ['image/*', 'application/pdf'], copyToCacheDirectory: true });
      if (res.canceled) return;
      const asset = res.assets && res.assets[0];
      if (!asset) return;
      if (asset.size && asset.size > 5 * 1024 * 1024) {
        Alert.alert('Too large', 'Max 5 MB ang file.');
        return;
      }
      const b64 = await FileSystem.readAsStringAsync(asset.uri, { encoding: FileSystem.EncodingType.Base64 });
      const mime = asset.mimeType || (asset.name && asset.name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');
      setProofDoc(`data:${mime};base64,${b64}`);
    } catch (e) {
      Alert.alert('Upload failed', 'Hindi ma-upload ang file. Subukan ulit.');
    }
  };

  const submit = async () => {
    if (!type) return Alert.alert('Required', 'Piliin ang serbisyo.');

    let missing = null;
    if (type === 'id') {
      if (!idForm.first_name || !idForm.surname || !idForm.birth_place || !idForm.contact_number
        || !idForm.emergency_contact_name || !idForm.emergency_contact_number) {
        missing = 'Punan ang lahat ng fields para sa Barangay ID.';
      } else if (idRequestType === 'renew' && !isVoter) {
        missing = 'Piliin kung registered voter (botante) ka o hindi.';
      }
    } else {
      for (const f of formCfg.fields) {
        if (f.required && !String(applicant[f.key] || '').trim()) {
          missing = 'Punan ang: ' + f.label;
          break;
        }
      }
      if (!missing && !proofDoc) missing = 'I-upload ang Proof of Identity (valid ID o voter document).';
      if (!missing && !certified) missing = 'I-check ang certification box bago mag-submit.';
    }
    if (missing) return Alert.alert('Required', missing);

    // Preview / double-check bago mag-submit
    const lines = [];
    lines.push('DOUBLE-CHECK YOUR REQUEST');
    lines.push('-------------------------');
    lines.push('Service: ' + serviceLabel(type));
    if (type === 'id') {
      lines.push('ID Type: ' + (idRequestType === 'new' ? 'New ID (First Time)' : 'Renew ID'));
      lines.push('Name: ' + [idForm.first_name, idForm.middle_name, idForm.surname].filter(Boolean).join(' '));
      lines.push('Birth Place: ' + idForm.birth_place);
      lines.push('Contact: ' + idForm.contact_number);
      lines.push('Emergency Contact: ' + idForm.emergency_contact_name + ' - ' + idForm.emergency_contact_number);
      if (idRequestType === 'renew') {
        lines.push('Registered Voter: ' + (isVoter === 'yes' ? 'Yes (Botante)' : 'No'));
        lines.push('Note: Harap at likod ng lumang ID ay i-upload sa web portal.');
        lines.push('Ang lumang ID ay i-surrender sa barangay hall.');
      }
    } else {
      formCfg.fields.forEach((f) => {
        const val = applicant[f.key];
        if (val) lines.push(f.label + ': ' + val);
      });
      if (prioritySel.length) lines.push('Priority: ' + prioritySel.join(', '));
      lines.push('Proof of Identity: Uploaded');
      lines.push('Certified: Yes');
    }

    return new Promise((resolve) => {
      Alert.alert(
        'Confirm Submission',
        lines.join('\n'),
        [
          { text: 'Edit / Bumalik', style: 'cancel', onPress: () => resolve() },
          { text: 'Confirm and Submit', onPress: () => { doSubmit(); resolve(); } },
        ],
        { cancelable: true }
      );
    });

    async function doSubmit() {
      setLoading(true);
      const payload = { type };
      if (type === 'id') {
        payload.purpose = 'Barangay ID application';
        Object.assign(payload, idForm);
        payload.id_request_type = idRequestType;
        if (idRequestType === 'renew') payload.is_voter = isVoter === 'yes';
      } else {
        Object.assign(payload, applicant);
        payload.purpose = applicant.purpose || 'Barangay certificate request';
        payload.priority = prioritySel.join(', ') || null;
        payload.certified = certified;
        payload.requirement_doc = proofDoc;
      }
      const r = await api('/requests', { method: 'POST', body: payload });
      setLoading(false);
      if (r.success) {
        Alert.alert('Submitted!', `Request ID: ${r.data.request_code}. Pending na ngayon para sa approval.`);
        setType(''); setApplicant({}); setPrioritySel([]); setCertified(false); setProofDoc(null);
        setIdForm({ first_name: '', middle_name: '', surname: '', birth_place: '', contact_number: '', emergency_contact_name: '', emergency_contact_number: '' });
        setIdRequestType('new'); setIsVoter('');
        goBack();
      } else {
        Alert.alert('Failed', r.message);
      }
    }
  };

  const isId = type === 'id';
  const svc = SERVICES.find((s) => s.value === type);
  const canSubmit = type === 'id'
    ? (!!idForm.first_name && !!idForm.surname && !!idForm.birth_place && !!idForm.contact_number && !!idForm.emergency_contact_name && !!idForm.emergency_contact_number && (idRequestType === 'new' || !!isVoter))
    : (!!type && certified && !!proofDoc);

  return (
    <ScrollView contentContainerStyle={styles.page}>
      {/* Service selector (kapag wala pang napili) */}
      {!type && (
        <View style={styles.chipWrap}>
          {SERVICES.map((s) => (
            <TouchableOpacity
              key={s.value}
              onPress={() => setType(s.value)}
              style={[styles.chip, type === s.value && styles.chipActive]}
            >
              <Text style={{ fontSize: 16 }}>{s.icon}</Text>
              <Text style={[styles.chipText, type === s.value && { color: COLORS.primary }]}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Selected service card + Change */}
      {svc && (
        <View style={styles.selectedCard}>
          <View style={[styles.serviceIcon, { backgroundColor: svc.iconBg }]}>
            <Text style={{ fontSize: 22 }}>{svc.icon}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.serviceTitle}>{svc.label}</Text>
            <Text style={styles.timeText}>{svc.price === 'Free' ? 'Free' : svc.price}  •  {svc.time}</Text>
          </View>
          <TouchableOpacity onPress={() => { setType(''); setApplicant({}); setPrioritySel([]); setCertified(false); setProofDoc(null); }}>
            <Text style={{ color: COLORS.primary, fontWeight: '800' }}>Change</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Certificate form (config-driven) */}
      {svc && !isId && (
        <Card>
          <View style={styles.noteCard}>
            <Text style={styles.noteTitle}>Requirements</Text>
            {formCfg.requirements.map((r, i) => (
              <Text key={i} style={styles.noteText}>✓ {r}</Text>
            ))}
          </View>

          <Text style={styles.sectionLabel}>APPLICANT INFORMATION</Text>

          {formCfg.fields.map((f) => (
            <Field key={f.key} label={f.label + (f.required ? ' *' : '')}>
              <TextInput
                style={[inputStyle, f.multiline && { height: 80, textAlignVertical: 'top' }]}
                value={applicant[f.key] || ''}
                onChangeText={(v) => setApplicant({ ...applicant, [f.key]: v })}
                placeholder={f.placeholder || ''}
                multiline={!!f.multiline}
                keyboardType={f.phone ? 'phone-pad' : 'default'}
              />
            </Field>
          ))}

          {formCfg.priority && (
            <Field label="Priority classification">
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {PRIORITY_OPTIONS.map((p) => (
                  <TouchableOpacity
                    key={p}
                    onPress={() => togglePriority(p)}
                    style={[styles.prioChip, prioritySel.includes(p) && styles.prioChipActive]}
                  >
                    <Text style={[styles.chipText, prioritySel.includes(p) && { color: COLORS.primary }]}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Field>
          )}

          <Field label="Proof of identity *">
            <TouchableOpacity style={styles.uploadBox} onPress={pickProof}>
              <Text style={{ fontSize: 22 }}>⬆️</Text>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={{ fontWeight: '800', color: '#1e293b' }}>Upload valid ID or voter document</Text>
                <Text style={{ fontSize: 11, color: COLORS.gray }}>JPG, PNG, or PDF  •  Max 5 MB</Text>
              </View>
            </TouchableOpacity>
            {proofDoc && <Text style={{ color: '#155724', fontSize: 12, marginTop: 4 }}>✔ Proof of identity uploaded</Text>}
          </Field>

          <TouchableOpacity style={styles.certBox} onPress={() => setCertified(!certified)}>
            <View style={[styles.certBoxSquare, certified && { backgroundColor: COLORS.primary, borderColor: COLORS.primary }]}>
              {certified && <Text style={{ color: '#fff', fontWeight: '900', fontSize: 12 }}>✓</Text>}
            </View>
            <Text style={{ flex: 1, color: '#334155', fontSize: 12.5, lineHeight: 18 }}>
              I certify that the information provided is true and authorize Barangay San Jose to verify my resident record.
            </Text>
          </TouchableOpacity>
        </Card>
      )}

      {/* ID Request form */}
      {isId && (
        <Card>
          <Text style={styles.cardTitle}>Barangay ID Application</Text>

          <Field label="Type of Request">
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                onPress={() => { setIdRequestType('new'); setIsVoter(''); }}
                style={[styles.typeOption, idRequestType === 'new' && styles.typeOptionActive, { flex: 1 }]}
              >
                <Text style={[styles.typeText, idRequestType === 'new' && { color: COLORS.primary, fontWeight: '700' }]}>New ID (First Time)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setIdRequestType('renew')}
                style={[styles.typeOption, idRequestType === 'renew' && styles.typeOptionActive, { flex: 1 }]}
              >
                <Text style={[styles.typeText, idRequestType === 'renew' && { color: COLORS.primary, fontWeight: '700' }]}>Renew ID</Text>
              </TouchableOpacity>
            </View>
          </Field>

          <Field label="First Name">
            <TextInput style={inputStyle} value={idForm.first_name} onChangeText={(v) => setIdForm({ ...idForm, first_name: v })} placeholder="e.g., Juan" />
          </Field>
          <Field label="Middle Name">
            <TextInput style={inputStyle} value={idForm.middle_name} onChangeText={(v) => setIdForm({ ...idForm, middle_name: v })} placeholder="e.g., Santos (optional)" />
          </Field>
          <Field label="Surname">
            <TextInput style={inputStyle} value={idForm.surname} onChangeText={(v) => setIdForm({ ...idForm, surname: v })} placeholder="e.g., Dela Cruz" />
          </Field>
          <Field label="Birth Place">
            <TextInput style={inputStyle} value={idForm.birth_place} onChangeText={(v) => setIdForm({ ...idForm, birth_place: v })} placeholder="e.g., Quezon City" />
          </Field>
          <Field label="Contact Number">
            <TextInput style={inputStyle} value={idForm.contact_number} onChangeText={(v) => setIdForm({ ...idForm, contact_number: v })} placeholder="e.g., 09171234567" keyboardType="phone-pad" />
          </Field>
          <Field label="Emergency Contact Person">
            <TextInput style={inputStyle} value={idForm.emergency_contact_name} onChangeText={(v) => setIdForm({ ...idForm, emergency_contact_name: v })} placeholder="Pangalan ng emergency contact" />
          </Field>
          <Field label="Emergency Contact Number">
            <TextInput style={inputStyle} value={idForm.emergency_contact_number} onChangeText={(v) => setIdForm({ ...idForm, emergency_contact_number: v })} placeholder="e.g., 09181234567" keyboardType="phone-pad" />
          </Field>

          {idRequestType === 'renew' && (
            <>
              <View style={styles.noteCard}>
                <Text style={styles.noteTitle}>Renewal note</Text>
                <Text style={styles.noteText}>
                  I-submit ang harap at likod ng lumang ID (back-to-back) sa web portal o barangay hall.
                  Kapag na-approve, kailangan i-surrender ang lumang ID sa barangay hall bago makuha ang bago.
                </Text>
              </View>

              <Field label="Registered Voter (Botante) ka ba?">
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity
                    onPress={() => setIsVoter('yes')}
                    style={[styles.typeOption, isVoter === 'yes' && styles.typeOptionActive, { flex: 1 }]}
                  >
                    <Text style={[styles.typeText, isVoter === 'yes' && { color: COLORS.primary, fontWeight: '700' }]}>Oo (Botante)</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setIsVoter('no')}
                    style={[styles.typeOption, isVoter === 'no' && styles.typeOptionActive, { flex: 1 }]}
                  >
                    <Text style={[styles.typeText, isVoter === 'no' && { color: COLORS.primary, fontWeight: '700' }]}>Hindi</Text>
                  </TouchableOpacity>
                </View>
              </Field>

              {isVoter === 'yes' && (
                <View style={styles.okCard}>
                  <Text style={styles.okText}>
                    Direct submission: Walang ibang requirement. I-upload lang ang harap at likod ng lumang ID sa web portal.
                  </Text>
                </View>
              )}

              {isVoter === 'no' && (
                <View style={styles.warnCard}>
                  <Text style={styles.warnText}>
                    Hindi botante: Kailangan ng HOA Certificate at Valid ID (bawal TIN ID) sa pangalan mo.
                    I-upload ang mga ito sa web portal, o dalhin sa barangay hall.
                  </Text>
                </View>
              )}
            </>
          )}
        </Card>
      )}

      <Btn title={loading ? 'Submitting...' : 'Submit request'} onPress={submit} loading={loading} />
      <Btn title="Cancel" variant="ghost" onPress={goBack} style={{ marginTop: 8, marginBottom: 20 }} />
    </ScrollView>
  );
}

// ---------- REQUESTS ----------
function RequestsScreen({ user }) {
  const isAdmin = user.role === 'admin';
  const [requests, setRequests] = useState(null);
  useEffect(() => {
    const load = () => {
      if (isAdmin) {
        api('/requests').then((r) => r.success && setRequests(r.data));
      } else {
        api('/requests/my').then((r) => r.success && setRequests(r.data));
      }
    };
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [isAdmin]);

  if (!requests) return <ActivityIndicator style={{ marginTop: 40 }} color={COLORS.primary} />;
  if (requests.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={{ color: COLORS.gray }}>Wala ka pang request.</Text>
      </View>
    );
  }
  return (
    <ScrollView contentContainerStyle={styles.page}>
      {requests.map((r, i) => (
        <Card key={r.request_id || r.id || i}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontWeight: '800', color: COLORS.primary }}>{r.request_code}</Text>
            <Badge status={r.status} />
          </View>
          <Text style={{ marginTop: 6, fontWeight: '700' }}>
            {serviceLabel(r.type)}
          </Text>
          {isAdmin && <Text style={{ color: COLORS.gray, fontSize: 12 }}>Resident: {r.full_name}</Text>}
          <Text style={{ color: COLORS.gray, fontSize: 13 }}>{r.purpose}</Text>
          <Text style={{ color: COLORS.gray, fontSize: 12, marginTop: 4 }}>
            Submitted: {new Date(r.created_at).toLocaleDateString()}
            {r.scheduled_date ? `  •  Schedule: ${new Date(r.scheduled_date).toLocaleDateString()}` : ''}
          </Text>
          {r.status === 'rejected' && r.reject_reason ? (
            <Text style={{ color: '#b91c1c', fontSize: 12, backgroundColor: '#fee2e2', borderRadius: 8, padding: 8, marginTop: 8 }}>
              ✏️ Dahilan ng pag-reject: {r.reject_reason}
            </Text>
          ) : null}
        </Card>
      ))}
    </ScrollView>
  );
}

// ---------- PROFILE ----------
function ProfileScreen({ user, onLogout, goChat }) {
  const [form, setForm] = useState(user);
  const save = async () => {
    const r = await api('/profile', { method: 'PUT', body: form });
    if (r.success) {
      await AsyncStorage.setItem('bsj_user', JSON.stringify(r.data));
      Alert.alert('Saved!', 'Profile updated.');
    } else {
      Alert.alert('Failed', r.message);
    }
  };
  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Card>
        <Text style={styles.cardTitle}>My Profile</Text>
        <Field label="Full Name">
          <TextInput style={inputStyle} value={form.full_name} onChangeText={(v) => setForm({ ...form, full_name: v })} />
        </Field>
        <Field label="Address">
          <TextInput style={inputStyle} value={form.address} onChangeText={(v) => setForm({ ...form, address: v })} />
        </Field>
        <Btn title="Save Changes" onPress={save} />
        <Btn title="💬 Chat with the Barangay Office" variant="ghost" onPress={goChat} style={{ marginTop: 8 }} />
        <Btn title="Logout" variant="ghost" onPress={onLogout} style={{ marginTop: 8 }} />
      </Card>
    </ScrollView>
  );
}

// ---------- CHAT (resident <-> admin) ----------
function ChatScreen({ user }) {
  const isAdmin = user.role === 'admin';
  const [partnerId, setPartnerId] = useState(isAdmin ? null : 1);
  const [partnerName, setPartnerName] = useState(isAdmin ? '' : 'Barangay Administrator');
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [residents, setResidents] = useState([]);

  useEffect(() => {
    if (isAdmin) {
      api('/users/residents').then((r) => r.success && setResidents(r.data));
    }
  }, [isAdmin]);

  const load = () => {
    if (!partnerId) return;
    api(`/messages/${partnerId}`).then((r) => r.success && setMessages(r.data));
  };
  useEffect(() => { load(); const t = setInterval(load, 3000); return () => clearInterval(t); }, [partnerId]);

  const send = async () => {
    if (!text.trim() || !partnerId) return;
    await api('/messages', { method: 'POST', body: { receiver_id: partnerId, message: text } });
    setText('');
    load();
  };

  if (isAdmin) {
    return (
      <View style={{ flex: 1 }}>
        <ScrollView horizontal={false} style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', flex: 1, height: '100%' }}>
            <ScrollView style={{ width: 150, borderRightWidth: 1, borderRightColor: COLORS.border }} contentContainerStyle={{ padding: 8 }}>
              <Text style={{ fontWeight: '800', marginBottom: 8, color: COLORS.dark }}>Residents</Text>
              {residents.map((r) => (
                <TouchableOpacity
                  key={r.user_id}
                  onPress={() => { setPartnerId(r.user_id); setPartnerName(r.full_name); load(); }}
                  style={{ padding: 10, borderRadius: 8, marginBottom: 4, backgroundColor: partnerId === r.user_id ? '#eef4f7' : '#fff' }}
                >
                  <Text style={{ fontWeight: partnerId === r.user_id ? '800' : '400', color: partnerId === r.user_id ? COLORS.primary : '#333', fontSize: 13 }}>{r.full_name}</Text>
                </TouchableOpacity>
              ))}
              {residents.length === 0 && <Text style={{ color: COLORS.gray, fontSize: 12 }}>Walang resident.</Text>}
            </ScrollView>
            <View style={{ flex: 1 }}>
              <View style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: '#fff' }}>
                <Text style={{ fontWeight: '800', color: COLORS.dark }}>{partnerName || 'Pumili ng resident'}</Text>
              </View>
              <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 90 }}>
                {messages.map((m, i) => (
                  <View key={m.message_id ? `${m.message_id}-${i}` : i} style={[styles.bubble, m.sender_id === user.user_id ? styles.bubbleSent : styles.bubbleRecv]}>
                    <Text style={m.sender_id === user.user_id ? { color: '#fff' } : { color: '#333' }}>{m.message}</Text>
                  </View>
                ))}
                {messages.length === 0 && partnerId && <Text style={{ color: COLORS.gray, fontStyle: 'italic' }}>Walang messages pa.</Text>}
                {!partnerId && <Text style={{ color: COLORS.gray, fontStyle: 'italic' }}>Pumili ng resident.</Text>}
              </ScrollView>
              <View style={styles.chatBar}>
                <TextInput style={styles.chatInput} value={text} onChangeText={setText} placeholder={partnerId ? 'Type a message...' : 'Pumili muna'} editable={!!partnerId} />
                <TouchableOpacity style={styles.sendBtn} onPress={send} disabled={!partnerId}>
                  <Text style={{ color: '#fff', fontWeight: '800' }}>➤</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Resident view
  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 90 }}>
        {messages.map((m, i) => (
          <View key={m.message_id ? `${m.message_id}-${i}` : i} style={[styles.bubble, m.sender_id === user.user_id ? styles.bubbleSent : styles.bubbleRecv]}>
            <Text style={m.sender_id === user.user_id ? { color: '#fff' } : { color: '#333' }}>{m.message}</Text>
          </View>
        ))}
        {messages.length === 0 && <Text style={{ color: COLORS.gray, fontStyle: 'italic' }}>No messages yet. Say hello!</Text>}
      </ScrollView>
      <View style={styles.chatBar}>
        <TextInput style={styles.chatInput} value={text} onChangeText={setText} placeholder="Type a message..." />
        <TouchableOpacity style={styles.sendBtn} onPress={send}>
          <Text style={{ color: '#fff', fontWeight: '800' }}>➤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ---------- Main App with 4 tabs ----------
const TITLES = { home: 'Resident Services', services: 'Document Services', apply: 'New Request', requests: 'My Requests', profile: 'My Profile', chat: 'Live Chat' };

export default function App() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState('home');
  const [preType, setPreType] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerAnim = useRef(new Animated.Value(-300)).current;

  useEffect(() => {
    AsyncStorage.getItem('bsj_user').then((u) => {
      if (u) setUser(JSON.parse(u));
      setReady(true);
    });
  }, []);

  useEffect(() => {
    Animated.timing(drawerAnim, {
      toValue: drawerOpen ? 0 : -300,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [drawerOpen]);

  const logout = async () => {
    await AsyncStorage.multiRemove(['bsj_token', 'bsj_user']);
    setUser(null);
    setTab('home');
  };

  const goRequest = (svcValue) => {
    if (user && user.role === 'admin') {
      Alert.alert('Admin', 'Ang pag-submit ng request ay para sa residents. Gamitin ang admin web portal.');
      return;
    }
    setPreType(svcValue || '');
    setTab('apply');
  };

  if (!ready) return <View style={{ flex: 1, backgroundColor: COLORS.bg }} />;
  if (!user) return <AuthScreen onLoggedIn={setUser} />;

  const hasReady = false; // green dot (puede naming ikonek sa data, simple muna)

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.dark} />
      <Header user={user} title={TITLES[tab]} onAvatar={() => setTab('profile')} onMenu={() => setDrawerOpen(true)} />

      {tab === 'home' && (
        <HomeScreen
          user={user}
          goRequest={goRequest}
          goServices={() => setTab('services')}
          goRequests={() => setTab('requests')}
          goChat={() => setTab('chat')}
        />
      )}
      {tab === 'services' && <ServicesScreen goRequest={goRequest} />}
      {tab === 'apply' && <ApplyScreen user={user} goBack={() => setTab('home')} preType={preType} />}
      {tab === 'requests' && <RequestsScreen user={user} />}
      {tab === 'profile' && <ProfileScreen user={user} onLogout={logout} goChat={() => setTab('chat')} />}
      {tab === 'chat' && <ChatScreen user={user} />}

      {/* Left Drawer Navigation */}
      {drawerOpen && (
        <TouchableOpacity
          style={styles.drawerBackdrop}
          activeOpacity={1}
          onPress={() => setDrawerOpen(false)}
        />
      )}
      <Animated.View style={[styles.drawer, { transform: [{ translateX: drawerAnim }] }]}>
        <Gradient colors={[COLORS.dark, COLORS.primary]} style={[styles.drawerHeader, { paddingTop: Platform.OS === 'ios' ? 54 : 46 }]}>
          <View style={styles.seal}>
            <Text style={{ fontSize: 22 }}>🏛️</Text>
          </View>
          <View style={{ marginLeft: 10, flex: 1 }}>
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>BARANGAY SAN JOSE</Text>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11 }}>RESIDENT SERVICES</Text>
          </View>
          <TouchableOpacity onPress={() => setDrawerOpen(false)} style={styles.drawerClose}>
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900' }}>✕</Text>
          </TouchableOpacity>
        </Gradient>
        <View style={styles.drawerUser}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.full_name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || 'U'}
            </Text>
          </View>
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={{ fontWeight: '700', color: '#1e293b', fontSize: 15 }}>{user.full_name}</Text>
            <Text style={{ fontSize: 12, color: COLORS.gray, marginTop: 2 }}>{user.role === 'admin' ? 'Administrator' : 'Resident'}</Text>
          </View>
        </View>
        <View style={styles.drawerItems}>
          {[
            ['home', '🏠', 'Home'],
            ['services', '🧾', 'Services'],
            ['apply', '📝', 'Apply'],
            ['requests', '🕒', 'Requests'],
            ['profile', '👤', 'Profile'],
            ['chat', '💬', 'Live Chat'],
          ].map(([key, icon, label]) => (
            <TouchableOpacity
              key={key}
              style={[styles.drawerItem, tab === key && styles.drawerItemActive]}
              onPress={() => { setTab(key); setDrawerOpen(false); }}
              activeOpacity={0.7}
            >
              <View style={[styles.drawerItemIcon, tab === key && styles.drawerItemIconActive]}>
                <Text style={{ fontSize: 18 }}>{icon}</Text>
              </View>
              <Text style={[styles.drawerItemText, tab === key && { color: COLORS.primary, fontWeight: '800' }]}>{label}</Text>
              {key === 'requests' && hasReady && <View style={styles.dot} />}
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.drawerFooter}>
          <TouchableOpacity style={styles.drawerLogout} onPress={() => { setDrawerOpen(false); logout(); }} activeOpacity={0.7}>
            <Text style={{ fontSize: 18, marginRight: 10 }}>🚪</Text>
            <Text style={{ color: '#dc2626', fontWeight: '700', fontSize: 15 }}>Logout</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

// ---------- Styles ----------
const styles = StyleSheet.create({
  authWrap: { flex: 1, backgroundColor: COLORS.bg },
  authHeader: { alignItems: 'center', paddingTop: 70, paddingBottom: 40, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  authTitle: { fontSize: 20, fontWeight: '800', marginTop: 10, color: '#fff', letterSpacing: 1 },
  authSub: { color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 2 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 18, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2, marginBottom: 14 },
  cardTitle: { fontSize: 18, fontWeight: '800', color: COLORS.dark, marginBottom: 12 },
  label: { fontWeight: '700', fontSize: 13, marginBottom: 6, color: '#334155' },
  btn: { borderRadius: 10, padding: 14, alignItems: 'center' },
  btnPrimary: { backgroundColor: COLORS.primary },
  btnGhost: { backgroundColor: '#fff', borderWidth: 1, borderColor: COLORS.primary },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  hint: { textAlign: 'center', color: COLORS.gray, fontSize: 12, marginTop: 10, marginBottom: 20 },

  header: { paddingTop: 46, paddingBottom: 16, paddingHorizontal: 16 },
  headerTop: { flexDirection: 'row', alignItems: 'center' },
  seal: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 15, fontWeight: '800', letterSpacing: 0.5 },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 10, letterSpacing: 1, marginTop: 2 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.6)' },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  headerPage: { color: '#fff', fontSize: 16, fontWeight: '800', marginTop: 12 },

  page: { padding: 16, paddingBottom: 40 },
  hero: { borderRadius: 22, padding: 20, marginBottom: 14 },
  heroKicker: { color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginBottom: 8 },
  heroTitle: { color: '#fff', fontSize: 27, fontWeight: '800', lineHeight: 33 },
  heroSub: { color: 'rgba(255,255,255,0.9)', fontSize: 13, marginTop: 8, marginBottom: 14 },
  heroBtn: { backgroundColor: '#fff', borderRadius: 10, paddingVertical: 11, paddingHorizontal: 18, alignSelf: 'flex-start' },
  heroBtnText: { color: COLORS.primary, fontWeight: '800', fontSize: 14 },

  statRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard2: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 14, elevation: 2 },
  statIcon: { fontSize: 20, marginBottom: 6 },
  statNum: { fontSize: 17, fontWeight: '800', color: COLORS.dark },
  statLabel: { fontSize: 11, color: COLORS.gray, marginTop: 2 },

  sectionTitle: { fontSize: 17, fontWeight: '800', color: COLORS.dark },
  sectionSub: { fontSize: 12, color: COLORS.gray },

  serviceCard: { backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 12, elevation: 2 },
  serviceRow: { flexDirection: 'row', alignItems: 'flex-start' },
  serviceIcon: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  serviceTitle: { fontSize: 16, fontWeight: '800', color: '#1e293b' },
  serviceDesc: { fontSize: 12.5, color: COLORS.gray, marginTop: 3, lineHeight: 17 },
  serviceMeta: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  pricePill: { backgroundColor: '#fde8d7', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  priceFree: { backgroundColor: '#d9f2e4' },
  priceText: { color: '#c2410c', fontWeight: '800', fontSize: 12 },
  timeText: { fontSize: 12, color: COLORS.gray },
  chevron: { fontSize: 26, color: '#cbd5e1', marginLeft: 6, marginTop: 8 },

  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, elevation: 2 },

  noteCard: { backgroundColor: '#fff8e1', borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#ffe082' },
  noteTitle: { fontWeight: '800', color: '#8d6e00', marginBottom: 4 },
  noteText: { color: '#7a6a1f', fontSize: 12.5, lineHeight: 18 },
  warnCard: { backgroundColor: '#fff3cd', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#ffc107' },
  warnText: { color: '#856404', fontSize: 12.5, lineHeight: 18 },
  okCard: { backgroundColor: '#d4edda', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#28a745' },
  okText: { color: '#155724', fontSize: 12.5, lineHeight: 18 },

  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: COLORS.border, elevation: 1 },
  chipActive: { borderColor: COLORS.primary, backgroundColor: '#fde8d7' },
  chipText: { fontSize: 12.5, color: '#334155', fontWeight: '600' },

  selectedCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 12, marginBottom: 14, elevation: 2, borderWidth: 1, borderColor: COLORS.primary },
  sectionLabel: { fontWeight: '800', color: '#64748b', fontSize: 13, letterSpacing: 0.5, marginBottom: 10, marginTop: 4 },
  prioChip: { flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingVertical: 10, alignItems: 'center', backgroundColor: '#fff' },
  prioChipActive: { borderColor: COLORS.primary, backgroundColor: '#fde8d7' },
  uploadBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: COLORS.accent, borderStyle: 'dashed', borderRadius: 12, padding: 12, backgroundColor: '#fff7f2' },
  certBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee', borderRadius: 12, padding: 12, marginTop: 4 },
  certBoxSquare: { width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: '#cbd5e1', justifyContent: 'center', alignItems: 'center' },

  typeOption: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 12, marginBottom: 8 },
  typeOptionActive: { borderColor: COLORS.primary, backgroundColor: '#fde8d7' },
  typeText: { color: '#334155' },

  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  tabBar: { flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: COLORS.border, paddingVertical: 8 },
  tabItem: { flex: 1, alignItems: 'center' },
  tabLabel: { fontSize: 10, color: COLORS.gray, marginTop: 2 },
  tabIndicator: { width: 24, height: 3, borderRadius: 2, backgroundColor: COLORS.primary, marginTop: 3 },
  dot: { position: 'absolute', top: -2, right: -8, width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e' },

  // ---------- Left Drawer Navigation (redesigned: no borders, clean) ----------
  menuBtn: { marginRight: 4, padding: 6, borderRadius: 10 },
  drawerBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,23,42,0.45)', zIndex: 50 },
  drawer: { position: 'absolute', top: 0, left: 0, bottom: 0, width: 290, backgroundColor: '#fff', zIndex: 60, borderTopRightRadius: 26, borderBottomRightRadius: 26, elevation: 18, shadowColor: '#000', shadowOpacity: 0.22, shadowRadius: 22, overflow: 'hidden' },
  drawerHeader: { paddingBottom: 18, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' },
  drawerClose: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  drawerUser: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 14, marginBottom: 6, padding: 14, backgroundColor: '#faf7f2', borderRadius: 16 },
  drawerItems: { flex: 1, paddingHorizontal: 14, paddingTop: 6 },
  drawerItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14, borderRadius: 14, marginBottom: 4 },
  drawerItemActive: { backgroundColor: '#fde8d7' },
  drawerItemIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  drawerItemIconActive: { backgroundColor: '#fff' },
  drawerItemText: { fontSize: 15, color: '#334155', fontWeight: '600', flex: 1 },
  drawerFooter: { padding: 16 },
  drawerLogout: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, paddingHorizontal: 14, borderRadius: 14, backgroundColor: '#fee2e2' },

  bubble: { maxWidth: '75%', borderRadius: 14, padding: 10, marginBottom: 8 },
  bubbleSent: { alignSelf: 'flex-end', backgroundColor: COLORS.primary },
  bubbleRecv: { alignSelf: 'flex-start', backgroundColor: '#e9ecef' },
  chatBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', padding: 10, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: COLORS.border },
  chatInput: { flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  sendBtn: { backgroundColor: COLORS.primary, borderRadius: 20, width: 40, height: 40, marginLeft: 8, justifyContent: 'center', alignItems: 'center' },
});
