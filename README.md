# NürnbergSpots Admin Frontend

Admin-Dashboard für NürnbergSpots — React 19, TypeScript, Tailwind CSS, shadcn/ui, Firebase Auth.

## Dokumentation

| Dokument                                     | Inhalt                                         |
| -------------------------------------------- | ---------------------------------------------- |
| [CONSTITUTION.md](CONSTITUTION.md)           | Regeln, Architektur, Design, Tests, API-Muster |
| [docs/app_review.html](docs/app_review.html) | App-Review, Roadmap, Prioritäten, Checklisten  |

Maschinenlesbare Regeln für Cursor/CI: `.cursorrules`.

## Quick Start

```bash
npm install
npm run start:dev    # Dev-Server
npm run validate     # type-check, lint, format, test
npm run build        # Production-Build
```

Node.js ≥ 18, npm ≥ 9.

## Umgebungsvariablen

`.env` / `.env.dev` mit `VITE_FIREBASE_*` und `VITE_API_BASE_URL` (siehe CONSTITUTION.md).

## Lizenz

MIT — siehe [LICENSE](LICENSE).
