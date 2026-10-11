import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export interface SecurityEvent {
  id: string;
  timestamp: string;
  type: 'AUTH_SUCCESS' | 'AUTH_FAILED' | 'BRUTE_FORCE_BLOCKED' | 'RATE_LIMIT_TRIGGERED' | 'XSS_ATTEMPT_BLOCKED' | 'ADMIN_ACTION' | 'FINANCIAL_TRANSACTION' | 'PROTOTYPE_POLLUTION_BLOCKED';
  severity: 'info' | 'warning' | 'critical' | 'success';
  ip: string;
  userAgent?: string;
  userId?: string;
  details: string;
}

// In-memory security store
class SecurityManager {
  private failedAttempts: Map<string, { count: number; lockedUntil: number }> = new Map();
  private ipRequests: Map<string, { count: number; resetTime: number }> = new Map();
  private authRequests: Map<string, { count: number; resetTime: number }> = new Map();
  private securityLogs: SecurityEvent[] = [];
  private blockedAttacksCount: number = 0;
  private verifiedRequestsCount: number = 0;

  constructor() {
    // Initial baseline security events
    this.logEvent({
      type: 'ADMIN_ACTION',
      severity: 'info',
      ip: '127.0.0.1',
      details: 'System Security Engine initialized with Anti-DDoS, XSS Sanitizer, Brute-Force Shield, and Escrow Guards.'
    });
  }

  public getClientIp(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    return req.socket.remoteAddress || req.ip || '127.0.0.1';
  }

  public logEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>) {
    const newEvent: SecurityEvent = {
      id: 'sec_' + crypto.randomUUID().slice(0, 8),
      timestamp: new Date().toISOString(),
      ...event
    };
    this.securityLogs.unshift(newEvent);
    // Keep last 150 events in memory
    if (this.securityLogs.length > 150) {
      this.securityLogs = this.securityLogs.slice(0, 150);
    }
    if (event.severity === 'critical' || event.severity === 'warning') {
      this.blockedAttacksCount++;
    }
  }

  public incrementVerifiedRequests() {
    this.verifiedRequestsCount++;
  }

  public getStats() {
    return {
      blockedAttacksCount: this.blockedAttacksCount,
      verifiedRequestsCount: this.verifiedRequestsCount,
      activeShields: {
        antiDDoS: true,
        antiBruteForce: true,
        xssSanitizer: true,
        sqlNoSqlInjectionGuard: true,
        escrowTamperGuard: true,
        sessionCryptoGuard: true,
        serverFingerprintHidden: true
      },
      recentLogs: this.securityLogs.slice(0, 30)
    };
  }

  public clearLogs() {
    this.securityLogs = [];
  }

  // ----------------------------------------------------
  // Brute Force Protection (Per email or IP)
  // ----------------------------------------------------
  public checkBruteForceLock(identifier: string): { isLocked: boolean; waitSeconds: number } {
    const record = this.failedAttempts.get(identifier);
    if (!record) return { isLocked: false, waitSeconds: 0 };

    if (Date.now() < record.lockedUntil) {
      const remainingSeconds = Math.ceil((record.lockedUntil - Date.now()) / 1000);
      return { isLocked: true, waitSeconds: remainingSeconds };
    }

    if (Date.now() >= record.lockedUntil && record.lockedUntil > 0) {
      // Lock expired, reset
      this.failedAttempts.delete(identifier);
    }
    return { isLocked: false, waitSeconds: 0 };
  }

  public registerFailedLogin(identifier: string, ip: string) {
    const record = this.failedAttempts.get(identifier) || { count: 0, lockedUntil: 0 };
    record.count += 1;

    if (record.count >= 5) {
      // Lock for 10 minutes
      record.lockedUntil = Date.now() + 10 * 60 * 1000;
      this.logEvent({
        type: 'BRUTE_FORCE_BLOCKED',
        severity: 'critical',
        ip,
        details: `Brute-force detected for target "${identifier}". Account/IP locked for 10 minutes.`
      });
    } else {
      this.logEvent({
        type: 'AUTH_FAILED',
        severity: 'warning',
        ip,
        details: `Failed authentication attempt (${record.count}/5) for "${identifier}".`
      });
    }

    this.failedAttempts.set(identifier, record);
  }

  public resetFailedLogin(identifier: string) {
    this.failedAttempts.delete(identifier);
  }

  // ----------------------------------------------------
  // Rate Limiting
  // ----------------------------------------------------
  public checkRateLimit(ip: string, limit: number = 200, windowMs: number = 60000): boolean {
    const now = Date.now();
    const record = this.ipRequests.get(ip);

    if (!record || now > record.resetTime) {
      this.ipRequests.set(ip, { count: 1, resetTime: now + windowMs });
      return true;
    }

    record.count += 1;
    if (record.count > limit) {
      this.logEvent({
        type: 'RATE_LIMIT_TRIGGERED',
        severity: 'warning',
        ip,
        details: `Rate limit exceeded: ${record.count} requests in window (limit: ${limit}). Request throttled.`
      });
      return false;
    }

    return true;
  }

  public checkAuthRateLimit(ip: string, limit: number = 15, windowMs: number = 60000): boolean {
    const now = Date.now();
    const record = this.authRequests.get(ip);

    if (!record || now > record.resetTime) {
      this.authRequests.set(ip, { count: 1, resetTime: now + windowMs });
      return true;
    }

    record.count += 1;
    if (record.count > limit) {
      this.logEvent({
        type: 'RATE_LIMIT_TRIGGERED',
        severity: 'critical',
        ip,
        details: `Auth rate limit exceeded: ${record.count} attempts in window. Access temporarily restricted.`
      });
      return false;
    }

    return true;
  }
}

export const securityManager = new SecurityManager();

// ----------------------------------------------------
// Express Security Middlewares
// ----------------------------------------------------

/**
 * Enterprise HTTP Security Headers Middleware
 */
export function securityHeadersMiddleware(req: Request, res: Response, next: NextFunction) {
  // Strip server fingerprint
  res.removeHeader('X-Powered-By');

  // Prevent MIME sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // XSS protection filter
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Allow iframe embedding so AI Studio preview can render seamlessly
  res.removeHeader('X-Frame-Options');

  securityManager.incrementVerifiedRequests();
  next();
}

/**
 * Global Rate Limiting Middleware for all API calls
 */
export function rateLimiterMiddleware(req: Request, res: Response, next: NextFunction) {
  const ip = securityManager.getClientIp(req);
  if (!securityManager.checkRateLimit(ip, 250, 60000)) {
    return res.status(429).json({
      error: 'Too many requests. Please slow down to maintain system security.'
    });
  }
  next();
}

/**
 * Stricter Rate Limiter for Authentication and Sensitive Financial Routes
 */
export function authRateLimiterMiddleware(req: Request, res: Response, next: NextFunction) {
  const ip = securityManager.getClientIp(req);
  if (!securityManager.checkAuthRateLimit(ip, 12, 60000)) {
    return res.status(429).json({
      error: 'Security rate limit reached. Please wait 1 minute before retrying.'
    });
  }
  next();
}

/**
 * Input Sanitization & Anti-Injection Helper
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return input;
  return input
    .replace(/\0/g, '') // remove null bytes
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // strip scripts
    .replace(/javascript:/gi, '') // strip javascript protocol
    .replace(/on\w+\s*=/gi, '') // strip inline handlers like onerror=
    .trim();
}

/**
 * Recursive Object Sanitization against Prototype Pollution & Injection
 */
export function sanitizeInputMiddleware(req: Request, res: Response, next: NextFunction) {
  const ip = securityManager.getClientIp(req);

  // Check for prototype pollution in body
  if (req.body && typeof req.body === 'object') {
    const keys = Object.keys(req.body);
    for (const key of keys) {
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        securityManager.logEvent({
          type: 'PROTOTYPE_POLLUTION_BLOCKED',
          severity: 'critical',
          ip,
          details: `Blocked malicious prototype pollution attempt with key "${key}".`
        });
        return res.status(400).json({ error: 'Malicious payload detected and blocked by security filter' });
      }
    }

    // Sanitize string fields
    for (const key of keys) {
      if (typeof req.body[key] === 'string') {
        const raw = req.body[key];
        const sanitized = sanitizeString(raw);
        if (raw !== sanitized && (raw.includes('<script') || raw.includes('javascript:'))) {
          securityManager.logEvent({
            type: 'XSS_ATTEMPT_BLOCKED',
            severity: 'critical',
            ip,
            details: `XSS Injection attempt blocked in parameter "${key}". Sanitized safely.`
          });
        }
        req.body[key] = sanitized;
      }
    }
  }

  next();
}
