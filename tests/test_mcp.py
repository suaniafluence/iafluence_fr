"""Tests de l'API des outils MCP (chatbot/backend/mcp.py)."""
import pytest
from flask import Flask

from chatbot.backend.mcp import mcp_bp, MCP_TOOLS, OFFERS


@pytest.fixture
def client():
    app = Flask(__name__)
    app.register_blueprint(mcp_bp)
    app.config['TESTING'] = True
    return app.test_client()


def test_tool_discovery_lists_four_tools(client):
    payload = client.get('/api/mcp/tools').get_json()
    names = [tool['name'] for tool in payload['tools']]
    assert names == ['get_offers', 'contact', 'request_quote', 'book_call']


def test_every_tool_has_an_input_schema():
    for tool in MCP_TOOLS:
        assert tool['inputSchema']['type'] == 'object'
        assert 'description' in tool


def test_offers_endpoint_returns_hourly_consulting(client):
    offers = client.get('/api/offers').get_json()['offers']
    assert [offer['id'] for offer in offers] == [offer['id'] for offer in OFFERS]
    assert any(offer['id'] == 'conseil-heure' for offer in offers)


def test_no_offer_points_to_a_deleted_pack_page():
    assert not [offer for offer in OFFERS if 'pack' in offer['cta_url']]



def test_unknown_tool_is_rejected(client):
    response = client.post(
        '/api/mcp/call',
        json={'name': 'drop_database', 'arguments': {}},
        headers={'Origin': 'https://iafluence.fr'},
    )
    assert response.status_code == 404


def test_call_from_foreign_origin_is_rejected(client):
    response = client.post(
        '/api/mcp/call',
        json={'name': 'get_offers', 'arguments': {}},
        headers={'Origin': 'https://exemple-malveillant.fr'},
    )
    assert response.status_code == 403


def test_contact_rejects_missing_fields(client):
    response = client.post('/api/contact', json={'name': 'Jean'})
    assert response.status_code == 400


def test_contact_rejects_invalid_email(client):
    response = client.post(
        '/api/contact',
        json={'name': 'Jean', 'email': 'pas-un-email', 'message': 'Bonjour'},
    )
    assert response.status_code == 400
