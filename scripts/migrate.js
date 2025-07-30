#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigrations() {
  console.log('🚀 Starting database migrations...')
  
  const { error: createTableError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS public.migrations (
        id SERIAL PRIMARY KEY,
        filename TEXT UNIQUE NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
  })

  if (createTableError) {
    console.error('❌ Failed to create migrations table:', createTableError)
    process.exit(1)
  }

  const scriptsDir = path.join(__dirname)
  const migrationFiles = fs.readdirSync(scriptsDir)
    .filter(file => file.endsWith('.sql') && file.match(/^\d{3}-/))
    .sort()

  console.log(`📁 Found ${migrationFiles.length} migration files`)

  const { data: executedMigrations, error: fetchError } = await supabase
    .from('migrations')
    .select('filename')

  if (fetchError) {
    console.error('❌ Failed to fetch executed migrations:', fetchError)
    process.exit(1)
  }

  const executedFilenames = new Set(executedMigrations?.map(m => m.filename) || [])

  for (const filename of migrationFiles) {
    if (executedFilenames.has(filename)) {
      console.log(`⏭️  Skipping ${filename} (already executed)`)
      continue
    }

    console.log(`🔄 Executing ${filename}...`)
    
    const filePath = path.join(scriptsDir, filename)
    const sql = fs.readFileSync(filePath, 'utf8')

    const { error: migrationError } = await supabase.rpc('exec_sql', { sql })

    if (migrationError) {
      console.error(`❌ Migration ${filename} failed:`, migrationError)
      process.exit(1)
    }

    const { error: recordError } = await supabase
      .from('migrations')
      .insert({ filename })

    if (recordError) {
      console.error(`❌ Failed to record migration ${filename}:`, recordError)
      process.exit(1)
    }

    console.log(`✅ Migration ${filename} completed`)
  }

  console.log('🎉 All migrations completed successfully!')
}

if (require.main === module) {
  runMigrations().catch(error => {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  })
}

module.exports = { runMigrations }
