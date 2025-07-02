import os
from chatbot.backend.rag import RAGProcessor


def test_get_relevant_context_contains_keyword():
    rag = RAGProcessor()
    context = rag.get_relevant_context("Auvergne")
    assert "Auvergne" in context


def test_get_relevant_context_is_string():
    rag = RAGProcessor()
    context = rag.get_relevant_context("IAfluence")
    assert isinstance(context, str)
    assert "IAfluence" in context
