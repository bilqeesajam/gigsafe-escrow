# transactions/scheduler.py

from apscheduler.schedulers.background import BackgroundScheduler
from django.utils import timezone
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)


def auto_release_funded_transactions():
    """
    Runs every hour.
    If a transaction has been in 'hold' for more than 1 day
    and the buyer has not confirmed delivery, auto-release to seller.
    """
    from .models import Transaction
    from .release import ReleaseService

    cutoff = timezone.now() - timedelta(days=1)

    transactions = Transaction.objects.filter(
        type='hold',
        created_at__lte=cutoff,
        delivered_at__isnull=True,
    )

    print(f"\nAUTO-RELEASE CHECK: {transactions.count()} transaction(s) eligible")

    for transaction in transactions:
        try:
            print(f"  Auto-releasing transaction {transaction.id}")
            release_service = ReleaseService(transaction)
            result = release_service.release_funds()

            if result.get('success'):
                print(f"  Transaction {transaction.id} auto-released successfully")
            else:
                print(f"  Transaction {transaction.id} auto-release failed: {result.get('error')}")

        except Exception as e:
            logger.error(f"Auto-release error for transaction {transaction.id}: {e}")


def expire_unfunded_transactions():
    """
    Runs every hour.
    Transactions in 'hold' with no payfast_payment_id older than 7 days
    are marked as expired via the note field.
    """
    from .models import Transaction

    cutoff = timezone.now() - timedelta(days=7)

    transactions = Transaction.objects.filter(
        type='hold',
        payfast_payment_id__isnull=True,
        created_at__lte=cutoff,
    )

    print(f"\nEXPIRY CHECK: {transactions.count()} transaction(s) eligible")

    for transaction in transactions:
        try:
            transaction.note = (transaction.note or '') + ' | EXPIRED: no payment received within 7 days'
            transaction.save()
            print(f"  Transaction {transaction.id} marked as expired in note")

        except Exception as e:
            logger.error(f"Expiry error for transaction {transaction.id}: {e}")


def start():
    """Start the background scheduler"""
    scheduler = BackgroundScheduler()

    scheduler.add_job(
        auto_release_funded_transactions,
        'interval',
        hours=1,
        id='auto_release',
        replace_existing=True,
    )

    scheduler.add_job(
        expire_unfunded_transactions,
        'interval',
        hours=1,
        id='expire_transactions',
        replace_existing=True,
    )

    scheduler.start()
    print("Scheduler started — auto-release and expiry jobs running every hour")