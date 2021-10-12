import {Model} from '@nozbe/watermelondb';
import {
  field,
  date,
  children,
  immutableRelation,
} from '@nozbe/watermelondb/decorators';

export class Feed extends Model {
  static table = 'feeds';

  static associations = {
    images: {type: 'has_many', foreignKey: 'feed_id'},
  };

  @date('timestamp') timestamp;
  @field('rotation') rotation;
  @field('rpm') rpm;
  @field('wasLastBatchDefective') wasLastBatchDefective;
  @field('defectStop') defectStop;
  @children('images') images;

  async destroyPermanently() {
    await this.images.destroyAllPermanently();
    await super.destroyPermanently();
  }
}

export class Image extends Model {
  static table = 'images';

  static associations = {
    feeds: {type: 'belongs_to', key: 'feed_id'},
  };

  @field('index') index;
  @date('timestamp') timestamp;
  @field('score') score;
  @field('thresholds') thresholds;
  @field('thumbnail') thumbnail;
  @field('defect') defect;
  @field('defectLevel') defectLevel;
  @field('frames') frames;

  @immutableRelation('feeds', 'feed_id') feed;
}

export class DefectStop extends Model {
  static table = 'defectStops';

  @date('timestamp') timestamp;
  @field('isUsed') isUsed;
}
