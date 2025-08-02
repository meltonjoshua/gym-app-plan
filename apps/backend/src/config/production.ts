// FitTracker Pro - Production Configuration
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables
config();

interface DatabaseConfig {
  uri: string;
  options: {
    maxPoolSize: number;
    minPoolSize: number;
    maxIdleTimeMS: number;
    serverSelectionTimeoutMS: number;
    socketTimeoutMS: number;
    bufferMaxEntries: number;
    retryWrites: boolean;
    retryReads: boolean;
    readPreference: 'primary' | 'primaryPreferred' | 'secondary' | 'secondaryPreferred' | 'nearest';
  };
}

interface RedisConfig {
  url: string;
  options: {
    maxRetriesPerRequest: number;
    retryDelayOnFailover: number;
    enableReadyCheck: boolean;
    connectTimeout: number;
    commandTimeout: number;
    lazyConnect: true;
    keepAlive: number;
    family: number;
  };
}

interface SecurityConfig {
  jwt: {
    secret: string;
    refreshSecret: string;
    expiresIn: string;
    refreshExpiresIn: string;
    issuer: string;
    audience: string;
  };
  bcrypt: {
    rounds: number;
  };
  cors: {
    origin: string | string[];
    credentials: boolean;
    methods: string[];
    allowedHeaders: string[];
    maxAge: number;
  };
  rateLimit: {
    windowMs: number;
    max: number;
    standardHeaders: boolean;
    legacyHeaders: boolean;
  };
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: string[];
        styleSrc: string[];
        scriptSrc: string[];
        imgSrc: string[];
        connectSrc: string[];
        fontSrc: string[];
        objectSrc: string[];
        mediaSrc: string[];
        frameSrc: string[];
      };
    };
    hsts: {
      maxAge: number;
      includeSubDomains: boolean;
      preload: boolean;
    };
  };
}

interface ProductionConfig {
  app: {
    name: string;
    version: string;
    env: 'production';
    port: number;
    host: string;
    baseUrl: string;
    apiPrefix: string;
    timezone: string;
  };
  database: DatabaseConfig;
  redis: RedisConfig;
  security: SecurityConfig;
  monitoring: {
    sentry: {
      dsn: string;
      environment: string;
      tracesSampleRate: number;
      profilesSampleRate: number;
    };
    newRelic: {
      licenseKey: string;
      appName: string;
      logLevel: 'error' | 'warn' | 'info' | 'debug' | 'trace';
    };
    prometheus: {
      enabled: boolean;
      port: number;
      route: string;
    };
  };
  logging: {
    level: 'error' | 'warn' | 'info' | 'debug';
    format: 'json' | 'simple';
    transports: {
      console: boolean;
      file: {
        enabled: boolean;
        level: string;
        filename: string;
        maxSize: string;
        maxFiles: number;
      };
    };
  };
  email: {
    service: string;
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
    from: {
      name: string;
      address: string;
    };
  };
  payments: {
    stripe: {
      secretKey: string;
      webhookSecret: string;
      apiVersion: string;
    };
    revenueCat: {
      secretKey: string;
      webhook: {
        secret: string;
        endpoint: string;
      };
    };
  };
  notifications: {
    push: {
      fcm: {
        serverKey: string;
        senderId: string;
      };
      apns: {
        keyId: string;
        teamId: string;
        bundleId: string;
        production: boolean;
      };
    };
    email: {
      templates: {
        welcome: string;
        passwordReset: string;
        emailVerification: string;
        workoutReminder: string;
        goalAchievement: string;
      };
    };
  };
  integrations: {
    googleMaps: {
      apiKey: string;
    };
    nutritionix: {
      appId: string;
      apiKey: string;
    };
    healthApis: {
      googleFit: {
        clientId: string;
        clientSecret: string;
      };
      appleHealthKit: {
        bundleId: string;
      };
      fitbit: {
        clientId: string;
        clientSecret: string;
      };
    };
  };
  storage: {
    uploads: {
      destination: string;
      maxFileSize: number;
      allowedMimeTypes: string[];
    };
    s3: {
      bucket: string;
      region: string;
      accessKeyId: string;
      secretAccessKey: string;
      signedUrlExpiration: number;
    };
  };
  features: {
    aiInsights: {
      enabled: boolean;
      apiEndpoint: string;
      apiKey: string;
      maxRequestsPerDay: number;
    };
    socialFeatures: {
      enabled: boolean;
      maxFriendsPerUser: number;
      challengeExpirationDays: number;
    };
    premiumFeatures: {
      enabled: boolean;
      trialDays: number;
      subscriptionPlans: string[];
    };
    enterpriseFeatures: {
      enabled: boolean;
      maxUsersPerOrganization: number;
      advancedAnalytics: boolean;
    };
  };
}

// Helper function to get package.json version
const getAppVersion = (): string => {
  try {
    const packageJson = JSON.parse(readFileSync(join(__dirname, '../../package.json'), 'utf8'));
    return packageJson.version || '1.0.0';
  } catch {
    return '1.0.0';
  }
};

// Validate required environment variables
const requiredEnvVars = [
  'MONGODB_URI',
  'REDIS_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'STRIPE_SECRET_KEY',
  'REVENUE_CAT_SECRET',
  'EMAIL_USER',
  'EMAIL_PASSWORD',
  'FCM_SERVER_KEY',
  'GOOGLE_MAPS_API_KEY'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

export const productionConfig: ProductionConfig = {
  app: {
    name: 'FitTracker Pro',
    version: getAppVersion(),
    env: 'production',
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || '0.0.0.0',
    baseUrl: process.env.API_BASE_URL || 'https://api.fittrackerpro.com',
    apiPrefix: '/api/v1',
    timezone: 'UTC'
  },

  database: {
    uri: process.env.MONGODB_URI!,
    options: {
      maxPoolSize: 20,
      minPoolSize: 5,
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferMaxEntries: 0,
      retryWrites: true,
      retryReads: true,
      readPreference: 'primary'
    }
  },

  redis: {
    url: process.env.REDIS_URL!,
    options: {
      maxRetriesPerRequest: 3,
      retryDelayOnFailover: 100,
      enableReadyCheck: true,
      connectTimeout: 10000,
      commandTimeout: 5000,
      lazyConnect: true,
      keepAlive: 30000,
      family: 4
    }
  },

  security: {
    jwt: {
      secret: process.env.JWT_SECRET!,
      refreshSecret: process.env.JWT_REFRESH_SECRET!,
      expiresIn: '15m',
      refreshExpiresIn: '7d',
      issuer: 'FitTracker Pro',
      audience: 'fittrackerpro.com'
    },
    bcrypt: {
      rounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10)
    },
    cors: {
      origin: process.env.CORS_ORIGIN?.split(',') || ['https://fittrackerpro.com'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
      maxAge: 86400 // 24 hours
    },
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '900000', 10), // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
      standardHeaders: true,
      legacyHeaders: false
    },
    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", "https:"],
          fontSrc: ["'self'", "https:", "data:"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"]
        }
      },
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true
      }
    }
  },

  monitoring: {
    sentry: {
      dsn: process.env.SENTRY_DSN || '',
      environment: 'production',
      tracesSampleRate: 0.1,
      profilesSampleRate: 0.1
    },
    newRelic: {
      licenseKey: process.env.NEW_RELIC_LICENSE_KEY || '',
      appName: 'FitTracker Pro Backend',
      logLevel: 'info'
    },
    prometheus: {
      enabled: true,
      port: 9090,
      route: '/api/metrics'
    }
  },

  logging: {
    level: 'info',
    format: 'json',
    transports: {
      console: true,
      file: {
        enabled: true,
        level: 'error',
        filename: 'logs/error.log',
        maxSize: '20m',
        maxFiles: 5
      }
    }
  },

  email: {
    service: process.env.EMAIL_SERVICE || 'gmail',
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER!,
      pass: process.env.EMAIL_PASSWORD!
    },
    from: {
      name: 'FitTracker Pro',
      address: process.env.EMAIL_FROM || 'noreply@fittrackerpro.com'
    }
  },

  payments: {
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY!,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
      apiVersion: '2023-10-16'
    },
    revenueCat: {
      secretKey: process.env.REVENUE_CAT_SECRET!,
      webhook: {
        secret: process.env.REVENUE_CAT_WEBHOOK_SECRET || '',
        endpoint: '/api/v1/webhooks/revenuecat'
      }
    }
  },

  notifications: {
    push: {
      fcm: {
        serverKey: process.env.FCM_SERVER_KEY!,
        senderId: process.env.FCM_SENDER_ID || ''
      },
      apns: {
        keyId: process.env.APNS_KEY_ID || '',
        teamId: process.env.APNS_TEAM_ID || '',
        bundleId: process.env.APNS_BUNDLE_ID || 'com.fittrackerpro.app',
        production: true
      }
    },
    email: {
      templates: {
        welcome: 'welcome',
        passwordReset: 'password-reset',
        emailVerification: 'email-verification',
        workoutReminder: 'workout-reminder',
        goalAchievement: 'goal-achievement'
      }
    }
  },

  integrations: {
    googleMaps: {
      apiKey: process.env.GOOGLE_MAPS_API_KEY!
    },
    nutritionix: {
      appId: process.env.NUTRITIONIX_APP_ID || '',
      apiKey: process.env.NUTRITIONIX_API_KEY || ''
    },
    healthApis: {
      googleFit: {
        clientId: process.env.GOOGLE_FIT_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_FIT_CLIENT_SECRET || ''
      },
      appleHealthKit: {
        bundleId: process.env.APPLE_HEALTHKIT_BUNDLE_ID || 'com.fittrackerpro.app'
      },
      fitbit: {
        clientId: process.env.FITBIT_CLIENT_ID || '',
        clientSecret: process.env.FITBIT_CLIENT_SECRET || ''
      }
    }
  },

  storage: {
    uploads: {
      destination: 'uploads/',
      maxFileSize: 50 * 1024 * 1024, // 50MB
      allowedMimeTypes: [
        'image/jpeg',
        'image/png',
        'image/webp',
        'video/mp4',
        'video/quicktime',
        'application/pdf'
      ]
    },
    s3: {
      bucket: process.env.AWS_S3_BUCKET || 'fittracker-prod-uploads',
      region: process.env.AWS_REGION || 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      signedUrlExpiration: 3600 // 1 hour
    }
  },

  features: {
    aiInsights: {
      enabled: true,
      apiEndpoint: process.env.AI_API_ENDPOINT || 'https://ai.fittrackerpro.com',
      apiKey: process.env.AI_API_KEY || '',
      maxRequestsPerDay: 1000
    },
    socialFeatures: {
      enabled: true,
      maxFriendsPerUser: 500,
      challengeExpirationDays: 30
    },
    premiumFeatures: {
      enabled: true,
      trialDays: 7,
      subscriptionPlans: ['basic', 'premium', 'pro']
    },
    enterpriseFeatures: {
      enabled: true,
      maxUsersPerOrganization: 10000,
      advancedAnalytics: true
    }
  }
};

export default productionConfig;
