// ============================================================
// PrintDocument - official barangay document generator
// Bubuksan ng bagong window na may print-ready HTML
// (gumagana sa browser at Electron desktop) + auto window.print()
// ============================================================

export const TYPE_TITLES = {
  clearance: 'BARANGAY CLEARANCE',
  indigency: 'CERTIFICATE OF INDIGENCY',
  low_income: 'CERTIFICATE OF LOW INCOME',
  guardianship: 'CERTIFICATE OF GUARDIANSHIP',
  cohabitation: 'CERTIFICATE OF COHABITATION',
  id: 'BARANGAY ID CERTIFICATION',
};

// Bawat dokumento: pangunahing detalye (label + value rows)
function docRows(r) {
  const name = r.complete_name || [r.first_name, r.middle_name, r.surname].filter(Boolean).join(' ') || r.full_name || '';
  switch (r.type) {
    case 'clearance':
      return [
        ['Name', name],
        ['Complete Address', r.complete_address],
        ['Date of Birth', fmtDate(r.date_of_birth)],
        ['Place of Birth', r.birth_place],
        ['Purpose', r.purpose],
        ['Priority Classification', r.priority || 'None'],
        ['Contact Number', r.contact_number],
      ];
    case 'indigency':
      return [
        ['Name of Applicant', r.complete_name || name],
        ['Complete Address', r.complete_address],
        ['Name of Beneficiary', r.beneficiary_name],
        ['Relationship to Beneficiary', r.beneficiary_relation],
        ['Request is for', r.purpose],
        ['Office / Agency', r.office_agency],
        ['Contact Number', r.contact_number],
      ];
    case 'low_income':
      return [
        ['Name of Applicant', r.complete_name || name],
        ['Name of Child', r.child_name],
        ['Complete Address', r.complete_address],
        ["Father's Name", r.father_name],
        ["Mother's Name", r.mother_name],
        ['Contact Number', r.contact_number],
      ];
    case 'guardianship':
      return [
        ['Name of Guardian', r.guardian_name],
        ['Residence / Address', r.complete_address],
        ['Name of Child', r.child_name],
        ['Relationship', r.relationship],
        ['Priority Classification', r.priority || 'None'],
      ];
    case 'cohabitation':
      return [
        ['Partner 1', r.partner1_name],
        ['Partner 1 Birthday', fmtDate(r.partner1_birthday)],
        ['Partner 2', r.partner2_name],
        ['Partner 2 Birthday', fmtDate(r.partner2_birthday)],
        ['Shared Residence', r.shared_residence],
        ['Years Living Together', r.years_living],
        ['Cohabitation Started (Year)', r.cohabitation_started],
        ['Children', r.children_info || 'None'],
        ['Priority Classification', r.priority || 'None'],
      ];
    case 'id':
      return [
        ['Name', name],
        ['Type of Request', r.id_request_type === 'renew' ? 'Renew ID' : 'New ID (First Time)'],
        ['Place of Birth', r.birth_place],
        ['Contact Number', r.contact_number],
        ['Emergency Contact', `${r.emergency_contact_name || ''} ${r.emergency_contact_number ? ' - ' + r.emergency_contact_number : ''}`],
        ['Registered Voter', r.is_voter === 1 || r.is_voter === '1' ? 'Yes' : r.is_voter === 0 || r.is_voter === '0' ? 'No' : 'N/A'],
      ];
    default:
      return [['Purpose', r.purpose]];
  }
}

function fmtDate(v) {
  if (!v) return '';
  try {
    const d = new Date(v);
    if (isNaN(d.getTime())) return String(v);
    return d.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return String(v);
  }
}

// Pangunahing pahayag ng bawat sertipiko
function bodyParagraph(r, title) {
  const name = r.complete_name || [r.first_name, r.middle_name, r.surname].filter(Boolean).join(' ') || r.full_name || '___________';
  const addr = r.complete_address || 'Barangay San Jose';
  switch (r.type) {
    case 'clearance':
      return `This is to certify that <b>${name}</b>, resident of ${addr}, Barangay San Jose, has personally appeared before this office and undergone the standard barangay record verification. Based on available records of this barangay, the above-named person is <b>not involved in any pending case or derogatory record</b> in the files of this barangay as of the date of issuance. This clearance is being issued upon the request of the interested party for the purpose of <b>${r.purpose || 'local employment'}</b>.`;
    case 'indigency':
      return `This is to certify that <b>${r.beneficiary_name || name}</b>${r.beneficiary_relation ? ` (${r.beneficiary_relation})` : ''}, resident of ${addr}, Barangay San Jose, belongs to an <b>indigent family</b> whose income is insufficient to support the basic needs of its members, based on the verification conducted by this office. This certification is issued upon the request of the applicant ${r.office_agency ? `to be submitted to <b>${r.office_agency}</b>` : ''} for the purpose of <b>${r.purpose || 'availment of assistance'}</b>.`;
    case 'low_income':
      return `This is to certify that the family of <b>${name}</b>, residing at ${addr}, Barangay San Jose, is classified as a <b>low-income family</b> under the household assessment conducted by this barangay, and therefore qualifies as a beneficiary for programs requiring proof of low income ${r.child_name ? `for <b>${r.child_name}</b>` : ''}. This certificate is issued for submission to the <b>Bureau of Internal Revenue (BIR)</b> and other concerned agencies as proof of the family's income classification.`;
    case 'guardianship':
      return `This is to certify that <b>${r.guardian_name || name}</b>, of legal age and resident of ${addr}, Barangay San Jose, is the <b>${r.relationship || 'guardian'}</b> and duly acting guardian of <b>${r.child_name || 'the minor named above'}</b>. As such, he/she is authorized to represent, sign documents on behalf of, and act in the best interest of the said minor in dealings with government and private offices, in accordance with the barangay's mandate over family and child welfare matters.`;
    case 'cohabitation':
      return `This is to certify that <b>${r.partner1_name || '___________'}</b>${r.partner1_birthday ? ` (born ${fmtDate(r.partner1_birthday)})` : ''} and <b>${r.partner2_name || '___________'}</b>${r.partner2_birthday ? ` (born ${fmtDate(r.partner2_birthday)})` : ''} are <b>living together as husband and wife</b> (cohabiting partners) at ${r.shared_residence || addr}, Barangay San Jose, for approximately <b>${r.years_living || '___'} year(s)</b>, since the year <b>${r.cohabitation_started || '____'}</b>.${r.children_info && r.children_info.toLowerCase() !== 'none' ? ` Their union is blessed with the following children: <b>${r.children_info}</b>.` : ' Their union is blessed with no children of record in this barangay.'} This certification is issued upon the request of the parties for legal and personal purposes.`;
    case 'id':
      return `This is to certify that <b>${name}</b> is a bona fide resident of Barangay San Jose, and has applied for a <b>${r.id_request_type === 'renew' ? 'renewal of Barangay ID' : 'new Barangay ID (first time)'}</b> under Request Code <b>${r.request_code}</b>. This document serves as official confirmation of the application and may be presented for claiming of the issued ID at the Barangay San Jose Main Hall.`;
    default:
      return '';
  }
}

// Kailangan ng valid requirement sa ID? (proof of identity)
function validityText(r) {
  return `This certification is valid within <b>six (6) months</b> from the date of issuance and may be revoked if any information herein proves false.`;
}

export function buildDocumentHtml(r) {
  const title = TYPE_TITLES[r.type] || 'BARANGAY CERTIFICATE';
  const rows = docRows(r);
  const today = fmtDate(new Date());
  const created = fmtDate(r.created_at);

  const rowsHtml = rows
    .map(([label, value]) => {
      const v = value == null || value === '' ? '—' : String(value).replace(/</g, '&lt;');
      return `<tr><td class="lbl">${label}</td><td class="val">${v}</td></tr>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>${r.request_code} - ${title}</title>
<style>
  @page { size: A4; margin: 18mm 20mm; }
  * { box-sizing: border-box; }
  body { font-family: 'Times New Roman', Georgia, serif; color: #111; margin: 0; }
  .sheet { max-width: 190mm; margin: 0 auto; padding: 8mm 6mm; }
  .head { text-align: center; border-bottom: 3px double #111; padding-bottom: 12px; margin-bottom: 16px; }
  .head .seal { font-size: 40px; line-height: 1; }
  .republic { font-size: 12px; letter-spacing: 1px; text-transform: uppercase; }
  .lgu { font-size: 11.5px; text-transform: uppercase; letter-spacing: .5px; }
  .hall { font-weight: bold; font-size: 16px; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 4px; }
  .office { font-size: 11px; font-style: italic; margin-top: 2px; }
  .doc-title { text-align: center; font-size: 20px; font-weight: bold; letter-spacing: 3px; margin: 14px 0 4px; }
  .doc-sub { text-align: center; font-size: 11px; color: #333; margin-bottom: 14px; }
  .body-text { font-size: 13px; text-align: justify; line-height: 1.75; text-indent: 40px; }
  table.details { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 12.5px; }
  table.details td { border: 1px solid #999; padding: 7px 10px; vertical-align: top; }
  table.details td.lbl { width: 34%; background: #f6f2ec; font-weight: bold; }
  table.details td.val { font-weight: 600; }
  .validity { font-size: 11.5px; margin-top: 10px; font-style: italic; }
  .sign-row { display: flex; justify-content: space-between; margin-top: 46px; page-break-inside: avoid; }
  .sign { text-align: center; width: 58mm; font-size: 12px; }
  .sign .line { border-top: 1px solid #111; margin-top: 34px; padding-top: 4px; font-weight: bold; }
  .sign .role { font-size: 10.5px; font-style: italic; }
  .code-bar { margin-top: 22px; border: 1px solid #999; padding: 8px 12px; font-size: 11px; display: flex; justify-content: space-between; background: #faf6f0; }
  .code-bar b { color: #c2410c; }
  @media print { .no-print { display: none !important; } body { -webkit-print-color-adjust: exact; } }
</style>
</head>
<body>
  <div class="sheet">
    <div class="head">
      <div class="seal">🏛️</div>
      <div class="republic">Republic of the Philippines</div>
      <div class="lgu">Province of ___ &nbsp;•&nbsp; City / Municipality of ___</div>
      <div class="hall">Barangay San Jose — Main Hall</div>
      <div class="office">Office of the Punong Barangay</div>
    </div>

    <div class="doc-title">${title}</div>
    <div class="doc-sub">Issued on ${today} &nbsp;|&nbsp; Request Code: ${r.request_code || '—'} &nbsp;|&nbsp; Filed: ${created}</div>

    <p class="body-text">${bodyParagraph(r, title)}</p>

    <table class="details">${rowsHtml}</table>

    <p class="validity">${validityText(r)}</p>

    <div class="sign-row">
      <div class="sign">
        <div class="line">Applicant / Resident</div>
        <div class="role">Signature over printed name</div>
      </div>
      <div class="sign">
        <div class="line">Hon. _________________</div>
        <div class="role">Punong Barangay, Barangay San Jose</div>
      </div>
    </div>

    <div class="code-bar">
      <span>Reference: <b>${r.request_code || '—'}</b> &nbsp;•&nbsp; Type: <b>${title}</b> &nbsp;•&nbsp; Status: <b>${String(r.status || '').toUpperCase()}</b></span>
      <span>Printed: ${new Date().toLocaleString('en-PH')}</span>
    </div>
  </div>
  <script>
    window.onload = function () { setTimeout(function () { window.print(); }, 350); };
  <\/script>
</body>
</html>`;
}

// I-print ang dokumento (bubukas ng bagong window + auto print dialog)
export function printDocument(request) {
  const html = buildDocumentHtml(request);
  const w = window.open('', '_blank', 'width=880,height=1000');
  if (!w) {
    alert('Please allow pop-ups for this site so the document can open for printing.');
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
}
