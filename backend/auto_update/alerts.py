import logging
import json
from typing import Dict, Any, List
from datetime import datetime

logger = logging.getLogger(__name__)


class AlertManager:
    """Manage alerts for system events."""
    
    def __init__(self, config: Dict = None):
        self.config = config or {"enabled": True, "channels": ["log"]}
        self.enabled = self.config.get("enabled", True)
        self.channels = self.config.get("channels", ["log"])
    
    async def send_alert(self, message: str, level: str = "error", details: Dict = None):
        """Send an alert notification."""
        if not self.enabled:
            return
        
        alert = {
            "message": message,
            "level": level,
            "details": details or {},
            "timestamp": datetime.now().isoformat()
        }
        
        for channel in self.channels:
            try:
                await self._send_to_channel(channel, alert)
            except Exception as e:
                logger.error(f"Error sending alert to {channel}: {e}")
    
    async def _send_to_channel(self, channel: str, alert: Dict):
        """Send alert to specific channel."""
        if channel == "log":
            self._log_alert(alert)
        elif channel == "email":
            await self._send_email(alert)
        elif channel == "webhook":
            await self._send_webhook(alert)
        else:
            logger.warning(f"Unknown alert channel: {channel}")
    
    def _log_alert(self, alert: Dict):
        """Log alert to console/file."""
        if alert["level"] == "error":
            logger.error(f"ALERT: {alert['message']}")
        elif alert["level"] == "warning":
            logger.warning(f"ALERT: {alert['message']}")
        else:
            logger.info(f"ALERT: {alert['message']}")
    
    async def _send_email(self, alert: Dict):
        """Send email alert (placeholder)."""
        logger.info(f"Would send email: {alert['message']}")
        # Implement email sending here
    
    async def _send_webhook(self, alert: Dict):
        """Send webhook alert (placeholder)."""
        logger.info(f"Would send webhook: {alert['message']}")
        # Implement webhook sending here
    
    async def alert_run_failure(self, error: Exception, context: Dict = None):
        """Alert on scheduler run failure."""
        await self.send_alert(
            f"Auto-update run failed: {str(error)}",
            level="error",
            details=context or {}
        )
    
    async def alert_source_failure(self, source: str, error: Exception):
        """Alert on source fetch failure."""
        await self.send_alert(
            f"Source '{source}' failed: {str(error)}",
            level="warning",
            details={"source": source}
        )
    
    async def alert_verification_failure(self, tool_name: str, reason: str):
        """Alert on tool verification failure."""
        await self.send_alert(
            f"Tool verification failed: {tool_name} - {reason}",
            level="warning",
            details={"tool": tool_name, "reason": reason}
        )


class AuditLogger:
    """Audit logging for all operations."""
    
    def __init__(self, log_file: str = None):
        self.log_file = log_file or "auto_update_audit.log"
        self.entries: List[Dict] = []
    
    def log(self, action: str, details: Dict):
        """Log an audit entry."""
        entry = {
            "action": action,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.entries.append(entry)
        
        # Also log to file
        try:
            with open(self.log_file, 'a') as f:
                f.write(json.dumps(entry) + "\n")
        except Exception as e:
            logger.error(f"Error writing audit log: {e}")
    
    def log_run_start(self):
        """Log run start."""
        self.log("run_start", {"message": "Daily update run started"})
    
    def log_run_end(self, stats: Dict):
        """Log run end."""
        self.log("run_end", stats)
    
    def log_tool_added(self, tool: Dict):
        """Log tool addition."""
        self.log("tool_added", {"name": tool.get("name"), "url": tool.get("url")})
    
    def log_tool_updated(self, tool_id: str, updates: Dict):
        """Log tool update."""
        self.log("tool_updated", {"tool_id": tool_id, "updates": list(updates.keys())})
    
    def log_tool_skipped(self, tool: Dict, reason: str):
        """Log tool skipped."""
        self.log("tool_skipped", {"name": tool.get("name"), "reason": reason})
    
    def get_recent_logs(self, limit: int = 100) -> List[Dict]:
        """Get recent audit logs."""
        return self.entries[-limit:]
