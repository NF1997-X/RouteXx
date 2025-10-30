import fs from 'fs';
import csv from 'csv-parser';
import { db } from './server/db';
import { tableRows } from './shared/schema';
import { sql } from 'drizzle-orm';

interface CSVRow {
  id: string;
  no: string;
  route: string;
  code: string;
  location: string;
  delivery: string;
  info: string;
  tng_site: string;
  tng_route: string;
  latitude: string;
  longitude: string;
  images: string;
  sort_order: string;
  qr_code: string;
  destination: string;
  toll_price: string;
  active: string;
  no_category: string;
}

async function importCSV() {
  const results: CSVRow[] = [];
  
  console.log('📂 Reading CSV file...');
  
  // Read CSV file
  await new Promise<void>((resolve, reject) => {
    fs.createReadStream('../table_rows.csv')
      .pipe(csv())
      .on('data', (data: CSVRow) => results.push(data))
      .on('end', () => resolve())
      .on('error', (error) => reject(error));
  });
  
  console.log(`✅ Found ${results.length} rows in CSV`);
  
  // Validate and prepare data BEFORE touching database
  console.log('🔍 Validating data...');
  const preparedRows: any[] = [];
  
  for (const row of results) {
    try {
      // Validate required fields
      if (!row.no || !row.route) {
        throw new Error('Missing required fields (no or route)');
      }
      
      // Parse and validate images JSON
      let images = [];
      if (row.images && row.images !== '[]' && row.images.trim() !== '') {
        try {
          images = JSON.parse(row.images);
          // Validate images is an array
          if (!Array.isArray(images)) {
            throw new Error('Images must be an array');
          }
        } catch (e) {
          throw new Error(`Invalid JSON in images field: ${e}`);
        }
      }
      
      // Validate numeric fields
      const no = parseInt(row.no);
      const sortOrder = parseInt(row.sort_order);
      if (isNaN(no) || isNaN(sortOrder)) {
        throw new Error('Invalid numeric value in no or sort_order');
      }
      
      // Validate lat/long if present
      if (row.latitude && row.latitude.trim() !== '' && isNaN(parseFloat(row.latitude))) {
        throw new Error('Invalid latitude value');
      }
      if (row.longitude && row.longitude.trim() !== '' && isNaN(parseFloat(row.longitude))) {
        throw new Error('Invalid longitude value');
      }
      
      // Prepare row data
      preparedRows.push({
        id: row.id || undefined,
        no: no,
        route: row.route || '',
        code: row.code || '',
        location: row.location || '',
        delivery: row.delivery || '',
        info: row.info || '',
        tngSite: row.tng_site || '',
        tngRoute: row.tng_route || '',
        latitude: row.latitude && row.latitude.trim() !== '' ? row.latitude : null,
        longitude: row.longitude && row.longitude.trim() !== '' ? row.longitude : null,
        images: images,
        sortOrder: sortOrder,
        qrCode: row.qr_code || '',
        destination: row.destination || '0.00',
        tollPrice: row.toll_price || '0.00',
        active: row.active === 'true',
        markerColor: '#3b82f6',
        deliveryAlt: 'normal',
      });
    } catch (error) {
      console.error(`❌ Validation failed for row ${row.no}:`, error);
      throw new Error(`Data validation failed. Aborting import to prevent corruption.`);
    }
  }
  
  console.log(`✅ All ${preparedRows.length} rows validated successfully`);
  
  // Now perform the import within a transaction
  console.log('📥 Starting transactional import...');
  
  try {
    await db.transaction(async (tx) => {
      // Clear existing data within transaction
      console.log('🗑️  Clearing existing data...');
      await tx.delete(tableRows);
      
      // Insert all rows
      let imported = 0;
      for (const rowData of preparedRows) {
        await tx.insert(tableRows).values(rowData);
        imported++;
        
        if (imported % 10 === 0) {
          console.log(`   ✓ Imported ${imported}/${preparedRows.length} rows...`);
        }
      }
      
      console.log(`   ✓ Imported ${imported}/${preparedRows.length} rows`);
    });
    
    console.log('\n✅ Import completed successfully!');
    console.log(`   Total rows imported: ${preparedRows.length}`);
  } catch (error) {
    console.error('\n❌ Transaction failed - all changes rolled back:', error);
    throw error;
  }
  
  process.exit(0);
}

importCSV().catch((error) => {
  console.error('❌ Import failed:', error);
  process.exit(1);
});
