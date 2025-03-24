# Telnyx Integration Guide

## Step 1: SIP Credentials for Telnyx FQDN Connection

For the Telnyx FQDN connection, we'll use the following SIP authentication credentials:

- **Username**: `automeshan`
- **Password**: `T3lnyx@S3cur3P@ss!`
- **SIP URI**: `sip:1ox3mp4c9qd.sip.livekit.cloud`

These credentials will be used when setting up the FQDN connection with Telnyx. The script `setup-telnyx-fqdn.js` is configured to use these values automatically.

## Step 2: Create an FQDN connection

The following inbound and outbound commands include the required configuration settings if you plan on using only an inbound or outbound trunk for your LiveKit telephony app. However, by default, an FQDN connection creates both an inbound and outbound trunk.

Creating an FQDN connection. Depending on your use case, select Inbound, Outbound, or Inbound and outbound to accept calls, make calls, or both:

To configure an FQDN trunk for both inbound and outbound calls:

1. Create a voice profile for outbound calls.
2. Set the caller's number format to +E.164.
3. Configure credential authentication with a username and password.

### Create a voice profile

```bash
curl -L 'https://api.telnyx.com/v2/outbound_voice_profiles' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -d '{
    "name": "My LiveKit outbound voice profile",
    "traffic_type": "conversational",
    "service_plan": "global"
  }'
```

### Create an inbound and outbound FQDN connection

```bash
curl -L 'https://api.telnyx.com/v2/fqdn_connections' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -d '{
    "active": true,
    "anchorsite_override": "Latency",
    "connection_name": "My LiveKit trunk",
    "transport_protocol": "TCP",
    "user_name": "automeshan",
    "password": "T3lnyx@S3cur3P@ss!",
    "inbound": {
      "ani_number_format": "+E.164",
      "dnis_number_format": "+e164"
    },
    "outbound": {
      "outbound_voice_profile_id": "voice_profile_id"
    }
  }'
```

Copy the FQDN connection ID from the output:

```json
{
  "data": {
    "id": "connection_id",
    ...
  }
}
```

### Create an FQDN with your SIP URI and your FQDN connection ID

> **Note**: Your LiveKit SIP URI is `sip:1ox3mp4c9qd.sip.livekit.cloud`

```bash
curl -L 'https://api.telnyx.com/v2/fqdns' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -d '{
    "connection_id": "connection_id",
    "fqdn": "1ox3mp4c9qd.sip.livekit.cloud",
    "port": 5060,
    "dns_record_type": "a"
  }'
```