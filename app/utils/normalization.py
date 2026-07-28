from typing import Iterable


def min_max_normalize(values: Iterable[float | None], higher_is_better: bool = True) -> list[float | None]:
    prepared = list(values)
    present = [v for v in prepared if v is not None]
    if not present:
        return [None for _ in prepared]
    minimum = min(present)
    maximum = max(present)
    if minimum == maximum:
        return [1.0 if value is not None else None for value in prepared]
    normalized = []
    for value in prepared:
        if value is None:
            normalized.append(None)
            continue
        ratio = (value - minimum) / (maximum - minimum)
        normalized.append(ratio if higher_is_better else 1 - ratio)
    return normalized
