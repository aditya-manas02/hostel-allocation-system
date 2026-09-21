'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface DocumentItem {
  id: string;
  studentName: string;
  studentRoll: string;
  quotaCategory: string;
  docType: 'DISABILITY_CERTIFICATE' | 'CASTE_CATEGORY_PROOF' | 'INCOME_CERTIFICATE';
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  rejectionReason?: string;
}

const mockDocuments: DocumentItem[] = [
  {
    id: 'doc-001',
    studentName: 'Rohan Gupta',
    studentRoll: '2023CS042',
    quotaCategory: 'PWD',
    docType: 'DISABILITY_CERTIFICATE',
    fileName: 'disability_cert_rohan.pdf',
    fileSize: '1.4 MB',
    uploadedAt: '2026-09-18 11:20',
    status: 'PENDING',
  },
  {
    id: 'doc-002',
    studentName: 'Priya Sundaram',
    studentRoll: '2023ME108',
    quotaCategory: 'OBC_NCL',
    docType: 'CASTE_CATEGORY_PROOF',
    fileName: 'obc_ncl_cert_2026.pdf',
    fileSize: '890 KB',
    uploadedAt: '2026-09-19 15:45',
    status: 'PENDING',
  },
  {
    id: 'doc-003',
    studentName: 'Ananya Sharma',
    studentRoll: '2023EC015',
    quotaCategory: 'EWS',
    docType: 'INCOME_CERTIFICATE',
    fileName: 'income_certificate_fy25_26.pdf',
    fileSize: '2.1 MB',
    uploadedAt: '2026-09-20 08:30',
    status: 'PENDING',
  },
];

export default function DocumentVerificationPage() {
  const [docs, setDocs] = useState<DocumentItem[]>(mockDocuments);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  const handleVerify = (id: string) => {
    setDocs((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: 'VERIFIED' } : d))
    );
    setNotice(`Document ${id} verified and student quota eligibility confirmed.`);
    setSelectedDoc(null);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleReject = (id: string) => {
    if (!rejectionReason.trim()) return;
    setDocs((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, status: 'REJECTED', rejectionReason } : d
      )
    );
    setNotice(`Document ${id} rejected with feedback sent to student.`);
    setSelectedDoc(null);
    setRejectionReason('');
    setTimeout(() => setNotice(null), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded">
              Admin Portal
            </span>
            <h1 className="text-xl font-bold mt-1">Quota & Verification Queue</h1>
          </div>
          <div className="flex gap-4 text-sm">
            <Link href="/inventory" className="text-slate-300 hover:text-white">Inventory</Link>
            <Link href="/cycles" className="text-slate-300 hover:text-white">Cycles</Link>
            <Link href="/runs" className="text-slate-300 hover:text-white">Runs</Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {notice && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-md font-medium text-sm">
            ✓ {notice}
          </div>
        )}

        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Student Document Verification Queue</h2>
            <p className="text-xs text-slate-500">
              Verify reserved quota and accessibility certificates prior to allocation run.
            </p>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold">
              Pending: {docs.filter((d) => d.status === 'PENDING').length}
            </span>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold">
              Verified: {docs.filter((d) => d.status === 'VERIFIED').length}
            </span>
          </div>
        </div>

        {/* Verification Queue Table */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden mb-8">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
              <tr>
                <th className="px-6 py-3">Student</th>
                <th className="px-6 py-3">Quota Category</th>
                <th className="px-6 py-3">Document Type</th>
                <th className="px-6 py-3">File Attached</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {docs.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{item.studentName}</div>
                    <div className="text-xs text-slate-500">{item.studentRoll}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {item.quotaCategory}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-mono text-xs text-slate-700">{item.docType.replace(/_/g, ' ')}</div>
                    <div className="text-[11px] text-slate-400">Uploaded {item.uploadedAt}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-blue-600 underline font-medium cursor-pointer">
                      {item.fileName}
                    </div>
                    <div className="text-[11px] text-slate-400">{item.fileSize}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                        item.status === 'VERIFIED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'REJECTED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {item.status === 'PENDING' ? (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleVerify(item.id)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => setSelectedDoc(item)}
                          className="px-3 py-1 bg-slate-100 hover:bg-rose-50 text-rose-700 border border-slate-200 rounded text-xs font-medium"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Completed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal for Rejection Reason */}
        {selectedDoc && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 border border-slate-200">
              <h3 className="text-base font-bold text-slate-900 mb-2">Reject Document</h3>
              <p className="text-xs text-slate-500 mb-4">
                Student: {selectedDoc.studentName} ({selectedDoc.studentRoll}) &bull; {selectedDoc.docType}
              </p>

              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Rejection Reason / Guidance for Student
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Document is expired, blurry, or missing the competent issuing authority's seal..."
                  rows={3}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  disabled={!rejectionReason.trim()}
                  onClick={() => handleReject(selectedDoc.id)}
                  className="px-4 py-1.5 text-xs bg-rose-600 hover:bg-rose-700 text-white rounded font-medium disabled:opacity-40"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
