from abc import ABC, abstractmethod
from typing import Any


class IVariableScorer(ABC):
    code: str
    display_name: str

    @abstractmethod
    def extract_raw_value(self, horse: Any) -> float | None: ...

    @abstractmethod
    def higher_is_better(self) -> bool: ...
