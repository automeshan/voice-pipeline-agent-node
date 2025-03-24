// Script to verify Telnyx integration
import dotenv from 'dotenv';
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

// Australian phone number to verify
const phoneNumber = '+61489900576';

// Verify connection by checking the phone number details
async function verifyTelnyxConnection() {
  try {
    console.log('Attempting to connect to Telnyx API...');
    console.log(`Checking details for phone number: ${phoneNumber}`);

    // List phone numbers to check if our number is there
    const phoneNumbers = await telnyx.phoneNumbers.list();

    console.log('✅ Successfully connected to Telnyx API!');
    console.log(`Found ${phoneNumbers.data.length} phone numbers in your account`);

    // Check if our specific number is in the list
    const ourNumber = phoneNumbers.data.find(
      (num) =>
        num.phone_number === phoneNumber || num.phone_number === phoneNumber.replace('+', ''),
    );

    if (ourNumber) {
      console.log('✅ Found your Australian phone number in your account!');
      console.log('Phone number details:');
      console.log(`  Number: ${ourNumber.phone_number}`);
      console.log(`  Status: ${ourNumber.status}`);
      console.log(`  Country: ${ourNumber.country_code}`);
      console.log('Telnyx integration is working correctly');
    } else {
      console.log('⚠️ Your specific phone number was not found in the account.');
      console.log('This could mean:');
      console.log('1. The number may be formatted differently in Telnyx');
      console.log('2. The number might be associated with a different Telnyx account');
      console.log('3. The number might not be active yet');

      // List the first few numbers from the account for reference
      console.log('\nHere are some phone numbers from your account:');
      phoneNumbers.data.slice(0, 3).forEach((num) => {
        console.log(`  - ${num.phone_number} (${num.country_code})`);
      });
    }

    return true;
  } catch (error) {
    console.error('❌ Failed to connect to Telnyx API:', error.message);

    if (error.response && error.response.data) {
      console.error('Error details:', JSON.stringify(error.response.data, null, 2));
    }

    console.log('\nTroubleshooting tips:');
    console.log('1. Verify your TELNYX_API_KEY is correct');
    console.log('2. Check if your Telnyx account is active');
    console.log('3. Ensure you have the correct permissions');

    return false;
  }
}

// Run the verification
verifyTelnyxConnection();
