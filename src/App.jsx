import { useState, useEffect } from "react";

const SLIDE_COUNT = 9;

const ICON = {
  flow: "🔄",
  cons: "⚠️",
  plan: "🛡️",
  sources: "📁",
  phases: "📋",
  metrics: "📊",
  links: "🔗",
  screen: "🖼️",
};

function useHashSlide() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const hash = window.location.hash;
    const match = hash.match(/^#slide-(\d+)$/);
    if (match) {
      const i = parseInt(match[1], 10) - 1;
      if (i >= 0 && i < SLIDE_COUNT) setIndex(i);
    }
  }, []);

  useEffect(() => {
    const handler = () => {
      const hash = window.location.hash;
      const match = hash.match(/^#slide-(\d+)$/);
      if (match) {
        const i = parseInt(match[1], 10) - 1;
        if (i >= 0 && i < SLIDE_COUNT) setIndex(i);
      }
    };
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  const goTo = (i) => {
    const next = Math.max(0, Math.min(i, SLIDE_COUNT - 1));
    setIndex(next);
    window.location.hash = `slide-${next + 1}`;
  };

  return [index, goTo];
}

function ScanScreenFlowDiagram() {
  return (
    <div className="flow-diagram">
      <div className="flow-row">
        <span className="box">User [Scan Screen]</span>
        <span className="arrow">→</span>
        <span className="box">Desktop: captureScreenshot()</span>
        <span className="arrow">→</span>
        <span className="box">IPC: compress → scanService.evaluate()</span>
      </div>
      <div className="flow-row">
        <span className="box">ApiClient: POST /screenshot-analysis/analyze</span>
        <span className="arrow">→</span>
        <span className="box">Backend: subscription check → callScreenshotAgent()</span>
        <span className="arrow">→</span>
        <span className="box">Agent: POST /analyze</span>
      </div>
      <div className="flow-row">
        <span className="box">Orchestrator: Content extraction</span>
        <span className="arrow">→</span>
        <span className="box">(parallel) Website scanner, Link checker, DNS verification, Screenshot verification</span>
      </div>
      <div className="flow-row">
        <span className="box">Backend: transform → saveScreenshotHistory()</span>
        <span className="arrow">→</span>
        <span className="box">Desktop: ResultCard + history</span>
      </div>
      <div className="flow-row flow-row-hint">
        Latency: typically 15–60s (capture + compress + network + multi-agent + LLM/vision).
      </div>
    </div>
  );
}

const slides = [
  {
    title: "Scan Screen Feature – Improvement Plan",
    type: "title",
    content: (
      <div className="slide-title-only">
        <h1>Scan Screen Feature – Improvement Plan</h1>
        <p className="subtitle">Current flow, gaps, competitors, and roadmap</p>
        <p className="intro">
          User captures a screenshot → desktop sends it to backend → agent analyzes it (content extraction, website scan, DNS, screenshot verification) and returns a verdict. This deck summarizes the current flow, pain points, competitor approaches, and the improvement plan from SCAN_SCREEN_IMPROVEMENT_PLAN.md.
        </p>
      </div>
    ),
  },
  {
    title: "Current flow – Desktop (entry points and steps)",
    icon: ICON.flow,
    content: (
      <div className="space-y-6">
        <div className="card-section card-section-flow">
          <h3>Desktop (spam-site-desktop) – who does what</h3>
          <div className="card-inner card-inner-flow">
            <h4>Entry points</h4>
            <ul className="text-sm">
              <li><strong>Screen Scan screen:</strong> User clicks “Scan Screen” → capture screenshot → auto-trigger scan with screenshot only.</li>
              <li><strong>Tray:</strong> User captures screenshot from tray → same scan with screenshot.</li>
              <li><strong>Scan URL screen:</strong> User can paste URL and optionally attach a screenshot; scan runs with URL and/or screenshot.</li>
            </ul>
          </div>
          <div className="card-inner card-inner-flow">
            <h4>Flow (screenshot-only)</h4>
            <ul className="text-sm">
              <li>User clicks “Scan Screen” → <code>captureScreenshot()</code> → data URL.</li>
              <li><code>useScanUrl()</code> → <code>window.desktopAPI.scanUrl(&#123; notes, screenshotDataUrl &#125;)</code>.</li>
              <li>IPC: compress screenshot (~50 KB) → <code>scanService.evaluate(request)</code>.</li>
              <li>ScanService: screenshot path → <code>apiClient.uploadScreenshot(base64, mimeType, notes)</code> → POST <strong>/screenshot-analysis/analyze</strong> (auth, 90s timeout).</li>
              <li>Result normalized to score, verdict (safe/warning/scam), reasoning → ResultCard + history.</li>
            </ul>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Current flow – Backend & Agent",
    icon: ICON.flow,
    content: (
      <div className="space-y-6">
        <div className="card-section card-section-flow">
          <h3>Backend (spam-site-backend)</h3>
          <div className="card-inner text-sm">
            <strong>ScreenshotAnalysisService.analyzeScreenshotBase64():</strong> Check active subscription (monthly plan) → clean base64, detect MIME → <strong>callScreenshotAgent()</strong> → POST agentUrl/analyze with image (60s timeout, optional Google ID token). Transform agent response (safetyScore, verdict, verification_report, website_scan_results) → saveScreenshotHistory() (optional S3 upload) → return result.
          </div>
        </div>
        <div className="card-section card-section-flow">
          <h3>Agent (spam-site-agent)</h3>
          <div className="card-inner text-sm">
            <strong>POST /analyze</strong> → ScreenshotVerificationApp.processScreenshot() → OrchestratorAgent.runLegacy(). <strong>Orchestrator:</strong> (1) Content extraction (URLs, domains, emails from screenshot via vision/OCR). (2) Parallel: Website scanner (DNS, SSL, trust, patterns), <strong>Link checker (fetches HTML from extracted URLs, extracts all links from that HTML, checks each link for safety)</strong>, DNS verification (SPF/DKIM/DMARC), Screenshot verification (email vs webpage, legitimacy, suspicious indicators). (3) Combined result: combinedAnalysis, simplifiedSummary, safetyScore (0–100), verificationReport, websiteScanResults, linkCheckerReports. <strong>HTML content is extracted in the Link checker step:</strong> after URLs are obtained from the screenshot, we fetch the HTML from each URL and parse it to get all links, then check those links. <strong>Improvement (consider now):</strong> When the screenshot is from a browser, we could obtain the page HTML (e.g. from the browser/DOM) and analyze it as well.
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "End-to-end sequence (scan screen, screenshot only)",
    icon: ICON.screen,
    content: (
      <div className="card-section card-section-flow">
        <h3>Full pipeline</h3>
        <ScanScreenFlowDiagram />
      </div>
    ),
  },
  {
    title: "Gaps and pain points",
    icon: ICON.cons,
    content: (
      <div className="space-y-6">
        <div className="card-section card-section-cons">
          <h3>{ICON.cons} What’s wrong today</h3>
          <ul className="slide-points">
            <li><strong>Latency & UX:</strong> 15–60s with no staged progress (“Analyzing image…”, “Checking URLs…”); users may think the app froze. Single timeout; no retry or partial result.</li>
            <li><strong>Cost & efficiency:</strong> Full pipeline every time; no cache or dedup for same/similar screenshot (subscription is monthly, not per-scan).</li>
            <li><strong>Consistency with URL safety:</strong> Extracted URLs are not checked against the same allowlist/blocklist as batch URL safety (when that exists); risk of different verdicts for the same URL in “scan screen” vs “URL monitoring”.</li>
            <li><strong>Reliability:</strong> Single agent call; if screenshot agent is down or slow, whole scan fails; no fallback (e.g. “Scan as URL” or cached result). Limited metrics for scan-screen latency and success rate.</li>
            <li><strong>Privacy:</strong> Full image sent to cloud; no on-device pre-check or optional “minimal send” (e.g. only extracted URLs) for privacy-sensitive users.</li>
            <li><strong>Browser HTML:</strong> When the screen is from a browser, we do not use the page HTML (e.g. page source/DOM); we only get HTML by fetching from extracted URLs in the Link checker. We could get the HTML from the browser and analyze it as well — consider now.</li>
            <li><strong>Partial result streaming:</strong> We return one final response; no streaming of intermediate results (e.g. extracted URLs, link check) so users see nothing until the end and get no partial result on timeout.</li>
            <li><strong>Cancel in-flight scan:</strong> User cannot cancel an ongoing screenshot analysis; request runs to completion or 90s timeout. ApiClient uses AbortController only for timeout, not for user-triggered abort.</li>
          </ul>
          <table className="storage-table mt-4">
            <thead><tr><th>Area</th><th>Issue</th></tr></thead>
            <tbody>
              <tr><td>UX</td><td>Long wait, no progress stages</td></tr>
              <tr><td>Cost</td><td>Full pipeline every time; no cache</td></tr>
              <tr><td>Consistency</td><td>Scan screen doesn’t use URL-safety blocklist/allowlist</td></tr>
              <tr><td>Reliability</td><td>Single agent; no fallback</td></tr>
              <tr><td>Browser HTML</td><td>Don't use page HTML when screen is from browser</td></tr>
              <tr><td>Empty extraction</td><td>No "no links in image" messaging</td></tr>
              <tr><td>Retry / rate limit</td><td>No backend retry on agent failure; no rate limit on analyze</td></tr>
              <tr><td>Partial result streaming</td><td>Single final response; nothing until end</td></tr>
              <tr><td>Cancel in-flight scan</td><td>No way to cancel; runs to completion or 90s timeout</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    ),
  },
  {
    title: "Competitor research (screenshot-based phishing detection)",
    icon: ICON.sources,
    content: (
      <div className="space-y-6">
        <div className="card-section card-section-sources">
          <h3>How others do it</h3>
          <ul className="slide-points text-sm">
            <li><strong>PhishSnap:</strong> Browser extension; on-device perceptual hashing (pHash); low latency, privacy-preserving; accuracy ~0.79.</li>
            <li><strong>PhishTank (multimodal):</strong> REST API; upload screenshot (base64); 5 hash algorithms + deep learning + OCR + semantic analysis; ~95% variant detection; cloud-based.</li>
            <li><strong>PhiShark, urlscan Pro, Filestack:</strong> API-based phishing/visual analysis; some use “quick check” then deep scan; some use caching/hashing to avoid re-analysis.</li>
          </ul>
          <h3 className="slide-subtitle">Patterns (us vs competitors)</h3>
          <table className="storage-table">
            <thead><tr><th>Aspect</th><th>Our flow</th><th>Common pattern</th></tr></thead>
            <tbody>
              <tr><td>Where analysis runs</td><td>Full pipeline in cloud</td><td>Mix: on-device (PhishSnap), cloud API (PhishTank)</td></tr>
              <tr><td>First step</td><td>Content extraction + full orchestration</td><td>Fast hash or lightweight classifier first; deep analysis when needed</td></tr>
              <tr><td>Latency</td><td>15–60s</td><td>On-device: ms; cloud: often “quick check” then deep</td></tr>
              <tr><td>Cost</td><td>Full LLM every time (monthly subscription)</td><td>Caching/hashing to avoid re-analysis</td></tr>
            </tbody>
          </table>
          <div className="card-inner text-sm mt-2">
            <strong>Takeaways:</strong> (1) Fast path: quick on-device or lightweight cloud check before full pipeline. (2) Reuse URL safety: run extracted URLs through same allowlist/blocklist as batch URL safety. (3) Caching/dedup: return cached result for same/similar screenshot. (4) Staged UX: “Quick check…” then “Deep analysis…” so users see progress.
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Improvement plan (Phase 1–5)",
    icon: ICON.plan,
    content: (
      <div className="space-y-6">
        <div className="card-section card-section-plan">
          <h3>{ICON.phases} Phases (from SCAN_SCREEN_IMPROVEMENT_PLAN.md)</h3>
          <ul className="slide-points text-sm">
            <li><strong>Phase 1 – UX (short term):</strong> Staged progress in UI (“Uploading…”, “Analyzing screenshot…”, “Checking links…”). Clear timeout/error message after ~30s and retry on failure. History: “View details” and optional “Re-analyze”. <strong>Consider now:</strong> When the screenshot is from a browser, get the HTML content (page source/DOM) and send it for analysis as well. <strong>Partial result streaming:</strong> stream intermediate results (extracted URLs, link check, then verdict) for progress and timeout fallback. <strong>Cancel:</strong> user can cancel in-flight analysis (AbortSignal for user-triggered abort).</li>
            <li><strong>Phase 2 – Consistency (medium term):</strong> When URL-safety allowlist/blocklist exists, run extracted URLs from screenshot through the same check in the agent. Same URL → same verdict in “scan screen” and “URL monitoring”.</li>
            <li><strong>Phase 3 – Fast path & caching (medium term):</strong> Optional perceptual hash + cache (return cached result for same/similar screenshot); optional “quick check” before full pipeline.</li>
            <li><strong>Phase 4 – Reliability (ongoing):</strong> Fallback on agent timeout/5xx (clear error + “Try again” or “Scan as URL”). Metrics: latency, success rate, scan type. Health checks.</li>
            <li><strong>Phase 5 – Privacy (longer term):</strong> Optional on-device extraction (send only extracted URLs/text); “Analyze only links (no image)” and transparency in UI.</li>
          </ul>
          <div className="text-sm mt-2">
            <strong>Order:</strong> Phase 1 first → Phase 2 after URL-safety allowlist/blocklist → Phase 3–4 in parallel → Phase 5 when product prioritizes it.
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Success metrics & next steps",
    icon: ICON.metrics,
    content: (
      <div className="space-y-6">
        <div className="card-section card-section-metrics">
          <h3>Target metrics</h3>
          <table className="storage-table">
            <thead><tr><th>Metric</th><th>Current</th><th>Target</th></tr></thead>
            <tbody>
              <tr><td>Scan-screen latency (p95)</td><td>~30–60s</td><td>&lt;25s full path; &lt;5s when cache hit or fast path</td></tr>
              <tr><td>User-visible progress</td><td>Single “loading”</td><td>2–3 clear stages</td></tr>
              <tr><td>Consistency with URL safety</td><td>Extracted URLs not checked vs blocklist/allowlist</td><td>Same URL same verdict in scan screen and batch</td></tr>
              <tr><td>Efficiency</td><td>Full pipeline every scan</td><td>Optional cache hit for same/similar screenshot</td></tr>
              <tr><td>Error handling</td><td>Generic timeout/error</td><td>Clear message + retry; optional “Scan as URL”</td></tr>
            <tr><td>Observability</td><td>Ad hoc</td><td>Latency, success rate, scan type</td></tr>
              <tr><td>Cancel in-flight scan</td><td>No way to cancel; runs to completion or 90s timeout</td><td>User can cancel; ApiClient uses AbortSignal for user-triggered abort</td></tr>
            </tbody>
          </table>
          <h3 className="slide-subtitle">Also in plan (gaps / future)</h3>
          <ul className="slide-points text-sm">
            <li><strong>Empty extraction:</strong> When no URLs in image, show "No links in image — analysis based on visual only."</li>
            <li><strong>Backend:</strong> Retry on agent 5xx/timeout; consider rate limit on analyze.</li>
            <li><strong>Partial result streaming:</strong> Stream intermediate results (extracted URLs, link check, then verdict) for progress and timeout fallback.</li>
            <li><strong>Cancel in-flight scan:</strong> User can cancel ongoing analysis; ApiClient uses AbortSignal for user-triggered abort.</li>
            <li><strong>Future research:</strong> CAPTCHA-cloaking, adversarial evasion; accessibility; confidence; offline / history.</li>
          </ul>
          <h3 className="slide-subtitle">Next steps</h3>
          <ul className="slide-points text-sm">
            <li>Review and approve SCAN_SCREEN_IMPROVEMENT_PLAN.md → assign resources.</li>
            <li>Phase 1: Desktop staged progress + timeout/retry copy (1–2 days).</li>
            <li>Phase 2: After URL-safety allowlist/blocklist exists, integrate into screenshot pipeline (3–5 days).</li>
            <li>Phase 3–4: Caching + metrics + fallback when prioritized.</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    title: "Sources & references",
    icon: ICON.links,
    content: (
      <div className="card-section card-section-sources">
        <h3>{ICON.links} Documentation and repos</h3>
        <p className="text-sm mb-2" style={{ opacity: 0.9 }}>
          The full improvement plan (current flow, gaps, competitors, phases, and metrics) is in the repo. Our code lives in three GitHub repos.
        </p>
        <ul className="sources-list">
          <li>Plan document: <strong>SCAN_SCREEN_IMPROVEMENT_PLAN.md</strong> (repo root)</li>
          <li>Related: <strong>URL_SAFETY_SYSTEM_IMPROVEMENT_PLAN.md</strong> (URL monitoring / batch scan; allowlist/blocklist used in Phase 2)</li>
          <li>GitHub repos: <strong>spam-site-desktop</strong>, <strong>spam-site-backend</strong>, <strong>spam-site-agent</strong></li>
        </ul>
      </div>
    ),
  },
];

function App() {
  const [index, goTo] = useHashSlide();

  useEffect(() => {
    if (!window.location.hash || !/^#slide-\d+$/.test(window.location.hash)) {
      window.location.hash = `slide-${index + 1}`;
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") goTo(index - 1);
      if (e.key === "ArrowRight") goTo(index + 1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [index, goTo]);

  const slide = slides[index];
  const isTitleSlide = slide.type === "title";

  return (
    <div className="pres-container">
      <header className="pres-header">
        <div className="pres-header-left">
          <button
            type="button"
            className="pres-nav-btn"
            onClick={() => goTo(index - 1)}
            disabled={index === 0}
            aria-label="Previous slide"
          >
            ← Previous
          </button>
        </div>
        <div className="pres-header-center">
          <span className="pres-header-count">
            {index + 1} / {SLIDE_COUNT}
          </span>
          <span className="pres-header-slide-title" title={slide.title}>
            {slide.title}
          </span>
          <div className="pres-dots pres-dots-below-title" role="tablist" aria-label="Slide index">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Slide ${i + 1}`}
                className={i === index ? "active" : ""}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
        </div>
        <nav className="pres-header-right" aria-label="Slide navigation">
          <button
            type="button"
            className="pres-nav-btn btn-next"
            onClick={() => goTo(index + 1)}
            disabled={index === SLIDE_COUNT - 1}
            aria-label="Next slide"
          >
            Next →
          </button>
        </nav>
      </header>

      <main
        className="pres-main"
        role="main"
        aria-label={`Slide ${index + 1} of ${SLIDE_COUNT}`}
      >
        <div className="pres-card">
          {!isTitleSlide && (
            <h2 className="slide-title">
              <span className="slide-title-icon" aria-hidden="true">
                {slide.icon}
              </span>
              {slide.title}
            </h2>
          )}
          {slide.content}
        </div>
      </main>
    </div>
  );
}

export default App;
