# Ministry Track Images — API Notes

Ministry-track create and update operations support either a new image upload or an existing image hosted by the configured Bunny CDN.

## Endpoints

Both endpoints require an authenticated administrator token and the administrator role:

```text
POST  /v1/ministry-tracks
PATCH /v1/ministry-tracks/:id
```

The image is returned in the track’s `cover_url` property. A missing image is returned as `null`.

## Choose one image input

| Input | Request content type | Behavior |
| --- | --- | --- |
| `coverImage` | `multipart/form-data` | Upload one JPEG, PNG, GIF, or WebP file. |
| `cover_url` | `application/json` or `multipart/form-data` | Reference an existing HTTPS image URL from the configured Bunny image CDN. |

Never send both fields in one request. On `PATCH`, send `cover_url: null` to remove the current image.

External URLs are not accepted. The URL origin must exactly match the Bunny image pull-zone origin configured by the backend. Accepted CDN references are normalized before persistence.

## Upload behavior

When `coverImage` is supplied, the request must use `multipart/form-data`. The upload field name is exactly `coverImage`.

All other create and update fields remain unchanged. The backend converts uploaded images to JPEG before storing them. The upload limit is controlled by `UPLOAD_FILE_SIZE_LIMIT` and defaults to 100 MiB.

## Existing CDN image references

For JSON or multipart requests, `cover_url` must be an existing HTTPS image URL from the configured Bunny image pull-zone origin.

On `PATCH`, set `cover_url` to `null` to remove the current image.

## Successful response

The create and update responses contain the ministry track object, including the persisted Bunny CDN URL in `cover_url`. List and detail responses include the same property.

## Error responses

- `400`: invalid image type, oversized upload, external/non-HTTPS URL, URL from another CDN, or both image inputs supplied. This also covers an upload field with the wrong name or content type.
- `401`: missing or expired authentication token.
- `403`: authenticated user is not an administrator.
- `404`: track or selected unit was not found.
- `409`: track name conflicts with an existing track.

Previous CDN objects are not automatically deleted when an image is replaced, because the same CDN image may be reused by another track.
