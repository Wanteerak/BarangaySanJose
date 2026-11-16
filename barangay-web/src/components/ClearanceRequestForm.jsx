import { useState } from 'react'

const CLEARANCE_TYPES = [
  'Barangay Clearance',
  'Police Clearance',
  'Business Clearance',
  'Certificate of Indigency',
  'Request ID',
]

export default function ClearanceRequestForm({ onBack }) {
  const [form, setForm] = useState({
    fullName: '',
    address: '',
    contactNumber: '',
    clearanceType: '',
    purpose: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [requestId, setRequestId] = useState(null)
  const [message, setMessage] = useState('')

  const generateRequestId = () => {
    const prefix = 'BSJ'
    const random = Math.floor(100000 + Math.random() * 900000)
    return `${prefix}-${random}`
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage('')

    await new Promise((r) => setTimeout(r, 1500))

    const id = generateRequestId()
    const requestData = {
      id,
      ...form,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }

    const existing = JSON.parse(localStorage.getItem('bsj_requests') || '[]')
    existing.push(requestData)
    localStorage.setItem('bsj_requests', JSON.stringify(existing))

    setRequestId(id)
    setMessage('Request submitted successfully!')
    setSubmitting(false)
  }

  return (
    <div className="page">
      <button onClick={onBack} className="btn-back">
        ← Back
      </button>

      <div className="card">
        {requestId ? (
          <>
            <div className="success-box">
              <h2>✅ Request Submitted</h2>
              <p><strong>Request ID:</strong> {requestId}</p>
              <p>
                Please save this ID. You can use it to check your request status.
              </p>
              <button
                onClick={() => setRequestId(null)}
                className="btn-primary"
              >
                Make Another Request
              </button>
            </div>
          </>
        ) : (
          <>
            <h2>Request Clearance</h2>
            <p>
              Fill up the form below to request a clearance from Barangay San
              Jose.
            </p>

            {message && <div className="alert success">{message}</div>}

            <form onSubmit={handleSubmit} className="form-grid">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Contact Number</label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={form.contactNumber}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Type of Clearance</label>
                <select
                  name="clearanceType"
                  value={form.clearanceType}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Select --</option>
                  {CLEARANCE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group full">
                <label>Purpose</label>
                <textarea
                  name="purpose"
                  value={form.purpose}
                  onChange={handleChange}
                  rows="4"
                  required
                  placeholder="e.g., For employment, travel, business permit..."
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
