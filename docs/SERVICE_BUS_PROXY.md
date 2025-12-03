# Azure Service Bus with Proxy Support

This guide explains how to connect to Azure Service Bus through a corporate proxy using WebSocket transport.

## Quick Start

### 1. Install Dependencies

The required packages are already installed:

- `@azure/service-bus` - Azure Service Bus SDK
- `https-proxy-agent` - Proxy support
- `ws` - WebSocket implementation for Node.js

### 2. Configure Proxy

Set proxy environment variables:

```bash
export HTTPS_PROXY=http://your-proxy.example.com:8080
# or
export HTTP_PROXY=http://your-proxy.example.com:8080
```

For authenticated proxies:

```bash
export HTTPS_PROXY=http://username:password@your-proxy.example.com:8080
```

### 3. Use in Code

#### Option A: Using Config-Based Client

Add to your config:

```javascript
{
  azure: {
    tenantId: 'your-tenant-id',
    clientId: 'your-client-id',
    serviceBusNamespace: 'mynamespace.servicebus.windows.net',
    proxyUrl: process.env.HTTPS_PROXY  // optional
  }
}
```

Then use:

```javascript
import { createServiceBusClientFromConfig } from './src/services/service-bus-service.js'

const client = createServiceBusClientFromConfig()
```

#### Option B: Direct Function Calls

```javascript
import { sendMessageToQueue } from './src/services/service-bus-service.js'

await sendMessageToQueue(
  'tenant-id',
  'client-id',
  'mynamespace.servicebus.windows.net',
  'my-queue',
  { message: 'Hello World' },
  { proxyUrl: 'http://proxy.example.com:8080' } // optional
)
```

#### Option C: Manual Client Creation

```javascript
import { createServiceBusClient } from './src/services/service-bus-service.js'

const client = createServiceBusClient(
  'tenant-id',
  'client-id',
  'mynamespace.servicebus.windows.net',
  { proxyUrl: 'http://proxy.example.com:8080' } // optional
)

const sender = client.createSender('my-queue')
await sender.sendMessages({ body: { test: true } })
await sender.close()
await client.close()
```

## Test Script

Run the included test script:

```bash
# Set required variables
export AZURE_TENANT_ID='your-tenant-id'
export AZURE_CLIENT_ID='your-client-id'
export SERVICE_BUS_NAMESPACE='mynamespace.servicebus.windows.net'
export SERVICE_BUS_QUEUE='my-queue'
export HTTPS_PROXY='http://proxy.example.com:8080'

# Run test
node scripts/test-service-bus-proxy.js
```

## How It Works

### WebSocket Transport

- Azure Service Bus supports two transports:
  - **AMQP over TLS** (port 5671) - default, often blocked by corporate firewalls
  - **AMQP over WebSocket** (port 443) - works through proxies and firewalls

### Proxy Configuration

The service automatically configures WebSocket to use the proxy when `proxyUrl` is provided:

```javascript
const proxyAgent = new HttpsProxyAgent(proxyUrl)
connectionOptions.webSocketOptions.webSocketConstructorOptions = {
  agent: proxyAgent
}
```

The proxy agent handles:

- HTTP CONNECT tunneling for HTTPS connections
- Authentication (basic auth in URL)
- Certificate validation

## Troubleshooting

### 1. Operation Timeout

If you see "operation timeout" errors:

**Check connectivity:**

```bash
# Test proxy connection
curl -x http://proxy.example.com:8080 https://mynamespace.servicebus.windows.net

# Check if port 443 is open through proxy
nc -vz -x proxy.example.com:8080 mynamespace.servicebus.windows.net 443
```

**Enable debug logging:**

```bash
DEBUG=azure*,rhea* node your-script.js
```

### 2. Authentication Issues

**Test credentials separately:**

```javascript
import { getAzureCredentials } from './src/services/utilities/get-azure-credentials.js'

const credential = getAzureCredentials(tenantId, clientId)
const token = await credential.getToken('https://servicebus.azure.net/.default')
console.log('Token obtained:', !!token.token)
```

### 3. Proxy Authentication

For authenticated proxies, include credentials in URL:

```bash
export HTTPS_PROXY=http://username:password@proxy.example.com:8080
```

Special characters in password need URL encoding:

```javascript
const password = encodeURIComponent('p@ssw0rd!')
const proxyUrl = `http://username:${password}@proxy.example.com:8080`
```

### 4. Certificate Issues

If using corporate proxy with SSL interception:

```bash
# Set custom CA certificate
export NODE_EXTRA_CA_CERTS=/path/to/corporate-ca.pem
```

### 5. Compare Direct vs Proxy

Test without proxy first to isolate issues:

```javascript
// Without proxy
await sendMessageToQueue(tenantId, clientId, namespace, queue, message)

// With proxy
await sendMessageToQueue(tenantId, clientId, namespace, queue, message, {
  proxyUrl: 'http://proxy.example.com:8080'
})
```

## Environment Variables

| Variable              | Description                     | Example                         |
| --------------------- | ------------------------------- | ------------------------------- |
| `HTTPS_PROXY`         | Proxy URL for HTTPS connections | `http://proxy.example.com:8080` |
| `HTTP_PROXY`          | Fallback proxy URL              | `http://proxy.example.com:8080` |
| `NO_PROXY`            | Hosts to exclude from proxy     | `localhost,127.0.0.1`           |
| `NODE_EXTRA_CA_CERTS` | Custom CA certificate path      | `/etc/ssl/certs/ca.pem`         |
| `DEBUG`               | Enable debug logging            | `azure*,rhea*`                  |

## Proxy Requirements

Your corporate proxy must:

1. Allow CONNECT method for HTTPS tunneling
2. Allow outbound connections to `*.servicebus.windows.net` on port 443
3. Support WebSocket upgrade (HTTP 101 Switching Protocols)

Most modern corporate proxies support these by default.

## Additional Resources

- [Azure Service Bus Proxy Documentation](https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-amqp-protocol-guide#use-web-sockets)
- [https-proxy-agent](https://github.com/TooTallNate/proxy-agents)
- [ws WebSocket Library](https://github.com/websockets/ws)

## Common Proxy Formats

```bash
# HTTP proxy (no auth)
http://proxy.example.com:8080

# HTTPS proxy (no auth)
https://proxy.example.com:8080

# HTTP proxy with basic auth
http://username:password@proxy.example.com:8080

# Using environment variable
http://${PROXY_USER}:${PROXY_PASS}@proxy.example.com:8080

# Corporate proxy with domain user
http://DOMAIN\\username:password@proxy.example.com:8080
```
