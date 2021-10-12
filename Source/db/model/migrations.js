import {
  schemaMigrations,
  addColumns,
  createTable,
} from '@nozbe/watermelondb/Schema/migrations';

export default schemaMigrations({
  migrations: [
    {
      toVersion: 3,
      steps: [
        addColumns({
          table: 'images',
          columns: [{name: 'defectLevel', type: 'string', isOptional: true}],
        }),
      ],
    },
    {
      toVersion: 4,
      steps: [
        createTable({
          name: 'defectStops',
          columns: [
            {name: 'timestamp', type: 'number'},
            {name: 'isUsed', type: 'boolean'},
          ],
        }),
        addColumns({
          table: 'feeds',
          columns: [{name: 'defectStop', type: 'boolean', isOptional: true}],
        }),
      ],
    },
  ],
});
