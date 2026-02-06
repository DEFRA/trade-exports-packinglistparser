# Secrets Configuration

## Overview

This project uses separate files for secrets management to keep sensitive credentials out of version control.

## Files

- **`.env.local`** - Your actual local development environment variables (ignored by git)
- **`.env.local.example`** - Example template with placeholder values (can be committed)
- **`secrets.env`** - Sensitive credentials only (ignored by git)

## Setup Instructions

1. Copy the example file:

   ```bash
   cp .env.local.example .env.local
   ```

2. Create a `secrets.env` file with your actual credentials:

   ```bash
   # secrets.env
   AZURE_MDM_CLIENT_SECRET=your-actual-client-secret
   AZURE_MDM_SUBSCRIPTION_KEY=your-actual-subscription-key
   ```

3. Update `.env.local` with environment-specific values

4. When running the application, load both files:

   ```bash
   # Using node --env-file flag (Node.js 20.6+)
   node --env-file=.env.local --env-file=secrets.env src/index.js

   # Or set environment variables manually
   export $(cat .env.local | xargs)
   export $(cat secrets.env | xargs)
   node src/index.js
   ```

## Security

- ✅ `.env.local` is in `.gitignore`
- ✅ `secrets.env` is in `.gitignore`
- ✅ `.env.local.example` can be safely committed
- ⚠️ Never commit actual secrets to version control
- ⚠️ Keep `secrets.env` secure and backed up separately

## What Goes Where

### `.env.local` (environment-specific, not committed)

- Environment names (development, staging, production)
- Service endpoints and URLs
- Feature flags
- Non-sensitive configuration
- Client IDs and tenant IDs (these are generally not secrets)

### `secrets.env` (highly sensitive, not committed)

- Client secrets
- API keys
- Subscription keys
- Access tokens
- Passwords
- Any credential that provides authentication
