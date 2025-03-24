#!/usr/bin/env node
// Script to set up FQDN connection with Telnyx
import dotenv from 'dotenv';
import path from 'path';
import readline from 'readline';
import telnyxLib from 'telnyx';
import { fileURLToPath } from 'url';

// Initialize environment variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '.env.local');

console.log('Loading environment from:', envPath);
dotenv.config({ path: envPath });

// Check if TELNYX_API_KEY is set
if (!process.env.TELNYX_API_KEY) {
  console.error('❌ TELNYX_API_KEY is not set in .env.local file');
  process.exit(1);
}

// Initialize Telnyx with the API key
const telnyx = telnyxLib(process.env.TELNYX_API_KEY);

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function setupFQDNConnection() {
  try {
    console.log('Setting up FQDN connection with Telnyx...');
    
    // Use predefined username and password
    const username = 'automeshan';
    const password = 'T3lnyx@S3cur3P@ss!';
    console.log(`Using username: ${username}`);
    console.log(`Using password: ${password}`);
    
    // Use the known SIP URI
    const sipUri = '1ox3mp4c9qd.sip.livekit.cloud';
    console.log(`Using SIP URI: ${sipUri}`);
    
    // Step 1: Create a voice profile for outbound calls
    console.log('\nCreating outbound voice profile...');
    const voiceProfileResponse = await telnyx.outboundVoiceProfiles.create({
      name: 'LiveKit outbound voice profile',
      traffic_type: 'conversational',
      service_plan: 'global',
    });
    
    console.log('✅ Voice profile created successfully');
    const voiceProfileId = voiceProfileResponse.data.id;
    console.log(`Voice Profile ID: ${voiceProfileId}`);
    
    // Step 2: Create an inbound and outbound FQDN connection
    console.log('\nCreating FQDN connection...');
    const fqdnConnectionResponse = await telnyx.fqdnConnections.create({
      active: true,
      anchorsite_override: 'Latency',
      connection_name: 'LiveKit trunk',
      transport_protocol: 'TCP',
      user_name: username,
      password: password,
      inbound: {
        ani_number_format: '+E.164',
        dnis_number_format: '+e164',
      },
      outbound: {
        outbound_voice_profile_id: voiceProfileId,
      },
    });
    
    console.log('✅ FQDN connection created successfully');
    const connectionId = fqdnConnectionResponse.data.id;
    console.log(`Connection ID: ${connectionId}`);
    
    // Step 3: Create an FQDN with your SIP URI and your FQDN connection ID
    console.log('\nCreating FQDN with SIP URI...');
    const fqdnResponse = await telnyx.fqdns.create({
      connection_id: connectionId,
      fqdn: sipUri,
      port: 5060,
      dns_record_type: 'a',
    });
    
    console.log('✅ FQDN with SIP URI created successfully');
    console.log(`FQDN ID: ${fqdnResponse.data.id}`);
    
    console.log('\n🎉 Telnyx FQDN connection setup completed successfully!');
    console.log('\nImportant information:');
    console.log(`Voice Profile ID: ${voiceProfileId}`);
    console.log(`Connection ID: ${connectionId}`);
    console.log(`FQDN ID: ${fqdnResponse.data.id}`);
    console.log(`SIP URI: ${sipUri}`);
    console.log(`SIP Authentication Username: ${username}`);
    console.log(`SIP Authentication Password: ${password}`);
    
    // Save the connection details to a file for reference
    console.log('\nSaving connection details to telnyx-connection-details.json');
    const fs = await import('fs/promises');
    await fs.writeFile(
      'telnyx-connection-details.json',
      JSON.stringify({
        voiceProfileId,
        connectionId,
        fqdnId: fqdnResponse.data.id,
        sipUri,
        sipUsername: username,
        sipPassword: password,
      }, null, 2)
    );
    
    console.log('✅ Connection details saved successfully');
  } catch (error) {
    console.error('❌ Error setting up FQDN connection:', error.message);
    if (error.response && error.response.data) {
      console.error('Error details:', JSON.stringify(error.response.data, null, 2));
    }
    console.log('\nTroubleshooting steps:');
    console.log('1. Verify your TELNYX_API_KEY is correct');
    console.log('2. Check if your Telnyx account is active');
    console.log('3. Ensure you have the necessary permissions');
    console.log('4. Verify the SIP URI format is correct');
  } finally {
    rl.close();
  }
}

// Run the setup
setupFQDNConnection();
