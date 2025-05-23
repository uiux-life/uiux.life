# UIUX.life

**Let the CSS renaissance begin!**

[![CI](https://img.shields.io/github/actions/workflow/status/YOUR-ORG/UIUX.life/ci.yml?branch=main)](https://github.com/YOUR-ORG/UIUX.life/actions)
[![Accessibility](https://img.shields.io/badge/accessibility-AAA-blueviolet)](#)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

UIUX.life is a handcrafted, standards-first HTML/CSS/JS reference implementation—no frameworks, no dependencies, no nonsense. It serves as a clean, performant, accessible baseline for modern UI/UX design systems.

## 🌐 Overview

This project embodies a "vanilla-first" philosophy:

* No build tools
* No external dependencies
* Fully semantic HTML5
* CSS-only interactivity wherever possible
* Modern JS used sparingly and purposefully
* Fully accessible (508/WCAG compliant)
* Mobile-first, content-driven design

## 📁 Project Structure

```
/
├── index.html
├── assets/
│   ├── css/styles.css
│   ├── js/scripts.js
│   └── images/
├── manifest.webmanifest
├── .github/workflows/ci.yml
├── .devcontainer/devcontainer.json
└── README.md
```

## ✅ Principles

* **Least Power:** HTML > CSS > JS
* **Separation of Concerns:** Strict layer isolation
* **Accessibility First:** WCAG 2.2 AA+/508 compliant by design
* **Native Performance:** Zero build, instant render
* **Progressive Enhancement:** Defaults to usable

## ⚙️ Dev Container (`.devcontainer.json`)

For GitHub Codespaces or VS Code remote containers:

```json
{
  "name": "uiux.life",
  "features": {
    "ghcr.io/devcontainers/features/node:1": { "version": "lts" },
    "ghcr.io/devcontainers/features/git:1": {}
  },
  "customizations": {
    "vscode": {
      "settings": {
        "editor.formatOnSave": true,
        "files.trimTrailingWhitespace": true
      },
      "extensions": [
        "esbenp.prettier-vscode",
        "dbaeumer.vscode-eslint"
      ]
    }
  }
}
```

## 🧪 Testing Philosophy

* Native browser dev tools
* CSS diagnostics (`::before`/`:has()`)
* Keyboard + screen reader traversal
* Content reflow/responsiveness
* Color contrast + motion safety

## 📱 PWA Checklist

* [x] `manifest.webmanifest` with icons + meta
* [x] `theme-color` + `viewport` `<meta>` tags
* [x] Offline-safe layout + fallback
* [x] Cache-less performance by default
* [ ] \[Optional] `service-worker.js` scaffolded (see `/docs/pwa.md`)

## 🤝 Contributing

Pull requests welcome.

* No third-party tooling
* Preserve semantic HTML + scoped CSS
* JS must degrade gracefully
* Always test accessibility (keyboard, screen reader)

## 📜 License

[MIT License](LICENSE)

---

> Built with love. Powered by CSS. Driven by clarity.
