#!/usr/bin/env node
// Script to verify Telnyx FQDN connection
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import telnyxLib from 'telnyx';
import { fileURLToPath } from 'url';

// Initialize environment variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '.env.local');

console.log('Loading environment from:', envPath);
dotenv.config({ path: envPath });

// Check if TELNYX_API_KEY is set
if (!process.env.TELNYX_API_KEY) {
  console.error('❌ TELNYX_API_KEY is not set in .env.local');
  process.exit(1);
}

console.log('✅ TELNYX_API_KEY found in environment variables');

// Initialize Telnyx with the API key
const telnyx = telnyxLib(process.env.TELNYX_API_KEY);

// Verify FQDN connection
async function verifyFQDNConnection() {
  try {
    console.log('Attempting to verify Telnyx FQDN connection...');
    
    // Load connection details from the JSON file
    console.log('Loading connection details from telnyx-connection-details.json');
    const connectionDetailsPath = path.join(__dirname, 'telnyx-connection-details.json');
    const connectionDetailsRaw = await fs.readFile(connectionDetailsPath, 'utf8');
    const connectionDetails = JSON.parse(connectionDetailsRaw);
    
    console.log('Connection details loaded:');
    console.log(`- Voice Profile ID: ${connectionDetails.voiceProfileId}`);
    console.log(`- Connection ID: ${connectionDetails.connectionId}`);
    console.log(`- FQDN ID: ${connectionDetails.fqdnId}`);
    console.log(`- SIP URI: ${connectionDetails.sipUri}`);
    
    // Step 1: Verify the voice profile exists
    console.log('\nVerifying voice profile...');
    const voiceProfile = await telnyx.outboundVoiceProfiles.retrieve(connectionDetails.voiceProfileId);
    console.log('✅ Voice profile verified:');
    console.log(`- Name: ${voiceProfile.data.name}`);
    console.log(`- Traffic Type: ${voiceProfile.data.traffic_type}`);
    console.log(`- Service Plan: ${voiceProfile.data.service_plan}`);
    
    // Step 2: Verify the FQDN connection exists
    console.log('\nVerifying FQDN connection...');
    const fqdnConnection = await telnyx.fqdnConnections.retrieve(connectionDetails.connectionId);
    console.log('✅ FQDN connection verified:');
    console.log(`- Name: ${fqdnConnection.data.connection_name}`);
    console.log(`- Status: ${fqdnConnection.data.active ? 'Active' : 'Inactive'}`);
    console.log(`- Transport Protocol: ${fqdnConnection.data.transport_protocol}`);
    console.log(`- Username: ${fqdnConnection.data.user_name}`);
    
    // Step 3: Verify the FQDN record exists
    console.log('\nVerifying FQDN record...');
    const fqdn = await telnyx.fqdns.retrieve(connectionDetails.fqdnId);
    console.log('✅ FQDN record verified:');
    console.log(`- FQDN: ${fqdn.data.fqdn}`);
    console.log(`- Port: ${fqdn.data.port}`);
    console.log(`- DNS Record Type: ${fqdn.data.dns_record_type}`);
    
    // Step 4: List all phone numbers to confirm account access
    console.log('\nVerifying account access by listing phone numbers...');
    const phoneNumbers = await telnyx.phoneNumbers.list();
    console.log(`✅ Found ${phoneNumbers.data.length} phone numbers in your account`);
    
    // Final verification
    console.log('\n🎉 Telnyx FQDN connection verification completed successfully!');
    console.log('All components are properly set up and accessible.');
  } catch (error) {
    console.error('❌ Error verifying FQDN connection:', error.message);
    if (error.response && error.response.data) {
      console.error('Error details:', JSON.stringify(error.response.data, null, 2));
    }
    console.log('\nTroubleshooting steps:');
    console.log('1. Verify your TELNYX_API_KEY is correct');
    console.log('2. Check if the connection IDs in telnyx-connection-details.json are correct');
    console.log('3. Ensure the FQDN connection is active in the Telnyx portal');
    console.log('4. Check if the SIP URI is correctly configured');
    process.exit(1);
  }
}

// Run the verification
verifyFQDNConnection();
