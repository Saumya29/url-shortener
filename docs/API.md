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
| 204  | No content (successful deletion)                     |
| 302  | Redirect to original URL                             |
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
  "originalUrl": "https://docs.anthropic.com/en/docs/welcome",
  "shortCode": "aBcD1eF",
  "shortUrl": "http://localhost:3001/r/aBcD1eF",
  "createdAt": "2025-01-15 12:00:00",
  "clickCount": 0
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
    "originalUrl": "https://en.wikipedia.org/wiki/URL_shortening",
    "shortCode": "xYz9876",
    "shortUrl": "http://localhost:3001/r/xYz9876",
    "createdAt": "2025-01-15 12:02:00",
    "clickCount": 5
  },
  {
    "id": 2,
    "originalUrl": "https://docs.anthropic.com/en/docs/welcome",
    "shortCode": "aBcD1eF",
    "shortUrl": "http://localhost:3001/r/aBcD1eF",
    "createdAt": "2025-01-15 12:01:00",
    "clickCount": 12
  },
  {
    "id": 1,
    "originalUrl": "https://github.com/anthropics/claude-code",
    "shortCode": "gH3jK5m",
    "shortUrl": "http://localhost:3001/r/gH3jK5m",
    "createdAt": "2025-01-15 12:00:00",
    "clickCount": 0
  }
]
```

**Example**

```bash
curl http://localhost:3001/api/urls
```

---

### Get Single URL

Retrieve a single shortened URL by its short code.

**Request**

```
GET /api/urls/:shortCode
```

**Parameters**

| Parameter   | Type   | Location | Description          |
|-------------|--------|----------|----------------------|
| `shortCode` | string | path     | The 7-character short code |

**Response** `200 OK`

```json
{
  "id": 1,
  "originalUrl": "https://docs.anthropic.com/en/docs/welcome",
  "shortCode": "aBcD1eF",
  "shortUrl": "http://localhost:3001/r/aBcD1eF",
  "createdAt": "2025-01-15 12:00:00",
  "clickCount": 12
}
```

**Errors**

| Status | Error              | Cause                                  |
|--------|--------------------|----------------------------------------|
| 404    | `URL not found`    | No URL exists with the given short code |

**Example**

```bash
curl http://localhost:3001/api/urls/aBcD1eF
```

---

### Resolve Short URL (Redirect)

Redirect to the original URL associated with a short code. This endpoint also increments the click counter.

**Request**

```
GET /r/:shortCode
```

**Parameters**

| Parameter   | Type   | Location | Description          |
|-------------|--------|----------|----------------------|
| `shortCode` | string | path     | The 7-character short code |

**Response** `302 Found`

Redirects to the original URL via the `Location` header.

**Errors**

| Status | Error              | Cause                                  |
|--------|--------------------|----------------------------------------|
| 404    | `URL not found`    | No URL exists with the given short code |

**Example**

```bash
# Follow redirect
curl -L http://localhost:3001/r/aBcD1eF

# See redirect without following
curl -I http://localhost:3001/r/aBcD1eF
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

**Response** `204 No Content`

Returns an empty response body on success.

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
| `originalUrl`  | string  | The full original URL                            |
| `shortCode`    | string  | 7-character nanoid identifier                    |
| `shortUrl`     | string  | Full redirect URL (e.g., `http://localhost:3001/r/aBcD1eF`) |
| `createdAt`    | string  | Datetime of creation (`YYYY-MM-DD HH:MM:SS`)    |
| `clickCount`   | integer | Number of times the short URL has been resolved  |
