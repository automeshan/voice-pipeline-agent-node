# SIP Dispatch Rules


## Creating Dispatch Rules

To create a dispatch rule with the SIP service, use the `CreateSIPDispatchRule` API. It returns a `SIPDispatchRuleInfo` object that describes the created rule.

By default, a dispatch rule is matched against all your trunks and makes a caller's phone number visible to others in the room. You can change these default behaviors using dispatch rule options. See the [`CreateSIPDispatchRule`](https://example.com/api-ref) API reference for full list of available options.

## Rule Types

### Individual Caller Rule

An `SIPDispatchRuleIndividual` creates new rooms per caller:

```typescript
const rule: SipDispatchRuleIndividual = {
  roomPrefix: "call-",
  type: 'individual',
};

const options: CreateSipDispatchRuleOptions = {
  name: 'my dispatch rule',
  roomConfig: new RoomConfiguration({
    agents: [
      new RoomAgentDispatch({
        agentName: "inbound-agent", 
        metadata: 'dispatch metadata',
      }),
    ],
  }),
};

const dispatchRule = await sipClient.createSipDispatchRule(rule, options);
console.log("created dispatch rule", dispatchRule);
```

> **Note**  
> When the `trunk_ids` field is omitted, the dispatch rule matches calls from all inbound trunks.

### Direct Dispatch Rule

Routes all callers to a specific room:

```typescript
const roomName = 'open-room';

const dispatchRuleOptions = {
  name: 'my dispatch rule',
};

const ruleType = {
  roomName: roomName,
  type: 'direct',
};

const dispatchRule = await sipClient.createSipDispatchRule(
  ruleType,
  dispatchRuleOptions
);

console.log(dispatchRule);
```

#### Pin Protection Example

```json
{
  "trunk_ids": [],
  "rule": {
    "dispatchRuleDirect": {
      "roomName": "safe-room",
      "pin": "12345"
    }
  }
}
```

### Callee Dispatch Rule

This creates rooms based on called number:

Callee dispatch rules can't be created using Node.js.

## Custom Attributes & Metadata

### Setting Attributes

```typescript
const dispatchRuleOptions = {
  name: 'My individual dispatch rule',
  attributes: {
    "<key_name1>": "<value1>",
    "<key_name2>": "<value2>"
  },
};
```

### Setting Metadata

```typescript
const dispatchRuleOptions = {
  name: 'My individual dispatch rule',
  metadata: "{\"is_internal\": true}",
};
```

## Management

### Listing Rules

```typescript
import { SipClient } from 'livekit-server-sdk';

const sipClient = new SipClient(process.env.LIVEKIT_URL,
                                process.env.LIVEKIT_API_KEY,
                                process.env.LIVEKIT_API_SECRET);

const rules = await sipClient.listSipDispatchRule();

console.log(rules);