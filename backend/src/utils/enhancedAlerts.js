import { AlertsService } from '../modules/alerts/alerts.service.js';
import { logger } from './logger.js';

/**
 * Enhanced alerting system with customizable rules
 */
export const EnhancedAlerts = {
    // Check and create alerts based on advanced rules
    async checkAndCreateAlerts(monitorId, metric, monitorConfig) {
        const alerts = [];
        const {
            alertRules = {},
            thresholdMs = 500,
        } = monitorConfig;

        try {
            // Rule 1: Response time threshold
            if (metric.responseTime > thresholdMs) {
                const severity = metric.responseTime > thresholdMs * 2 ? 'error' : 'warning';
                alerts.push({
                    monitorId,
                    message: `Response time ${metric.responseTime}ms exceeds threshold of ${thresholdMs}ms`,
                    severity,
                });
            }

            // Rule 2: Status code alerts
            if (!metric.success || (metric.statusCode >= 400)) {
                let severity = 'warning';
                if (metric.statusCode >= 500) {
                    severity = 'error';
                } else if (metric.statusCode === 404) {
                    severity = 'info';
                }

                alerts.push({
                    monitorId,
                    message: `HTTP ${metric.statusCode}: ${metric.errorMessage || 'Request failed'}`,
                    severity,
                });
            }

            // Rule 3: Custom response time rules
            if (alertRules.responseTime && alertRules.responseTime.enabled) {
                const { critical, warning } = alertRules.responseTime;
                if (critical && metric.responseTime > critical) {
                    alerts.push({
                        monitorId,
                        message: `Critical: Response time ${metric.responseTime}ms exceeds critical threshold of ${critical}ms`,
                        severity: 'error',
                    });
                } else if (warning && metric.responseTime > warning) {
                    alerts.push({
                        monitorId,
                        message: `Warning: Response time ${metric.responseTime}ms exceeds warning threshold of ${warning}ms`,
                        severity: 'warning',
                    });
                }
            }

            // Rule 4: Status code pattern matching
            if (alertRules.statusCodes && alertRules.statusCodes.enabled) {
                const { codes = [] } = alertRules.statusCodes;
                if (codes.includes(metric.statusCode)) {
                    alerts.push({
                        monitorId,
                        message: `Alert: Status code ${metric.statusCode} matches alert pattern`,
                        severity: 'warning',
                    });
                }
            }

            // Rule 5: Consecutive failures
            if (alertRules.consecutiveFailures && alertRules.consecutiveFailures.enabled) {
                const { count = 3 } = alertRules.consecutiveFailures;
                // This would require checking previous metrics
                // For now, we'll rely on the basic failure check
            }

            // Create alerts (errors are handled inside createAlert, so we don't need to catch here)
            for (const alertData of alerts) {
                const result = await AlertsService.createAlert(
                    alertData.monitorId,
                    alertData.message,
                    alertData.severity
                );
                if (result) {
                    logger.info('Alert created', alertData);
                } else {
                    logger.warn('Alert creation returned null (likely failed silently)', alertData);
                }
            }

            return alerts;
        } catch (error) {
            logger.error('Error checking alerts', { error: error.message });
            return [];
        }
    },

    // Evaluate alert rules
    evaluateRules(metric, rules) {
        const triggeredRules = [];

        if (rules.responseTime) {
            if (metric.responseTime > rules.responseTime.critical) {
                triggeredRules.push('response_time_critical');
            } else if (metric.responseTime > rules.responseTime.warning) {
                triggeredRules.push('response_time_warning');
            }
        }

        if (rules.statusCodes && rules.statusCodes.includes(metric.statusCode)) {
            triggeredRules.push('status_code_alert');
        }

        return triggeredRules;
    },
};

