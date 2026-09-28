# Admin CMS handoff

This folder describes the admin functionality implemented by this frontend on 2026-09-16. It is intended as a functional and data contract reference for a standalone CMS. The checked-in `openapi copy 2.yaml` is the source for the generated schema and endpoint catalogues; the React source is the source for actual UI behavior. Neither proves that a deployed backend implements every operation.

Read in this order:

1. [FUNCTIONS.md](FUNCTIONS.md) — each admin section, workflows, and visible data.
2. [DATA_MODELS.md](DATA_MODELS.md) — every OpenAPI schema, property, required flag, enum, and constraint.
3. [API_CONTRACTS.md](API_CONTRACTS.md) — every documented HTTP operation, query parameter, request body, and response.
4. [API_INTEGRATION.md](API_INTEGRATION.md) — how this client calls those operations, media encoding, cache behavior, and contract gaps.
5. [AUTH_AND_LOCAL_STATE.md](AUTH_AND_LOCAL_STATE.md) — session, authorization, URL state, and unsaved form state.

Scope is the portal's admin side, including user detail activity and content that admins publish to public or signed-in feeds. The generated catalogues include adjacent public and donor schemas/endpoints because admin records reference them. For a CMS implementation, use the schema catalogue as a precise field inventory and the function document to decide which fields need an editor, table, detail view, or read-only display.

Existing deeper references: [`BADGE_CREATION_REFERENCE.md`](../BADGE_CREATION_REFERENCE.md), [`BADGE_ADMIN_DASHBOARD_CHECKLIST.md`](../BADGE_ADMIN_DASHBOARD_CHECKLIST.md), [`ministry-field-updates-checklist.md`](../ministry-field-updates-checklist.md), and [`inviter-reference-implementation-checklist.md`](../inviter-reference-implementation-checklist.md). These may include planned work; this folder labels current implementation separately.
