"""
Auto-Update AI Tools System

Main entry point for the daily AI tool discovery and update system.
"""

import asyncio
import logging
import signal
import os
import sys
from datetime import datetime

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Import modules
from auto_update.sources import SourceFactory, ConfigManager
from auto_update.verifier import Verifier
from auto_update.scheduler import create_scheduler_from_config
from auto_update.database import DatabaseManager
from auto_update.alerts import AlertManager, AuditLogger


class AutoUpdateSystem:
    """Main auto-update system orchestrator."""
    
    def __init__(self, config_path: str = None):
        self.config_manager = ConfigManager(config_path)
        self.db = DatabaseManager()
        self.verifier = Verifier()
        self.alerts = AlertManager(self.config_manager.config.get("alerts", {}))
        self.audit = AuditLogger()
        
        scheduler_config = self.config_manager.config.get("scheduler", {})
        self.scheduler = create_scheduler_from_config(scheduler_config)
        
        self.stop_event = asyncio.Event()
    
    async def run_update(self):
        """Run the complete update process."""
        logger.info("=" * 50)
        logger.info("Starting AI tools auto-update")
        logger.info("=" * 50)
        
        self.audit.log_run_start()
        
        stats = {
            "fetched": 0,
            "verified": 0,
            "added": 0,
            "skipped": 0,
            "failed": 0
        }
        
        try:
            # 1. Fetch tools from all sources
            logger.info("Fetching tools from sources...")
            tools = await SourceFactory.fetch_from_all_sources(self.config_manager)
            stats["fetched"] = len(tools)
            logger.info(f"Fetched {len(tools)} tools from sources")
            
            # 2. Verify each tool
            logger.info("Verifying tools...")
            verified_tools = []
            for tool in tools:
                passed, verified_tool = await self.verifier.verify_tool(tool)
                if passed:
                    verified_tools.append(verified_tool)
                    stats["verified"] += 1
                else:
                    stats["failed"] += 1
                    logger.warning(f"Verification failed for: {tool.get('name')}")
            
            logger.info(f"Verified {len(verified_tools)} tools")
            
            # 3. Add verified tools to database
            logger.info("Adding tools to database...")
            add_stats = await self.db.add_tools_batch(verified_tools)
            stats["added"] = add_stats["added"]
            stats["skipped"] = add_stats["skipped"]
            
            logger.info(f"Added {add_stats['added']} new tools")
            logger.info(f"Skipped {add_stats['skipped']} duplicate tools")
            
            # 4. Log completion
            self.audit.log_run_end(stats)
            logger.info("Update completed successfully")
            
            return stats
            
        except Exception as e:
            logger.error(f"Update failed: {e}")
            await self.alerts.alert_run_failure(e)
            raise
    
    async def run_daily(self):
        """Run the scheduler for daily updates."""
        logger.info("Starting daily scheduler...")
        
        # Setup signal handlers
        def signal_handler(sig, frame):
            logger.info("Received shutdown signal")
            self.stop_event.set()
        
        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)
        
        # Run scheduler
        await self.scheduler.run_daily(self.run_update, self.stop_event)
    
    async def run_once(self):
        """Run update once (for manual trigger)."""
        await self.scheduler.run_once(self.run_update)
    
    async def check_availability(self):
        """Check availability of existing tools (weekly)."""
        logger.info("Checking tool availability...")
        
        try:
            stats = await self.db.check_availability()
            logger.info(f"Availability check complete: {stats}")
            return stats
        except Exception as e:
            logger.error(f"Availability check failed: {e}")
            await self.alerts.alert_run_failure(e)
            raise


async def main():
    """Main entry point."""
    # Check for command line args
    mode = sys.argv[1] if len(sys.argv) > 1 else "once"
    
    system = AutoUpdateSystem()
    
    if mode == "daily":
        await system.run_daily()
    elif mode == "once":
        await system.run_once()
    elif mode == "check":
        await system.check_availability()
    else:
        print(f"Unknown mode: {mode}")
        print("Usage: python main.py [once|daily|check]")


if __name__ == "__main__":
    asyncio.run(main())
