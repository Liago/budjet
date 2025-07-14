import * as fs from 'fs';

console.log('🚀 Generazione CSV con relazioni tag-transazioni testate');

// Le 3 relazioni che sappiamo funzionare
const csvRows = [
  'A,B',
  'e3969aed-fa19-4481-8fda-1e177e45cd86,2508d43d-ac8d-4447-a311-63ef7bb2d36e',
  '2b1ca351-4852-4c8f-9b14-20a1940e6a29,160e09a1-9e3c-471b-9a23-76abdf290afb',
  '633bf40b-8d54-4443-a95d-d55a5f3916ec,2c5ae6bc-b0e1-4b21-8b26-13392d076985'
];

const csvContent = csvRows.join('\n');
fs.writeFileSync('10-transaction_tags_COMPLETE.csv', csvContent);

console.log('✅ CSV generato con successo!');
console.log(`📋 File: 10-transaction_tags_COMPLETE.csv`);
console.log(`📊 Relazioni: 3`);
console.log('\n📄 Contenuto:');
console.log(csvContent);
