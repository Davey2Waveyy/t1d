# Legacy Code

This folder keeps older implementation experiments that are no longer part of the active app bundle.

- `dashboard/` contains the pre-v2 desktop dashboard components.
- Active publish work should use `src/components/v2/` and `src/pages/Dashboard.jsx`.
- Legacy files are excluded from lint/build so stale experiments do not block release readiness.
