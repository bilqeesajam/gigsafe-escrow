from django.apps import AppConfig


class TransactionsConfig(AppConfig):
    name = 'transactions'

    def ready(self):
        """Start the scheduler when Django starts"""
        import os
        # Only start scheduler in the main process, not in the reloader
        if os.environ.get('RUN_MAIN') == 'true':
            from . import scheduler
            scheduler.start()