import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  Check,
  ChevronDown,
  CircleDot,
  Menu,
  ShieldCheck,
  X,
} from 'lucide-react';

const solutions = [
  'Online Payments',
  'Payment Reminders',
  'Payment Routing',
  'Subscriptions',
  'Fraud Management',
  'Disbursements',
  'Reconciliation',
];

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-[#f8fafc]">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center gap-6 px-5 lg:px-8">
        <Link to="/" className="flex-none" aria-label="SwiftPay home">
          <img src="/logo.svg" alt="SwiftPay" className="h-7 w-auto" />
        </Link>

        <div className="hidden flex-1 items-center gap-1 lg:flex">
          <div className="relative">
            <button
              type="button"
              onClick={() => setSolutionsOpen((open) => !open)}
              className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200/70 hover:text-slate-950"
              aria-expanded={solutionsOpen}
            >
              Solutions <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {solutionsOpen && (
              <div className="absolute left-0 top-[calc(100%+8px)] w-56 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
                {solutions.map((solution) => (
                  <a
                    key={solution}
                    href="#capabilities"
                    onClick={() => setSolutionsOpen(false)}
                    className="block rounded-md px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                  >
                    {solution}
                  </a>
                ))}
              </div>
            )}
          </div>
          <a href="/why-swiftpay/" className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200/70 hover:text-slate-950">Why SwiftPay</a>
          <Link to="/pricing" className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200/70 hover:text-slate-950">Pricing</Link>
        </div>

        <div className="ml-auto hidden items-center gap-3 lg:flex">
          <Link to="/login" className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-indigo-700">Merchant Portal</Link>
          <a href="/contact-us/" className="rounded-md bg-indigo-700 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-800">Request access</a>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          className="ml-auto rounded-md p-2 text-slate-700 lg:hidden"
          aria-label="Toggle navigation"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-5 py-3 lg:hidden">
          <a href="#capabilities" onClick={() => setMobileOpen(false)} className="block border-b border-slate-100 py-3 text-sm font-medium text-slate-700">Solutions</a>
          <a href="/why-swiftpay/" onClick={() => setMobileOpen(false)} className="block border-b border-slate-100 py-3 text-sm font-medium text-slate-700">Why SwiftPay</a>
          <Link to="/pricing" onClick={() => setMobileOpen(false)} className="block border-b border-slate-100 py-3 text-sm font-medium text-slate-700">Pricing</Link>
          <Link to="/login" onClick={() => setMobileOpen(false)} className="block border-b border-slate-100 py-3 text-sm font-medium text-slate-700">Merchant Portal</Link>
          <a href="/contact-us/" onClick={() => setMobileOpen(false)} className="mt-3 block rounded-md bg-indigo-700 px-4 py-2.5 text-center text-sm font-semibold text-white">Request access</a>
        </div>
      )}
    </nav>
  );
}

function HomePage() {
  const capabilities = [
    { code: '01', title: 'Collection controls', body: 'Hosted links, approved payment methods, and server-authorized checkout in one operating model.' },
    { code: '02', title: 'Settlement operations', body: 'Track provider readiness, settlement preferences, and release status without manual follow-up.' },
    { code: '03', title: 'Exception management', body: 'Review unmatched transactions and payment exceptions with complete transaction records.' },
    { code: '04', title: 'Risk and access', body: 'Apply approval controls and maintain audit-ready records as your payment operations scale.' },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] font-display text-slate-950 selection:bg-indigo-100">
      <Navbar />
      <main id="main" className="pt-16">
        <section className="border-b border-slate-200 bg-[#f8fafc]">
          <div className="mx-auto max-w-[1280px] px-5 py-10 lg:px-8 lg:py-14">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 text-xs">
              <div className="flex items-center gap-2 font-medium text-slate-600"><CircleDot className="h-3.5 w-3.5 text-indigo-700" /> Operations console / Philippines</div>
              <div className="font-mono text-slate-500">REPORTING WINDOW: TODAY, 14:30 PHT</div>
            </div>

            <div className="grid gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(480px,1.08fr)] lg:gap-12">
              <div className="flex flex-col justify-between py-1">
                <div>
                  <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-indigo-700">Payment operations infrastructure</p>
                  <h1 className="max-w-xl text-4xl font-semibold leading-[1.05] tracking-[-0.035em] text-slate-950 sm:text-5xl">
                    Keep collections, settlements, and exceptions in control.
                  </h1>
                  <p className="mt-6 max-w-lg text-base leading-7 text-slate-600">
                    SwiftPay gives Philippine enterprises a disciplined operating layer for payment acceptance, reconciliation, payouts, and reporting.
                  </p>
                </div>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <a href="/contact-us/" className="inline-flex items-center gap-2 rounded-md bg-indigo-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-800">
                    Review your payment operations <ArrowRight className="h-4 w-4" />
                  </a>
                  <Link to="/login" className="text-sm font-semibold text-indigo-700 hover:text-indigo-900">Open merchant portal</Link>
                </div>
              </div>

              <section aria-label="Settlement status" className="overflow-hidden rounded-lg border border-slate-300 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
                <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3">
                  <div><p className="text-sm font-semibold text-slate-900">Settlement control</p><p className="mt-0.5 text-xs text-slate-500">Operating position · 14:30 PHT</p></div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700"><span className="h-1.5 w-1.5 rounded-full bg-indigo-700" /> On schedule</span>
                </div>
                <div className="grid border-b border-slate-200 sm:grid-cols-3">
                  {[
                    ['PHP 2.84M', 'Available to settle'],
                    ['PHP 186.4K', 'In review'],
                    ['12 min', 'Median confirmation'],
                  ].map(([value, label]) => <div key={label} className="border-b border-slate-200 px-5 py-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0"><p className="font-mono text-lg font-semibold tracking-tight text-slate-900">{value}</p><p className="mt-1 text-xs text-slate-500">{label}</p></div>)}
                </div>
                <div className="p-5">
                  <div className="mb-3 flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Settlement queue</p><p className="text-xs font-medium text-slate-500">3 active batches</p></div>
                  <div className="space-y-2">
                    {[
                      ['Batch SP-0821-A', 'PHP 1,240,880.00', 'Ready for release'],
                      ['Batch SP-0821-B', 'PHP 980,420.50', 'Reconciliation complete'],
                      ['Batch SP-0821-C', 'PHP 618,764.25', 'Provider confirmation'],
                    ].map(([batch, amount, status]) => <div key={batch} className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-md border border-slate-200 px-3 py-2.5"><div><p className="font-mono text-xs font-semibold text-slate-700">{batch}</p><p className="mt-0.5 text-xs text-slate-500">{status}</p></div><p className="font-mono text-xs font-medium text-slate-700">{amount}</p></div>)}
                  </div>
                </div>
              </section>
            </div>
          </div>
        </section>

        <section id="capabilities" className="border-b border-slate-200 bg-white" aria-label="Merchant capabilities">
          <div className="mx-auto max-w-[1280px] px-5 py-10 lg:px-8 lg:py-12">
            <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-700">Core capability set</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-slate-950">One system for daily payment operations.</h2></div><p className="max-w-md text-sm leading-6 text-slate-500">Designed for the teams responsible for movement of funds, exception closure, and reliable reporting.</p></div>
            <div className="grid border-l border-t border-slate-200 sm:grid-cols-2 lg:grid-cols-4">
              {capabilities.map((capability) => <article key={capability.code} className="min-h-48 border-b border-r border-slate-200 p-5"><p className="font-mono text-xs font-semibold text-indigo-700">{capability.code}</p><h3 className="mt-8 text-base font-semibold text-slate-900">{capability.title}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{capability.body}</p></article>)}
            </div>
          </div>
        </section>

        <section id="why-swiftpay" className="border-b border-slate-200 bg-slate-100" aria-label="Operations status">
          <div className="mx-auto max-w-[1280px] px-5 py-10 lg:px-8 lg:py-12">
            <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
              <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-700">Operational safeguards</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-slate-950">Measured control at every release point.</h2><p className="mt-3 max-w-md text-sm leading-6 text-slate-600">Only approved checkout methods are presented after merchant and provider authorization.</p></div>
              <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-slate-300 bg-slate-300 sm:grid-cols-3">
                {[
                  ['01', 'merchant payment configuration'],
                  ['02', 'provider readiness states'],
                  ['00', 'unapproved checkout methods'],
                ].map(([value, label]) => <div key={label} className="bg-[#f8fafc] px-5 py-5"><p className="font-mono text-3xl font-semibold tracking-[-0.04em] text-slate-950">{value}</p><p className="mt-2 text-sm leading-5 text-slate-600">{label}</p></div>)}
              </div>
            </div>
            <div className="mt-8 grid gap-3 border-t border-slate-300 pt-5 text-sm text-slate-600 sm:grid-cols-3">
              <p className="flex items-center gap-2"><Check className="h-4 w-4 text-indigo-700" /> Provider-backed checkout</p>
              <p className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-indigo-700" /> Server-authorized payment links</p>
              <p className="flex items-center gap-2"><AlertCircle className="h-4 w-4 text-indigo-700" /> Structured exception visibility</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default HomePage;
