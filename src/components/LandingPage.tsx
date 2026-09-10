import React from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Clock,
  Headphones,
  CheckCircle2,
  FileText,
  UserCheck,
  TrendingUp,
} from 'lucide-react';

interface LandingPageProps {
  onRegisterComplaint: () => void;
  onTrackStatus: () => void;
  onOpenAuth: () => void;
  onSignUp?: () => void;
  onSignIn?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onRegisterComplaint,
  onTrackStatus,
  onOpenAuth,
  onSignUp,
  onSignIn,
}) => {
  const handleSignUpClick = onSignUp || onOpenAuth;
  const handleSignInClick = onSignIn || onOpenAuth;

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9ff]">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-slate-200/70 bg-gradient-to-b from-[#eff4ff] to-[#f8f9ff]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-3.5 py-1.5 text-xs font-semibold text-[#00288e] shadow-2xs">
                <span className="flex h-2 w-2 rounded-full bg-[#00288e] animate-ping" />
                <span>Enterprise Complaint Management System</span>
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight text-[#0b1c30] sm:text-5xl lg:text-6xl">
                Resolving Concerns,{' '}
                <span className="text-[#00288e]">Building Trust.</span>
              </h1>

              <p className="max-w-2xl text-base sm:text-lg leading-relaxed text-slate-600">
                A transparent, secure, and responsive enterprise platform designed to voice your
                workplace concerns, ensure compliance, and track resolutions in real-time.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onRegisterComplaint}
                  className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#00288e] px-6 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-[#00288e]/90 hover:shadow-lg active:scale-95"
                >
                  <span>Register a Complaint</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={handleSignUpClick}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95"
                >
                  <span>Sign Up / Get Started</span>
                </button>

                <button
                  type="button"
                  onClick={handleSignInClick}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 shadow-2xs transition-all hover:bg-slate-50 hover:border-slate-400 active:scale-95"
                >
                  <span>Sign In</span>
                </button>
              </div>

              {/* Security Trust Badges */}
              <div className="flex items-center gap-6 pt-4 text-xs font-medium text-slate-500">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>256-Bit Encrypted</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  <span>Whistleblower Protected</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <span>24h SLA Triage</span>
                </div>
              </div>
            </div>

            {/* Hero Right Visual: Interactive Live Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xl ring-1 ring-black/5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-[#00288e]">
                      <span className="material-symbols-outlined text-[22px]">verified_user</span>
                    </div>
                    <div>
                      <div className="font-mono text-xs font-bold text-[#00288e]">
                        #RS-8492
                      </div>
                      <div className="text-xs text-slate-500">Facility Hazard In Aisle 4</div>
                    </div>
                  </div>
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                    In Progress
                  </span>
                </div>

                <div className="py-4 space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-600 mb-1.5">
                      <span>Resolution Progress</span>
                      <span className="font-bold text-[#00288e]">65%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#00288e] transition-all duration-500"
                        style={{ width: '65%' }}
                      />
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2XAlLogsrycT0PGIyMvVxpqt37yhpc4OBKGMg7mV3WJSeqZdXpRXsbZNqBS_1xPOmsMaVMcL9VsgJDcq2lbSXsqBoPavupjftLqbEbvZkSECtj7bQe8umDTy9lHOdxCaJtrWNLUXHfRE8QJryTNF22V_IgahPYkWMi-_AsMlAoP_bQeyMZmD9lbSQelgZMw2kjy-za_Pc7L15Yk1Kyy4-cdFv5Z_ibTywHsOARF85EKK5lJXudmrD"
                        alt="Agent Sarah"
                        className="h-9 w-9 rounded-full object-cover ring-2 ring-white"
                      />
                      <div>
                        <div className="text-xs font-semibold text-slate-800">Sarah J.</div>
                        <div className="text-[11px] text-slate-500">Assigned Safety Specialist</div>
                      </div>
                    </div>
                    <button
                      onClick={onTrackStatus}
                      className="rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-[#00288e] border border-slate-200 shadow-2xs hover:bg-blue-50"
                    >
                      View Live
                    </button>
                  </div>

                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>Last update: Maintenance crew dispatched 15m ago</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Department: Logistics & Safety</span>
                  <span className="font-semibold text-emerald-600">On Track for 24h SLA</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seamless Resolution Process (4 Step Cards from design) */}
      <section className="py-16 md:py-24 bg-white border-b border-slate-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#00288e] mb-2">
              How It Works
            </h2>
            <h3 className="text-3xl font-extrabold tracking-tight text-[#0b1c30] sm:text-4xl">
              Seamless Resolution Process
            </h3>
            <p className="mt-3 text-base text-slate-600">
              Every issue is handled with strict governance, transparent escalation protocols, and verifiable audit trails.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="relative rounded-2xl border border-slate-200 bg-[#f8f9ff] p-6 hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-[#00288e] mb-4">
                <FileText className="h-6 w-6" />
              </div>
              <div className="text-xs font-bold text-[#00288e] tracking-wider uppercase mb-1">
                Step 01
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Submit Details</h4>
              <p className="text-xs leading-relaxed text-slate-600">
                Submit your workplace concerns either anonymously or under your verified corporate ID with document attachments.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative rounded-2xl border border-slate-200 bg-[#f8f9ff] p-6 hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 mb-4">
                <UserCheck className="h-6 w-6" />
              </div>
              <div className="text-xs font-bold text-indigo-700 tracking-wider uppercase mb-1">
                Step 02
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Assigned to Agent</h4>
              <p className="text-xs leading-relaxed text-slate-600">
                Automated triage routes your complaint directly to a qualified specialist or department manager based on category.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative rounded-2xl border border-slate-200 bg-[#f8f9ff] p-6 hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-700 mb-4">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div className="text-xs font-bold text-amber-700 tracking-wider uppercase mb-1">
                Step 03
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Real-time Tracking</h4>
              <p className="text-xs leading-relaxed text-slate-600">
                Monitor status transitions, milestones, internal notes, and chat directly with your assigned agent.
              </p>
            </div>

            {/* Step 4 */}
            <div className="relative rounded-2xl border border-slate-200 bg-[#f8f9ff] p-6 hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 mb-4">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div className="text-xs font-bold text-emerald-700 tracking-wider uppercase mb-1">
                Step 04
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Resolution Confirmed</h4>
              <p className="text-xs leading-relaxed text-slate-600">
                Review corrective actions, rate your experience via a 5-star feedback loop, or escalate if unsatisfied.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Banner */}
      <section className="py-12 bg-[#00288e] text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-white/20">
            <div className="pt-4 md:pt-0">
              <div className="text-4xl font-extrabold sm:text-5xl">50k+</div>
              <div className="mt-2 text-sm text-blue-200 font-medium">
                Complaints Successfully Resolved
              </div>
            </div>
            <div className="pt-4 md:pt-0">
              <div className="text-4xl font-extrabold sm:text-5xl">24/7</div>
              <div className="mt-2 text-sm text-blue-200 font-medium">
                Expert Support & Escalation Team
              </div>
            </div>
            <div className="pt-4 md:pt-0">
              <div className="text-4xl font-extrabold sm:text-5xl">48hr</div>
              <div className="mt-2 text-sm text-blue-200 font-medium">
                Average Resolution Time Across Departments
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#00288e] text-white">
              <span className="material-symbols-outlined text-[16px]">shield</span>
            </div>
            <span className="font-semibold text-slate-800">ResolvSafe SaaS</span>
            <span>© 2024. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={onOpenAuth} className="hover:text-slate-800">
              Support Center
            </button>
            <a href="#privacy" className="hover:text-slate-800">
              Privacy Policy
            </a>
            <a href="#terms" className="hover:text-slate-800">
              Terms of Service
            </a>
            <a href="#compliance" className="hover:text-slate-800">
              Compliance & Ethics
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
