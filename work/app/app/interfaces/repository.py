from abc import ABC, abstractmethod
from typing import Generic, TypeVar

T = TypeVar('T')


class IRepository(ABC, Generic[T]):
    @abstractmethod
    async def get(self, entity_id: int) -> T | None: ...
