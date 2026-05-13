---
description: Defra NodeJs backend development standards
applyTo: '**/*.js,**/*.mjs'
---

# Node.js Backend

## Language rules

- Use vanilla JavaScript — do not use TypeScript without an approved exception
- Use JSDoc for type annotations
- Use ES modules (`import`/`export`) by default
- Use CommonJS (`require`) only where needed (e.g. Jest config files)
- Use `const` by default, `let` only when reassignment is required, never `var`
- Use `async/await` — do not use callbacks or raw `.then()` chains
- Use `===` and `!==` for all equality checks
- Lint with [neostandard](https://github.com/neostandard/neostandard) (Defra-mandated since April 2025) — do not extend the ruleset or set `noStyle: true`. Do not use ESLint, Prettier, or Standard JS.
- Use containerisation with Docker with Defra base images (`defradigital/node`, `defradigital/node-development`)

## Hapi framework

- Use Hapi for all HTTP servers — do not use Express, Fastify, or Koa
- Register plugins for cross-cutting concerns (auth, CSRF, security headers)
- Use `@hapi/inert` for serving static files
- Use `@hapi/vision` for template rendering (Nunjucks)
- Use `@hapi/boom` for HTTP error responses
- Use `joi` (standalone package) for request validation — do not use the deprecated `@hapi/joi`
- Use `@hapi/crumb` for CSRF protection — CSRF is on by default for all routes
- Use `@hapi/blankie` for Content Security Policy headers
- Use `@defra/hapi-secure-context` for TLS certificate management on CDP platform
- Use `@defra/cdp-metrics` for Prometheus metrics on CDP platform

### Architecture

Keep controllers thin: validate input, call a service, render a view. Business logic belongs in service modules, not route handlers. Centralise shared logic in `src/utils/` or dedicated services — do not duplicate validation or formatting utilities.

```
Route handler → validates input (joi) → calls service → renders view or returns response
```

✅ Route handler with view rendering:

```javascript
import Boom from '@hapi/boom'

const getApplication = {
  method: 'GET',
  path: '/applications/{id}',
  handler: async (request, h) => {
    const { id } = request.params
    const application = await applicationService.getById(id)

    if (!application) {
      throw Boom.notFound('Application not found')
    }

    return h.view('pages/application-detail', {
      pageTitle: 'Application details',
      application
    })
  }
}
```

For POST routes, use `options.validate` with a `failAction` that re-renders the form with error details and returns a 400 status.

### Security

- **CSRF**: use `@hapi/crumb` on all state-changing routes. Exempt only endpoints with their own auth (e.g. HMAC-signed webhooks) and document the exemption with `plugins: { crumb: false }`
- **CSP**: configure `@hapi/blankie` — no `unsafe-inline` or `unsafe-eval`, no third-party script sources unless approved, set `frame-ancestors` to `'none'`
- **Headers**: set `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, HSTS (`max-age=31536000; includeSubDomains`), and `Cache-Control: no-store` for pages with user data
- **Cookies**: all cookies must be `HttpOnly`, `Secure`, `SameSite=Lax` with minimal scope and TTL

## Nunjucks views

- Use Nunjucks (`.njk`) for all server-side templates
- Base layout goes in `views/layouts/` (e.g. `main.njk`)
- Reusable fragments go in `views/partials/`
- GOV.UK component macros go in `views/macros/`
- Page templates go in `views/pages/`
- Render views using `h.view('pages/page-name', { context })`
- Display validation errors inline next to the field and in an error summary at the top of the page using the GOV.UK error pattern

## Error handling

- Use `@hapi/boom` for all HTTP error responses
- Return useful error messages without leaking internals (no stack traces, no SQL)
- Log the full error server-side for debugging
- Display user-friendly error pages using GOV.UK error patterns — keep templates in `views/errors/`

## Health endpoint

- Expose `/health` returning `200 OK` when healthy
- Include only lightweight checks for critical downstream dependencies

## Logging

- Use Winston for structured JSON logging
- Log levels: `error`, `warn`, `info`, `debug`
- Never log PII: no names, addresses, emails, phone numbers, NI numbers, bank details, API keys, or tokens
- Include a correlation ID on every log entry
- Production: `error` and `critical` only. Development: `debug`

## Database access

- Use parameterised queries — never concatenate user input into query strings
- Set connection timeouts and pool limits
- Index frequently queried columns
- Avoid `eval`, dynamic `Function()`, or executing user-supplied data
- **MongoDB**: use the native driver (not Mongoose), register via Hapi plugin, store foreign keys as `ObjectId`, enforce schema validation with `$jsonSchema`
- **SQL (PostgreSQL etc.)**: use Knex, Sequelize, or Objection.js with parameterised queries. Use migrations for all schema changes

## Environment and configuration

- Follow [12-factor app](https://12factor.net/) principles: one codebase, declared dependencies, config in environment, stateless processes, logs as event streams
- Use `convict` (with `convict-format-with-validator`) for configuration — define all environment variables with format validation and default values
- Never hard-code secrets, connection strings, or API keys
- Read from `process.env` only inside the config module — all other modules import from config
- Fail fast if a required environment variable is missing or invalid

```javascript
import convict from 'convict'

export const config = convict({
  port: {
    doc: 'The port to bind',
    format: 'port',
    default: 3000,
    env: 'PORT'
  },
  serviceVersion: {
    doc: 'Service version, injected by CDP platform',
    format: String,
    nullable: true,
    default: null,
    env: 'SERVICE_VERSION'
  }
})
config.validate({ allowed: 'strict' })
```

### CDP environments

On the Core Delivery Platform, `ENVIRONMENT` is set to one of: `local`, `infra-dev`, `management`, `dev`, `test`, `perf-test`, `ext-test`, `prod`. Include this in your config if you need environment-based behaviour.

## Asset bundling

- Use Webpack 5 for bundling frontend assets (CSS, images)
- Source assets live in `src/public/` or equivalent
- Built assets are generated into a static output directory
- Do not commit built assets to version control — build them in CI

## Dependencies

- Use NPM with `package-lock.json` in version control
- Use only Active LTS versions of Node.js
- Run `npm audit` and resolve vulnerabilities before merging
- Use `joi` (standalone) — do not use the deprecated `@hapi/joi`
- New dependencies must be widely used, actively maintained, and compatible with the current Node.js LTS

## Testing

- Use Jest for unit and integration tests
- Use Supertest to test Hapi routes via `createServer()`
- Every route must include tests for at minimum: happy path, validation failure, CSRF protection, and security headers
- Prefer small pure functions for testability
- Mock external dependencies (APIs, databases, file system)

## References

- [Defra Node.js standards](https://github.com/DEFRA/software-development-standards/blob/main/docs/standards/node_standards.md)
- [Defra JavaScript standards](https://github.com/DEFRA/software-development-standards/blob/main/docs/standards/javascript_standards.md)
- [Hapi API reference](https://hapi.dev/api/) · [Crumb (CSRF)](https://hapi.dev/module/crumb/) · [Joi](https://joi.dev/)
- [Defra FFC demo web template](https://github.com/DEFRA/ffc-demo-web)
