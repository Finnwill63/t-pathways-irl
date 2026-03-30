import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "./supabaseClient.js";

// ── KTH IRL FRAMEWORK DATA ───────────────────────────────────────────────────
const DIMS = [
  {
    code: "CRL", name: "Customer", full: "Customer Readiness Level",
    color: "#2471a3", light: "#d6eaf8", dark: "#1a5276",
    what: "How well do you understand your customers and how far along are you in building real market relationships?",
    levels: [
      { n: 1, label: "Hypothesis only", desc: "You have a hypothesis about possible needs in the market, but no external validation yet. You are working from assumptions." },
      { n: 2, label: "Needs identified", desc: "You have done initial research and identified specific needs in the market. You can describe who has the problem and why it matters." },
      { n: 3, label: "First feedback", desc: "You have spoken with potential customers and established first market feedback. You have heard the problem described in their own words." },
      { n: 4, label: "Problem confirmed", desc: "Multiple customers or users have confirmed the problem or need. You are confident the problem is real and worth solving." },
      { n: 5, label: "Interest established", desc: "You have established genuine interest and ongoing relationships with customers. Some are actively engaged and following your progress." },
      { n: 6, label: "Benefits confirmed", desc: "First customer testing has confirmed that your solution delivers the benefits you claimed. You have proof it works for real people." },
      { n: 7, label: "Test sales / early users", desc: "Customers are in extended testing or you have made first test sales. You have a small but real number of active users." },
      { n: 8, label: "Commercial sales", desc: "You have made first commercial sales and have an implemented sales process. You have a substantial number of active users." },
      { n: 9, label: "Scaling sales", desc: "You have widespread sales that scale, and a large number of active users with substantial growth. The sales engine runs without heroic effort." },
    ],
  },
  {
    code: "TRL", name: "Technology", full: "Technology Readiness Level",
    color: "#1e8449", light: "#d5f5e3", dark: "#145a32",
    what: "How mature is your product, service, or solution — the actual thing you are building?",
    levels: [
      { n: 1, label: "Initial idea", desc: "You have an interesting idea or have identified initial research results. Nothing has been built or tested yet." },
      { n: 2, label: "Concept formulated", desc: "You have formulated a technology concept and can articulate how it could work. The idea is written down and thought through." },
      { n: 3, label: "Proof of concept", desc: "You have demonstrated proof-of-concept of the critical functions in a lab or controlled setting. Core mechanics work at a basic level." },
      { n: 4, label: "Lab validation", desc: "The technology has been validated in a laboratory. It works under controlled conditions with reliable, repeatable results." },
      { n: 5, label: "Relevant environment", desc: "The technology has been validated in a relevant (but not yet operational) environment. It holds up outside the lab." },
      { n: 6, label: "Prototype demonstrated", desc: "A prototype has been demonstrated in a relevant environment. Real users or stakeholders have seen and interacted with it." },
      { n: 7, label: "Operational prototype", desc: "The prototype has been demonstrated in an operational environment — conditions close to real-world use. It performs under pressure." },
      { n: 8, label: "Complete & demonstrated", desc: "The technology is complete and has been demonstrated in actual operations. It works in the real world, reliably." },
      { n: 9, label: "Proven over time", desc: "The technology is complete and proven in actual operations over time. Track record exists. It does not just work — it keeps working." },
    ],
  },
  {
    code: "BRL", name: "Business Model", full: "Business Model Readiness Level",
    color: "#d35400", light: "#fdebd0", dark: "#784212",
    what: "How well defined, tested, and validated is your sustainable business model?",
    levels: [
      { n: 1, label: "No clear hypothesis", desc: "There is no clear description of a business idea, market potential, or competitive landscape. You are pre-business-model." },
      { n: 2, label: "First hypothesis", desc: "You have a first hypothesis of a possible business concept and have identified the overall market potential and key competition." },
      { n: 3, label: "Model described", desc: "You have a description of a sustainable business model and your target market(s), including how you differ from competition." },
      { n: 4, label: "Viability calculated", desc: "First calculations indicate an economically viable business model. You have done an initial assessment of environmental and social sustainability." },
      { n: 5, label: "Assumptions tested", desc: "Key assumptions in your sustainable business model have been tested on the market. You know which hold and which need revision." },
      { n: 6, label: "Full model tested", desc: "The full sustainable business model has been tested with customers, partners, and suppliers — including test sales — with calculations showing economic viability." },
      { n: 7, label: "Validated by sales", desc: "The viability of the sustainable business model has been validated by initial commercial sales. Real money has confirmed the model works." },
      { n: 8, label: "Metrics confirm viability", desc: "Sales and metrics show that the sustainable business model is viable. You have data, not just belief, that this business works." },
      { n: 9, label: "Proven & scalable", desc: "The sustainable business model is proven to meet internal and external expectations on profit, scalability, and impact — over time, not just once." },
    ],
  },
  {
    code: "IPRL", name: "IP", full: "IP Readiness Level",
    color: "#7d3c98", light: "#f4ecf7", dark: "#512e5f",
    what: "How well have you identified, protected, and strategically managed your intellectual property?",
    levels: [
      { n: 1, label: "Hypothesising on IP", desc: "You are beginning to think about what IP you might have, but have not done any formal assessment. IP is on the radar but not yet acted on." },
      { n: 2, label: "IP identified", desc: "You have identified different forms of possible IP you have or are creating. Ownership is clarified and you can use your relevant IP." },
      { n: 3, label: "Key IP described", desc: "You have described your possible key IP in some detail and done an initial evaluation of the potential to protect it." },
      { n: 4, label: "Protection confirmed", desc: "You have confirmed that IP protection is possible and for which assets. You have decided why protecting certain IP is business-relevant." },
      { n: 5, label: "Strategy drafted & filed", desc: "A draft IP strategy to create business value is in place. You have filed your first formal application or registration of key IP." },
      { n: 6, label: "Full strategy in place", desc: "A complete IP strategy considering different types of IP is in place. You have received a positive response on filed applications or registrations." },
      { n: 7, label: "Filed in key markets", desc: "Formal applications or registrations of key IP have been filed in relevant countries or regions, according to your IP strategy." },
      { n: 8, label: "Strategy implemented", desc: "IP strategy and management practices are fully implemented. Complementary IP applications or registrations have been filed." },
      { n: 9, label: "Strong protection granted", desc: "You have strong IP support and protection for your business. IP protection has been granted and is maintained in relevant countries." },
    ],
  },
  {
    code: "TmRL", name: "Team", full: "Team Readiness Level",
    color: "#b03a2e", light: "#fadbd8", dark: "#78281f",
    what: "How capable, complete, and committed is your team for executing on this venture?",
    levels: [
      { n: 1, label: "Solo / major gaps", desc: "There is a lack of necessary competencies or resources to verify the idea. Little insight into what the team actually needs. Typically an individual." },
      { n: 2, label: "Limited competencies", desc: "Limited competencies are in place to start verifying the idea. You have a first idea of what additional competencies or resources are needed." },
      { n: 3, label: "Some competencies, plan forming", desc: "Some of the necessary competencies are in place. You have defined what you need and have a plan for finding those competencies." },
      { n: 4, label: "Champion + partial team", desc: "A champion is present with a clear sense of direction. Several needed competencies are in place and there is an initiated plan to complement the team." },
      { n: 5, label: "Initial founding team", desc: "An initial founding team is in place with the main needed competencies and capacity. The team agrees on ownership, roles, goals, and vision." },
      { n: 6, label: "Complete founding team", desc: "A complementary, diverse, and committed founding team is in place with all necessary competencies and capacity to start building a business." },
      { n: 7, label: "Well-functioning team", desc: "A well-functioning team and culture is in place. A growth plan exists for expanding the team and building the organisation over time." },
      { n: 8, label: "Professional organisation", desc: "A professional organisation is in place — including board, CEO, management, and staff. The company runs with structure beyond the founders." },
      { n: 9, label: "High-performing organisation", desc: "A high-performing, well-structured organisation at all levels is maintained, develops, and performs over time. Leadership depth exists throughout." },
    ],
  },
  {
    code: "FRL", name: "Fundraising", full: "Fundraising Readiness Level",
    color: "#0e6655", light: "#d1f2eb", dark: "#0a3d33",
    what: "How well have you secured the funding and resources needed to execute your plan?",
    levels: [
      { n: 1, label: "No funding plan", desc: "There is no clear description of initial verification activities and no clear view of initial funding needs or funding options." },
      { n: 2, label: "Needs defined", desc: "You have described your initial verification activities and defined your funding need and funding sources for your initial milestones." },
      { n: 3, label: "Initial funding secured", desc: "Funding for your initial verification plan is secured. You have enough to take your first real steps." },
      { n: 4, label: "Elaborated plan funded", desc: "Funding for an elaborated verification plan is secured. You have a runway to do meaningful validation work." },
      { n: 5, label: "Pitch tested, strategy set", desc: "A first pitch for funding has been tested on a relevant audience. You have defined your near-term funding need and decided on a funding strategy." },
      { n: 6, label: "Improved pitch, contacts initiated", desc: "An improved pitch has been tested on a relevant audience. You have initiated contacts with relevant external funding sources." },
      { n: 7, label: "Investor discussions begun", desc: "Initial discussions with potential external funding sources are underway. A complete pitch and supporting materials are ready." },
      { n: 8, label: "Term sheet discussions", desc: "You are in term-sheet-level discussions with one or several external funding sources that show clear interest." },
      { n: 9, label: "Funded & monitored", desc: "Funding for at least 6–12 months of operations is secured. A financial monitoring and forecasting system is fully implemented." },
    ],
  },
];

const COACHING = {
  CRL: [
    { max: 2, text: "Your priority is problem validation. Talk to at least 10 potential customers before building anything — focus on listening, not pitching." },
    { max: 4, text: "You have early signals but need depth. Run structured discovery interviews and quantify the problem: how often, how painful, what are they doing instead?" },
    { max: 6, text: "Customers are interested but not yet buying. Design a test that creates a moment of commitment — a paid pilot, a letter of intent, or a pre-order." },
    { max: 8, text: "You have traction. Now systematise it: document your sales process, identify what's repeatable, and build acquisition deliberately rather than opportunistically." },
    { max: 9, text: "Strong position. Focus on retention, expansion within accounts, and building scalable acquisition channels rather than one-off deals." },
  ],
  TRL: [
    { max: 2, text: "Define the single technical assumption that must be true and design the cheapest possible experiment to test it. Don't build — test." },
    { max: 4, text: "Build the minimum viable proof — not a product, just enough to test your core technical assumption with real data." },
    { max: 6, text: "Take it out of the lab. Stress-test in a realistic environment with real users. Expect things to break — that is the value of this stage." },
    { max: 8, text: "Technology is mature. Shift focus to reliability, scalability, and reducing technical debt before it compounds." },
    { max: 9, text: "Proven technology. Your edge now is operational excellence and continuous improvement, not invention." },
  ],
  BRL: [
    { max: 2, text: "Explore at least three different revenue model options before committing. The first business model idea is rarely the right one." },
    { max: 4, text: "Identify your single most critical assumption — often willingness to pay — and design a direct, real-world test for it." },
    { max: 6, text: "Test the full system end-to-end: pricing, delivery, cost structure, and margins — ideally in a real transaction, not a simulation." },
    { max: 8, text: "The model works. Now optimise unit economics: CAC, LTV, gross margin. Document what's working so it can be replicated and taught." },
    { max: 9, text: "Proven model. Focus on scalability — can it grow without proportional increases in cost and complexity?" },
  ],
  IPRL: [
    { max: 2, text: "Start by inventorying what you're creating — code, brand, content, data, methods — and clarify who owns what before anything else." },
    { max: 4, text: "Assess what is protectable, commercially valuable, and worth the cost of formal protection. Not everything needs a patent." },
    { max: 6, text: "Build a coherent IP strategy — not just patents, but trade secrets, trademarks, and contractual protections working together." },
    { max: 8, text: "Ensure your IP portfolio aligns with your business strategy. File in the markets where you plan to commercialise." },
    { max: 9, text: "Strong position. Focus on enforcement, portfolio maintenance, and identifying strategic licensing opportunities." },
  ],
  TmRL: [
    { max: 2, text: "Map the competencies your venture needs and identify two or three specific people you could bring in. Be concrete, not abstract." },
    { max: 4, text: "Name your critical gaps explicitly — a missing skill is a strategic risk. Address it before you try to scale." },
    { max: 6, text: "Formalise roles, equity, and decision-making now. Ambiguity at this stage compounds fast when pressure increases." },
    { max: 8, text: "Invest in culture, communication, and onboarding as you hire. Culture is set early and is very hard to change later." },
    { max: 9, text: "Focus on leadership development at all levels and succession planning for key roles. The organisation should not depend on any one person." },
  ],
  FRL: [
    { max: 2, text: "Map your funding needs against your milestones. Identify the most appropriate source for each stage — grant, angel, accelerator, or revenue." },
    { max: 4, text: "Prioritise non-dilutive funding (grants, competitions) to extend runway while you validate. Don't give away equity before you have to." },
    { max: 6, text: "Get in front of investors now — even for feedback, not just capital. Relationships take time and your pitch improves with each conversation." },
    { max: 8, text: "Prepare your data room, know your key metrics cold, and move quickly when term sheets arrive. Momentum in a raise is fragile." },
    { max: 9, text: "Focus on capital efficiency and building financial monitoring systems now. Your next raise will scrutinise how you managed this one." },
  ],
};

function getCoaching(code, level) {
  const rules = COACHING[code];
  return rules.find((r) => level <= r.max)?.text ?? rules[rules.length - 1].text;
}

const ADMIN_PW = "courage2026";
// ── STORAGE — Supabase ───────────────────────────────────────────────────────
function useStorage() {
  const get = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("irl_submissions")
        .select("*")
        .order("submitted_at", { ascending: false });
      if (error) throw error;
      // Normalise Supabase rows to the same shape the app expects
      return (data || []).map((row) => ({
        team: row.team,
        idea: row.idea || "",
        start: row.start_scores,
        target: row.target_scores,
        timestamp: row.submitted_at,
      }));
    } catch (e) {
      console.error("Supabase read error:", e);
      return [];
    }
  }, []);

  const set = useCallback(async (allSubmissions) => {
    // "set" is called with the full updated array after a new submission.
    // We upsert based on team name — update if exists, insert if not.
    // Find the latest entry (last in array since we push new ones to end).
    const latest = allSubmissions[allSubmissions.length - 1];
    if (!latest) return;
    try {
      // Check if team already has a row
      const { data: existing } = await supabase
        .from("irl_submissions")
        .select("id")
        .eq("team", latest.team)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("irl_submissions")
          .update({
            idea: latest.idea,
            start_scores: latest.start,
            target_scores: latest.target,
            submitted_at: new Date().toISOString(),
          })
          .eq("team", latest.team);
      } else {
        await supabase
          .from("irl_submissions")
          .insert({
            team: latest.team,
            idea: latest.idea,
            start_scores: latest.start,
            target_scores: latest.target,
          });
      }
    } catch (e) {
      console.error("Supabase write error:", e);
    }
  }, []);

  return { get, set };
}

function avgScores(scores) {
  return DIMS.reduce((s, d) => s + (scores[d.code] || 0), 0) / DIMS.length;
}
function getInitials(name) {
  return name.trim().split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

// ── RADAR CHART ───────────────────────────────────────────────────────────────
function RadarChart({ datasets, size = 280 }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  const build = useCallback(() => {
    if (!canvasRef.current || !window.Chart) return;
    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new window.Chart(canvasRef.current, {
      type: "radar",
      data: { labels: DIMS.map((d) => d.name), datasets: datasets.map((ds) => ({ ...ds, pointRadius: 4, borderWidth: 2 })) },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: { r: { min: 0, max: 9, ticks: { stepSize: 3, font: { size: 10 }, color: "#999", backdropColor: "transparent" }, pointLabels: { font: { size: 11 } }, grid: { color: "rgba(0,0,0,0.07)" }, angleLines: { color: "rgba(0,0,0,0.07)" } } },
        plugins: { legend: { display: datasets.length > 1, position: "bottom", labels: { font: { size: 11 }, boxWidth: 10, padding: 12, color: "#666" } } },
      },
    });
  }, [datasets]);

  useEffect(() => {
    if (window.Chart) { build(); return; }
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js";
    s.onload = build;
    document.head.appendChild(s);
    return () => { try { document.head.removeChild(s); } catch {} };
  }, []);
  useEffect(() => { if (window.Chart) build(); }, [build]);

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: size, height: size, margin: "0 auto" }}>
      <canvas ref={canvasRef} />
    </div>
  );
}

// ── GDPR GATE ─────────────────────────────────────────────────────────────────
function GdprGate({ onAccept }) {
  const [expanded, setExpanded] = useState(false);
  const [checked, setChecked] = useState(false);
  return (
    <div style={S.gdprOverlay}>
      <div style={S.gdprModal}>
        <div style={S.gdprHeader}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={S.logoKth}>KTH</span>
            <span style={S.logoDivider}>/</span>
            <span style={S.logoSub}>Innovation Readiness Levels</span>
          </div>
          <span style={S.gdprBadge}>Data notice</span>
        </div>
        <div style={S.gdprTitle}>Before you begin</div>
        <div style={S.gdprProgramme}>Pathways Pre-Accelerator — Spring 2026</div>
        <div style={S.gdprSummary}>
          {[
            ["🏛", "Data controller", "William Cardwell"],
            ["📋", "What we collect", "Your team name, a short idea description, and your Innovation Readiness Level scores (start and target) across 6 dimensions. No personal names or contact details are collected."],
            ["🎯", "Why we collect it", "To support programme facilitation and educational research. Your profile helps facilitators tailor coaching and track progress across the programme."],
            ["👥", "Who can see it", "Programme facilitators (Pathways team). Aggregated cohort averages — not individual scores — may be shown to all participants during a session."],
            ["⏱", "Retention", "For the duration of the programme and up to 2 years thereafter for research purposes."],
            ["⚖️", "Legal basis", "Legitimate interests of the University of Helsinki in educational research and programme improvement (GDPR Art. 6(1)(f))."],
          ].map(([icon, title, body]) => (
            <div key={title} style={S.gdprRow}>
              <span style={S.gdprIcon}>{icon}</span>
              <div>
                <div style={S.gdprRowTitle}>{title}</div>
                <div style={S.gdprRowBody}>{body}</div>
              </div>
            </div>
          ))}
        </div>
        <button style={S.gdprExpandBtn} onClick={() => setExpanded(!expanded)}>
          {expanded ? "▲" : "▼"} Your rights under GDPR
        </button>
        {expanded && (
          <div style={S.gdprRights}>
            {[["Access","Request a copy of your team's data at any time."],["Rectification","Correct data by resubmitting with the same team name."],["Erasure","Request deletion by contacting a programme facilitator."],["Objection","Object to processing based on legitimate interests at any time."],["Portability","Request your data in a machine-readable format."]].map(([r, d]) => (
              <div key={r} style={{ display: "flex", gap: 10, marginBottom: 6 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#1a1a2e", width: 90, flexShrink: 0 }}>{r}</div>
                <div style={{ fontSize: 11, color: "#555", lineHeight: 1.6 }}>{d}</div>
              </div>
            ))}
            <div style={{ fontSize: 11, color: "#888", marginTop: 8, lineHeight: 1.6 }}>
              To exercise any right, contact your programme facilitator. You may also lodge a complaint with the Finnish Data Protection Ombudsman at tietosuoja.fi.
            </div>
          </div>
        )}
        <label style={S.gdprCheckRow}>
          <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)}
            style={{ width: 18, height: 18, accentColor: "#1a1a2e", flexShrink: 0, marginTop: 2 }} />
          <span style={{ fontSize: 13, color: "#1a1a2e", lineHeight: 1.6 }}>
            I have read and understood how my team's data will be used. I agree to participate in the KTH Innovation Readiness Level assessment for the Pathways Pre-Accelerator — Spring 2026.
          </span>
        </label>
        <button style={{ ...S.submitBtn, opacity: checked ? 1 : 0.4, cursor: checked ? "pointer" : "not-allowed" }}
          disabled={!checked} onClick={onAccept}>
          Continue to assessment →
        </button>
        <div style={{ fontSize: 10, color: "#bbb", marginTop: 14, lineHeight: 1.6, textAlign: "center" }}>
          Operated by Courage Ventures on behalf of the University of Helsinki · KTH IRL™ CC BY-NC-SA 4.0
        </div>
      </div>
    </div>
  );
}

// ── PRIVACY MODAL ─────────────────────────────────────────────────────────────
function PrivacyModal({ onClose }) {
  return (
    <div style={S.gdprOverlay} onClick={onClose}>
      <div style={{ ...S.gdprModal, maxHeight: "80vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={S.gdprTitle}>Privacy information</div>
          <button style={S.outBtn} onClick={onClose}>✕ Close</button>
        </div>
        <div style={S.gdprProgramme}>Pathways Pre-Accelerator — Spring 2026</div>
        <div style={{ ...S.gdprSummary, marginTop: 12 }}>
          {[
            ["Data controller","University of Helsinki"],
            ["Operator","Courage Ventures Management Oy, acting on behalf of the University of Helsinki"],
            ["Data collected","Team name; idea description; Innovation Readiness Level scores (1–9) for 6 dimensions; start and target assessments; submission timestamp. No personal names or contact details are collected."],
            ["Purpose","Educational research and programme improvement. Scores are used to tailor coaching during the programme and to analyse innovation readiness patterns across cohorts."],
            ["Legal basis","Legitimate interests (GDPR Art. 6(1)(f)). The University of Helsinki has a legitimate interest in conducting educational research and improving programme quality."],
            ["Data sharing","Programme facilitators have access to individual team submissions. Aggregated, anonymised results may be used in research or programme reporting."],
            ["Retention","For the duration of the programme and up to 2 years thereafter, after which data is deleted or fully anonymised."],
            ["Your rights","Access, rectification, erasure, restriction, objection, and portability. Contact a programme facilitator or lodge a complaint with the Finnish Data Protection Ombudsman at tietosuoja.fi."],
            ["Framework","KTH Innovation Readiness Level™ © KTH Innovation, licensed CC BY-NC-SA 4.0. See kthinnovationreadinesslevel.com."],
          ].map(([t, b]) => (
            <div key={t} style={S.gdprRow}>
              <div>
                <div style={S.gdprRowTitle}>{t}</div>
                <div style={S.gdprRowBody}>{b}</div>
              </div>
            </div>
          ))}
        </div>
        <button style={{ ...S.submitBtn, marginTop: 16 }} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("submit");
  const [submissions, setSubmissions] = useState([]);
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [confirmed, setConfirmed] = useState(null);
  const [gdprAccepted, setGdprAccepted] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const { get, set } = useStorage();

  useEffect(() => { get().then(setSubmissions); }, []);

  const handleSubmit = async (entry) => {
    const updated = [...submissions.filter((s) => s.team.toLowerCase() !== entry.team.toLowerCase()), entry];
    await set(updated); setSubmissions(updated); setConfirmed(entry);
  };
  const handleReset = async () => {
    if (!window.confirm("Clear all submissions? This cannot be undone.")) return;
    await set([]); setSubmissions([]);
  };
  const exportCSV = () => {
    const headers = ["Team", "Idea", ...DIMS.map((d) => d.code + " Start"), "Avg Start", ...DIMS.map((d) => d.code + " Target"), "Avg Target", "Timestamp"];
    const rows = submissions.map((s) => [`"${s.team}"`, `"${(s.idea || "").replace(/"/g, "'")}"`, ...DIMS.map((d) => s.start[d.code]), avgScores(s.start).toFixed(2), ...DIMS.map((d) => s.target[d.code]), avgScores(s.target).toFixed(2), s.timestamp]);
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent([headers, ...rows].map((r) => r.join(",")).join("\n"));
    a.download = "irl-cohort.csv"; a.click();
  };

  if (!gdprAccepted) return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,400&display=swap'); * { box-sizing: border-box; } button { font-family: 'DM Sans', sans-serif; cursor: pointer; }`}</style>
      <GdprGate onAccept={() => setGdprAccepted(true)} />
    </>
  );

  return (
    <div style={S.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,400&display=swap');
        * { box-sizing: border-box; }
        button { font-family: 'DM Sans', sans-serif; cursor: pointer; }
        input[type=range] { cursor: pointer; height: 4px; }
        textarea { font-family: 'DM Sans', sans-serif; resize: vertical; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes popIn { 0% { transform: scale(0.7); opacity: 0; } 70% { transform: scale(1.08); } 100% { transform: scale(1); opacity: 1; } }
        .fade-up { animation: fadeUp 0.35s ease both; }
        .pop-in { animation: popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both; }
      `}</style>
      {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} />}

      <header style={S.header}>
        <div style={S.logo}>
          <span style={S.logoKth}>KTH</span>
          <span style={S.logoDivider}>/</span>
          <span style={S.logoSub}>Innovation Readiness Levels</span>
        </div>
        <nav style={S.nav}>
          {[["submit","Submit"],["cohort","Cohort View"],["admin","Admin"]].map(([t, lbl]) => (
            <button key={t} style={{ ...S.navBtn, ...(tab === t ? S.navActive : {}) }}
              onClick={() => { setTab(t); if (t === "submit") setConfirmed(null); }}>
              {lbl}
            </button>
          ))}
        </nav>
      </header>

      <main style={S.main}>
        {tab === "submit" && (confirmed
          ? <CelebrationView entry={confirmed} onBack={() => setConfirmed(null)} />
          : <SubmitForm onSubmit={handleSubmit} existing={submissions} />
        )}
        {tab === "cohort" && <CohortView submissions={submissions} />}
        {tab === "admin" && <AdminView submissions={submissions} unlocked={adminUnlocked} onUnlock={() => setAdminUnlocked(true)} onReset={handleReset} onExport={exportCSV} />}
      </main>

      <footer style={S.privacyFooter}>
        <span style={S.privacyFooterText}>Data processed by the University of Helsinki · Pathways Pre-Accelerator 2026 · </span>
        <button style={S.privacyLink} onClick={() => setShowPrivacy(true)}>Privacy information</button>
        <span style={S.privacyFooterText}> · KTH IRL™ CC BY-NC-SA 4.0</span>
      </footer>
    </div>
  );
}

// ── SUBMIT FORM ───────────────────────────────────────────────────────────────
function SubmitForm({ onSubmit, existing }) {
  const [team, setTeam] = useState("");
  const [idea, setIdea] = useState("");
  const [activeDim, setActiveDim] = useState(0);
  const [startVals, setStartVals] = useState(() => Object.fromEntries(DIMS.map((d) => [d.code, 1])));
  const [targetVals, setTargetVals] = useState(() => Object.fromEntries(DIMS.map((d) => [d.code, 1])));
  const [mode, setMode] = useState("start");
  const [step, setStep] = useState("info"); // "info" | "dims"

  const dim = DIMS[activeDim];
  const vals = mode === "start" ? startVals : targetVals;
  const setVals = mode === "start" ? setStartVals : setTargetVals;
  const currentLevel = vals[dim.code];
  const levelData = dim.levels[currentLevel - 1];
  const duplicate = existing.find((s) => s.team.trim().toLowerCase() === team.trim().toLowerCase());
  const canProceed = team.trim().length > 0 && idea.trim().length > 0;

  // Progress: how many dims have both start and target explicitly visited
  // We track visited dims
  const [visitedDims, setVisitedDims] = useState(new Set([0]));
  const allDone = visitedDims.size === DIMS.length;

  const goToDim = (i) => {
    setActiveDim(i);
    setVisitedDims((prev) => new Set([...prev, i]));
  };

  if (step === "info") {
    return (
      <div className="fade-up">
        <div style={S.stepHeader}>
          <div style={S.stepNum}>1</div>
          <div>
            <div style={S.stepTitle}>Tell us about your team</div>
            <div style={S.stepSub}>This takes about 5 minutes. Be honest — there are no right answers.</div>
          </div>
        </div>

        <div style={S.field}>
          <label style={S.fieldLabel}>Team name</label>
          <input style={S.textInput} placeholder="e.g. Aivia, NutriLoop, Nasu AI…"
            value={team} onChange={(e) => setTeam(e.target.value)} />
        </div>

        <div style={S.field}>
          <label style={S.fieldLabel}>What is your idea?</label>
          <div style={S.fieldHint}>Describe the problem you're solving and your proposed solution. A paragraph is ideal — enough for a facilitator to understand your venture at a glance.</div>
          <textarea style={S.textArea} rows={5}
            placeholder="e.g. Many elderly patients in Finland struggle to manage complex medication schedules at home, leading to missed doses and avoidable hospitalisations. We are building an AI-powered mobile tool that gives patients and carers a simple, personalised daily medication guide with reminders and side-effect flags…"
            value={idea} onChange={(e) => setIdea(e.target.value)} />
          <div style={{ ...S.charCount, color: idea.length > 600 ? "#c0392b" : "#bbb" }}>
            {idea.length} / 600 characters recommended
          </div>
        </div>

        {duplicate && team.trim() && (
          <div style={S.warnPill}>⚠ {duplicate.team} has already submitted — saving will update their entry.</div>
        )}

        <button style={{ ...S.submitBtn, opacity: canProceed ? 1 : 0.4 }}
          disabled={!canProceed}
          onClick={() => setStep("dims")}>
          Next: Rate your readiness →
        </button>
      </div>
    );
  }

  return (
    <div className="fade-up">
      {/* Step header */}
      <div style={S.stepHeader}>
        <div style={S.stepNum}>2</div>
        <div>
          <div style={S.stepTitle}>Rate your readiness across 6 dimensions</div>
          <div style={S.stepSub}>Set where you are today and where you aim to be by end of programme.</div>
        </div>
        <button style={S.backLink} onClick={() => setStep("info")}>← Back</button>
      </div>

      {/* Progress bar */}
      <div style={S.progressWrap}>
        <div style={S.progressTrack}>
          <div style={{ ...S.progressFill, width: `${(visitedDims.size / DIMS.length) * 100}%` }} />
        </div>
        <div style={S.progressLabel}>{visitedDims.size} of {DIMS.length} dimensions visited</div>
      </div>

      {/* Mode toggle */}
      <div style={S.modeBar}>
        <span style={S.modeLabel}>Editing:</span>
        {[["start", "Today (start)"], ["target", "End of programme (target)"]].map(([m, lbl]) => (
          <button key={m} style={{ ...S.modeBtn, ...(mode === m ? { ...S.modeBtnActive, borderColor: dim.color, color: dim.dark, background: dim.light } : {}) }}
            onClick={() => setMode(m)}>{lbl}</button>
        ))}
      </div>

      {/* Dimension tabs */}
      <div style={S.dimTabs}>
        {DIMS.map((d, i) => {
          const visited = visitedDims.has(i);
          const active = i === activeDim;
          return (
            <button key={d.code}
              style={{ ...S.dimTab, ...(active ? { ...S.dimTabActive, borderColor: d.color, color: d.dark, background: d.light } : {}) }}
              onClick={() => goToDim(i)}>
              <span>{d.code}</span>
              {visited && <span style={{ ...S.dimDot, background: active ? d.color : "#27ae60" }} />}
            </button>
          );
        })}
      </div>

      {/* Active dimension panel */}
      <div style={{ ...S.dimPanel, borderColor: dim.color + "44" }} className="fade-up" key={activeDim}>
        <div style={{ ...S.dimPanelHead, borderBottom: `2px solid ${dim.color}` }}>
          <span style={{ ...S.dimPanelBadge, background: dim.light, color: dim.dark }}>{dim.code}</span>
          <div>
            <div style={S.dimPanelTitle}>{dim.full}</div>
            <div style={S.dimPanelWhat}>{dim.what}</div>
          </div>
        </div>

        <div style={S.levelDisplay}>
          <div style={{ ...S.levelNumber, color: dim.color }}>Level {currentLevel}</div>
          <div style={{ ...S.levelLabel, color: dim.dark }}>{levelData.label}</div>
        </div>

        <div style={S.sliderWrap}>
          <input type="range" min="1" max="9" step="1" value={currentLevel}
            style={{ width: "100%", accentColor: dim.color }}
            onChange={(e) => setVals((v) => ({ ...v, [dim.code]: +e.target.value }))} />
          <div style={S.sliderTicks}>
            {dim.levels.map((l) => (
              <div key={l.n} style={{ ...S.tick, ...(l.n === currentLevel ? { color: dim.color, fontWeight: 600 } : {}) }}>{l.n}</div>
            ))}
          </div>
        </div>

        <div style={{ ...S.descCard, borderLeft: `3px solid ${dim.color}`, background: dim.light }}>
          <div style={{ fontSize: 13, lineHeight: 1.75, fontStyle: "italic", color: dim.dark }}>{levelData.desc}</div>
        </div>

        <div style={S.levelsGlance}>
          <div style={S.glanceTitle}>All levels at a glance</div>
          <div style={S.glanceGrid}>
            {dim.levels.map((l) => (
              <div key={l.n} style={{ ...S.glanceItem, ...(l.n === currentLevel ? { background: dim.light, border: `1px solid ${dim.color}50` } : {}) }}
                onClick={() => setVals((v) => ({ ...v, [dim.code]: l.n }))}>
                <div style={{ ...S.glanceNum, color: l.n === currentLevel ? dim.color : "#bbb" }}>{l.n}</div>
                <div style={{ ...S.glanceLbl, color: l.n === currentLevel ? dim.dark : "#888" }}>{l.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={S.dimFooter}>
          <div style={S.dimFooterItem}>
            <span style={S.dimFooterLbl}>Today</span>
            <span style={{ ...S.dimFooterVal, color: dim.color }}>{startVals[dim.code]}</span>
          </div>
          <div style={{ color: "#ddd", fontSize: 18 }}>→</div>
          <div style={S.dimFooterItem}>
            <span style={S.dimFooterLbl}>Target</span>
            <span style={{ ...S.dimFooterVal, color: dim.color }}>{targetVals[dim.code]}</span>
          </div>
          <div style={{ flex: 1 }} />
          {activeDim < DIMS.length - 1 ? (
            <button style={{ ...S.nextBtn, borderColor: dim.color, color: dim.dark, background: dim.light }}
              onClick={() => goToDim(activeDim + 1)}>
              Next: {DIMS[activeDim + 1].name} →
            </button>
          ) : (
            <button style={{ ...S.nextBtn, borderColor: "#27ae60", color: "#145a32", background: "#d5f5e3" }}
              onClick={() => goToDim(0)}>
              ✓ Review all →
            </button>
          )}
        </div>
      </div>

      {/* Summary strip */}
      <div style={S.summaryStrip}>
        {DIMS.map((d) => (
          <div key={d.code} style={{ ...S.summaryDim, cursor: "pointer" }} onClick={() => goToDim(DIMS.indexOf(d))}>
            <div style={{ ...S.summaryCode, color: d.dark }}>{d.code}</div>
            <div style={S.summaryVals}>
              <span style={{ color: d.color, fontWeight: 600 }}>{startVals[d.code]}</span>
              <span style={{ color: "#ddd" }}>→</span>
              <span style={{ color: d.color, fontWeight: 600 }}>{targetVals[d.code]}</span>
            </div>
          </div>
        ))}
      </div>

      {!allDone && (
        <div style={S.notDoneHint}>
          Visit all 6 dimension tabs before submitting — use the Next button or click any tab above.
        </div>
      )}

      <button
        style={{ ...S.submitBtn, opacity: allDone ? 1 : 0.4 }}
        disabled={!allDone}
        onClick={() => onSubmit({ team: team.trim(), idea: idea.trim(), start: { ...startVals }, target: { ...targetVals }, timestamp: new Date().toISOString() })}>
        Submit my IRL profile →
      </button>
    </div>
  );
}

// ── CELEBRATION VIEW ──────────────────────────────────────────────────────────
function CelebrationView({ entry, onBack }) {
  const aS = avgScores(entry.start).toFixed(1);
  const aT = avgScores(entry.target).toFixed(1);
  return (
    <div>
      {/* Celebration banner */}
      <div style={S.celebBanner} className="fade-up">
        <div style={S.celebEmoji} className="pop-in">🎉</div>
        <div style={S.celebTitle}>Submitted — nice work, {entry.team}!</div>
        <div style={S.celebSub}>Your IRL profile is saved. Here's what it's telling you.</div>
      </div>

      {/* Radar */}
      <div style={{ marginBottom: "1.25rem" }}>
        <div style={S.secHead}>Your readiness profile</div>
        <div style={S.radarLegend}>
          <span style={S.legendDot("#2471a3")} />Today (avg {aS})
          <span style={{ marginLeft: 16, display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span style={S.legendDash("#1e8449")} />Target (avg {aT})
          </span>
        </div>
        <RadarChart size={280} datasets={[
          { label: "Today", data: DIMS.map((d) => entry.start[d.code]), borderColor: "#2471a3", backgroundColor: "rgba(36,113,163,0.1)", pointBackgroundColor: "#2471a3" },
          { label: "Target", data: DIMS.map((d) => entry.target[d.code]), borderColor: "#1e8449", backgroundColor: "rgba(30,132,73,0.07)", pointBackgroundColor: "#1e8449", borderDash: [5, 3] },
        ]} />
      </div>

      {/* Score grid */}
      <div style={S.scoresGrid}>
        {DIMS.map((d) => (
          <div key={d.code} style={S.scoreCard}>
            <div style={{ fontSize: 10, fontWeight: 700, color: d.dark, marginBottom: 4, letterSpacing: "0.04em" }}>{d.code}</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#1a1a2e" }}>
              {entry.start[d.code]} <span style={{ color: "#ccc", fontWeight: 300 }}>→</span> {entry.target[d.code]}
            </div>
            <div style={{ fontSize: 10, color: "#bbb", marginTop: 2 }}>{d.name}</div>
          </div>
        ))}
      </div>

      {/* Coaching */}
      <div style={S.secHead}>Coaching notes — where to focus now</div>
      {DIMS.map((d) => (
        <div key={d.code} style={{ ...S.coachItem, background: d.light, borderLeftColor: d.color }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: d.dark, letterSpacing: "0.04em" }}>{d.full}</span>
            <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 20, background: d.color + "18", color: d.dark }}>Level {entry.start[d.code]}</span>
          </div>
          <div style={{ fontSize: 12, color: "#444", lineHeight: 1.75 }}>{getCoaching(d.code, entry.start[d.code])}</div>
        </div>
      ))}

      <button style={S.backBtn} onClick={onBack}>← Submit another team</button>
    </div>
  );
}

// ── COHORT VIEW ───────────────────────────────────────────────────────────────
function CohortView({ submissions }) {
  const [revealed, setRevealed] = useState(false);
  const [pw, setPw] = useState(""); const [err, setErr] = useState("");
  const [selectedTeam, setSelectedTeam] = useState(null);
  const count = submissions.length;

  const attempt = () => {
    if (pw === ADMIN_PW) { setRevealed(true); setErr(""); }
    else setErr("Incorrect password.");
  };

  if (selectedTeam) {
    return <TeamCard entry={selectedTeam} onBack={() => setSelectedTeam(null)} />;
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: 8 }}>
        <div style={{ fontSize: 13, color: "#aaa" }}>{count} team{count !== 1 ? "s" : ""} submitted so far</div>
        {!revealed && (
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            <input type="password" style={{ ...S.textInput, maxWidth: 160, padding: "7px 12px", fontSize: 13, marginBottom: 0 }}
              placeholder="Admin password" value={pw}
              onChange={(e) => { setPw(e.target.value); setErr(""); }}
              onKeyDown={(e) => e.key === "Enter" && attempt()} />
            <button style={{ ...S.outBtn, whiteSpace: "nowrap" }} onClick={attempt}>Reveal cohort →</button>
          </div>
        )}
        {err && <div style={{ fontSize: 12, color: "#c0392b", width: "100%" }}>{err}</div>}
      </div>

      {!revealed ? (
        <div style={S.locked}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>🔒</div>
          <div style={{ fontSize: 15, color: "#888", fontWeight: 500 }}>Cohort view is coach-controlled</div>
          <div style={{ fontSize: 12, color: "#bbb", marginTop: 6, lineHeight: 1.6 }}>Enter the admin password above when you are ready to reveal results to the cohort.</div>
        </div>
      ) : (
        <>
          {/* Cohort radar */}
          <div style={S.secHead}>Cohort average — start vs target ({count} teams)</div>
          <div style={S.radarLegend}>
            <span style={S.legendDot("#2471a3")} />Cohort start avg
            <span style={{ marginLeft: 16, display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={S.legendDash("#1e8449")} />Cohort target avg
            </span>
          </div>
          <RadarChart size={300} datasets={[
            { label: "Cohort start avg", data: DIMS.map((d) => { const v = submissions.map((s) => s.start[d.code]); return v.reduce((a, b) => a + b, 0) / v.length; }), borderColor: "#2471a3", backgroundColor: "rgba(36,113,163,0.1)", pointBackgroundColor: "#2471a3" },
            { label: "Cohort target avg", data: DIMS.map((d) => { const v = submissions.map((s) => s.target[d.code]); return v.reduce((a, b) => a + b, 0) / v.length; }), borderColor: "#1e8449", backgroundColor: "rgba(30,132,73,0.07)", pointBackgroundColor: "#1e8449", borderDash: [5, 3] },
          ]} />

          {/* Team list */}
          <div style={{ ...S.secHead, marginTop: "1.5rem" }}>All teams — click for detail</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[...submissions].sort((a, b) => avgScores(b.start) - avgScores(a.start)).map((s, i) => (
              <div key={s.team} style={{ ...S.teamRowLb, cursor: "pointer" }} onClick={() => setSelectedTeam(s)}>
                <div style={{ fontSize: 12, color: "#ccc", width: 20 }}>{i + 1}</div>
                <div style={S.teamAvi}>{getInitials(s.team)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a2e" }}>{s.team}</div>
                  {s.idea && <div style={{ fontSize: 11, color: "#aaa", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 280 }}>{s.idea}</div>}
                </div>
                <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 18 }}>
                  {DIMS.map((d) => <div key={d.code} style={{ width: 9, borderRadius: "2px 2px 0 0", height: Math.round((s.start[d.code] / 9) * 18), background: d.color }} />)}
                </div>
                <div style={{ fontSize: 12, color: "#aaa", minWidth: 30, textAlign: "right" }}>{avgScores(s.start).toFixed(1)}</div>
                <div style={{ fontSize: 11, color: "#bbb" }}>→</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── TEAM CARD ─────────────────────────────────────────────────────────────────
function TeamCard({ entry, onBack }) {
  const aS = avgScores(entry.start).toFixed(1);
  const aT = avgScores(entry.target).toFixed(1);

  const printCard = () => {
    const w = window.open("", "_blank");
    w.document.write(`
      <html><head><title>${entry.team} — IRL Profile</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 700px; margin: 40px auto; padding: 0 20px; color: #1a1a2e; }
        h1 { font-size: 22px; margin: 0 0 4px; }
        .sub { font-size: 13px; color: #888; margin-bottom: 20px; }
        .idea { background: #f7f8fa; border-left: 3px solid #1a1a2e; padding: 12px 16px; font-size: 13px; line-height: 1.7; margin-bottom: 20px; }
        .grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; margin-bottom: 20px; }
        .cell { border: 1px solid #ececec; border-radius: 8px; padding: 10px; }
        .code { font-size: 10px; font-weight: 700; color: #888; margin-bottom: 4px; }
        .vals { font-size: 15px; font-weight: 600; }
        .coach { margin-bottom: 10px; padding: 10px 14px; border-left: 3px solid #ccc; font-size: 12px; line-height: 1.6; }
        .coach-dim { font-size: 10px; font-weight: 700; margin-bottom: 4px; }
        @media print { body { margin: 20px; } }
      </style></head><body>
      <h1>${entry.team}</h1>
      <div class="sub">IRL Profile · Pathways Pre-Accelerator Spring 2026 · Start avg ${aS} → Target avg ${aT}</div>
      <div class="idea">${entry.idea || "No idea description provided."}</div>
      <div class="grid">${DIMS.map((d) => `<div class="cell"><div class="code">${d.code} — ${d.name}</div><div class="vals">${entry.start[d.code]} → ${entry.target[d.code]}</div></div>`).join("")}</div>
      <h3 style="font-size:14px;margin-bottom:12px;">Coaching notes</h3>
      ${DIMS.map((d) => `<div class="coach"><div class="coach-dim">${d.full} · Level ${entry.start[d.code]}</div>${getCoaching(d.code, entry.start[d.code])}</div>`).join("")}
      <div style="font-size:10px;color:#bbb;margin-top:20px;">KTH IRL™ CC BY-NC-SA 4.0 · Generated by Pathways IRL Tool · ${new Date().toLocaleDateString()}</div>
      <script>window.onload=()=>window.print()</script>
      </body></html>
    `);
    w.document.close();
  };

  return (
    <div className="fade-up">
      <button style={S.backLink} onClick={onBack}>← All teams</button>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "1rem 0 1.25rem", paddingBottom: "1rem", borderBottom: "1px solid #f0f0f0" }}>
        <div style={{ ...S.teamAvi, width: 48, height: 48, fontSize: 16, flexShrink: 0 }}>{getInitials(entry.team)}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#1a1a2e" }}>{entry.team}</div>
          <div style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>Start avg {aS} · Target avg {aT} · Submitted {new Date(entry.timestamp).toLocaleDateString()}</div>
        </div>
        <button style={S.printBtn} onClick={printCard}>⎙ Print / export</button>
      </div>

      {/* Idea */}
      {entry.idea && (
        <div style={S.ideaBox}>
          <div style={S.ideaLabel}>Idea description</div>
          <div style={S.ideaText}>{entry.idea}</div>
        </div>
      )}

      {/* Radar */}
      <div style={S.secHead}>Readiness profile</div>
      <RadarChart size={260} datasets={[
        { label: "Today", data: DIMS.map((d) => entry.start[d.code]), borderColor: "#2471a3", backgroundColor: "rgba(36,113,163,0.1)", pointBackgroundColor: "#2471a3" },
        { label: "Target", data: DIMS.map((d) => entry.target[d.code]), borderColor: "#1e8449", backgroundColor: "rgba(30,132,73,0.07)", pointBackgroundColor: "#1e8449", borderDash: [5, 3] },
      ]} />

      {/* Scores */}
      <div style={{ ...S.scoresGrid, margin: "1.25rem 0" }}>
        {DIMS.map((d) => (
          <div key={d.code} style={{ ...S.scoreCard, borderTop: `3px solid ${d.color}` }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: d.dark, marginBottom: 4 }}>{d.code}</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#1a1a2e" }}>{entry.start[d.code]} <span style={{ color: "#ccc" }}>→</span> {entry.target[d.code]}</div>
            <div style={{ fontSize: 10, color: "#bbb", marginTop: 2 }}>{d.levels[entry.start[d.code] - 1]?.label}</div>
          </div>
        ))}
      </div>

      {/* Coaching */}
      <div style={S.secHead}>Coaching notes</div>
      {DIMS.map((d) => (
        <div key={d.code} style={{ ...S.coachItem, background: d.light, borderLeftColor: d.color }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: d.dark }}>{d.full}</span>
            <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: d.color + "18", color: d.dark }}>Level {entry.start[d.code]}</span>
          </div>
          <div style={{ fontSize: 12, color: "#444", lineHeight: 1.75 }}>{getCoaching(d.code, entry.start[d.code])}</div>
        </div>
      ))}
    </div>
  );
}

// ── ADMIN VIEW ────────────────────────────────────────────────────────────────
function AdminView({ submissions, unlocked, onUnlock, onReset, onExport }) {
  const [pw, setPw] = useState(""); const [err, setErr] = useState("");
  const attempt = () => { if (pw === ADMIN_PW) onUnlock(); else setErr("Incorrect password."); };

  if (!unlocked) return (
    <div style={S.gate}>
      <div style={{ fontSize: 16, fontWeight: 600, color: "#1a1a2e" }}>Admin access</div>
      <div style={{ fontSize: 13, color: "#aaa" }}>Enter the admin password to continue</div>
      <input type="password" style={{ ...S.textInput, maxWidth: 220 }} placeholder="Password"
        value={pw} onChange={(e) => { setPw(e.target.value); setErr(""); }} onKeyDown={(e) => e.key === "Enter" && attempt()} />
      <button style={S.submitBtn} onClick={attempt}>Unlock →</button>
      {err && <div style={{ fontSize: 12, color: "#c0392b" }}>{err}</div>}
    </div>
  );

  const count = submissions.length;
  const dimAvgs = DIMS.map((d) => { const v = submissions.map((s) => s.start[d.code]); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0; });
  const overallAvg = count ? (submissions.reduce((a, s) => a + avgScores(s.start), 0) / count).toFixed(1) : "—";
  const lastDate = count ? new Date([...submissions].sort((a,b) => new Date(b.timestamp)-new Date(a.timestamp))[0].timestamp).toLocaleDateString() : "—";

  return (
    <div>
      <div style={S.adminStats}>
        {[["Submitted", count], ["Avg start IRL", overallAvg], ["Last submitted", lastDate]].map(([l, v]) => (
          <div key={l} style={S.statCard}>
            <div style={{ fontSize: 22, fontWeight: 600, color: "#1a1a2e" }}>{v}</div>
            <div style={{ fontSize: 11, color: "#aaa", marginTop: 3 }}>{l}</div>
          </div>
        ))}
      </div>

      <div style={S.secHead}>Cohort average by dimension (start)</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 8, marginBottom: "1.5rem" }}>
        {DIMS.map((d, i) => (
          <div key={d.code} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 10, color: "#aaa", marginBottom: 4 }}>{d.code}</div>
            <div style={{ height: 56, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
              <div style={{ width: "100%", borderRadius: "3px 3px 0 0", minHeight: 2, height: Math.round((dimAvgs[i] / 9) * 54), background: d.color }} />
            </div>
            <div style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>{dimAvgs[i].toFixed(1)}</div>
          </div>
        ))}
      </div>

      <div style={S.secHead}>All submissions</div>
      <div style={{ overflowX: "auto", marginBottom: "1.25rem" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr>{["Team", "Idea (preview)", "Start", "Avg", "Target", "Avg", "Date"].map((h) => (
              <th key={h} style={{ fontSize: 11, color: "#aaa", fontWeight: 400, padding: "7px 6px", borderBottom: "1px solid #f0f0f0", textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {submissions.length === 0
              ? <tr><td colSpan={7} style={{ color: "#bbb", textAlign: "center", padding: "2rem" }}>No submissions yet</td></tr>
              : [...submissions].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).map((s) => (
                <tr key={s.team}>
                  <td style={{ padding: "7px 6px", borderBottom: "1px solid #f8f8f8", fontWeight: 600, color: "#1a1a2e", whiteSpace: "nowrap" }}>{s.team}</td>
                  <td style={{ padding: "7px 6px", borderBottom: "1px solid #f8f8f8", color: "#888", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {s.idea ? s.idea.slice(0, 60) + (s.idea.length > 60 ? "…" : "") : "—"}
                  </td>
                  <td style={{ padding: "7px 6px", borderBottom: "1px solid #f8f8f8" }}>
                    <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 14 }}>
                      {DIMS.map((d) => <div key={d.code} style={{ width: 7, borderRadius: "1px 1px 0 0", height: Math.round((s.start[d.code] / 9) * 12), background: d.color }} />)}
                    </div>
                  </td>
                  <td style={{ padding: "7px 6px", borderBottom: "1px solid #f8f8f8", color: "#555", whiteSpace: "nowrap" }}>{avgScores(s.start).toFixed(1)}</td>
                  <td style={{ padding: "7px 6px", borderBottom: "1px solid #f8f8f8" }}>
                    <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 14 }}>
                      {DIMS.map((d) => <div key={d.code} style={{ width: 7, borderRadius: "1px 1px 0 0", height: Math.round((s.target[d.code] / 9) * 12), background: d.color, opacity: 0.5 }} />)}
                    </div>
                  </td>
                  <td style={{ padding: "7px 6px", borderBottom: "1px solid #f8f8f8", color: "#555", whiteSpace: "nowrap" }}>{avgScores(s.target).toFixed(1)}</td>
                  <td style={{ padding: "7px 6px", borderBottom: "1px solid #f8f8f8", color: "#bbb", fontSize: 11, whiteSpace: "nowrap" }}>{new Date(s.timestamp).toLocaleDateString()}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button style={S.outBtn} onClick={onExport}>⬇ Export CSV</button>
        <button style={{ ...S.outBtn, color: "#c0392b", borderColor: "#f1948a" }} onClick={onReset}>✕ Clear all data</button>
      </div>
    </div>
  );
}

// ── STYLES ────────────────────────────────────────────────────────────────────
const S = {
  app: { fontFamily: "'DM Sans',sans-serif", minHeight: "100vh", background: "#f7f8fa", color: "#1a1a2e", display: "flex", flexDirection: "column" },
  header: { padding: "14px 24px", background: "#fff", borderBottom: "1px solid #ececec", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 },
  logo: { display: "flex", alignItems: "baseline", gap: 6 },
  logoKth: { fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 18, color: "#1a1a2e", letterSpacing: "0.05em" },
  logoDivider: { fontSize: 14, color: "#ddd" },
  logoSub: { fontSize: 12, color: "#aaa" },
  nav: { display: "flex", gap: 3, background: "#f4f4f4", borderRadius: 10, padding: 3 },
  navBtn: { padding: "6px 14px", border: "none", background: "transparent", borderRadius: 7, fontSize: 13, color: "#999", transition: "all 0.15s" },
  navActive: { background: "#fff", color: "#1a1a2e", fontWeight: 500, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" },
  main: { flex: 1, maxWidth: 740, width: "100%", margin: "0 auto", padding: "28px 20px" },

  // Form
  stepHeader: { display: "flex", alignItems: "flex-start", gap: 14, marginBottom: "1.5rem" },
  stepNum: { width: 32, height: 32, borderRadius: "50%", background: "#1a1a2e", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, flexShrink: 0, marginTop: 2 },
  stepTitle: { fontSize: 17, fontWeight: 600, color: "#1a1a2e", marginBottom: 3 },
  stepSub: { fontSize: 13, color: "#aaa", lineHeight: 1.5 },
  backLink: { fontSize: 13, color: "#aaa", background: "none", border: "none", padding: 0, cursor: "pointer", marginLeft: "auto", alignSelf: "center" },

  field: { marginBottom: "1.25rem" },
  fieldLabel: { display: "block", fontSize: 11, color: "#aaa", marginBottom: 6, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" },
  fieldHint: { fontSize: 12, color: "#bbb", marginBottom: 8, lineHeight: 1.6 },
  textInput: { width: "100%", padding: "10px 14px", border: "1px solid #e5e5e5", borderRadius: 10, fontSize: 15, outline: "none", background: "#fff", color: "#1a1a2e" },
  textArea: { width: "100%", padding: "10px 14px", border: "1px solid #e5e5e5", borderRadius: 10, fontSize: 14, outline: "none", background: "#fff", color: "#1a1a2e", lineHeight: 1.65 },
  charCount: { fontSize: 11, textAlign: "right", marginTop: 4 },
  warnPill: { fontSize: 12, color: "#d35400", background: "#fef3e8", border: "1px solid #f0c080", borderRadius: 8, padding: "8px 12px", marginBottom: 12 },

  progressWrap: { marginBottom: "1rem" },
  progressTrack: { background: "#ececec", borderRadius: 4, height: 5, overflow: "hidden", marginBottom: 5 },
  progressFill: { height: "100%", background: "#1a1a2e", borderRadius: 4, transition: "width 0.4s ease" },
  progressLabel: { fontSize: 11, color: "#bbb" },

  modeBar: { display: "flex", gap: 6, alignItems: "center", marginBottom: "1rem", flexWrap: "wrap" },
  modeLabel: { fontSize: 12, color: "#bbb" },
  modeBtn: { padding: "5px 14px", border: "1px solid #e5e5e5", borderRadius: 20, fontSize: 12, background: "#fff", color: "#aaa", transition: "all 0.15s" },
  modeBtnActive: { fontWeight: 500 },

  dimTabs: { display: "flex", gap: 4, marginBottom: 0, flexWrap: "wrap" },
  dimTab: { padding: "6px 12px", border: "1px solid #e5e5e5", borderBottom: "none", borderRadius: "8px 8px 0 0", fontSize: 12, background: "#f4f4f4", color: "#aaa", transition: "all 0.15s", display: "flex", alignItems: "center", gap: 6, position: "relative", bottom: -1 },
  dimTabActive: { background: "#fff", fontWeight: 500, zIndex: 1 },
  dimDot: { width: 6, height: 6, borderRadius: "50%", display: "inline-block" },

  dimPanel: { border: "1px solid #e5e5e5", borderRadius: "0 8px 8px 8px", background: "#fff", padding: "18px", marginBottom: "1rem" },
  dimPanelHead: { display: "flex", alignItems: "flex-start", gap: 10, paddingBottom: 12, marginBottom: 14 },
  dimPanelBadge: { padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 700, flexShrink: 0, marginTop: 2 },
  dimPanelTitle: { fontSize: 15, fontWeight: 600, color: "#1a1a2e", marginBottom: 2 },
  dimPanelWhat: { fontSize: 12, color: "#888", lineHeight: 1.6, fontStyle: "italic" },

  levelDisplay: { display: "flex", alignItems: "baseline", gap: 10, marginBottom: 10 },
  levelNumber: { fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, lineHeight: 1 },
  levelLabel: { fontSize: 15, fontWeight: 500 },

  sliderWrap: { marginBottom: 14 },
  sliderTicks: { display: "flex", justifyContent: "space-between", marginTop: 5 },
  tick: { fontSize: 11, color: "#ccc", width: "11.1%", textAlign: "center" },

  descCard: { borderRadius: "0 8px 8px 8px", padding: "12px 14px", marginBottom: 16 },

  levelsGlance: { marginBottom: 16 },
  glanceTitle: { fontSize: 10, color: "#bbb", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 },
  glanceGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 5 },
  glanceItem: { padding: "7px 9px", border: "1px solid #f0f0f0", borderRadius: 7, cursor: "pointer", transition: "all 0.12s", background: "#fafafa" },
  glanceNum: { fontSize: 12, fontWeight: 700, marginBottom: 1 },
  glanceLbl: { fontSize: 10, lineHeight: 1.3 },

  dimFooter: { display: "flex", alignItems: "center", gap: 14, paddingTop: 12, borderTop: "1px solid #f5f5f5" },
  dimFooterItem: { display: "flex", flexDirection: "column", alignItems: "center", gap: 2 },
  dimFooterLbl: { fontSize: 10, color: "#bbb", textTransform: "uppercase", letterSpacing: "0.05em" },
  dimFooterVal: { fontSize: 20, fontWeight: 700, fontFamily: "'Syne',sans-serif" },
  nextBtn: { padding: "7px 14px", border: "1px solid", borderRadius: 20, fontSize: 12, fontWeight: 500, transition: "all 0.15s" },

  summaryStrip: { display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 5, marginBottom: "1rem", background: "#fff", border: "1px solid #ececec", borderRadius: 10, padding: "10px 12px" },
  summaryDim: { textAlign: "center" },
  summaryCode: { fontSize: 10, fontWeight: 700, letterSpacing: "0.04em", marginBottom: 3 },
  summaryVals: { fontSize: 11, display: "flex", gap: 2, justifyContent: "center", alignItems: "center" },

  notDoneHint: { fontSize: 12, color: "#e67e22", background: "#fef9e7", border: "1px solid #f9ca8a", borderRadius: 8, padding: "8px 12px", marginBottom: 10, lineHeight: 1.5 },

  submitBtn: { width: "100%", padding: 13, background: "#1a1a2e", color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 500, transition: "opacity 0.15s" },

  // Celebration
  celebBanner: { background: "linear-gradient(135deg, #1a1a2e 0%, #2471a3 100%)", borderRadius: 16, padding: "28px 24px", marginBottom: "1.5rem", textAlign: "center" },
  celebEmoji: { fontSize: 44, marginBottom: 10, display: "block" },
  celebTitle: { fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 6, fontFamily: "'Syne',sans-serif" },
  celebSub: { fontSize: 13, color: "rgba(255,255,255,0.7)" },

  radarLegend: { display: "flex", alignItems: "center", fontSize: 12, color: "#888", marginBottom: 8, gap: 6 },
  legendDot: (c) => ({ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: c, marginRight: 4 }),
  legendDash: (c) => ({ display: "inline-block", width: 18, height: 2, background: c, borderRadius: 1, marginRight: 4 }),

  scoresGrid: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 },
  scoreCard: { background: "#f8f9fa", borderRadius: 10, padding: "10px 12px" },

  secHead: { fontSize: 13, fontWeight: 600, color: "#1a1a2e", marginBottom: 12, paddingBottom: 8, borderBottom: "1px solid #f0f0f0" },
  coachItem: { borderLeft: "3px solid", borderRadius: "0 8px 8px 0", padding: "12px 14px", marginBottom: 8 },

  backBtn: { width: "100%", marginTop: "1rem", padding: 11, border: "1px solid #e5e5e5", borderRadius: 12, background: "transparent", fontSize: 13, color: "#aaa" },

  // Team card
  teamAvi: { width: 36, height: 36, borderRadius: "50%", background: "#d6eaf8", color: "#1a5276", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 },
  printBtn: { padding: "7px 14px", border: "1px solid #e5e5e5", borderRadius: 8, background: "#fff", fontSize: 12, color: "#555", cursor: "pointer", whiteSpace: "nowrap" },
  ideaBox: { background: "#f7f8fa", border: "1px solid #ececec", borderLeft: "3px solid #1a1a2e", borderRadius: "0 8px 8px 0", padding: "14px 16px", marginBottom: "1.25rem" },
  ideaLabel: { fontSize: 10, fontWeight: 700, color: "#aaa", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 },
  ideaText: { fontSize: 13, color: "#444", lineHeight: 1.75 },

  // Cohort / admin
  teamRowLb: { background: "#fff", border: "1px solid #ececec", borderRadius: 10, padding: "9px 14px", display: "flex", alignItems: "center", gap: 10 },
  locked: { textAlign: "center", padding: "3rem 1rem", border: "1.5px dashed #e5e5e5", borderRadius: 16 },

  adminStats: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: "1.5rem" },
  statCard: { background: "#fff", border: "1px solid #ececec", borderRadius: 12, padding: "14px 16px" },

  gate: { display: "flex", flexDirection: "column", alignItems: "center", padding: "3rem 1rem", gap: 12, maxWidth: 320, margin: "0 auto" },
  outBtn: { padding: "9px 16px", border: "1px solid #e5e5e5", borderRadius: 10, background: "transparent", fontSize: 13, color: "#666" },

  // GDPR
  gdprOverlay: { position: "fixed", inset: 0, background: "rgba(10,14,30,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 },
  gdprModal: { background: "#fff", borderRadius: 16, maxWidth: 580, width: "100%", maxHeight: "92vh", overflowY: "auto", padding: "26px 26px 22px" },
  gdprHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 },
  gdprBadge: { fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "#1a5276", background: "#d6eaf8", padding: "3px 10px", borderRadius: 20 },
  gdprTitle: { fontSize: 20, fontWeight: 700, color: "#1a1a2e", marginBottom: 3, fontFamily: "'Syne',sans-serif" },
  gdprProgramme: { fontSize: 13, color: "#888", marginBottom: 18, fontStyle: "italic" },
  gdprSummary: { display: "flex", flexDirection: "column", gap: 12, marginBottom: 14 },
  gdprRow: { display: "flex", gap: 10, alignItems: "flex-start" },
  gdprIcon: { fontSize: 16, flexShrink: 0, marginTop: 1 },
  gdprRowTitle: { fontSize: 11, fontWeight: 700, color: "#1a1a2e", marginBottom: 2, letterSpacing: "0.02em" },
  gdprRowBody: { fontSize: 12, color: "#555", lineHeight: 1.65 },
  gdprExpandBtn: { width: "100%", padding: "9px 12px", border: "1px solid #e5e5e5", borderRadius: 8, background: "#f8f9fa", fontSize: 12, color: "#666", fontWeight: 500, textAlign: "left", marginBottom: 2 },
  gdprRights: { background: "#f8f9fa", border: "1px solid #e5e5e5", borderTop: "none", borderRadius: "0 0 8px 8px", padding: "12px 14px", marginBottom: 4 },
  gdprCheckRow: { display: "flex", gap: 12, alignItems: "flex-start", margin: "16px 0 12px", cursor: "pointer" },

  // Footer
  privacyFooter: { borderTop: "1px solid #ececec", padding: "10px 20px", textAlign: "center", background: "#fff" },
  privacyFooterText: { fontSize: 11, color: "#bbb" },
  privacyLink: { fontSize: 11, color: "#2471a3", background: "none", border: "none", padding: 0, textDecoration: "underline", cursor: "pointer" },
};
