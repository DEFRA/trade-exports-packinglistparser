# Azure Service Bus with Proxy Support

This guide explains how to connect to Azure Service Bus through a corporate proxy using WebSocket transport.

## Quick Start

### 1. Install Dependencies

The required packages are already installed:

- `@azure/service-bus` - Azure Service Bus SDK
- `https-proxy-agent` - Proxy support
- `ws` - WebSocket implementation for Node.js

### 2. Configure Proxy

The proxy is configured through the application's config system. Add to your config:

```javascript
{
  httpProxy: 'http://your-proxy.example.com:8080'
}
```

Or set via environment variable (depending on your config setup):

```bash
export HTTP_PROXY=http://your-proxy.example.com:8080
```

For authenticated proxies:

```bash
export HTTP_PROXY=http://username:password@your-proxy.example.com:8080
```

### 3. Use in Code

#### Option A: Using Config-Based Client (Recommended)

Add to your config:

```javascript
{
  azure: {
    defraCloudTenantId: 'your-tenant-id'  // or defraTenantId for blob storage
  },
  tradeServiceBus: {
    clientId: 'your-client-id',
    serviceBusNamespace: 'mynamespace.servicebus.windows.net',
    queueName: 'your-queue-name'
  },
  httpProxy: 'http://proxy.example.com:8080'  // optional, auto-configured if present
}
```

Then use the high-level functions:

```javascript
import {
  sendMessageToQueue,
  receiveMessagesFromQueue
} from './src/services/trade-service-bus-service.js'

// Send a message (proxy automatically configured)
await sendMessageToQueue({ text: 'Hello, Service Bus!' })

// Receive messages
const messages = await receiveMessagesFromQueue(10, 5000)
```

#### Option B: Manual Client Creation

For more control, use the lower-level functions:

```javascript
import { ServiceBusClient } from '@azure/service-bus'
import { getAzureCredentials } from './src/services/utilities/get-azure-credentials.js'
import { getServiceBusConnectionOptions } from './src/services/utilities/proxy-helper.js'

// Create client with automatic proxy configuration
const credential = getAzureCredentials('tenant-id', 'client-id')
const connectionOptions = getServiceBusConnectionOptions() // Reads httpProxy from config

const client = new ServiceBusClient(
  'mynamespace.servicebus.windows.net',
  credential,
  connectionOptions
)

// Use the client
const sender = client.createSender('my-queue')
await sender.sendMessages({ body: { test: true } })
await sender.close()
await client.close()
```

## Test Routes

Test Service Bus connectivity through the API route:

```bash
# Configure your application (in config or env vars)
export HTTP_PROXY='http://proxy.example.com:8080'

# Start the server
npm start

# Test the endpoint
curl http://localhost:3000/trade-service-bus
```

Or check connectivity through the connectivity-check endpoint:

```bash
curl http://localhost:3000/connectivity-check
```

## How It Works

### WebSocket Transport

- Azure Service Bus supports two transports:
  - **AMQP over TLS** (port 5671) - default, often blocked by corporate firewalls
  - **AMQP over WebSocket** (port 443) - works through proxies and firewalls

### Proxy Configuration

The service automatically configures WebSocket to use the proxy when `httpProxy` is set in config:

```javascript
// From proxy-helper.js
const proxyUrl = config.get('httpProxy')

if (proxyUrl) {
  const proxyAgent = new HttpsProxyAgent(proxyUrl)
  connectionOptions.webSocketOptions.webSocketConstructorOptions = {
    agent: proxyAgent
  }
}
```

The `HttpsProxyAgent` handles:

- HTTP CONNECT tunneling for HTTPS connections
- Authentication (basic auth in URL: `http://user:pass@proxy:8080`)
- Certificate validation
- Both HTTP and HTTPS proxy protocols

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

This application uses **AWS Cognito** to obtain OpenID tokens for Azure AD federation.

**Test credentials separately:**

```javascript
import { getAzureCredentials } from './src/services/utilities/get-azure-credentials.js'

// This uses Cognito to get a token for Azure authentication
const credential = getAzureCredentials(tenantId, clientId)
const token = await credential.getToken('https://servicebus.azure.net/.default')
console.log('Token obtained:', !!token.token)
```

**Check Cognito configuration:**

Ensure your AWS Cognito identity pool is properly configured in `config.get('aws')` with:

- `poolId`: Cognito identity pool ID
- `region`: AWS region

### 3. Proxy Authentication

For authenticated proxies, include credentials in the config URL:

```javascript
{
  httpProxy: 'http://username:password@proxy.example.com:8080'
}
```

Or via environment:

```bash
export HTTP_PROXY=http://username:password@proxy.example.com:8080
```

**Special characters in password need URL encoding:**

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
import { config } from './src/config.js'
import { sendMessageToQueue } from './src/services/trade-service-bus-service.js'

// Without proxy - remove from config
delete config.httpProxy
await sendMessageToQueue({ test: 'message' })

// With proxy - add back to config
config.httpProxy = 'http://proxy.example.com:8080'
await sendMessageToQueue({ test: 'message' })
```

## Configuration

### Config Structure

```javascript
{
  azure: {
    defraCloudTenantId: 'your-azure-tenant-id',  // For Service Bus
    defraTenantId: 'your-azure-tenant-id'        // For Blob Storage
  },
  aws: {
    poolId: 'eu-west-2:your-cognito-pool-id',
    region: 'eu-west-2'
  },
  tradeServiceBus: {
    clientId: 'your-service-bus-client-id',
    serviceBusNamespace: 'mynamespace.servicebus.windows.net',
    queueName: 'your-queue-name'
  },
  httpProxy: 'http://proxy.example.com:8080'  // Optional
}
```

### Environment Variables

| Variable              | Description                 | Example                         |
| --------------------- | --------------------------- | ------------------------------- |
| `HTTP_PROXY`          | Proxy URL (read by config)  | `http://proxy.example.com:8080` |
| `NO_PROXY`            | Hosts to exclude from proxy | `localhost,127.0.0.1`           |
| `NODE_EXTRA_CA_CERTS` | Custom CA certificate path  | `/etc/ssl/certs/ca.pem`         |
| `DEBUG`               | Enable debug logging        | `azure*,rhea*`                  |

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
