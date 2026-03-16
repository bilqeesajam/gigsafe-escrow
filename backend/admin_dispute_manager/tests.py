from django.test import TestCase, Client
from django.urls import reverse
from unittest.mock import patch, MagicMock
import json
import uuid as uuid_lib


class DisputeRoutesTestCase(TestCase):
    """Test cases for dispute management routes."""

    def setUp(self):
        """Set up test client."""
        self.client = Client()
        self.test_uuid = '550e8400-e29b-41d4-a716-446655440000'

    def _mock_dispute(self, uuid_str=None):
        """Create a mock dispute response."""
        if uuid_str is None:
            uuid_str = self.test_uuid
        return {
            'id': uuid_str,
            'gig_id': 'test-gig-id',
            'raised_by': 'test-user',
            'reason': 'test-reason',
            'status': 'open',
            'admin_notes': '',
            'resolved_at': None,
            'created_at': '2024-01-01T00:00:00Z',
        }

    def test_list_disputes_route_exists(self):
        """Test that the list_disputes route exists and is accessible."""
        with patch('admin_dispute_manager.views.supabase') as mock_supabase:
            mock_supabase.table.return_value.select.return_value.order.return_value.execute.return_value = MagicMock(data=[])
            response = self.client.get('/api/disputes/')
            # Should not get a 404, even if Supabase returns empty
            self.assertNotEqual(response.status_code, 404)

    def test_list_disputes_by_status_open_route_exists(self):
        """Test that the list_disputes_by_status route with 'open' status exists."""
        with patch('admin_dispute_manager.views.supabase') as mock_supabase:
            mock_supabase.table.return_value.select.return_value.order.return_value.eq.return_value.execute.return_value = MagicMock(data=[])
            response = self.client.get('/api/disputes/status/open')
            self.assertNotEqual(response.status_code, 404)

    def test_list_disputes_by_status_under_review_route_exists(self):
        """Test that the list_disputes_by_status route with 'under_review' status exists."""
        with patch('admin_dispute_manager.views.supabase') as mock_supabase:
            mock_supabase.table.return_value.select.return_value.order.return_value.eq.return_value.execute.return_value = MagicMock(data=[])
            response = self.client.get('/api/disputes/status/under_review/')
            self.assertNotEqual(response.status_code, 404)

    def test_list_disputes_by_status_resolved_client_route_exists(self):
        """Test that the list_disputes_by_status route with 'resolved_client' status exists."""
        with patch('admin_dispute_manager.views.supabase') as mock_supabase:
            mock_supabase.table.return_value.select.return_value.order.return_value.eq.return_value.execute.return_value = MagicMock(data=[])
            response = self.client.get('/api/disputes/status/resolved_client/')
            self.assertNotEqual(response.status_code, 404)

    def test_list_disputes_by_status_resolved_hustler_route_exists(self):
        """Test that the list_disputes_by_status route with 'resolved_hustler' status exists."""
        with patch('admin_dispute_manager.views.supabase') as mock_supabase:
            mock_supabase.table.return_value.select.return_value.order.return_value.eq.return_value.execute.return_value = MagicMock(data=[])
            response = self.client.get('/api/disputes/status/resolved_hustler/')
            self.assertNotEqual(response.status_code, 404)

    def test_list_disputes_by_status_dynamic_route_exists(self):
        """Test that the dynamic list_disputes_by_status route exists."""
        with patch('admin_dispute_manager.views.supabase') as mock_supabase:
            mock_supabase.table.return_value.select.return_value.order.return_value.eq.return_value.execute.return_value = MagicMock(data=[])
            response = self.client.get('/api/disputes/status/open/')
            self.assertNotEqual(response.status_code, 404)

    def test_dispute_detail_route_exists(self):
        """Test that the dispute_detail route exists."""
        with patch('admin_dispute_manager.views.supabase') as mock_supabase:
            mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = MagicMock(data=[self._mock_dispute()])
            response = self.client.get(f'/api/disputes/{self.test_uuid}/')
            self.assertNotEqual(response.status_code, 404)

    def test_dispute_admin_notes_get_route_exists(self):
        """Test that the dispute_admin_notes GET route exists."""
        with patch('admin_dispute_manager.views.supabase') as mock_supabase:
            mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = MagicMock(data=[self._mock_dispute()])
            response = self.client.get(f'/api/disputes/{self.test_uuid}/admin-notes/')
            self.assertNotEqual(response.status_code, 404)

    def test_dispute_internal_notes_get_route_exists(self):
        """Test that the dispute_internal_notes GET route exists (legacy)."""
        with patch('admin_dispute_manager.views.supabase') as mock_supabase:
            mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = MagicMock(data=[self._mock_dispute()])
            response = self.client.get(f'/api/disputes/{self.test_uuid}/internal-notes/')
            self.assertNotEqual(response.status_code, 404)

    def test_dispute_decision_release_to_seller_route_exists(self):
        """Test that the dispute_decision_release_to_seller route exists."""
        with patch('admin_dispute_manager.views.supabase') as mock_supabase:
            mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = MagicMock(data=[self._mock_dispute()])
            response = self.client.post(f'/api/disputes/{self.test_uuid}/decisions/release-to-seller/')
            self.assertNotEqual(response.status_code, 404)

    def test_dispute_decision_refund_buyer_route_exists(self):
        """Test that the dispute_decision_refund_buyer route exists."""
        with patch('admin_dispute_manager.views.supabase') as mock_supabase:
            mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = MagicMock(data=[self._mock_dispute()])
            response = self.client.post(f'/api/disputes/{self.test_uuid}/decisions/refund-buyer/')
            self.assertNotEqual(response.status_code, 404)

    def test_dispute_decision_split_route_exists(self):
        """Test that the dispute_decision_split route exists."""
        with patch('admin_dispute_manager.views.supabase') as mock_supabase:
            mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = MagicMock(data=[self._mock_dispute()])
            response = self.client.post(f'/api/disputes/{self.test_uuid}/decisions/split/')
            self.assertNotEqual(response.status_code, 404)

    def test_dispute_decision_logs_route_exists(self):
        """Test that the dispute_decision_logs route exists."""
        with patch('admin_dispute_manager.views.supabase') as mock_supabase:
            mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = MagicMock(data=[self._mock_dispute()])
            response = self.client.get(f'/api/disputes/{self.test_uuid}/decision-logs/')
            self.assertNotEqual(response.status_code, 404)

    def test_dispute_sla_route_exists(self):
        """Test that the dispute_sla route exists."""
        with patch('admin_dispute_manager.views.supabase') as mock_supabase:
            mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = MagicMock(data=[self._mock_dispute()])
            response = self.client.get(f'/api/disputes/{self.test_uuid}/sla/')
            self.assertNotEqual(response.status_code, 404)

