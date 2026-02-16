# Agent Tests API (Updated to latest ElevenLabs schema)

This project keeps calling our backend (`/agent-test`), but payloads now follow the latest ElevenLabs test model.

## Backend base path

- `/agent-test`
- Auth: `Authorization: Bearer <token>`

## Data model used by frontend

### Core fields

- `name: string`
- `type: 'llm' | 'tool'`
- `chat_history: Array<{ role: 'user' | 'agent'; message: string; time_in_call_secs: number }>`
- `success_condition: string`
- `success_examples: Array<{ response: string; type: 'success' }>`
- `failure_examples: Array<{ response: string; type: 'failure' }>`
- `dynamic_variables?: Record<string, string | number | boolean>`
- `tool_call_parameters?: object`
- `check_any_tool_matches?: boolean`

### Legacy compatibility

Frontend still tolerates legacy fields if backend returns them:

- `prompt`
- `expectedResponse`
- `assertions`

## Endpoints

### List tests

- `GET /agent-test`
- Supports both old and new pagination shapes:
  - old: `page`, `limit`, `total`, `items`
  - new/cursor style: `tests`, `next_cursor`, `has_more`

### Get test by id

- `GET /agent-test/:testId`

### Create test

- `POST /agent-test`
- Frontend sends latest schema first (`chat_history`, `success_condition`, examples, dynamic variables).
- If backend still expects legacy body, frontend falls back automatically.

### Update test

- `PUT /agent-test/:testId`
- Same behavior as create (latest schema first, legacy fallback).

### Delete test

- `DELETE /agent-test/:testId`

### Run tests on agent

- `POST /agent-test/run/:agentId`
- Frontend now sends:

```json
{
	"tests": [{ "test_id": "test_123" }]
}
```

- If backend still expects legacy body (`testIds`), frontend falls back automatically.

## Notes

- UI now follows the latest ElevenLabs test-studio flow:
  - success condition
  - success/failure examples
  - dynamic variables
  - conversation chat history
- Result normalization is applied for both old and new backend response formats.
