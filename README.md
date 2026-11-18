[README.md](https://github.com/user-attachments/files/35023575/README.md)
# Madiyan Imran — Software Engineer Portfolio (real-world case-study edition)

Seven selected software/AI case studies in a static GitHub Pages site, with responsive UI, dark/light modes, project detail pages, and runnable browser demos. **No build step or framework is required.**

## Selected project pages

1. `projects/task-nest.html` — Task Nest service marketplace
2. `projects/vehicle-tracking.html` — Vehicle & license-plate tracking
3. `projects/sql-optimization.html` — SQL Query Optimization
4. `projects/object-tracking.html` — Multi-frame Object Tracking
5. `projects/traffic-flow.html` — **TrafficFlow: Intelligent Traffic Monitoring** (synthetic vehicle tracking and line counting)
6. `projects/cropguard.html` — **CropGuard: AI Plant Disease Detection** (local leaf-image API-contract simulation)
7. `projects/fieldmanual-ai.html` — **FieldManual AI: Technical Document Search** (fictional manual excerpts, inspectable citations)

The final three have application-specific interactive concept demos. Their simulations **do not run trained models or actual production backends**, and are not evidence of real model accuracy or deployments. The site says this explicitly, while presenting all seven in one Selected Projects section.

## Publishing on GitHub Pages

Upload the *contents* of this folder to the repository root and enable **Settings → Pages → Deploy from a branch → main / (root)**. Test locally with `python3 -m http.server 8000`.

## Configuration

- Edit homepage and cards: `index.html`
- Edit project case studies: `projects/*.html`
- Edit synthetic demos: `assets/ai-demos.js` and `assets/demos.js`
- Colors/layout: `assets/styles.css`, `assets/ai-projects.css`, `assets/project-pages.css`
- Real photo: upload `assets/profile-photo.jpg` and set `profilePhoto: "assets/profile-photo.jpg"` in `assets/config.js`
- Genuine owner GitHub/project repository URLs: `assets/config.js` (empty until supplied)
- Current CV: `assets/Madiyan-Imran-Academic-CV.pdf`

### Private maintainer references

See `LEARNING-RESOURCES.md` for separately verified public GitHub repos and their licenses. These **are not linked in the public portfolio**; use them for learning and reimplementation.

The website works without external services, API keys, model weights, or network requests. The CV/site must be updated as the owner finishes and verifies additional real implementations.

## Academic CV revision (October 2026)

The website's Resume link now downloads the two-page academic CV (`assets/Madiyan-Imran-Academic-CV.pdf`). An editable Word edition is available in `assets/Madiyan-Imran-Academic-CV.docx`. The education wording uses the verified university name without a city/location.

Portfolio project examples use illustrative browser demos; they should not be described as deployed models or source-code evidence of inference.
