"""initial schema"""

from alembic import op
import sqlalchemy as sa

revision = '0001_initial'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table('jockeys', sa.Column('id', sa.Integer(), primary_key=True), sa.Column('name', sa.String(length=255), nullable=False), sa.Column('rating', sa.Float(), nullable=True), sa.Column('created_at', sa.DateTime(timezone=True)), sa.Column('updated_at', sa.DateTime(timezone=True)))
    op.create_index('ix_jockeys_name', 'jockeys', ['name'], unique=True)
    op.create_table('logs', sa.Column('id', sa.Integer(), primary_key=True), sa.Column('level', sa.String(length=20)), sa.Column('category', sa.String(length=100)), sa.Column('message', sa.Text()), sa.Column('details', sa.Text(), nullable=True), sa.Column('created_at', sa.DateTime(timezone=True)), sa.Column('updated_at', sa.DateTime(timezone=True)))
    op.create_table('race_meetings', sa.Column('id', sa.Integer(), primary_key=True), sa.Column('venue', sa.String(length=255), nullable=False), sa.Column('meeting_date', sa.Date(), nullable=True), sa.Column('external_id', sa.String(length=255), nullable=False), sa.Column('source_url', sa.String(length=500), nullable=True), sa.Column('created_at', sa.DateTime(timezone=True)), sa.Column('updated_at', sa.DateTime(timezone=True)))
    op.create_index('ix_race_meetings_external_id', 'race_meetings', ['external_id'], unique=True)
    op.create_table('scrape_history', sa.Column('id', sa.Integer(), primary_key=True), sa.Column('source_url', sa.String(length=500)), sa.Column('status', sa.String(length=50)), sa.Column('changes_detected', sa.Boolean(), default=False), sa.Column('checksum', sa.String(length=64), nullable=True), sa.Column('details', sa.Text(), nullable=True), sa.Column('created_at', sa.DateTime(timezone=True)), sa.Column('updated_at', sa.DateTime(timezone=True)))
    op.create_table('trainers', sa.Column('id', sa.Integer(), primary_key=True), sa.Column('name', sa.String(length=255), nullable=False), sa.Column('ranking', sa.Float(), nullable=True), sa.Column('created_at', sa.DateTime(timezone=True)), sa.Column('updated_at', sa.DateTime(timezone=True)))
    op.create_index('ix_trainers_name', 'trainers', ['name'], unique=True)
    op.create_table('variables', sa.Column('id', sa.Integer(), primary_key=True), sa.Column('code', sa.String(length=50), nullable=False), sa.Column('display_name', sa.String(length=100), nullable=False), sa.Column('created_at', sa.DateTime(timezone=True)), sa.Column('updated_at', sa.DateTime(timezone=True)))
    op.create_index('ix_variables_code', 'variables', ['code'], unique=True)
    op.create_table('races', sa.Column('id', sa.Integer(), primary_key=True), sa.Column('meeting_id', sa.Integer(), sa.ForeignKey('race_meetings.id')), sa.Column('race_number', sa.Integer()), sa.Column('external_id', sa.String(length=255), nullable=False), sa.Column('source_url', sa.String(length=500)), sa.Column('race_time', sa.DateTime(timezone=True), nullable=True), sa.Column('distance', sa.String(length=100), nullable=True), sa.Column('surface', sa.String(length=100), nullable=True), sa.Column('field_size', sa.Integer(), nullable=True), sa.Column('status', sa.String(length=50), nullable=True), sa.Column('title', sa.String(length=255), nullable=True), sa.Column('created_at', sa.DateTime(timezone=True)), sa.Column('updated_at', sa.DateTime(timezone=True)))
    op.create_index('ix_races_external_id', 'races', ['external_id'], unique=True)
    op.create_table('prediction_runs', sa.Column('id', sa.Integer(), primary_key=True), sa.Column('race_id', sa.Integer(), sa.ForeignKey('races.id')), sa.Column('run_at', sa.DateTime(timezone=True)), sa.Column('selected_variables', sa.String(length=255)), sa.Column('status', sa.String(length=50)), sa.Column('notes', sa.String(length=500), nullable=True), sa.Column('created_at', sa.DateTime(timezone=True)), sa.Column('updated_at', sa.DateTime(timezone=True)))
    op.create_table('horses', sa.Column('id', sa.Integer(), primary_key=True), sa.Column('race_id', sa.Integer(), sa.ForeignKey('races.id')), sa.Column('trainer_id', sa.Integer(), sa.ForeignKey('trainers.id'), nullable=True), sa.Column('jockey_id', sa.Integer(), sa.ForeignKey('jockeys.id'), nullable=True), sa.Column('external_id', sa.String(length=255), nullable=False), sa.Column('name', sa.String(length=255), nullable=False), sa.Column('draw_number', sa.Integer(), nullable=True), sa.Column('weight_value', sa.Numeric(10,2), nullable=True), sa.Column('starting_price', sa.Numeric(10,2), nullable=True), sa.Column('previous_run_rating', sa.Numeric(10,2), nullable=True), sa.Column('status', sa.String(length=50), nullable=True), sa.Column('scratched', sa.Boolean(), default=False), sa.Column('notes', sa.String(length=500), nullable=True), sa.Column('created_at', sa.DateTime(timezone=True)), sa.Column('updated_at', sa.DateTime(timezone=True)))
    op.create_table('predictions', sa.Column('id', sa.Integer(), primary_key=True), sa.Column('prediction_run_id', sa.Integer(), sa.ForeignKey('prediction_runs.id')), sa.Column('horse_id', sa.Integer(), sa.ForeignKey('horses.id')), sa.Column('predicted_position', sa.Integer()), sa.Column('overall_score', sa.Numeric(10,4)), sa.Column('confidence_percent', sa.Numeric(5,2)), sa.Column('strongest_metric', sa.String(length=100), nullable=True), sa.Column('weakest_metric', sa.String(length=100), nullable=True), sa.Column('key_factors', sa.String(length=500), nullable=True), sa.Column('notes', sa.String(length=500), nullable=True), sa.Column('created_at', sa.DateTime(timezone=True)), sa.Column('updated_at', sa.DateTime(timezone=True)))
    op.create_table('scores', sa.Column('id', sa.Integer(), primary_key=True), sa.Column('prediction_id', sa.Integer(), sa.ForeignKey('predictions.id'), nullable=True), sa.Column('horse_id', sa.Integer(), sa.ForeignKey('horses.id')), sa.Column('variable_id', sa.Integer(), sa.ForeignKey('variables.id')), sa.Column('raw_value', sa.Numeric(10,4), nullable=True), sa.Column('normalized_score', sa.Numeric(10,4), nullable=True), sa.Column('weight', sa.Numeric(10,4)), sa.Column('created_at', sa.DateTime(timezone=True)), sa.Column('updated_at', sa.DateTime(timezone=True)))


def downgrade() -> None:
    op.drop_table('scores')
    op.drop_table('predictions')
    op.drop_table('horses')
    op.drop_table('prediction_runs')
    op.drop_table('races')
    op.drop_table('variables')
    op.drop_table('trainers')
    op.drop_table('scrape_history')
    op.drop_table('race_meetings')
    op.drop_table('logs')
    op.drop_table('jockeys')
