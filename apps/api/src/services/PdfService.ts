import crypto from 'crypto';

export interface AllocationLetterData {
  studentName: string;
  studentRollNumber: string;
  studentEmail: string;
  hostelName: string;
  hostelCode: string;
  blockName: string;
  floorName: string;
  roomNumber: string;
  bedLabel: string;
  cycleName: string;
  academicYear: string;
  allocatedDate: string;
  checkInDeadline: string;
}

export class PdfService {
  /**
   * Generates a printable, professional HTML allotment letter.
   * Can be served directly as HTML or converted to PDF via headless browser.
   */
  public static generateAllotmentLetterHtml(data: AllocationLetterData): string {
    const verificationHash = crypto
      .createHash('sha256')
      .update(`${data.studentRollNumber}:${data.hostelCode}:${data.roomNumber}:${data.bedLabel}`)
      .digest('hex')
      .slice(0, 16)
      .toUpperCase();

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Hostel Allotment Letter - ${data.studentRollNumber}</title>
  <style>
    @media print {
      body { margin: 0; padding: 20mm; font-size: 12pt; }
      .no-print { display: none; }
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      color: #1a1a1a;
      line-height: 1.6;
      max-width: 800px;
      margin: 40px auto;
      padding: 40px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .university-name {
      font-size: 24px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #0f172a;
    }
    .sub-header {
      font-size: 14px;
      color: #475569;
      margin-top: 4px;
    }
    .doc-title {
      font-size: 18px;
      font-weight: bold;
      text-decoration: underline;
      margin: 24px 0 16px;
      text-align: center;
    }
    .meta-table {
      width: 100%;
      margin-bottom: 24px;
    }
    .meta-table td {
      padding: 4px 0;
      font-size: 14px;
    }
    .allotment-box {
      border: 2px solid #0f172a;
      background: #f8fafc;
      padding: 16px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .allotment-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      font-size: 14px;
    }
    .allotment-item strong {
      color: #0f172a;
    }
    .instructions {
      font-size: 13px;
      color: #334155;
      margin-top: 24px;
    }
    .instructions ol {
      padding-left: 20px;
    }
    .instructions li {
      margin-bottom: 6px;
    }
    .footer-signatures {
      display: flex;
      justify-content: space-between;
      margin-top: 50px;
      padding-top: 20px;
    }
    .sig-box {
      text-align: center;
      width: 200px;
      border-top: 1px dashed #64748b;
      padding-top: 8px;
      font-size: 13px;
    }
    .qr-token {
      font-family: monospace;
      font-size: 12px;
      color: #64748b;
      text-align: center;
      margin-top: 30px;
      border-top: 1px solid #e2e8f0;
      padding-top: 10px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="university-name">National Institute of Technology</div>
    <div class="sub-header">Office of the Dean of Student Welfare & Council of Wardens</div>
    <div class="sub-header">Hostel Allotment & Residence Management Division</div>
  </div>

  <div class="doc-title">OFFICIAL HOSTEL ALLOTMENT ORDER</div>

  <table class="meta-table">
    <tr>
      <td><strong>Date:</strong> ${data.allocatedDate}</td>
      <td style="text-align: right;"><strong>Academic Year:</strong> ${data.academicYear}</td>
    </tr>
    <tr>
      <td><strong>Cycle:</strong> ${data.cycleName}</td>
      <td style="text-align: right;"><strong>Verification ID:</strong> ${verificationHash}</td>
    </tr>
  </table>

  <p>Dear <strong>${data.studentName}</strong> (Roll No: <strong>${data.studentRollNumber}</strong>),</p>
  <p>We are pleased to inform you that you have been provisionally allotted hostel accommodation for the upcoming academic session based on the university policy-driven allocation process.</p>

  <div class="allotment-box">
    <div class="allotment-grid">
      <div class="allotment-item"><strong>Hostel Name:</strong> ${data.hostelName} (${data.hostelCode})</div>
      <div class="allotment-item"><strong>Block & Floor:</strong> ${data.blockName}, ${data.floorName}</div>
      <div class="allotment-item"><strong>Room Number:</strong> ${data.roomNumber}</div>
      <div class="allotment-item"><strong>Bed Number/Label:</strong> Bed ${data.bedLabel}</div>
    </div>
  </div>

  <div class="instructions">
    <strong>Terms & Reporting Instructions:</strong>
    <ol>
      <li>Please report to the Hostel Warden's office on or before <strong>${data.checkInDeadline}</strong> along with this allotment letter.</li>
      <li>Produce your valid Institute Identity Card and proof of hostel fee payment at the time of check-in.</li>
      <li>Possession of electrical appliances exceeding 500W without prior written permission is strictly prohibited.</li>
      <li>Allotment is strictly personal and non-transferable. Subletting or mutual exchange without formal warden approval is a disciplinary offense.</li>
    </ol>
  </div>

  <div class="footer-signatures">
    <div class="sig-box">
      Student Signature
    </div>
    <div class="sig-box">
      Hostel Warden
    </div>
    <div class="sig-box">
      Dean of Student Welfare
    </div>
  </div>

  <div class="qr-token">
    Security Verification Hash: <code>${verificationHash}</code> &bull; System Generated &bull; Tamper Evident
  </div>
</body>
</html>`;
  }
}
