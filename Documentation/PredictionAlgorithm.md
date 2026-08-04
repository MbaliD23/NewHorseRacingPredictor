# Prediction Algorithm

## Variables

The platform supports exactly six variables:

1. Draw Advantage
2. Weight
3. Previous Run
4. Trainer/Jockey Combination Win %
5. Speed Index
6. Predicted Time

Users must choose exactly three variables.

## Scoring process

1. Retrieve active horses for the selected race.
2. Extract raw values from the chosen scorer modules.
3. Normalize each selected variable to a common 0-1 range.
4. Reverse the scale for variables where lower values are better, such as draw, weight, previous-run finish, and predicted time.
5. Average the three normalized values to produce the final score.
6. Rank descending and return the top three horses.

## Confidence process

Confidence is reduced when:

- Data completeness is low.
- Variable agreement is weak.
- Fewer extracted values are available.

The response also reports strongest metric, weakest metric, key factor values, and notes when extracted data is incomplete.
