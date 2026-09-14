# Ministry Field Updates Implementation Checklist

## 1. API and Type Preparation

- [ ] Use `openapi copy 2.yaml` as the source of truth for field-update APIs.
- [ ] Confirm the generated API types include:
  - [ ] `FieldUpdate`
  - [ ] `FieldUpdatePage`
  - [ ] `CreateFieldUpdateRequest`
  - [ ] `UpdateFieldUpdateRequest`
  - [ ] Multipart create and update request types.
- [ ] Regenerate `src/api/generated.ts` from the updated OpenAPI file.
- [ ] Verify the generated types preserve the field-update lifecycle values: `draft`, `published`, and `archived`.
- [ ] Keep email delivery outside the current field-update API payload until a backend contract exists.

## 2. API Client and Query Hooks

- [ ] Keep the existing field-update API methods aligned with the updated OpenAPI contract.
- [ ] Add or update query keys for:
  - [ ] User-visible field-update lists.
  - [ ] Admin field-update lists with filters.
  - [ ] Field-update details.
- [ ] Add a paginated user-facing field-update query hook.
- [ ] Add an admin list hook supporting:
  - [ ] Search.
  - [ ] Status.
  - [ ] Ministry track.
  - [ ] Category.
  - [ ] Tag.
  - [ ] Sort field and direction.
- [ ] Add mutation hooks for:
  - [ ] Create.
  - [ ] Update.
  - [ ] Publish.
  - [ ] Archive.
  - [ ] Restore.
- [ ] Invalidate the appropriate list and detail queries after every successful mutation.
- [ ] Add clear error handling for validation, authorization, conflict, and server errors.

## 3. Shared Markdown Rendering

- [ ] Add a Markdown parser for field-update content.
- [ ] Add a sanitizer for the generated HTML.
- [ ] Create a shared renderer component that:
  - [ ] Accepts the persisted `mdBody` Markdown value.
  - [ ] Parses Markdown into HTML.
  - [ ] Sanitizes the resulting HTML before rendering.
  - [ ] Applies consistent typography and link behavior.
- [ ] Ensure raw Markdown and unsanitized HTML are never injected directly into the DOM.
- [ ] Test unsafe scripts, event handlers, unsafe URLs, and embedded HTML.

## 4. Signed-In Homepage and Dashboard Feed

- [ ] Create a reusable ministry field-updates feed component.
- [ ] Render the feed on the signed-in homepage/overview.
- [ ] Render the same feed on the signed-in dashboard.
- [ ] Add paginated cards containing:
  - [ ] Title.
  - [ ] Tag.
  - [ ] Category when present.
  - [ ] Publication date.
  - [ ] Ministry track when present.
  - [ ] Media thumbnail when present.
  - [ ] Sanitized Markdown excerpt.
- [ ] Add loading, empty, and error states.
- [ ] Add pagination controls using the API response metadata.
- [ ] Add a detail modal or route for the complete update.
- [ ] Render the full detail content through the shared sanitized Markdown renderer.
- [ ] Support optional image and video media according to `mediaType`.
- [ ] Ensure only currently visible published updates are shown to non-admin users.

## 5. Admin Navigation and List View

- [ ] Add a dedicated “Field Updates” tab to `AdminPanel`.
- [ ] Create an admin field-updates management component.
- [ ] Display paginated records with:
  - [ ] Title.
  - [ ] Tag/category.
  - [ ] Ministry track.
  - [ ] Status.
  - [ ] Publication date.
  - [ ] Updated date.
- [ ] Add search and filter controls for all supported API filters.
- [ ] Add actions for:
  - [ ] Create.
  - [ ] Edit.
  - [ ] View preview.
  - [ ] Publish.
  - [ ] Archive.
  - [ ] Restore.
- [ ] Add confirmation before archiving.
- [ ] Disable invalid actions based on lifecycle state.
- [ ] Show clear mutation success and failure feedback.

## 6. Admin Create and Edit Form

- [ ] Create a shared create/edit form for field updates.
- [ ] Add fields for:
  - [ ] Title.
  - [ ] Tag.
  - [ ] Category.
  - [ ] Ministry track.
  - [ ] Status.
  - [ ] Publication date.
  - [ ] Markdown body.
  - [ ] Optional media type and media upload/URL.
- [ ] Validate required fields and OpenAPI length constraints on the client.
- [ ] Preserve the canonical Markdown value in `mdBody`.
- [ ] Support draft saves without requiring publication metadata.
- [ ] Respect the API rules for published dates and archived records.
- [ ] Prevent editing archived content except through the restore workflow.

## 7. WYSIWYG Markdown Editor and Preview

- [ ] Add a maintained React WYSIWYG editor with Markdown support.
- [ ] Configure the editor to produce Markdown compatible with the `mdBody` API field.
- [ ] Add formatting controls appropriate for field updates, such as headings, emphasis, lists, links, and quotes.
- [ ] Add edit, preview, and split-view modes.
- [ ] Render the preview through the same Markdown parser and sanitizer used by users.
- [ ] Make preview updates responsive while typing.
- [ ] Verify that switching between edit and preview does not lose content.
- [ ] Test common Markdown formatting and malformed input.

## 8. Email Delivery Controls

- [ ] Add an “Enable email delivery” checkbox to the create/edit form.
- [ ] Keep the checkbox state separate from the current field-update API payload.
- [ ] Add a recipient-count display using a clearly labeled placeholder, such as “Recipient count unavailable”.
- [ ] Add composable audience filters using union semantics.
- [ ] Support filter options for:
  - [ ] Ministry-track subscribers.
  - [ ] All subscribers.
  - [ ] All users.
  - [ ] Specific roles.
  - [ ] Specific users, if supported by the eventual backend contract.
- [ ] Show the relevant track, role, or user selector when a filter requires it.
- [ ] Grey out and disable the complete filters section when email delivery is unchecked.
- [ ] Preserve selected filter values when toggling delivery off and back on unless validation requires clearing them.
- [ ] Add an isolated placeholder delivery adapter for future count/send API integration.
- [ ] Trigger the placeholder delivery flow when publishing with email delivery enabled.
- [ ] Keep email subject, body, and rendering behavior owned by the backend.

## 9. Accessibility and UX

- [ ] Give all form controls visible labels.
- [ ] Ensure disabled filters communicate their disabled state to assistive technology.
- [ ] Provide keyboard-accessible editor controls, previews, dialogs, and pagination.
- [ ] Add focus management for the detail modal or route transition.
- [ ] Provide accessible loading and error announcements.
- [ ] Verify readable contrast for cards, statuses, disabled controls, and preview content.

## 10. Verification Checklist

- [ ] Run the TypeScript check/build successfully.
- [ ] Verify signed-in users can see published field updates on both homepage and dashboard.
- [ ] Verify drafts and archived records are hidden from non-admin users.
- [ ] Verify admins can create, edit, publish, archive, restore, and preview updates.
- [ ] Verify pagination and all admin filters work together.
- [ ] Verify media rendering handles image, video, and no-media cases.
- [ ] Verify Markdown sanitization blocks unsafe content.
- [ ] Verify the email filters are disabled when delivery is unchecked.
- [ ] Verify union-based filter state is prepared for future backend integration.
- [ ] Verify the placeholder recipient count does not imply real backend data.
- [ ] Verify API errors and lifecycle conflicts are presented without losing unsaved form content.

## Assumptions

- [ ] The updated OpenAPI file remains authoritative for field-update CRUD and lifecycle behavior.
- [ ] Email recipient-count and send endpoints are not yet available.
- [ ] Email delivery is conceptually associated with publishing, but the current UI uses a replaceable placeholder adapter.
- [ ] The backend determines email subject, body, and final delivery content.
- [ ] Non-admin users receive only currently visible published field updates.
- [ ] “Delete” is implemented as archive because that is how the API models deletion.
