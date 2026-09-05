"""
Base class for every Pydantic schema that gets sent to the frontend.

The frontend's TypeScript types are camelCase (keyEvents, applicableLaws,
relevanceScore...). Python convention is snake_case. Rather than write
camelCase Python attribute names everywhere (unidiomatic, and error-prone
to type-check), every field is written snake_case internally and this base
class auto-generates the camelCase alias -- so `key_events` in Python
becomes `"keyEvents"` on the wire, matching the frontend exactly.

`populate_by_name=True` means the API also still ACCEPTS snake_case on the
way in (useful for tests/curl), but always SENDS camelCase out, which is
what FRONTEND_CONTRACT_MAP.md verifies against.
"""
from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,  # lets these build directly from SQLAlchemy model instances
    )
