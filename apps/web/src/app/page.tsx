export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <div className="max-w-3xl space-y-6">
        <div className="inline-block rounded-full bg-blue-100 px-4 py-1.5 text-sm font-semibold text-blue-800">
          Policy-Driven University System
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-slate-900">
          Hostel Allocation & Roommate Matching Engine
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Deterministic, explainable, and policy-compliant room allotment with lifestyle-based
          roommate compatibility matching and comprehensive audit trails.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-8 text-left">
          <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition">
            <h3 className="font-bold text-slate-900 text-lg">Student Portal</h3>
            <p className="text-sm text-slate-500 mt-2">
              Apply for accommodation, rank preferences, take compatibility survey, and view allotment.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition">
            <h3 className="font-bold text-slate-900 text-lg">Warden Review</h3>
            <p className="text-sm text-slate-500 mt-2">
              Visual floor bed-map, draft review, reasoned overrides, and hostel-level approval.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition">
            <h3 className="font-bold text-slate-900 text-lg">Admin & Governance</h3>
            <p className="text-sm text-slate-500 mt-2">
              Inventory management, cycle configuration, allocation engine runs, and audit logs.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
