import logging
import asyncio
from datetime import datetime, time
from typing import Callable, Optional
import os

logger = logging.getLogger(__name__)


class Scheduler:
    """Daily scheduler for running the auto-update process."""
    
    def __init__(self, run_time: str = "06:00", timezone: str = "UTC"):
        self.run_time = self._parse_time(run_time)
        self.timezone = timezone
        self.is_running = False
        self.last_run: Optional[datetime] = None
        self.last_status: Optional[str] = None
    
    def _parse_time(self, time_str: str) -> time:
        """Parse time string to time object."""
        hour, minute = map(int, time_str.split(":"))
        return time(hour, minute)
    
    async def run_once(self, callback: Callable):
        """Run the scheduler once (for manual trigger)."""
        logger.info("Running scheduler once (manual trigger)")
        try:
            result = await callback()
            self.last_run = datetime.now()
            self.last_status = "success"
            return result
        except Exception as e:
            self.last_run = datetime.now()
            self.last_status = f"failed: {str(e)}"
            logger.error(f"Scheduler run failed: {e}")
            raise
    
    async def run_daily(self, callback: Callable, stop_event: asyncio.Event):
        """Run the scheduler daily at the specified time."""
        self.is_running = True
        logger.info(f"Scheduler started - will run daily at {self.run_time}")
        
        while not stop_event.is_set():
            now = datetime.now()
            current_time = now.time()
            
            # Check if it's time to run
            if current_time >= self.run_time:
                # Check if we already ran today
                if self.last_run:
                    last_run_date = self.last_run.date()
                    if last_run_date == now.date():
                        # Already ran today, wait for tomorrow
                        logger.info("Already ran today, waiting for next scheduled time")
                        await self._wait_until_tomorrow(stop_event)
                        continue
                
                # Run the update
                try:
                    logger.info("Starting daily update run")
                    await callback()
                    self.last_run = datetime.now()
                    self.last_status = "success"
                    logger.info("Daily update completed successfully")
                except Exception as e:
                    self.last_run = datetime.now()
                    self.last_status = f"failed: {str(e)}"
                    logger.error(f"Daily update failed: {e}")
                    # Send alert on failure (would integrate with alerting)
                
                # Wait until tomorrow
                await self._wait_until_tomorrow(stop_event)
            else:
                # Wait a bit before checking again
                await asyncio.sleep(60)  # Check every minute
        
        self.is_running = False
        logger.info("Scheduler stopped")
    
    async def _wait_until_tomorrow(self, stop_event: asyncio.Event):
        """Wait until tomorrow's scheduled time."""
        now = datetime.now()
        tomorrow = now.date()
        
        # Calculate seconds until tomorrow's run time
        target = datetime.combine(tomorrow, self.run_time)
        if target <= now:
            target = datetime.combine(tomorrow + __import__('datetime').timedelta(days=1), self.run_time)
        
        wait_seconds = (target - now).total_seconds()
        
        # Wait in chunks to allow for clean shutdown
        while wait_seconds > 0 and not stop_event.is_set():
            chunk = min(wait_seconds, 60)  # Check every minute
            await asyncio.sleep(chunk)
            wait_seconds -= chunk
    
    def get_status(self) -> dict:
        """Get scheduler status."""
        return {
            "is_running": self.is_running,
            "last_run": self.last_run.isoformat() if self.last_run else None,
            "last_status": self.last_status,
            "scheduled_time": self.run_time.isoformat(),
            "timezone": self.timezone
        }


def create_scheduler_from_config(config: dict = None) -> Scheduler:
    """Create scheduler from configuration."""
    if config is None:
        config = {"run_time": "06:00", "timezone": "UTC"}
    
    return Scheduler(
        run_time=config.get("run_time", "06:00"),
        timezone=config.get("timezone", "UTC")
    )
