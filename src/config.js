import convict from 'convict'
import convictFormatWithValidator from 'convict-format-with-validator'

convict.addFormats(convictFormatWithValidator)

const isProduction = process.env.NODE_ENV === 'production'
const isTest = process.env.NODE_ENV === 'test'
const AZURE_AD_CLIENT_ID_DOC = 'Azure AD Client ID'

const config = convict({
  serviceVersion: {
    doc: 'The service version, this variable is injected into your docker container in CDP environments',
    format: String,
    nullable: true,
    default: null,
    env: 'SERVICE_VERSION'
  },
  host: {
    doc: 'The IP address to bind',
    format: 'ipaddress',
    default: '0.0.0.0',
    env: 'HOST'
  },
  port: {
    doc: 'The port to bind',
    format: 'port',
    default: 3001,
    env: 'PORT'
  },
  serviceName: {
    doc: 'Api Service Name',
    format: String,
    default: 'trade-exports-packinglistparser'
  },
  cdpEnvironment: {
    doc: 'The CDP environment the app is running in. With the addition of "local" for local development',
    format: [
      'local',
      'infra-dev',
      'management',
      'dev',
      'test',
      'perf-test',
      'ext-test',
      'prod'
    ],
    default: 'local',
    env: 'ENVIRONMENT'
  },
  log: {
    isEnabled: {
      doc: 'Is logging enabled',
      format: Boolean,
      default: !isTest,
      env: 'LOG_ENABLED'
    },
    level: {
      doc: 'Logging level',
      format: ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'],
      default: 'info',
      env: 'LOG_LEVEL'
    },
    format: {
      doc: 'Format to output logs in',
      format: ['ecs', 'pino-pretty'],
      default: isProduction ? 'ecs' : 'pino-pretty',
      env: 'LOG_FORMAT'
    },
    redact: {
      doc: 'Log paths to redact',
      format: Array,
      default: isProduction
        ? ['req.headers.authorization', 'req.headers.cookie', 'res.headers']
        : ['req', 'res', 'responseTime']
    }
  },
  httpProxy: {
    doc: 'HTTP Proxy URL',
    format: String,
    nullable: true,
    default: null,
    env: 'HTTP_PROXY'
  },
  isMetricsEnabled: {
    doc: 'Enable metrics reporting',
    format: Boolean,
    default: isProduction,
    env: 'ENABLE_METRICS'
  },
  tracing: {
    header: {
      doc: 'CDP tracing header name',
      format: String,
      default: 'x-cdp-request-id',
      env: 'TRACING_HEADER'
    }
  },
  aws: {
    region: {
      doc: 'AWS region',
      format: String,
      default: 'eu-west-2',
      env: 'AWS_REGION'
    },
    endpoint: {
      doc: 'AWS endpoint URL, for example to use with LocalStack',
      format: String,
      nullable: true,
      default: null,
      env: 'AWS_ENDPOINT_URL'
    },
    accessKeyId: {
      doc: 'AWS access key ID',
      format: String,
      nullable: true,
      default: null,
      env: 'AWS_ACCESS_KEY_ID'
    },
    secretAccessKey: {
      doc: 'AWS secret access key',
      format: String,
      nullable: true,
      default: null,
      env: 'AWS_SECRET_ACCESS_KEY'
    },
    s3Bucket: {
      doc: 'S3 bucket name, required if S3 is enabled',
      format: String,
      default: '',
      env: 'AWS_S3_BUCKET'
    },
    poolId: {
      doc: 'Cognito Identity Pool ID',
      format: String,
      default: '',
      env: 'AWS_COGNITO_IDENTITY_POOL_ID'
    }
  },
  packingList: {
    schemaVersion: {
      doc: 'The schema version for the packing list',
      format: String,
      default: 'v0.0',
      env: 'PACKING_LIST_SCHEMA_VERSION'
    }
  },
  dynamics: {
    url: {
      doc: 'Dynamics 365 instance URL',
      format: String,
      nullable: true,
      default: null,
      env: 'DYNAMICS_URL'
    },
    tokenUrl: {
      doc: 'OAuth token endpoint URL for Dynamics authentication',
      format: String,
      nullable: true,
      default: null,
      env: 'DYNAMICS_TOKEN_URL'
    },
    grantType: {
      doc: 'OAuth grant type for Dynamics authentication',
      format: String,
      default: 'client_credentials',
      env: 'DYNAMICS_GRANT_TYPE'
    },
    clientId: {
      doc: 'Client ID for Dynamics authentication',
      format: String,
      nullable: true,
      default: null,
      sensitive: true,
      env: 'DYNAMICS_CLIENT_ID'
    },
    clientSecret: {
      doc: 'Client secret for Dynamics authentication',
      format: String,
      nullable: true,
      default: null,
      sensitive: true,
      env: 'DYNAMICS_CLIENT_SECRET'
    },
    resource: {
      doc: 'Resource URL for Dynamics authentication',
      format: String,
      nullable: true,
      default: null,
      env: 'DYNAMICS_RESOURCE'
    },
    maxRetries: {
      doc: 'Maximum number of retry attempts for Dynamics requests',
      format: 'nat',
      default: 3,
      env: 'DYNAMICS_MAX_RETRIES'
    },
    retryDelayMs: {
      doc: 'Delay in milliseconds between retry attempts',
      format: 'nat',
      default: 2000,
      env: 'DYNAMICS_RETRY_DELAY_MS'
    }
  },
  azure: {
    defraCloudTenantId: {
      doc: 'Azure AD Tenant ID',
      format: String,
      nullable: true,
      default: null,
      env: 'AZURE_DEFRA_CLOUD_TENANT_ID'
    },
    defraTenantId: {
      doc: 'Azure AD Tenant ID for DEFRA',
      format: String,
      nullable: true,
      default: null,
      env: 'AZURE_DEFRA_TENANT_ID'
    }
  },
  tradeServiceBus: {
    clientId: {
      doc: AZURE_AD_CLIENT_ID_DOC,
      format: String,
      nullable: true,
      default: null,
      env: 'AZURE_TRADE_SERVICE_BUS_CLIENT_ID'
    },
    serviceBusNamespace: {
      doc: 'Azure Service Bus Namespace (fully qualified)',
      format: String,
      nullable: true,
      default: null,
      env: 'AZURE_TRADE_SERVICE_BUS_NAMESPACE'
    },
    queueName: {
      doc: 'Azure Service Bus Queue Name',
      format: String,
      nullable: true,
      default: null,
      env: 'AZURE_TRADE_SERVICE_BUS_QUEUE_NAME'
    },
    disableSend: {
      doc: 'Is sending messages to the Service Bus disabled',
      format: Boolean,
      nullable: false,
      default: false,
      env: 'AZURE_TRADE_SERVICE_BUS_DISABLE_SEND'
    }
  },
  ehcoBlob: {
    clientId: {
      doc: AZURE_AD_CLIENT_ID_DOC,
      format: String,
      nullable: true,
      default: null,
      env: 'AZURE_EHCO_BLOB_CLIENT_ID'
    },
    blobStorageAccount: {
      doc: 'Azure Blob Storage Account',
      format: String,
      nullable: true,
      default: null,
      env: 'AZURE_EHCO_BLOB_STORAGE_ACCOUNT'
    },
    formsContainerName: {
      doc: 'Azure Blob Storage Container Name for Forms',
      format: String,
      nullable: true,
      default: null,
      env: 'AZURE_EHCO_BLOB_FORMS_CONTAINER_NAME'
    }
  },
  mdm: {
    clientId: {
      doc: AZURE_AD_CLIENT_ID_DOC,
      format: String,
      nullable: true,
      default: null,
      env: 'AZURE_MDM_CLIENT_ID'
    },
    subscriptionKey: {
      doc: 'Azure APIM Subscription Key',
      format: String,
      nullable: true,
      default: null,
      sensitive: true,
      env: 'AZURE_MDM_SUBSCRIPTION_KEY'
    },
    internalAPIMScope: {
      doc: 'Azure APIM Internal Scope',
      format: String,
      nullable: true,
      default: null,
      env: 'AZURE_MDM_INTERNAL_APIM_SCOPE'
    },
    internalAPIMEndpoint: {
      doc: 'Azure APIM Internal Endpoint',
      format: String,
      nullable: true,
      default: null,
      env: 'AZURE_MDM_INTERNAL_APIM_ENDPOINT'
    },
    getIneligibleItemsEndpoint: {
      doc: 'Azure APIM Get Ineligible Items Endpoint',
      format: String,
      nullable: true,
      default: null,
      env: 'AZURE_MDM_GET_INELIGIBLE_ITEMS_ENDPOINT'
    }
  },
  ineligibleItemsCache: {
    readEnabled: {
      doc: 'Enable or disable reading ineligible items from S3',
      format: Boolean,
      default: true,
      env: 'INELIGIBLE_ITEMS_READ_ENABLED'
    },
    s3FileName: {
      doc: 'S3 file name for ineligible items data (without extension)',
      format: String,
      default: 'ineligible-items',
      env: 'INELIGIBLE_ITEMS_S3_FILE_NAME'
    },
    s3Schema: {
      doc: 'S3 schema/prefix for ineligible items file',
      format: String,
      nullable: true,
      default: 'cache',
      env: 'INELIGIBLE_ITEMS_S3_SCHEMA'
    },
    maxRetries: {
      doc: 'Maximum number of retry attempts when fetching ineligible items from S3',
      format: 'nat',
      default: 3,
      env: 'INELIGIBLE_ITEMS_MAX_RETRIES'
    },
    retryDelayMs: {
      doc: 'Delay in milliseconds between retry attempts for ineligible items',
      format: 'nat',
      default: 2000,
      env: 'INELIGIBLE_ITEMS_RETRY_DELAY_MS'
    }
  }
})

config.validate({ allowed: 'strict' })

export { config }
