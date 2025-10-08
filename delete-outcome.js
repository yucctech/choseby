const API_URL = 'http://localhost:8080/api/v1';
const DECISION_ID = 'b3782f76-0307-44c6-95f8-445e8925bf02';

async function deleteOutcome() {
  const { Client } = require('pg');
  const client = new Client({
    connectionString: 'postgresql://postgres.igrmbkienznttmunapix:9C.2@eVGaVLWAse@aws-1-us-east-2.pooler.supabase.com:5432/postgres?sslmode=require&search_path=public',
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();

  const result = await client.query(
    'DELETE FROM outcome_tracking WHERE decision_id = $1 RETURNING id',
    [DECISION_ID]
  );

  console.log(`Deleted ${result.rowCount} outcome record(s)`);

  await client.end();
}

deleteOutcome().catch(console.error);
