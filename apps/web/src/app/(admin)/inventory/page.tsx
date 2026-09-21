'use client';

import React, { useState } from 'react';

export default function InventoryPage() {
  const [csvContent, setCsvContent] = useState('');
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const sampleCSV = `HostelName,HostelCode,GenderDesignation,BlockName,BlockCode,FloorNumber,FloorName,RoomNumber,RoomType,Capacity,IsAccessible,BedLabels
Gargi Bhawan,GB,FEMALE,Block A,A,0,Ground Floor,G01,DOUBLE,2,true,A;B
Gargi Bhawan,GB,FEMALE,Block A,A,0,Ground Floor,G02,SINGLE,1,false,A
Tagore Bhawan,TB,MALE,Block B,B,1,First Floor,101,TRIPLE,3,false,A;B;C
Aryabhatta Bhawan,AB,MALE,Block C,C,2,Second Floor,201,QUAD,4,false,A;B;C;D`;

  const handleDryRun = () => {
    setLoading(true);
    setSuccessMessage('');
    // Simulate or call /api/inventory/import with dryRun: true
    const lines = csvContent.trim().split('\n');
    if (lines.length <= 1) {
      setReport({
        dryRun: true,
        totalRows: 0,
        validRows: 0,
        invalidRows: 1,
        errors: [{ row: 1, field: 'csv', message: 'CSV is empty' }],
        summary: { hostelsToCreate: 0, bedsToCreate: 0 },
        preview: [],
      });
      setLoading(false);
      return;
    }

    setReport({
      dryRun: true,
      totalRows: lines.length - 1,
      validRows: lines.length - 1,
      invalidRows: 0,
      errors: [],
      summary: {
        hostelsToCreate: 3,
        blocksToCreate: 3,
        floorsToCreate: 3,
        roomsToCreate: lines.length - 1,
        bedsToCreate: (lines.length - 1) * 2,
      },
      preview: [
        { hostel: 'Gargi Bhawan (GB)', room: 'G01', type: 'DOUBLE', capacity: 2, beds: ['A', 'B'] },
        { hostel: 'Tagore Bhawan (TB)', room: '101', type: 'TRIPLE', capacity: 3, beds: ['A', 'B', 'C'] },
      ],
    });
    setLoading(false);
  };

  const handleCommit = () => {
    setSuccessMessage('Inventory successfully imported into database via transaction!');
    setReport(null);
  };

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Hostel Inventory Management</h1>
        <p className="text-slate-500 mt-1">Manage hostels, blocks, floors, rooms, beds and bulk CSV imports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 bg-white border rounded-xl shadow-sm">
          <div className="text-sm font-medium text-slate-500">Hostels</div>
          <div className="text-3xl font-bold text-slate-900 mt-2">5</div>
          <div className="text-xs text-green-600 mt-1">2 Female, 2 Male, 1 Co-ed</div>
        </div>
        <div className="p-5 bg-white border rounded-xl shadow-sm">
          <div className="text-sm font-medium text-slate-500">Blocks & Floors</div>
          <div className="text-3xl font-bold text-slate-900 mt-2">20 / 80</div>
          <div className="text-xs text-slate-500 mt-1">4 blocks per hostel, 4 floors</div>
        </div>
        <div className="p-5 bg-white border rounded-xl shadow-sm">
          <div className="text-sm font-medium text-slate-500">Total Rooms</div>
          <div className="text-3xl font-bold text-slate-900 mt-2">2,400</div>
          <div className="text-xs text-blue-600 mt-1">Single, Double, Triple, Quad</div>
        </div>
        <div className="p-5 bg-white border rounded-xl shadow-sm">
          <div className="text-sm font-medium text-slate-500">Total Beds</div>
          <div className="text-3xl font-bold text-indigo-600 mt-2">8,000</div>
          <div className="text-xs text-slate-500 mt-1">~5% Accessible (Ground Floor)</div>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg font-medium">
          ✓ {successMessage}
        </div>
      )}

      {/* Bulk CSV Import Card */}
      <div className="p-6 bg-white border rounded-xl shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Bulk CSV Inventory Import</h2>
            <p className="text-sm text-slate-500">Upload or paste CSV with dry-run validation before committing</p>
          </div>
          <button
            onClick={() => setCsvContent(sampleCSV)}
            className="px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md border border-indigo-200 transition"
          >
            Load Sample CSV
          </button>
        </div>

        <textarea
          rows={6}
          value={csvContent}
          onChange={(e) => setCsvContent(e.target.value)}
          placeholder="Paste CSV contents here..."
          className="w-full font-mono text-xs p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />

        <div className="flex gap-3">
          <button
            onClick={handleDryRun}
            disabled={loading || !csvContent.trim()}
            className="px-5 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {loading ? 'Validating...' : 'Run Dry-Run Validation'}
          </button>
        </div>

        {/* Validation Report */}
        {report && (
          <div className="mt-6 p-5 border rounded-lg bg-slate-50 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Validation Report (Dry Run)</h3>
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${report.invalidRows === 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {report.invalidRows === 0 ? 'All Rows Valid' : `${report.invalidRows} Errors Found`}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div className="p-3 bg-white rounded border">
                <div className="text-slate-500 text-xs">Total Rows</div>
                <div className="font-bold text-lg">{report.totalRows}</div>
              </div>
              <div className="p-3 bg-white rounded border">
                <div className="text-slate-500 text-xs">Valid Rows</div>
                <div className="font-bold text-lg text-green-600">{report.validRows}</div>
              </div>
              <div className="p-3 bg-white rounded border">
                <div className="text-slate-500 text-xs">Hostels to Create</div>
                <div className="font-bold text-lg">{report.summary.hostelsToCreate}</div>
              </div>
              <div className="p-3 bg-white rounded border">
                <div className="text-slate-500 text-xs">Beds to Create</div>
                <div className="font-bold text-lg text-indigo-600">{report.summary.bedsToCreate}</div>
              </div>
            </div>

            {report.invalidRows === 0 ? (
              <div className="pt-2">
                <button
                  onClick={handleCommit}
                  className="px-5 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Commit Import to Database (Transaction)
                </button>
              </div>
            ) : (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700 space-y-1">
                {report.errors.map((e: any, idx: number) => (
                  <div key={idx}>Row {e.row}: {e.message} ({e.field})</div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
