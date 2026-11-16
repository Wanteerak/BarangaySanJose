import { useState, useRef } from 'react';
import { requestAPI } from '../api';
import { SERVICES } from './Home';
import Icon, { SERVICE_ICONS } from './Icons';

const TYPES = SERVICES.map((s) => ({ value: s.value, label: s.label }));

// Config-driven forms: bawat serbisyo may sariling fields + requirements
// (madaling dagdagan kapag may bagong mockup na ipapadala)
export const SERVICE_FORMS = {
  clearance: {
    requirements: [
      "Photocopy of Voter's ID, voter stub, COMELEC certification, or any valid government ID",
      'Applicant must be a verified Barangay San Jose resident',
    ],
    fields: [
      { key: 'purpose', label: 'Purpose / Kahiligan', placeholder: 'e.g. Local employment', required: true },
      { key: 'complete_name', label: 'Complete name', placeholder: 'Full legal name', required: true },
      { key: 'complete_address', label: 'Complete address', placeholder: 'House no., street, purok, Barangay San Jose', required: true },
      { key: 'date_of_birth', label: 'Date of birth', placeholder: '', type: 'date', required: true },
      { key: 'birth_place', label: 'Place of birth', placeholder: 'City / municipality', required: true },
      { key: 'contact_number', label: 'Contact number', placeholder: '09XX XXX XXXX', required: true },
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
      { key: 'complete_name', label: 'Name of applicant', placeholder: '', required: true },
      { key: 'complete_address', label: 'Complete address', placeholder: '', required: true },
      { key: 'beneficiary_name', label: 'Name of beneficiary', placeholder: '', required: true },
      { key: 'beneficiary_relation', label: 'Relationship to beneficiary', placeholder: 'e.g. Child', required: true },
      { key: 'contact_number', label: 'Contact number', placeholder: '09XX XXX XXXX', required: true },
    ],
    priority: false,
  },
  low_income: {
    requirements: [
      "Photocopy of Voter's ID, voter stub, COMELEC certification, or any valid government ID",
      'Applicant must be a verified Barangay San Jose resident',
    ],
    fields: [
      { key: 'complete_name', label: 'Name of applicant', placeholder: '', required: true },
      { key: 'child_name', label: 'Name of child', placeholder: '', required: true },
      { key: 'complete_address', label: 'Complete address', placeholder: '', required: true },
      { key: 'father_name', label: "Father's name", placeholder: '', required: true },
      { key: 'mother_name', label: "Mother's name", placeholder: '', required: true },
      { key: 'contact_number', label: 'Contact number', placeholder: '09XX XXX XXXX', required: true },
    ],
    priority: false,
  },
  guardianship: {
    requirements: [
      "Photocopy of Voter's ID, voter stub, COMELEC certification, or any valid government ID",
      'Applicant must be a verified Barangay San Jose resident',
    ],
    fields: [
      { key: 'guardian_name', label: 'Name of guardian', placeholder: '', required: true },
      { key: 'complete_address', label: 'Residence / address', placeholder: '', required: true },
      { key: 'child_name', label: 'Name of child', placeholder: '', required: true },
      { key: 'relationship', label: 'Relationship', placeholder: '', required: true },
    ],
    priority: true,
  },
  cohabitation: {
    requirements: [
      "Photocopy of Voter's ID, voter stub, COMELEC certification, or any valid government ID",
      'Applicant must be a verified Barangay San Jose resident',
    ],
    fields: [
      { key: 'partner1_name', label: 'Partner 1 complete name', placeholder: '', required: true },
      { key: 'partner1_birthday', label: 'Partner 1 birthday', placeholder: '', type: 'date', required: true },
      { key: 'partner2_name', label: 'Partner 2 complete name', placeholder: '', required: true },
      { key: 'partner2_birthday', label: 'Partner 2 birthday', placeholder: '', type: 'date', required: true },
      { key: 'shared_residence', label: 'Shared residence', placeholder: '', required: true },
      { key: 'years_living', label: 'Years living together', placeholder: '', required: true },
      { key: 'cohabitation_started', label: 'Year cohabitation started', placeholder: '', required: true },
      { key: 'children_info', label: "Children's names and ages", placeholder: 'One child per line, or write None', type: 'textarea', required: false },
    ],
    priority: true,
  },
};

// Default config para sa mga serbisyong wala pang dedicated mockup
const DEFAULT_FORM = {
  requirements: [
    'Any valid government ID',
    'Applicant must be a verified Barangay San Jose resident',
  ],
  fields: [
    { key: 'purpose', label: 'Purpose / Kahiligan', placeholder: 'e.g. Local employment', required: true },
    { key: 'complete_name', label: 'Complete name', placeholder: 'Full legal name', required: true },
    { key: 'complete_address', label: 'Complete address', placeholder: 'House no., street, purok, Barangay San Jose', required: true },
    { key: 'contact_number', label: 'Contact number', placeholder: '09XX XXX XXXX', required: true },
  ],
  priority: false,
};
const getFormCfg = (type) => SERVICE_FORMS[type] || DEFAULT_FORM;

const PRIORITY_OPTIONS = ['Senior', 'PWD', 'Pregnant'];

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function RequestForm({ setPage }) {
  const preset = (typeof window !== 'undefined' && window.__bsj_preset_service) || '';
  const [form, setForm] = useState({ type: preset, purpose: '' });
  const [applicant, setApplicant] = useState({});
  const [prioritySel, setPrioritySel] = useState([]);
  const [certified, setCertified] = useState(false);
  const [idForm, setIdForm] = useState({
    id_request_type: 'new',
    first_name: '',
    middle_name: '',
    surname: '',
    birth_place: '',
    contact_number: '',
    is_voter: '',
    requirement_type: 'voters',
    emergency_contact_name: '',
    emergency_contact_number: '',
  });
  const [photo, setPhoto] = useState(null);
  const [hoaCert, setHoaCert] = useState(null);
  const [requirement, setRequirement] = useState(null);
  const [frontPhoto, setFrontPhoto] = useState(null);
  const [backPhoto, setBackPhoto] = useState(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [submitted, setSubmitted] = useState(null);

  const photoInputRef = useRef(null);
  const reqInputRef = useRef(null);
  const hoaInputRef = useRef(null);
  const frontInputRef = useRef(null);
  const backInputRef = useRef(null);

  const handleFile = async (file, setter) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('File too large. Max 5MB.');
      return;
    }
    try {
      const b64 = await fileToBase64(file);
      setter(b64);
      setError('');
    } catch {
      setError('Failed to read file.');
    }
  };

  const isId = form.type === 'id';
  const isNew = idForm.id_request_type === 'new';
  const formCfg = getFormCfg(form.type);

  const togglePriority = (p) => {
    setPrioritySel((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  };

  const buildPayload = () => {
    const payload = {
      type: form.type,
      purpose: form.purpose,
    };
    if (form.type === 'id') {
      payload.id_request_type = idForm.id_request_type;
      payload.first_name = idForm.first_name;
      payload.middle_name = idForm.middle_name;
      payload.surname = idForm.surname;
      payload.birth_place = idForm.birth_place;
      payload.contact_number = idForm.contact_number;
      payload.emergency_contact_name = idForm.emergency_contact_name;
      payload.emergency_contact_number = idForm.emergency_contact_number;
      if (idForm.id_request_type === 'new') {
        payload.requirement_type = idForm.requirement_type;
        payload.id_photo = photo;
        payload.hoa_cert = hoaCert;
        payload.requirement_doc = requirement;
      } else {
        payload.is_voter = idForm.is_voter === 'yes';
        payload.front_photo = frontPhoto;
        payload.back_photo = backPhoto;
        if (idForm.is_voter === 'no') {
          payload.requirement_type = idForm.requirement_type;
          payload.hoa_cert = hoaCert;
          payload.requirement_doc = requirement;
        }
      }
    } else {
      // Certificate services (clearance, indigency, atbp.)
      Object.assign(payload, applicant);
      payload.priority = prioritySel.join(', ') || null;
      payload.certified = certified;
      payload.requirement_doc = requirement;
      payload.id_photo = null;
    }
    return payload;
  };

  const buildSummary = (payload) => {
    const cfg = getFormCfg(payload.type);
    let lines = [];
    lines.push('REQUEST SUMMARY (Double-Check)');
    lines.push('-----------------------------');
    const typeLabel = (v) => (TYPES.find((t) => t.value === v)?.label || v);
    lines.push('Request Type: ' + typeLabel(payload.type));
    if (payload.type === 'id') {
      lines.push('ID Request Type: ' + (payload.id_request_type === 'new' ? 'New ID (First Time)' : 'Renew ID'));
      lines.push('Name: ' + [payload.first_name, payload.middle_name, payload.surname].filter(Boolean).join(' '));
      lines.push('Birth Place: ' + payload.birth_place);
      lines.push('Contact Number: ' + payload.contact_number);
      lines.push('Emergency Contact: ' + payload.emergency_contact_name + ' - ' + payload.emergency_contact_number);
      if (payload.id_request_type === 'new') {
        lines.push('Requirement Type: ' + (payload.requirement_type === 'voters' ? "Voter's Certificate" : 'Valid ID (not TIN)'));
        lines.push('HOA Certificate: Uploaded');
        lines.push('Secondary ID: Uploaded');
        lines.push('ID Photo: Uploaded');
      } else {
        lines.push('Registered Voter: ' + (payload.is_voter ? 'Yes' : 'No'));
        if (!payload.is_voter) {
          lines.push('Requirement Type: ' + (payload.requirement_type === 'voters' ? "Voter's Certificate" : 'Valid ID (not TIN)'));
          lines.push('HOA Certificate: Uploaded');
          lines.push('Secondary ID: Uploaded');
        }
        lines.push('Front of Old ID: Uploaded');
        lines.push('Back of Old ID: Uploaded');
        lines.push('Note: Old ID must be surrendered at barangay hall.');
      }
    } else {
      cfg.fields.forEach((f) => {
        const val = payload[f.key];
        if (val) lines.push(f.label + ': ' + val);
      });
      if (payload.priority) lines.push('Priority: ' + payload.priority);
      lines.push('Proof of Identity: Uploaded');
      lines.push('Certified: Yes');
    }
    lines.push('-----------------------------');
    lines.push('I-submit na ba? (OK = Submit, Cancel = Edit)');
    return lines.join('\n');
  };

  const validate = () => {
    if (!form.type) {
      setError('Please select a service.');
      return false;
    }
    if (form.type === 'id') {
      if (!idForm.first_name || !idForm.surname) {
        setError('Please fill in First Name and Surname.');
        return false;
      }
      if (!idForm.birth_place || !idForm.contact_number) {
        setError('Please fill in Birth Place and Contact Number.');
        return false;
      }
      if (!idForm.emergency_contact_name || !idForm.emergency_contact_number) {
        setError('Please fill in Emergency Contact Person (name and number).');
        return false;
      }
      if (isNew) {
        if (!photo) {
          setError('Please upload or take a picture for the ID photo.');
          return false;
        }
        if (!hoaCert) {
          setError('Please upload HOA Certificate (required).');
          return false;
        }
        if (!requirement) {
          setError("Please upload Voter's Certificate or other Valid ID (not TIN ID).");
          return false;
        }
      } else {
        if (!idForm.is_voter) {
          setError('Please select if you are a registered voter or not.');
          return false;
        }
        if (idForm.is_voter === 'no') {
          if (!hoaCert) {
            setError('Please upload HOA Certificate (required).');
            return false;
          }
          if (!requirement) {
            setError("Please upload Voter's Certificate or other Valid ID (not TIN ID).");
            return false;
          }
        }
        if (!frontPhoto || !backPhoto) {
          setError('Please upload front and back of old ID (back-to-back).');
          return false;
        }
      }
    } else {
      // Certificate services
      for (const f of formCfg.fields) {
        if (f.required && !String(applicant[f.key] || '').trim()) {
          setError('Please fill in: ' + f.label);
          return false;
        }
      }
      if (!requirement) {
        setError('Please upload your Proof of Identity (valid ID or voter document).');
        return false;
      }
      if (!certified) {
        setError('Please check the certification box before submitting.');
        return false;
      }
    }
    setError('');
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setPreviewData(buildPayload());
    setShowPreview(true);
  };

  const confirmSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await requestAPI.submitRequest(previewData);
      if (res.data.success) {
        setSubmitted({ code: res.data.data.request_code, type: previewData.type });
        setForm({ type: '', purpose: '' });
        setApplicant({});
        setPrioritySel([]);
        setCertified(false);
        setIdForm({ id_request_type: 'new', first_name: '', middle_name: '', surname: '', birth_place: '', contact_number: '', is_voter: '', requirement_type: 'voters', emergency_contact_name: '', emergency_contact_number: '' });
        setPhoto(null);
        setHoaCert(null);
        setRequirement(null);
        setFrontPhoto(null);
        setBackPhoto(null);
        if (photoInputRef.current) photoInputRef.current.value = '';
        if (reqInputRef.current) reqInputRef.current.value = '';
        if (hoaInputRef.current) hoaInputRef.current.value = '';
        if (frontInputRef.current) frontInputRef.current.value = '';
        if (backInputRef.current) backInputRef.current.value = '';
        setShowPreview(false);
        setPreviewData(null);
      } else {
        setError(res.data.message || 'Failed to submit request.');
        setShowPreview(false);
      }
    } catch (err) {
      setError('Failed to submit request. Make sure backend and MySQL are running.');
      setShowPreview(false);
    } finally {
      setLoading(false);
    }
  };

  const cancelPreview = () => {
    setShowPreview(false);
    setPreviewData(null);
  };

  const typeLabel = (v) => (TYPES.find((t) => t.value === v)?.label || v);
  const selectedService = SERVICES.find((s) => s.value === form.type);

  // ===== SUCCESS SCREEN (Request submitted) =====
  if (submitted) {
    return (
      <div className="page">
        <div className="msuccess">
          <div className="msuccess-check"><Icon name="check" size={52} color="#10b981" strokeWidth={3} /></div>
          <h2>Request submitted</h2>
          <p>Your {typeLabel(submitted.type)} application is now queued for document review.</p>
          <div className="msuccess-ref">
            <small>REFERENCE NUMBER</small>
            <strong>{submitted.code}</strong>
            <span>Keep this number for tracking and pickup.</span>
          </div>
          <button
            className="msuccess-track"
            onClick={() => { setSubmitted(null); setPage('my-requests'); }}
          >
            Track my request
          </button>
        </div>
      </div>
    );
  }

  if (showPreview && previewData) {
    const cfg = getFormCfg(previewData.type);
    const lines = [];
    lines.push(['Request Type', typeLabel(previewData.type)]);
    if (previewData.type === 'id') {
      lines.push(['ID Type', previewData.id_request_type === 'new' ? 'New ID (First Time)' : 'Renew ID']);
      lines.push(['Name', [previewData.first_name, previewData.middle_name, previewData.surname].filter(Boolean).join(' ')]);
      lines.push(['Birth Place', previewData.birth_place]);
      lines.push(['Contact Number', previewData.contact_number]);
      lines.push(['Emergency Contact', previewData.emergency_contact_name + ' - ' + previewData.emergency_contact_number]);
      if (previewData.id_request_type === 'new') {
        lines.push(['Requirement Type', previewData.requirement_type === 'voters' ? "Voter's Certificate" : 'Valid ID (not TIN)']);
        lines.push(['HOA Certificate', 'Uploaded']);
        lines.push(['Secondary ID', 'Uploaded']);
        lines.push(['ID Photo', 'Uploaded']);
      } else {
        lines.push(['Registered Voter', previewData.is_voter ? 'Yes (Botante)' : 'No']);
        if (!previewData.is_voter) {
          lines.push(['Requirement Type', previewData.requirement_type === 'voters' ? "Voter's Certificate" : 'Valid ID (not TIN)']);
          lines.push(['HOA Certificate', 'Uploaded']);
          lines.push(['Secondary ID', 'Uploaded']);
        }
        lines.push(['Front of Old ID', 'Uploaded']);
        lines.push(['Back of Old ID', 'Uploaded']);
      }
    } else {
      cfg.fields.forEach((f) => {
        const val = previewData[f.key];
        if (val) lines.push([f.label, val]);
      });
      if (previewData.priority) lines.push(['Priority', previewData.priority]);
      lines.push(['Proof of Identity', 'Uploaded']);
      lines.push(['Certified', 'Yes']);
    }

    return (
      <div className="page">
        <button className="btn-back" onClick={cancelPreview}>Back to Edit</button>
        <h1>Double-Check Your Request</h1>
        <p className="welcome-text">Review all details carefully before submitting.</p>

        {error && <div className="flash-error">{error}</div>}

        <div className="card">
          <h2>Request Summary</h2>
          <div className="status-card" style={{ marginTop: '0.5rem' }}>
            {lines.map(([label, val]) => (
              <p key={label}><strong>{label}:</strong> {val}</p>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={confirmSubmit} disabled={loading}>
              {loading ? 'Submitting...' : 'Confirm and Submit'}
            </button>
            <button className="btn btn-outline" onClick={cancelPreview} disabled={loading}>
              Edit / Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <button className="btn-back" onClick={() => setPage('dashboard')}>Back</button>

      <h1>New Application</h1>
      <p className="welcome-text">Apply for certificates or your Barangay ID from the Barangay San Jose hall.</p>

      {error && <div className="flash-error">{error}</div>}
      {success && <div className="flash-success">{success}</div>}

      {/* Service selection (service cards) */}
      {!form.type && (
        <div className="card">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Choose a Service (pindutin ang isa)</label>
            <div className="mservice-list" style={{ maxHeight: 'none' }}>
              {SERVICES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  className="mservice"
                  onClick={() => setForm({ ...form, type: s.value })}
                >
                  <span className="mservice-icon" style={{ background: s.iconBg }}>
                    <Icon name={SERVICE_ICONS[s.value]} size={24} color={s.iconColor} />
                  </span>
                  <span className="mservice-body">
                    <strong className="mservice-title">{s.label}</strong>
                    <span className="mservice-desc">{s.desc}</span>
                    <span className="mservice-meta">
                      <span className="mservice-price" style={s.price === 'Free' ? { background: '#d9f2e4', color: '#15803d' } : {}}>{s.price}</span>
                      <span className="mservice-time"><Icon name="clock" size={13} color="#64748b" /> {s.time}</span>
                    </span>
                  </span>
                  <span className="mservice-chev">›</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Selected service card + Change */}
      {form.type && selectedService && (
        <div className="msummary">
          <span className="mservice-icon" style={{ background: selectedService.iconBg }}>
            <Icon name={SERVICE_ICONS[selectedService.value]} size={24} color={selectedService.iconColor} />
          </span>
          <span className="msummary-body">
            <strong>{selectedService.label}</strong>
            <span className="msummary-meta">
              <span className="mservice-price" style={selectedService.price === 'Free' ? { background: '#d9f2e4', color: '#15803d' } : {}}>{selectedService.price}</span>
              <span>• {selectedService.time}</span>
            </span>
          </span>
          <button type="button" className="msummary-change" onClick={() => setForm({ type: '', purpose: '' })}>
            Change
          </button>
        </div>
      )}

      {form.type && !isId && (
        <div className="card">
          <form onSubmit={handleSubmit}>
            {/* Requirements */}
            <div className="mnote" style={{ marginTop: 0, marginBottom: '1.2rem' }}>
              <strong>Requirements</strong>
              <ul style={{ margin: '0.3rem 0 0 1.2rem' }}>
                {formCfg.requirements.map((r, i) => (
                  <li key={i} style={{ color: '#7a6a1f', fontSize: '0.85rem', lineHeight: 1.5 }}>{r}</li>
                ))}
              </ul>
            </div>

            <h3 style={{ color: '#64748b', letterSpacing: '0.5px', fontSize: '0.85rem', marginBottom: '0.8rem' }}>APPLICANT INFORMATION</h3>

            {formCfg.fields.map((f) => (
              <div className="form-group" key={f.key}>
                <label>{f.label}{f.required ? ' *' : ''}</label>
                {f.type === 'date' ? (
                  <input
                    type="date"
                    value={applicant[f.key] || ''}
                    onChange={(e) => setApplicant({ ...applicant, [f.key]: e.target.value })}
                  />
                ) : f.type === 'textarea' ? (
                  <textarea
                    rows="3"
                    value={applicant[f.key] || ''}
                    onChange={(e) => setApplicant({ ...applicant, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                  />
                ) : f.key === 'complete_address' ? (
                  <textarea
                    rows="2"
                    value={applicant[f.key] || ''}
                    onChange={(e) => setApplicant({ ...applicant, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                  />
                ) : (
                  <input
                    type="text"
                    value={applicant[f.key] || ''}
                    onChange={(e) => setApplicant({ ...applicant, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                  />
                )}
              </div>
            ))}

            {formCfg.priority && (
              <div className="form-group">
                <label>Priority classification</label>
                <div className="mpriority-row">
                  {PRIORITY_OPTIONS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      className={`mpriority-chip ${prioritySel.includes(p) ? 'sel' : ''}`}
                      onClick={() => togglePriority(p)}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Proof of identity upload */}
            <div className="form-group">
              <label>Proof of identity *</label>
              <div className="mupload" onClick={() => reqInputRef.current?.click()}>
                <span className="mupload-icon"><Icon name="upload" size={24} color="#c2410c" /></span>
                <div>
                  <strong>Upload valid ID or voter document</strong>
                  <small>JPG, PNG, or PDF • Max 5 MB</small>
                </div>
              </div>
              <input
                ref={reqInputRef}
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => handleFile(e.target.files?.[0], setRequirement)}
                className="mfile-hidden"
              />
              {requirement && <p style={{ fontSize: '0.8rem', color: '#155724', marginTop: '0.3rem' }}>✔ Proof of identity uploaded</p>}
            </div>

            {/* Certification checkbox */}
            <label className="mcertify">
              <input
                type="checkbox"
                checked={certified}
                onChange={(e) => setCertified(e.target.checked)}
              />
              <span>
                I certify that the information provided is true and authorize Barangay San Jose to verify my resident record.
              </span>
            </label>

            <button type="submit" className="msubmit" disabled={loading || !certified}>
              {loading ? 'Submitting...' : 'Submit request'}
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setPage('dashboard')}
              style={{ marginLeft: '0.5rem', marginTop: '0.5rem' }}
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {isId && (
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Type of Request</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 400, cursor: 'pointer', padding: '0.5rem 0.8rem', border: '1px solid #ddd', borderRadius: 8, background: idForm.id_request_type === 'new' ? '#eef4f7' : '#fff' }}>
                  <input
                    type="radio"
                    name="idreqtype"
                    value="new"
                    checked={idForm.id_request_type === 'new'}
                    onChange={(e) => setIdForm({ ...idForm, id_request_type: e.target.value })}
                  />
                  New ID (First Time)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 400, cursor: 'pointer', padding: '0.5rem 0.8rem', border: '1px solid #ddd', borderRadius: 8, background: idForm.id_request_type === 'renew' ? '#eef4f7' : '#fff' }}>
                  <input
                    type="radio"
                    name="idreqtype"
                    value="renew"
                    checked={idForm.id_request_type === 'renew'}
                    onChange={(e) => setIdForm({ ...idForm, id_request_type: e.target.value })}
                  />
                  Renew ID
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                value={idForm.first_name}
                onChange={(e) => setIdForm({ ...idForm, first_name: e.target.value })}
                placeholder="e.g., Juan"
                required
              />
            </div>

            <div className="form-group">
              <label>Middle Name</label>
              <input
                type="text"
                value={idForm.middle_name}
                onChange={(e) => setIdForm({ ...idForm, middle_name: e.target.value })}
                placeholder="e.g., Santos (optional)"
              />
            </div>

            <div className="form-group">
              <label>Surname</label>
              <input
                type="text"
                value={idForm.surname}
                onChange={(e) => setIdForm({ ...idForm, surname: e.target.value })}
                placeholder="e.g., Dela Cruz"
                required
              />
            </div>

            <div className="form-group">
              <label>Birth Place</label>
              <input
                type="text"
                value={idForm.birth_place}
                onChange={(e) => setIdForm({ ...idForm, birth_place: e.target.value })}
                placeholder="e.g., Quezon City"
                required
              />
            </div>

            <div className="form-group">
              <label>Contact Number</label>
              <input
                type="tel"
                value={idForm.contact_number}
                onChange={(e) => setIdForm({ ...idForm, contact_number: e.target.value })}
                placeholder="e.g., 09171234567"
                required
              />
            </div>

            <div className="form-group">
              <label>Emergency Contact Person (In Case of Emergency)</label>
              <input
                type="text"
                value={idForm.emergency_contact_name}
                onChange={(e) => setIdForm({ ...idForm, emergency_contact_name: e.target.value })}
                placeholder="Name of emergency contact"
                required
              />
            </div>

            <div className="form-group">
              <label>Emergency Contact Number</label>
              <input
                type="tel"
                value={idForm.emergency_contact_number}
                onChange={(e) => setIdForm({ ...idForm, emergency_contact_number: e.target.value })}
                placeholder="e.g., 09187654321"
                required
              />
            </div>

            {idForm.id_request_type === 'new' && (
              <div>
                <div className="form-group">
                  <label>HOA Certificate (Required)</label>
                  <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.4rem' }}>
                    Upload HOA Certificate under your name, addressed to Barangay San Jose.
                  </p>
                  <input
                    ref={hoaInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => handleFile(e.target.files?.[0], setHoaCert)}
                  />
                  {hoaCert && <p style={{ fontSize: '0.8rem', color: '#155724', marginTop: '0.3rem' }}>✔ HOA Certificate uploaded</p>}
                </div>

                <div className="form-group">
                  <label>Secondary ID (Voter's Certificate or other Valid ID)</label>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 400, cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="reqtype"
                        value="voters"
                        checked={idForm.requirement_type === 'voters'}
                        onChange={(e) => setIdForm({ ...idForm, requirement_type: e.target.value })}
                      />
                      Voter's Certificate
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 400, cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="reqtype"
                        value="valid_id"
                        checked={idForm.requirement_type === 'valid_id'}
                        onChange={(e) => setIdForm({ ...idForm, requirement_type: e.target.value })}
                      />
                      Valid ID (not TIN ID)
                    </label>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.4rem' }}>
                    {idForm.requirement_type === 'voters'
                      ? "Upload Voter's Certificate under your name, addressed to Barangay San Jose."
                      : 'Upload any valid ID (Driver\'s License, Passport, SSS, PhilHealth, Postal ID, etc.) - TIN ID is NOT allowed. Must be under your name in San Jose.'}
                  </p>
                  <input
                    ref={reqInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => handleFile(e.target.files?.[0], setRequirement)}
                  />
                  {requirement && <p style={{ fontSize: '0.8rem', color: '#155724', marginTop: '0.3rem' }}>✔ Secondary ID uploaded</p>}
                </div>

                <div className="form-group">
                  <label>Picture (ID Photo)</label>
                  <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.4rem' }}>
                    Upload a photo or take a picture here (camera).
                  </p>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    capture="user"
                    onChange={(e) => handleFile(e.target.files?.[0], setPhoto)}
                  />
                  {photo && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <img src={photo} alt="ID photo" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8, border: '1px solid #ddd' }} />
                      <p style={{ fontSize: '0.8rem', color: '#155724', marginTop: '0.3rem' }}>✔ Picture uploaded</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {idForm.id_request_type === 'renew' && (
              <div>
                <div style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 8, padding: '0.8rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#856404' }}>
                  Note: For renewal, please submit front and back of old ID (back-to-back). After approval, you must surrender the old ID at the barangay hall before claiming the new one.
                </div>

                <div className="form-group">
                  <label>Are you a Registered Voter?</label>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 400, cursor: 'pointer', padding: '0.5rem 0.8rem', border: '1px solid #ddd', borderRadius: 8, background: idForm.is_voter === 'yes' ? '#eef4f7' : '#fff' }}>
                      <input
                        type="radio"
                        name="isvoter"
                        value="yes"
                        checked={idForm.is_voter === 'yes'}
                        onChange={(e) => setIdForm({ ...idForm, is_voter: e.target.value })}
                      />
                      Yes (Botante)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 400, cursor: 'pointer', padding: '0.5rem 0.8rem', border: '1px solid #ddd', borderRadius: 8, background: idForm.is_voter === 'no' ? '#eef4f7' : '#fff' }}>
                      <input
                        type="radio"
                        name="isvoter"
                        value="no"
                        checked={idForm.is_voter === 'no'}
                        onChange={(e) => setIdForm({ ...idForm, is_voter: e.target.value })}
                      />
                      No (Hindi Botante)
                    </label>
                  </div>
                </div>

                {idForm.is_voter === 'no' && (
                  <div>
                    <div className="form-group">
                      <label>HOA Certificate (Required)</label>
                      <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.4rem' }}>
                        Upload HOA Certificate under your name, addressed to Barangay San Jose.
                      </p>
                      <input
                        ref={hoaInputRef}
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => handleFile(e.target.files?.[0], setHoaCert)}
                      />
                      {hoaCert && <p style={{ fontSize: '0.8rem', color: '#155724', marginTop: '0.3rem' }}>✔ HOA Certificate uploaded</p>}
                    </div>

                    <div className="form-group">
                      <label>Secondary ID (Voter's Certificate or other Valid ID)</label>
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 400, cursor: 'pointer' }}>
                          <input
                            type="radio"
                            name="reqtype2"
                            value="voters"
                            checked={idForm.requirement_type === 'voters'}
                            onChange={(e) => setIdForm({ ...idForm, requirement_type: e.target.value })}
                          />
                          Voter's Certificate
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 400, cursor: 'pointer' }}>
                          <input
                            type="radio"
                            name="reqtype2"
                            value="valid_id"
                            checked={idForm.requirement_type === 'valid_id'}
                            onChange={(e) => setIdForm({ ...idForm, requirement_type: e.target.value })}
                          />
                          Valid ID (not TIN ID)
                        </label>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.4rem' }}>
                        {idForm.requirement_type === 'voters'
                          ? "Upload Voter's Certificate under your name, addressed to Barangay San Jose."
                          : 'Upload any valid ID (Driver\'s License, Passport, SSS, PhilHealth, Postal ID, etc.) - TIN ID is NOT allowed.'}
                      </p>
                      <input
                        ref={reqInputRef}
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => handleFile(e.target.files?.[0], setRequirement)}
                      />
                      {requirement && <p style={{ fontSize: '0.8rem', color: '#155724', marginTop: '0.3rem' }}>✔ Secondary ID uploaded</p>}
                    </div>
                  </div>
                )}

                {idForm.is_voter === 'yes' && (
                  <div style={{ background: '#d4edda', border: '1px solid #28a745', borderRadius: 8, padding: '0.8rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#155724' }}>
                    Direct submission: No secondary ID needed. Just submit front and back of old ID.
                  </div>
                )}

                <div className="form-group">
                  <label>Front of Old ID</label>
                  <input
                    ref={frontInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => handleFile(e.target.files?.[0], setFrontPhoto)}
                  />
                  {frontPhoto && <p style={{ fontSize: '0.8rem', color: '#155724', marginTop: '0.3rem' }}>✔ Front uploaded</p>}
                </div>

                <div className="form-group">
                  <label>Back of Old ID</label>
                  <input
                    ref={backInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => handleFile(e.target.files?.[0], setBackPhoto)}
                  />
                  {backPhoto && <p style={{ fontSize: '0.8rem', color: '#155724', marginTop: '0.3rem' }}>✔ Back uploaded</p>}
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Review and Submit'}
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setPage('dashboard')}
              style={{ marginLeft: '0.5rem' }}
            >
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
