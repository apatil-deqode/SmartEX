import {appSchema, tableSchema} from '@nozbe/watermelondb';

export default appSchema({
  version: 4,
  tables: [
    tableSchema({
      name: 'feeds',
      columns: [
        {name: 'timestamp', type: 'number'},
        {name: 'rotation', type: 'number'},
        {name: 'rpm', type: 'number'},
        {name: 'wasLastBatchDefective', type: 'boolean'},
        {name: 'defectStop', type: 'boolean'},
      ],
    }),
    tableSchema({
      name: 'images',
      columns: [
        {name: 'feed_id', type: 'string', isIndexed: true},
        {name: 'index', type: 'number'},
        {name: 'timestamp', type: 'number'},
        {name: 'score', type: 'string'},
        {name: 'thresholds', type: 'string'},
        {name: 'thumbnail', type: 'string'},
        {name: 'frames', type: 'string'},
        {name: 'defect', type: 'string', isOptional: true},
        {name: 'defectLevel', type: 'string', isOptional: true},
      ],
    }),
    tableSchema({
      name: 'defectStops',
      columns: [
        {name: 'timestamp', type: 'number'},
        {name: 'isUsed', type: 'boolean'},
      ],
    }),
  ],
});
