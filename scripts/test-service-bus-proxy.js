#!/usr/bin/env node
/**
 * Test script for Azure Service Bus connection with proxy support
 *
 * Usage:
 *   node scripts/test-service-bus-proxy.js
 *
 * Environment variables:
 *   AZURE_TENANT_ID - Azure tenant ID
 *   AZURE_CLIENT_ID - Azure client ID
 *   SERVICE_BUS_NAMESPACE - Service Bus namespace (e.g., "mynamespace.servicebus.windows.net")
 *   SERVICE_BUS_QUEUE - Queue name
 *   HTTP_PROXY or HTTPS_PROXY - Proxy URL (e.g., "http://proxy.example.com:8080")
 */

import { sendMessageToQueue } from '../src/services/trade-service-bus-service.js'

async function testServiceBusWithProxy() {
  const tenantId = process.env.AZURE_TENANT_ID
  const clientId = process.env.AZURE_CLIENT_ID
  const namespace = process.env.SERVICE_BUS_NAMESPACE
  const queueName = process.env.SERVICE_BUS_QUEUE
  const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY

  console.log('Configuration:')
  console.log('  Tenant ID:', tenantId ? '✓' : '✗ (missing)')
  console.log('  Client ID:', clientId ? '✓' : '✗ (missing)')
  console.log('  Namespace:', namespace || '✗ (missing)')
  console.log('  Queue:', queueName || '✗ (missing)')
  console.log('  Proxy:', proxyUrl || '(none - direct connection)')
  console.log()

  if (!tenantId || !clientId || !namespace || !queueName) {
    console.error('Error: Missing required environment variables')
    console.error(
      'Please set: AZURE_TENANT_ID, AZURE_CLIENT_ID, SERVICE_BUS_NAMESPACE, SERVICE_BUS_QUEUE'
    )
    process.exit(1)
  }

  const testMessage = {
    test: true,
    timestamp: new Date().toISOString(),
    message: 'Test message sent via WebSocket with proxy support'
  }

  console.log('Sending test message...')
  console.log('Message:', JSON.stringify(testMessage, null, 2))
  console.log()

  try {
    const options = proxyUrl ? { proxyUrl } : {}

    await sendMessageToQueue(
      tenantId,
      clientId,
      namespace,
      queueName,
      testMessage,
      options
    )

    console.log('✓ Message sent successfully!')
    console.log()
    console.log('Connection details:')
    console.log('  Transport: WebSocket (port 443)')
    console.log('  Proxy:', proxyUrl || 'Direct connection')
    process.exit(0)
  } catch (error) {
    console.error('✗ Failed to send message:')
    console.error('  Error:', error.message)
    console.error()
    console.error('Troubleshooting:')
    console.error(
      '  1. Check proxy URL format: http://host:port or https://host:port'
    )
    console.error('  2. Verify proxy allows CONNECT method for HTTPS tunneling')
    console.error(
      '  3. Check credentials are valid (run with DEBUG=azure* for detailed logs)'
    )
    console.error(
      '  4. Verify Service Bus namespace and queue name are correct'
    )
    console.error(
      '  5. Test without proxy first to isolate proxy vs credentials issues'
    )
    console.error()
    console.error('Full error:', error)
    process.exit(1)
  }
}

testServiceBusWithProxy()
