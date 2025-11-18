"""
Celery Application Configuration
"""
from celery import Celery
from app.core.config import settings

# Create Celery app
celery_app = Celery(
    "bazarlar_tasks",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL
)

# Celery configuration
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Bishkek",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutes
    task_soft_time_limit=25 * 60,  # 25 minutes
)

# Auto-discover tasks from all registered apps
celery_app.autodiscover_tasks(['app.tasks'])


# Example periodic tasks (commented out - uncomment when needed)
# from celery.schedules import crontab
#
# celery_app.conf.beat_schedule = {
#     'check-expired-promotions': {
#         'task': 'app.tasks.check_expired_promotions',
#         'schedule': crontab(minute='*/30'),  # Every 30 minutes
#     },
#     'process-pending-withdrawals': {
#         'task': 'app.tasks.process_withdrawals',
#         'schedule': crontab(hour='*/2'),  # Every 2 hours
#     },
# }
