/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { BookOpen, Palette, Grid, ShieldAlert, Cpu, Heart, CheckCircle2 } from "lucide-react";

export default function DesignSystemDocs() {
  const [activeDSSection, setActiveDSSection] = useState<"basics" | "ia" | "figma" | "wcag" | "ai-spec">("basics");

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 overflow-hidden">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-wider text-gov-blue bg-gov-blue-light px-2.5 py-1 rounded font-bold">
            GovTech Design Standards v1.4
          </span>
          <h2 className="text-2xl font-display font-semibold text-slate-900 mt-2">
            CivicIQ Design System & Specifications
          </h2>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            A secure, accessible, high-contrast, official governance design token library matching US Federal (WDS) and European Smart-City Guidelines.
          </p>
        </div>
        <div className="flex items-center gap-1.5 self-start md:self-center font-mono text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <BookOpen className="h-4 w-4 text-gov-blue" />
          <span>Section VII.e (Civic Framework)</span>
        </div>
      </div>

      {/* Docs Nav */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-100 pb-4">
        <button
          onClick={() => setActiveDSSection("basics")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
            activeDSSection === "basics"
              ? "bg-gov-blue text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Palette className="h-3.5 w-3.5" />
          <span>1. Aesthetic & Colors</span>
        </button>

        <button
          onClick={() => setActiveDSSection("ia")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
            activeDSSection === "ia"
              ? "bg-gov-blue text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span>2. IA & User Flows</span>
        </button>

        <button
          onClick={() => setActiveDSSection("figma")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
            activeDSSection === "figma"
              ? "bg-gov-blue text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Grid className="h-3.5 w-3.5" />
          <span>3. Grid & Figma Auto Layout</span>
        </button>

        <button
          onClick={() => setActiveDSSection("ai-spec")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
            activeDSSection === "ai-spec"
              ? "bg-gov-blue text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Cpu className="h-3.5 w-3.5" />
          <span>4. AI Agents Architecture</span>
        </button>

        <button
          onClick={() => setActiveDSSection("wcag")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
            activeDSSection === "wcag"
              ? "bg-gov-blue text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <ShieldAlert className="h-3.5 w-3.5" />
          <span>5. WCAG & Accessibility</span>
        </button>
      </div>

      {/* Docs Content */}
      <div className="space-y-6">
        {activeDSSection === "basics" && (
          <div className="space-y-6 animate-fade-in">
            {/* Color section */}
            <div>
              <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <span className="w-2.5 h-4 bg-gov-blue inline-block rounded"></span>
                Official Color Architecture
              </h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Strict WCAG Contrast Compliant Theme (4.5:1 ratio minimum for medium text, 7:1 for fine displays). No gradients to preserve absolute trust.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="border border-slate-200 rounded-lg p-3 bg-white">
                  <div className="w-full h-12 rounded bg-gov-blue border border-slate-200 mb-2"></div>
                  <div className="font-mono text-xs text-slate-800 font-bold">Government Blue</div>
                  <div className="font-mono text-[10px] text-slate-500">#1565C0 (Accent & Branding)</div>
                  <div className="text-[10px] text-emerald-600 font-semibold mt-1">AAA Compliant</div>
                </div>

                <div className="border border-slate-200 rounded-lg p-3 bg-white">
                  <div className="w-full h-12 rounded bg-[#FFFFFF] border border-slate-300 mb-2"></div>
                  <div className="font-mono text-xs text-slate-800 font-bold">Primary Slate Canvas</div>
                  <div className="font-mono text-[10px] text-slate-500">#FFFFFF (Spacious White)</div>
                  <div className="text-[10px] text-slate-400 font-semibold mt-1">Universal Base</div>
                </div>

                <div className="border border-slate-200 rounded-lg p-3 bg-[#F5F7FA]">
                  <div className="w-full h-12 rounded bg-[#F5F7FA] border border-slate-200 mb-2"></div>
                  <div className="font-mono text-xs text-slate-800 font-bold">Secondary Base</div>
                  <div className="font-mono text-[10px] text-slate-500">#F5F7FA (Light Neutral Gray)</div>
                  <div className="text-[10px] text-slate-400 font-semibold mt-1">Component Frames</div>
                </div>

                <div className="border border-slate-200 rounded-lg p-3 bg-white">
                  <div className="flex gap-1 mb-2">
                    <span className="flex-1 h-12 bg-[#EF4444] rounded"></span>
                    <span className="flex-1 h-12 bg-[#F97316] rounded"></span>
                    <span className="flex-1 h-12 bg-[#10B981] rounded"></span>
                  </div>
                  <div className="font-mono text-xs text-slate-800 font-bold">Alert Signifiers</div>
                  <div className="font-mono text-[10px] text-slate-500">Red (#EF4444) | Orange | Green</div>
                  <div className="text-[10px] text-amber-600 font-semibold mt-1">Adaptive Severity Colors</div>
                </div>
              </div>
            </div>

            {/* Typography section */}
            <div>
              <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <span className="w-2.5 h-4 bg-slate-700 inline-block rounded"></span>
                Typography Scale & Hierarchy
              </h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden mt-3">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 font-mono text-slate-600">
                      <th className="p-3">Role</th>
                      <th className="p-3">Family</th>
                      <th className="p-3">Weight</th>
                      <th className="p-3">Size/Leading</th>
                      <th className="p-3">Usage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                    <tr>
                      <td className="p-3 font-semibold text-slate-900">Hero Heading</td>
                      <td className="p-3">Space Grotesk</td>
                      <td className="p-3">Bold (700)</td>
                      <td className="p-3">30px / 38px</td>
                      <td className="p-3 font-sans">Main Dashboard Title, Splash Landing</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-900">Card Header</td>
                      <td className="p-3">Space Grotesk</td>
                      <td className="p-3">Medium (500)</td>
                      <td className="p-3">18px / 24px</td>
                      <td className="p-3 font-sans">Section headings, map anchors, modal titles</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-900">Body Text</td>
                      <td className="p-3">Inter</td>
                      <td className="p-3">Regular (400)</td>
                      <td className="p-3">14px / 20px</td>
                      <td className="p-3 font-sans">Descriptions, citizen reports, logs, instructions</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-900">Data Display</td>
                      <td className="p-3">JetBrains Mono</td>
                      <td className="p-3">Medium (500)</td>
                      <td className="p-3">12px / 16px</td>
                      <td className="p-3 font-sans">KPI indicators, telemetry metrics, IDs, coordinates</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeDSSection === "ia" && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <span className="w-2.5 h-4 bg-emerald-600 inline-block rounded"></span>
              CivicIQ Complete Information Architecture
            </h3>
            <p className="text-xs text-slate-500">
              A comprehensive view of how citizen reports feed into the central decision intelligence engine and are subsequently triaged and assigned to field workers.
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 font-mono text-xs text-slate-700 leading-relaxed overflow-x-auto">
              <pre>{`
CivicIQ Governance Framework [Root Level Map]
 ├── Citizen Application Terminal [Mobile Mode]
 │    ├── Splash Screen (Official Seal & Authenticator)
 │    ├── Secure Portal Login (Local Key or PIN/OTP Authentication)
 │    ├── Dashboard Home
 │    │    ├── Active Trackers (Visual timeline of past submissions)
 │    │    ├── Citizen Bulletin (Alerts, localized priority zone warnings)
 │    │    └── Submission Anchor -> Navigation trigger
 │    ├── Interactive Report Intake Form
 │    │    ├── Intake Phase: Text description (Natural Language Parsing)
 │    │    ├── Audio Phase: Mic recordings -> Instant transcription
 │    │    ├── Media Phase: Pavement damage / leakage camera uploads
 │    │    └── GIS Phase: Automatic GPS fetch + interactive grid map anchor
 │    └── Pre-Submission Classification Engine Preview
 │         └── Displays what categories & confidence CivicIQ detects PRIOR to saving
 │
 ├── Government Administrator Portal [Desktop Console]
 │    ├── Global Smart City KPI metrics (Total, Resolved, Pending, Budget Status)
 │    ├── Command Center Map Workspace (Live coordinate mapping of clusters & workers)
 │    ├── AI Explainable Priority Matrix (Ranking algorithms displaying affected citizens)
 │    ├── Explainable Decision Drawer (Audit logs of deep model confidence scores)
 │    ├── Simulation Playground (Dynamic sliders for real-time budget forecasting)
 │    └── Resource Dispatch Command (Direct assignment to available technicians)
 │
 └── Field Worker Application Terminal [Mobile Mode]
      ├── Daily Work order list (Ranked strictly by CivicIQ Severity weights)
      ├── Active Mission navigation portal (Street directions & coordinate lookup)
      ├── Completion Verification Console (Camera captures, closeout logs)
      └── Offline Mode Sync engine (State preservation when signal fails)
`}</pre>
            </div>
          </div>
        )}

        {activeDSSection === "figma" && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <span className="w-2.5 h-4 bg-orange-500 inline-block rounded"></span>
              Figma Auto Layout & Token Mapping Specifications
            </h3>
            <p className="text-xs text-slate-500">
              Developer handoff coordinates and layout constraints used to build the CivicIQ app. All components are programmed on an 8px grid with precise bounding boxes.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="border border-slate-200 p-4 rounded-lg bg-white space-y-3">
                <div className="font-bold text-slate-900 border-b border-slate-100 pb-1 text-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                  Figma Component Naming
                </div>
                <div className="space-y-1.5 text-slate-600">
                  <div><span className="text-gov-blue">CivicIQ_Button_Primary</span>: Hug contents, Padding: 12px 20px, R: 8px</div>
                  <div><span className="text-gov-blue">CivicIQ_Badge_Severity</span>: Hug contents, Padding: 4px 8px, R: 4px</div>
                  <div><span className="text-gov-blue">CivicIQ_Card_Elevated</span>: Fill container, Padding: 24px, R: 12px</div>
                  <div><span className="text-gov-blue">CivicIQ_Mobile_Viewport</span>: 390px x 844px, Vertical Auto Layout</div>
                  <div><span className="text-gov-blue">CivicIQ_Grid_System</span>: 12-Column Desktop Grid, Gutter: 24px, Margin: 48px</div>
                </div>
              </div>

              <div className="border border-slate-200 p-4 rounded-lg bg-white space-y-3">
                <div className="font-bold text-slate-900 border-b border-slate-100 pb-1 text-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Spacing & Token Values
                </div>
                <div className="space-y-1.5 text-slate-600">
                  <div><span className="font-bold">--spacing-2xs</span>: 4px (Fine details, badge spacing)</div>
                  <div><span className="font-bold">--spacing-xs</span>: 8px (Grid gutters, icon spacing)</div>
                  <div><span className="font-bold">--spacing-sm</span>: 12px (Label-to-input padding)</div>
                  <div><span className="font-bold">--spacing-md</span>: 16px (Interior card padding)</div>
                  <div><span className="font-bold">--spacing-lg</span>: 24px (Standard section gaps, outer borders)</div>
                  <div><span className="font-bold">--spacing-xl</span>: 32px (Spacious layout separation margins)</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeDSSection === "ai-spec" && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <span className="w-2.5 h-4 bg-purple-600 inline-block rounded"></span>
              CivicIQ Agent Orchestration Specifications
            </h3>
            <p className="text-xs text-slate-500">
              The platform utilizes a system of seven specialized AI agents working together in a secure server-side container to analyze, verify, prioritize, and allocate public works resources.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="border border-slate-200 p-3 rounded-lg bg-slate-50 text-xs">
                <div className="font-bold text-slate-800">1. Complaint Classifier Agent</div>
                <div className="text-slate-500 mt-1">Parses text & voice. Matches with 1 of 5 municipal department domains with high-confidence labels.</div>
              </div>
              <div className="border border-slate-200 p-3 rounded-lg bg-slate-50 text-xs">
                <div className="font-bold text-slate-800">2. Duplicate Detector Agent</div>
                <div className="text-slate-500 mt-1">Runs spatial (GPS radius) and semantic text-cosine checks to identify redundant logs. Merges into active master logs.</div>
              </div>
              <div className="border border-slate-200 p-3 rounded-lg bg-slate-50 text-xs">
                <div className="font-bold text-slate-800">3. Severity Evaluator Agent</div>
                <div className="text-slate-500 mt-1">Interprets imagery and descriptive keywords to label damage. Computes physical hazard threat levels.</div>
              </div>
              <div className="border border-slate-200 p-3 rounded-lg bg-slate-50 text-xs">
                <div className="font-bold text-slate-800">4. Population Impact Agent</div>
                <div className="text-slate-500 mt-1">Queries regional census databases to count affected citizens inside a dynamic buffer zone of the incident coordinates.</div>
              </div>
              <div className="border border-slate-200 p-3 rounded-lg bg-slate-50 text-xs">
                <div className="font-bold text-slate-800">5. Delay Prediction Agent</div>
                <div className="text-slate-500 mt-1">Simulates vehicle/pedestrian slowdowns by intersecting incidents with grid traffic flow data streams.</div>
              </div>
              <div className="border border-slate-200 p-3 rounded-lg bg-slate-50 text-xs">
                <div className="font-bold text-slate-800">6. Priority Ranking Agent</div>
                <div className="text-slate-500 mt-1">Normalizes severities, delays, populations, and times to output an objective score from 0 to 100 for dispatchers.</div>
              </div>
            </div>
          </div>
        )}

        {activeDSSection === "wcag" && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <span className="w-2.5 h-4 bg-blue-600 inline-block rounded"></span>
              WCAG 2.1 AA Compliance Audit Protocol
            </h3>
            <p className="text-xs text-slate-500">
              Government-facing applications must remain usable by all members of the public, including those utilizing screen readers or high-contrast navigation aids.
            </p>

            <div className="space-y-2.5 font-sans text-xs text-slate-700">
              <div className="flex items-start gap-2 border border-slate-200 p-2.5 rounded bg-white">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">Guideline 1.1.1 - Non-text Content (Level A)</span>
                  <span className="text-slate-500">All submitted photo attachments, icons, and vector indicators contain descriptive `aria-label` or `alt` tags to support automated screen reading utilities.</span>
                </div>
              </div>

              <div className="flex items-start gap-2 border border-slate-200 p-2.5 rounded bg-white">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">Guideline 1.4.3 - Contrast Minimum (Level AA)</span>
                  <span className="text-slate-500">Text elements in our palette maintain a contrast of 4.5:1 against their backgrounds. Highlighted text colors use dark grays (#374151) on white to guarantee legibility.</span>
                </div>
              </div>

              <div className="flex items-start gap-2 border border-slate-200 p-2.5 rounded bg-white">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">Guideline 2.1.1 - Keyboard Accessibility (Level A)</span>
                  <span className="text-slate-500">All active controls, navigation tabs, and dropdown menus are accessible using standard Tab keys, with a distinct visual focus outline of 2px.</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
