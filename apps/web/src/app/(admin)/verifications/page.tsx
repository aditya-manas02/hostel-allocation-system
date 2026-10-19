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

const initialDocuments: DocumentItem[] = [
  {
    id: 'doc-001',
    studentName: 'Rohan Gupta',
    studentRoll: '2023CS042',
    quotaCategory: 'PWD',
    docType: 'DISABILITY_CERTIFICATE',
    fileName: 'disability_cert_rohan.pdf',
    fileSize: '1.4 MB',
    uploadedAt: '2026-09-18 11:20',
    status: 'VERIFIED',
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
  const [docs, setDocs] = useState<DocumentItem[]>(initialDocuments);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  const handleVerify = (id: string) => {
    setDocs((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: 'VERIFIED' } : d))
    );
    setNotice(`Document ${id} verified and student quota eligibility confirmed in audit log.`);
    setSelectedDoc(null);
    setTimeout(() => setNotice(null), 4000);
  };

  const handleReject = (id: string) => {
    if (!rejectionReason.trim()) return;
    setDocs((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, status: 'REJECTED', rejectionReason } : d
      )
    );
    setNotice(`Document ${id} rejected with feedback logged.`);
    setSelectedDoc(null);
    setRejectionReason('');
    setTimeout(() => setNotice(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
              Administrative Verification
            </span>
            <span className="text-xs text-slate-500">&bull; Quota &amp; Proof Audit</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Student Quota &amp; Certificate Verification Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Verify reserved quota and accessibility certificates before running the allocation engine.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold">
            Pending: {docs.filter((d) => d.status === 'PENDING').length}
          </span>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
            Verified: {docs.filter((d) => d.status === 'VERIFIED').length}
          </span>
        </div>
      </div>

      {notice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-sm animate-in fade-in duration-200">
          <span>✓</span>
          <span>{notice}</span>
        </div>
      )}

      {/* Verification Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase">
            <tr>
              <th className="px-6 py-3.5">Student</th>
              <th className="px-6 py-3.5">Quota Category</th>
              <th className="px-6 py-3.5">Document Type</th>
              <th className="px-6 py-3.5">File Attached</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {docs.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-900">{item.studentName}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{item.studentRoll}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {item.quotaCategory}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="font-mono text-slate-700">{item.docType.replace(/_/g, ' ')}</div>
                  <div className="text-[10px] text-slate-400">{item.uploadedAt}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-blue-600 font-semibold cursor-pointer hover:underline">
                    📄 {item.fileName}
                  </div>
                  <div className="text-[10px] text-slate-400">{item.fileSize}</div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
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
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => setSelectedDoc(item)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 text-rose-700 border border-slate-200 rounded-lg text-xs font-bold transition"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-medium">Completed &check;</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Rejection Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Reject Supporting Certificate</h3>
            <p className="text-xs text-slate-500">
              Student: {selectedDoc.studentName} ({selectedDoc.studentRoll}) &bull; {selectedDoc.docType}
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Rejection Reason (Forwarded to Student)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Expired certificate, seal not visible, or incorrect issuing authority..."
                rows={3}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedDoc(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold"
              >
                Cancel
              </button>
              <button
                disabled={!rejectionReason.trim()}
                onClick={() => handleReject(selectedDoc.id)}
                className="px-4 py-1.5 text-xs bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold disabled:opacity-40 shadow transition"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
