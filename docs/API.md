# API Reference

## Base URL

```
http://localhost:3001
```

All API endpoints are prefixed with `/api` except for the redirect endpoint.

## Error Format

All error responses use a consistent JSON format:

```json
{
  "error": "Description of what went wrong"
}
```

## Status Codes

| Code | Meaning                                              |
|------|------------------------------------------------------|
| 200  | Success                                              |
| 201  | Resource created                                     |
| 301  | Redirect to original URL                             |
| 400  | Bad request (missing or invalid parameters)          |
| 404  | Resource not found                                   |
| 500  | Internal server error                                |

---

## Endpoints

### Health Check

Check that the API server is running.

**Request**

```
GET /api/health
```

**Response** `200 OK`

```json
{
  "status": "ok",
  "timestamp": "2025-01-15T12:00:00.000Z"
}
```

**Example**

```bash
curl http://localhost:3001/api/health
```

---

### Create Short URL

Shorten a long URL and receive a short code.

**Request**

```
POST /api/urls
Content-Type: application/json
```

**Body**

| Field         | Type   | Required | Description                    |
|---------------|--------|----------|--------------------------------|
| `originalUrl` | string | Yes      | The URL to shorten (must be a valid URL) |

```json
{
  "originalUrl": "https://docs.anthropic.com/en/docs/welcome"
}
```

**Response** `201 Created`

```json
{
  "id": 1,
  "original_url": "https://docs.anthropic.com/en/docs/welcome",
  "short_code": "aBcD1eF",
  "created_at": "2025-01-15 12:00:00",
  "click_count": 0
}
```

**Errors**

| Status | Error                    | Cause                          |
|--------|--------------------------|--------------------------------|
| 400    | `originalUrl is required` | Missing `originalUrl` in body |
| 400    | `Invalid URL format`     | `originalUrl` is not a valid URL |

**Example**

```bash
curl -X POST http://localhost:3001/api/urls \
  -H "Content-Type: application/json" \
  -d '{"originalUrl": "https://docs.anthropic.com/en/docs/welcome"}'
```

---

### List All URLs

Retrieve all shortened URLs, ordered by creation date (newest first).

**Request**

```
GET /api/urls
```

**Response** `200 OK`

```json
[
  {
    "id": 3,
    "original_url": "https://en.wikipedia.org/wiki/URL_shortening",
    "short_code": "xYz9876",
    "created_at": "2025-01-15 12:02:00",
    "click_count": 5
  },
  {
    "id": 2,
    "original_url": "https://docs.anthropic.com/en/docs/welcome",
    "short_code": "aBcD1eF",
    "created_at": "2025-01-15 12:01:00",
    "click_count": 12
  },
  {
    "id": 1,
    "original_url": "https://github.com/anthropics/claude-code",
    "short_code": "gH3jK5m",
    "created_at": "2025-01-15 12:00:00",
    "click_count": 0
  }
]
```

**Example**

```bash
curl http://localhost:3001/api/urls
```

---

### Resolve Short URL (Redirect)

Redirect to the original URL associated with a short code. This endpoint also increments the click counter.

**Request**

```
GET /:shortCode
```

**Parameters**

| Parameter   | Type   | Location | Description          |
|-------------|--------|----------|----------------------|
| `shortCode` | string | path     | The 7-character short code |

**Response** `301 Moved Permanently`

Redirects to the original URL via the `Location` header.

**Errors**

| Status | Error              | Cause                                  |
|--------|--------------------|----------------------------------------|
| 404    | `URL not found`    | No URL exists with the given short code |

**Example**

```bash
# Follow redirect
curl -L http://localhost:3001/aBcD1eF

# See redirect without following
curl -I http://localhost:3001/aBcD1eF
```

---

### Delete Short URL

Delete a shortened URL by its short code.

**Request**

```
DELETE /api/urls/:shortCode
```

**Parameters**

| Parameter   | Type   | Location | Description          |
|-------------|--------|----------|----------------------|
| `shortCode` | string | path     | The 7-character short code |

**Response** `200 OK`

```json
{
  "message": "URL deleted"
}
```

**Errors**

| Status | Error              | Cause                                  |
|--------|--------------------|----------------------------------------|
| 404    | `URL not found`    | No URL exists with the given short code |

**Example**

```bash
curl -X DELETE http://localhost:3001/api/urls/aBcD1eF
```

---

## URL Object Schema

Every URL object returned by the API has the following shape:

| Field          | Type    | Description                                      |
|----------------|---------|--------------------------------------------------|
| `id`           | integer | Auto-incremented primary key                     |
| `original_url` | string  | The full original URL                            |
| `short_code`   | string  | 7-character nanoid identifier                    |
| `created_at`   | string  | ISO-ish datetime of creation (`YYYY-MM-DD HH:MM:SS`) |
| `click_count`  | integer | Number of times the short URL has been resolved  |
