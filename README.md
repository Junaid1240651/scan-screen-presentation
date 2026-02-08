# Scan Screen – Improvement Plan (Presentation)

A slide deck for the **Scan Screen** feature: current flow (desktop → backend → agent), gaps and pain points, competitor research, and the improvement plan from [SCAN_SCREEN_IMPROVEMENT_PLAN.md](../SCAN_SCREEN_IMPROVEMENT_PLAN.md).

UI and structure match [thread-notification-presentation](../thread-notification-presentation) (URL Safety deck).

## Run locally

```bash
npm install
npm run dev
```

Then open the URL shown (e.g. http://localhost:5173). Use **Previous** / **Next** or arrow keys; slides are also reachable via `#slide-1`, `#slide-2`, etc.

## Build

```bash
npm run build
npm run preview
```

## Slides (9 total)

1. **Title** – Scan Screen Feature – Improvement Plan  
2. **Current flow – Desktop** – Entry points and steps (Screen Scan, tray, Scan URL; IPC, ScanService, ApiClient)  
3. **Current flow – Backend & Agent** – ScreenshotAnalysisService, Orchestrator (content extraction, website scanner, link checker, DNS, screenshot verification)  
4. **End-to-end sequence** – Flow diagram (User → Desktop → Backend → Agent → result)  
5. **Gaps and pain points** – Latency/UX, cost, consistency with URL safety, reliability, privacy  
6. **Competitor research** – PhishSnap, PhishTank, patterns table  
7. **Improvement plan** – Phase 1 (UX) → Phase 2 (URL-safety reuse) → Phase 3 (caching) → Phase 4 (reliability) → Phase 5 (privacy)  
8. **Success metrics & next steps** – Target metrics and order of work  
9. **Sources & references** – SCAN_SCREEN_IMPROVEMENT_PLAN.md, URL_SAFETY plan, repos  

## Related

- **SCAN_SCREEN_IMPROVEMENT_PLAN.md** (repo root) – Full improvement plan  
- **URL_SAFETY_SYSTEM_IMPROVEMENT_PLAN.md** – URL monitoring; allowlist/blocklist used in Phase 2 of scan screen plan  
- **thread-notification-presentation** – URL Safety presentation (same UI)
