# New campaign: "Call source" section (FTP connection or uploaded recordings)

## Context

The New campaign page (`src/modules/qa/campaigns/NewCampaignPage/NewCampaignPage.tsx`) has a "Call source" card with a single FTP link field. External campaigns need two ways to get their calls: connect an FTP/SFTP server the system pulls from, or upload recordings by hand (single audio files or ZIPs with groups of calls). The current single text field cannot express either.

Decisions made with the user (2026-10-16):

- **Section name:** "Call source" / "Fuente de llamadas" (keeps the card's current name; describes where the calls come from, not how).
- **Organization:** one card, one choice. A segmented control "How do the calls arrive?" with two options, **Connect an FTP server** and **Upload recordings**, shows only the chosen block. A campaign has one source at creation; single uploads later stay available from the campaign detail (existing Upload audio modal).
- **FTP block:** full connection: protocol FTP/SFTP, host, port, username, password or SSH key, source folder, sync frequency, and a mocked **Test connection** button. Field set reused from `src/modules/campaigns/ExternalCampaignWizard/StepOneServerSetup.tsx`.
- **Upload block:** drag-and-drop area accepting MP3, WAV and ZIP. Each ZIP is one row with a ZIP badge and a mocked call count; a hint says the contents are processed on create.

Mode: mockup. Mantine v9, CSS modules, light/dark via Mantine variables and `light-dark()`, no inline styles, shared primitives (`SectionCard`, `BaseTable`). No backend, no tests, no dev server. Prettier on touched files only. Do not commit unless asked.

Plan copy convention: Task 0 copies this file to `docs/superpowers/plans/2026-10-16-new-campaign-call-source.md`.

---

## Verified facts (do not re-explore)

- `@mantine/dropzone` is **not installed**; no ZIP library either. Drag-and-drop is done by hand: hidden `<input type='file'>` + a `div` with `onDragOver/onDragLeave/onDrop`. Best reference: `src/modules/configurations/DictionaryRules/CsvUploadModal/CsvUploadModal.tsx` (handlers L91-110, markup L229-275) and its CSS module (`.dropzone`, `.dropzoneDragOver`, `.hiddenInput`, `.dropzoneInner`, `.selectedFile`, dark variants).
- FTP form reference: `StepOneServerSetup.tsx` fields in order: host (`ftp.example.com`), port (`NumberInput` 1-65535, default 21), username, protocol `SegmentedControl` FTP/SFTP, password (`PasswordInput`) for FTP or SSH key (`FileInput accept='.pem,.key,.pub'`) for SFTP, source directory (`/campaigns/imports`). `ConnectionTestButton` is a full-width button that mocks a 1 s test and flips to green "Connected"; any field change resets it. Frequency values: every 30 min, hourly, daily, weekly, on demand. All of this is hard-coded English in that wizard; the new section uses the `qa.campaigns` namespace instead.
- `BaseTable` (`~/components/BaseTable`): `columns: BaseTableColumnDef<T>[]`, `data`, `getRowId`, `density='compact'` (used by `UploadConversationsModal.tsx`).
- `SectionCard` props: `icon`, `title`, `description`, `padding`, `children`.
- Notifications: `notifySuccess`, `notifyWarning` in `src/modules/qa/utils/notifications.ts`.
- The page already validates with `useForm`, has a sticky footer (`NewCampaignPage.module.css .stickyActions`) and a discard guard. Current form values: `{ name, campaignType, status, source, modality, formId }`. `Campaign` (`src/views/Campaigns/types.ts`, CRLF file) has optional `campaignType`, `modality`, `formId`, `sourceUrl`.
- Existing `newCampaign.*` keys in `src/locales/{en,es}/qa.campaigns.json`: `sections.source.title` "Call source" / "Fuente de llamadas", `sections.source.description`, `fields.source`, `fields.sourcePlaceholder`, `fields.sourceHelp`, `validation.sourceRequired`, `validation.sourceInvalid`. The last five become unused (Task 5 removes them).

---

## Direction

```
SectionCard "Call source"  (IconDatabaseImport)  description: "Where the calls to analyze come from."
├─ SegmentedControl  "How do the calls arrive?"   [ Connect an FTP server | Upload recordings ]   (no default: must choose)
├─ when FTP → FtpSourceFields
│    Protocol [FTP | SFTP]           (segmented; switching sets Port 21 ↔ 22 unless the user edited it)
│    Host ──────────────────  Port ──
│    Username ──────────────  Password ──────── (FTP)  |  SSH private key [FileInput] (SFTP)
│    Source folder ─────────  Sync frequency ▾
│    [ Test connection ]  → spinner 1 s → green Alert "Connected to host" (or button turns green)
│    hint: "The system pulls new recordings from this folder on the chosen schedule."
└─ when UPLOAD → RecordingsUpload
     ┌ dashed drop area ─────────────────────────────────────┐
     │ ⬆  Drag recordings here or click to browse            │
     │    MP3, WAV or ZIP with several calls · up to 200 MB  │
     └───────────────────────────────────────────────────────┘
     BaseTable compact: File · Type (Audio | ZIP) · Size · Calls · [remove]
     footer: "3 files · 14 calls"   [+ Add more files]
     hint: "ZIP contents are extracted and counted when the campaign is created."
```

Both blocks live inside the same card so the page keeps three cards: Campaign details, Call source, Evaluation.

---

## Implementation plan

Execute in order; `npm run typecheck` after each task.

### Task 0 — Plan copy

Copy this file to `docs/superpowers/plans/2026-10-16-new-campaign-call-source.md`.

### Task 1 — Types and helpers

**1a. `src/modules/qa/campaigns/NewCampaignPage/callSource.types.ts`** (new):

```ts
export type CallSourceKind = 'FTP' | 'UPLOAD';
export type FtpProtocol = 'FTP' | 'SFTP';
export type SyncFrequency =
	| 'EVERY_30_MIN'
	| 'HOURLY'
	| 'DAILY'
	| 'WEEKLY'
	| 'ON_DEMAND';
export type RecordingKind = 'AUDIO' | 'ZIP';

export interface FtpSourceValues {
	protocol: FtpProtocol;
	host: string;
	port: number;
	/** True once the user typed a port, so protocol changes stop overriding it. */
	portEdited: boolean;
	username: string;
	password: string;
	sshKey: File | null;
	directory: string;
	frequency: SyncFrequency;
	/** Mocked "Test connection" result; any field change resets it to false. */
	tested: boolean;
}

export interface UploadedRecording {
	id: string;
	name: string;
	kind: RecordingKind;
	sizeBytes: number;
	/** 1 for an audio file; a mocked estimate for a ZIP. */
	calls: number;
}

/** Form slice for the section. `kind` is '' until the user picks one. */
export interface CallSourceValues {
	kind: CallSourceKind | '';
	ftp: FtpSourceValues;
	recordings: UploadedRecording[];
}

/** What gets saved on the campaign. Never stores credentials. */
export type CampaignCallSource =
	| {
			kind: 'FTP';
			protocol: FtpProtocol;
			host: string;
			port: number;
			directory: string;
			frequency: SyncFrequency;
	  }
	| { kind: 'UPLOAD'; files: number; calls: number };
```

**1b. `src/modules/qa/campaigns/NewCampaignPage/callSource.helpers.ts`** (new):

```ts
import type {
	CallSourceValues,
	FtpProtocol,
	FtpSourceValues,
	RecordingKind,
	SyncFrequency,
	UploadedRecording,
} from './callSource.types';

export const SYNC_FREQUENCIES: SyncFrequency[] = [
	'EVERY_30_MIN',
	'HOURLY',
	'DAILY',
	'WEEKLY',
	'ON_DEMAND',
];
export const FTP_PROTOCOLS: FtpProtocol[] = ['FTP', 'SFTP'];
export const DEFAULT_PORT: Record<FtpProtocol, number> = { FTP: 21, SFTP: 22 };
export const RECORDINGS_ACCEPT =
	'.mp3,.wav,.zip,audio/mpeg,audio/wav,audio/x-wav,application/zip,application/x-zip-compressed';
export const RECORDING_MAX_SIZE_MB = 200;
/** Mocked: roughly one call per 1.2 MB of ZIP, between 2 and 60. */
const ZIP_BYTES_PER_CALL = 1.2 * 1024 * 1024;

export const emptyFtp = (): FtpSourceValues => ({
	protocol: 'FTP',
	host: '',
	port: 21,
	portEdited: false,
	username: '',
	password: '',
	sshKey: null,
	directory: '',
	frequency: 'DAILY',
	tested: false,
});

export const emptyCallSource = (): CallSourceValues => ({
	kind: '',
	ftp: emptyFtp(),
	recordings: [],
});

export const recordingKindOf = (file: File): RecordingKind | null => {
	const name = file.name.toLowerCase();
	if (name.endsWith('.zip') || file.type.includes('zip')) return 'ZIP';
	if (
		name.endsWith('.mp3') ||
		name.endsWith('.wav') ||
		file.type.startsWith('audio/')
	)
		return 'AUDIO';
	return null;
};

let recordingSeq = 0;
export const toRecording = (
	file: File,
	kind: RecordingKind
): UploadedRecording => ({
	id: `rec-${++recordingSeq}`,
	name: file.name,
	kind,
	sizeBytes: file.size,
	calls:
		kind === 'AUDIO'
			? 1
			: Math.min(60, Math.max(2, Math.round(file.size / ZIP_BYTES_PER_CALL))),
});

export const formatSize = (bytes: number) =>
	bytes >= 1024 * 1024
		? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
		: `${Math.max(1, Math.round(bytes / 1024))} KB`;

export const totalCalls = (recordings: UploadedRecording[]) =>
	recordings.reduce((n, r) => n + r.calls, 0);
```

**1c. `src/views/Campaigns/types.ts`** (CRLF — edit preserving line endings): replace `sourceUrl?: string;` and its comment with:

```ts
	/** How the calls are obtained: an FTP/SFTP connection or uploaded recordings. */
	callSource?: CampaignCallSource;
```

and add `import type { CampaignCallSource } from '~/modules/qa/campaigns/NewCampaignPage/callSource.types';` next to the existing `FormModality` import. `grep -rn sourceUrl src` must then return nothing.

### Task 2 — Locale keys (`src/locales/{en,es}/qa.campaigns.json`)

Add under `newCampaign` (merge; keep every other key). Delete `fields.source`, `fields.sourcePlaceholder`, `fields.sourceHelp`, `validation.sourceRequired`, `validation.sourceInvalid`.

**en:**

```json
"sections": {
	"source": {
		"title": "Call source",
		"description": "Where the calls to analyze come from."
	}
},
"callSource": {
	"kind": "How do the calls arrive?",
	"kinds": { "FTP": "Connect an FTP server", "UPLOAD": "Upload recordings" },
	"kindRequired": "Choose how the calls arrive",
	"ftp": {
		"protocol": "Protocol",
		"host": "Server",
		"hostPlaceholder": "ftp.example.com",
		"port": "Port",
		"username": "Username",
		"password": "Password",
		"sshKey": "SSH private key",
		"sshKeyPlaceholder": "Select a .pem or .key file",
		"directory": "Source folder",
		"directoryPlaceholder": "/recordings/june",
		"frequency": "Sync frequency",
		"frequencies": {
			"EVERY_30_MIN": "Every 30 minutes",
			"HOURLY": "Hourly",
			"DAILY": "Daily",
			"WEEKLY": "Weekly",
			"ON_DEMAND": "On demand"
		},
		"hint": "New recordings are pulled from this folder on the chosen schedule.",
		"test": "Test connection",
		"testing": "Connecting…",
		"tested": "Connected to {{host}}",
		"testHint": "Test the connection before creating the campaign.",
		"validation": {
			"hostRequired": "Server is required",
			"portRange": "Port must be between 1 and 65535",
			"usernameRequired": "Username is required",
			"passwordRequired": "Password is required",
			"sshKeyRequired": "Select the SSH private key",
			"directoryRequired": "Source folder is required"
		}
	},
	"upload": {
		"dropTitle": "Drag recordings here or click to browse",
		"dropSubtitle": "MP3, WAV, or a ZIP with several calls · up to {{size}} MB each",
		"addMore": "Add more files",
		"zipHint": "ZIP contents are extracted and counted when the campaign is created.",
		"summary": "{{files}} files · {{calls}} calls",
		"columns": {
			"file": "File",
			"type": "Type",
			"size": "Size",
			"calls": "Calls",
			"actions": "Actions"
		},
		"types": { "AUDIO": "Audio", "ZIP": "ZIP" },
		"calls_one": "{{count}} call",
		"calls_other": "{{count}} calls",
		"estimated": "estimated",
		"remove": "Remove",
		"rejected_one": "{{count}} file was skipped: only MP3, WAV and ZIP up to {{size}} MB are accepted.",
		"rejected_other": "{{count}} files were skipped: only MP3, WAV and ZIP up to {{size}} MB are accepted.",
		"validation": { "filesRequired": "Add at least one recording or ZIP" }
	}
}
```

**es:**

```json
"sections": {
	"source": {
		"title": "Fuente de llamadas",
		"description": "De dónde salen las llamadas a analizar."
	}
},
"callSource": {
	"kind": "¿Cómo llegan las llamadas?",
	"kinds": { "FTP": "Conectar un servidor FTP", "UPLOAD": "Subir grabaciones" },
	"kindRequired": "Elige cómo llegan las llamadas",
	"ftp": {
		"protocol": "Protocolo",
		"host": "Servidor",
		"hostPlaceholder": "ftp.ejemplo.com",
		"port": "Puerto",
		"username": "Usuario",
		"password": "Contraseña",
		"sshKey": "Llave privada SSH",
		"sshKeyPlaceholder": "Selecciona un archivo .pem o .key",
		"directory": "Carpeta de origen",
		"directoryPlaceholder": "/grabaciones/junio",
		"frequency": "Frecuencia de sincronización",
		"frequencies": {
			"EVERY_30_MIN": "Cada 30 minutos",
			"HOURLY": "Cada hora",
			"DAILY": "Diaria",
			"WEEKLY": "Semanal",
			"ON_DEMAND": "Bajo demanda"
		},
		"hint": "Las grabaciones nuevas se toman de esta carpeta con la frecuencia elegida.",
		"test": "Probar conexión",
		"testing": "Conectando…",
		"tested": "Conectado a {{host}}",
		"testHint": "Prueba la conexión antes de crear la campaña.",
		"validation": {
			"hostRequired": "El servidor es obligatorio",
			"portRange": "El puerto debe estar entre 1 y 65535",
			"usernameRequired": "El usuario es obligatorio",
			"passwordRequired": "La contraseña es obligatoria",
			"sshKeyRequired": "Selecciona la llave privada SSH",
			"directoryRequired": "La carpeta de origen es obligatoria"
		}
	},
	"upload": {
		"dropTitle": "Arrastra las grabaciones aquí o haz clic para buscarlas",
		"dropSubtitle": "MP3, WAV o un ZIP con varias llamadas · hasta {{size}} MB cada uno",
		"addMore": "Agregar más archivos",
		"zipHint": "El contenido de los ZIP se extrae y se cuenta al crear la campaña.",
		"summary": "{{files}} archivos · {{calls}} llamadas",
		"columns": {
			"file": "Archivo",
			"type": "Tipo",
			"size": "Tamaño",
			"calls": "Llamadas",
			"actions": "Acciones"
		},
		"types": { "AUDIO": "Audio", "ZIP": "ZIP" },
		"calls_one": "{{count}} llamada",
		"calls_other": "{{count}} llamadas",
		"estimated": "estimado",
		"remove": "Quitar",
		"rejected_one": "Se omitió {{count}} archivo: solo se aceptan MP3, WAV y ZIP de hasta {{size}} MB.",
		"rejected_other": "Se omitieron {{count}} archivos: solo se aceptan MP3, WAV y ZIP de hasta {{size}} MB.",
		"validation": { "filesRequired": "Agrega al menos una grabación o un ZIP" }
	}
}
```

Validate both files with `node -e "JSON.parse(require('fs').readFileSync('src/locales/en/qa.campaigns.json','utf8'))"` (and `es`).

### Task 3 — Components (`src/modules/qa/campaigns/NewCampaignPage/components/`)

All strings via `useTranslation('qa.campaigns')`. Controlled components: the page owns the `useForm`; each component receives its slice and an `onChange(patch)`.

**3a. `FtpSourceFields/FtpSourceFields.tsx`** (+ `index.ts`)

Props: `{ value: FtpSourceValues; errors: Partial<Record<keyof FtpSourceValues, string>>; onChange: (patch: Partial<FtpSourceValues>) => void }`.

Every `onChange` call also sets `tested: false` (one `update = (patch) => onChange({ ...patch, tested: false })`).

| Row | Controls                                                                                                                                                                                                                                                                                  | Notes                                                                                                                                          |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `Input.Wrapper label=ftp.protocol` + `SegmentedControl` FTP/SFTP, `size='sm'`, `w={200}`                                                                                                                                                                                                  | On change: `update({ protocol, port: value.portEdited ? value.port : DEFAULT_PORT[protocol], password: '', sshKey: null })`                    |
| 2   | `SimpleGrid cols={{ base: 1, sm: 2 }}`: `TextInput` host (required, placeholder `ftp.hostPlaceholder`, error `errors.host`) · `NumberInput` port (`min=1 max=65535 w={140}`, error `errors.port`, on change `update({ port: typeof v === 'number' ? v : value.port, portEdited: true })`) | Use a `Group align='flex-end' wrap='nowrap'` instead of grid if the port column looks too wide: host `className={styles.grow}`, port `w={140}` |
| 3   | `SimpleGrid cols={{ base: 1, sm: 2 }}`: `TextInput` username (required) · FTP: `PasswordInput` password (required) / SFTP: `FileInput` sshKey (`accept='.pem,.key,.pub'`, `clearable`, placeholder `ftp.sshKeyPlaceholder`, `leftSection={<IconKey size={16} />}`)                        | error keys `errors.username`, `errors.password`, `errors.sshKey`                                                                               |
| 4   | `SimpleGrid cols={{ base: 1, sm: 2 }}`: `TextInput` directory (required, placeholder `ftp.directoryPlaceholder`, `leftSection={<IconFolder size={16} />}`) · `Select` frequency (`allowDeselect={false}`, data from `SYNC_FREQUENCIES` with labels `ftp.frequencies.*`)                   |                                                                                                                                                |
| 5   | `Text size='xs' c='dimmed'` `ftp.hint`                                                                                                                                                                                                                                                    |                                                                                                                                                |
| 6   | `Group gap='sm'`: `Button variant={value.tested ? 'light' : 'outline'} color={value.tested ? 'green' : 'blue'} leftSection={value.tested ? <IconCheck/> : <IconPlugConnected/>} loading={testing} disabled={!value.host                                                                   |                                                                                                                                                | !value.username} onClick={runTest}`label`ftp.test`/`ftp.testing`; when `tested`: `Text size='sm' c='green'` `ftp.tested {{host}}`; else `Text size='xs' c='dimmed'` `ftp.testHint` | `runTest`: `setTesting(true)`; `setTimeout(() => { setTesting(false); onChange({ tested: true }); notifySuccess(t('callSource.ftp.tested', { host })) }, 1000)`. Clear the timer on unmount (`useEffect` cleanup with a ref). |

**3b. `RecordingsUpload/RecordingsUpload.tsx`** (+ `RecordingsUpload.module.css`, `index.ts`)

Props: `{ recordings: UploadedRecording[]; error?: string; onChange: (recordings: UploadedRecording[]) => void }`.

- Hidden `<input ref type='file' multiple accept={RECORDINGS_ACCEPT} className={styles.hiddenInput} onChange={e => addFiles(e.currentTarget.files); e.currentTarget.value = ''}>`.
- `addFiles(list)`: for each file, `kind = recordingKindOf(file)`; reject when `kind === null` or `file.size > RECORDING_MAX_SIZE_MB * 1024 * 1024`; append `toRecording(file, kind)` for the rest; if any rejected → `notifyWarning(t('callSource.upload.rejected', { count, size: RECORDING_MAX_SIZE_MB }))`.
- Drop area shown **only when `recordings.length === 0`**: `div role='button' tabIndex={0} className={cx(styles.dropzone, dragOver && styles.dropzoneDragOver, error && styles.dropzoneError)}` with `onClick → input.click()`, `onKeyDown Enter/Space → click`, `onDragOver (preventDefault, setDragOver(true))`, `onDragLeave → false`, `onDrop (preventDefault, setDragOver(false), addFiles(e.dataTransfer.files))`. Inside `Stack align='center' gap={4}`: `IconCloudUpload size={32}` dimmed, `Text fw={600} size='sm'` `upload.dropTitle`, `Text size='xs' c='dimmed'` `upload.dropSubtitle {{size}}`.
- When there are files: `Group justify='space-between'`: `Text size='sm' c='dimmed'` `upload.summary {{files}} {{calls}}` and `Button size='xs' variant='light' leftSection={<IconPlus size={14}/>} onClick → input.click()` `upload.addMore`. Then `BaseTable<UploadedRecording> density='compact' getRowId={r => r.id}` columns:

| id        | header                   | cell                                                                                                                             |
| --------- | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| `name`    | `upload.columns.file`    | `Group gap='xs' wrap='nowrap'`: `IconFileMusic` (AUDIO) or `IconFileZip` (ZIP) 16px dimmed + `Text size='sm' lineClamp={1}` name |
| `kind`    | `upload.columns.type`    | `Badge size='sm' variant='light' color={kind === 'ZIP' ? 'violet' : 'blue'}` `upload.types.{kind}`                               |
| `size`    | `upload.columns.size`    | `Text size='sm' c='dimmed'` `formatSize(sizeBytes)`                                                                              |
| `calls`   | `upload.columns.calls`   | `Text size='sm'` `upload.calls {{count}}` + for ZIP `Text span size='xs' c='dimmed'` ` (${t('upload.estimated')})`               |
| `actions` | `upload.columns.actions` | `ActionIcon color='red' variant='subtle' aria-label=upload.remove` `IconTrash` → `onChange(recordings.filter(r => r.id !== id))` |

- Below the table (or the drop area): `Text size='xs' c='dimmed'` `upload.zipHint`; `error` as `Text size='xs' c='red'`.
- Still accept drops while the table is shown: wrap the whole block in a `div` with the same drag handlers so dragging more files onto the list also adds them (apply `styles.listDragOver` outline when dragging over).

`RecordingsUpload.module.css` (adapted from `CsvUploadModal.module.css`, dark via `light-dark()`):

```css
.hiddenInput {
	display: none;
}

.dropzone {
	border: 1.5px dashed var(--mantine-color-gray-4);
	border-radius: var(--mantine-radius-md);
	padding: 2rem 1.5rem;
	cursor: pointer;
	background: light-dark(
		var(--mantine-color-gray-0),
		var(--mantine-color-dark-6)
	);
	transition:
		border-color 120ms ease,
		background 120ms ease;
}

.dropzone:hover,
.dropzoneDragOver {
	border-color: var(--mantine-primary-color-filled);
	background: light-dark(
		var(--mantine-primary-color-0),
		var(--mantine-color-dark-5)
	);
}

.dropzoneError {
	border-color: var(--mantine-color-red-6);
}

.listDragOver {
	outline: 2px dashed var(--mantine-primary-color-filled);
	outline-offset: 4px;
	border-radius: var(--mantine-radius-md);
}

.grow {
	flex: 1;
	min-width: 0;
}
```

**3c. `CallSourceSection/CallSourceSection.tsx`** (+ `index.ts`)

Props: `{ value: CallSourceValues; errors: { kind?: string; ftp: Partial<Record<keyof FtpSourceValues, string>>; recordings?: string }; onChange: (patch: Partial<CallSourceValues>) => void }`.

`SectionCard icon={IconDatabaseImport} padding='md' title={t('newCampaign.sections.source.title')} description={t('newCampaign.sections.source.description')}`, `Stack gap='md'`:

1. `Input.Wrapper label={t('callSource.kind')} required error={errors.kind}` + `SegmentedControl data=[{FTP},{UPLOAD}] value={value.kind} onChange={kind => onChange({ kind })} size='sm'`. With `value.kind === ''` Mantine needs a string: pass `value={value.kind || undefined}`? `SegmentedControl` requires a value; use a controlled `value={value.kind}` and `data` without a matching item renders nothing selected — verified pattern already used for `modality` on this page (`value={modality}` with `''`). Keep the same approach.
2. `value.kind === 'FTP' && <FtpSourceFields value={value.ftp} errors={errors.ftp} onChange={patch => onChange({ ftp: { ...value.ftp, ...patch } })} />`
3. `value.kind === 'UPLOAD' && <RecordingsUpload recordings={value.recordings} error={errors.recordings} onChange={recordings => onChange({ recordings })} />`
4. `value.kind === '' && <Text size='sm' c='dimmed'>{t('newCampaign.sections.source.description')}</Text>` is redundant with the card description — render nothing instead.

### Task 4 — Page integration (`NewCampaignPage.tsx`)

- Form values: replace `source: string` with `callSource: CallSourceValues` (initial `emptyCallSource()`); remove `FTP_LINK` and the `source` validator.
- Validation (`validate` object, nested keys with Mantine's dotted paths):
  ```ts
  'callSource.kind': (v) => (v ? null : t('callSource.kindRequired')),
  'callSource.ftp.host': (v, values) => values.callSource.kind === 'FTP' && !v.trim() ? t('callSource.ftp.validation.hostRequired') : null,
  'callSource.ftp.port': (v, values) => values.callSource.kind === 'FTP' && (v < 1 || v > 65535) ? t('callSource.ftp.validation.portRange') : null,
  'callSource.ftp.username': …usernameRequired,
  'callSource.ftp.password': (v, values) => values.callSource.kind === 'FTP' && values.callSource.ftp.protocol === 'FTP' && !v ? t('…passwordRequired') : null,
  'callSource.ftp.sshKey': (v, values) => values.callSource.kind === 'FTP' && values.callSource.ftp.protocol === 'SFTP' && !v ? t('…sshKeyRequired') : null,
  'callSource.ftp.directory': …directoryRequired,
  'callSource.recordings': (v, values) => values.callSource.kind === 'UPLOAD' && v.length === 0 ? t('callSource.upload.validation.filesRequired') : null,
  ```
- Errors mapping for the section: `errors={{ kind: form.errors['callSource.kind'] as string | undefined, ftp: { host: form.errors['callSource.ftp.host'], port: …, username: …, password: …, sshKey: …, directory: … } as …, recordings: form.errors['callSource.recordings'] as string | undefined }}`. Write a small `pick = (key: string) => form.errors[key] as string | undefined` helper.
- `onChange` for the section: `(patch) => { form.setFieldValue('callSource', { ...form.values.callSource, ...patch }); form.clearFieldError('callSource.kind'); ['host','port','username','password','sshKey','directory'].forEach(k => form.clearFieldError(`callSource.ftp.${k}`)); form.clearFieldError('callSource.recordings'); }` — clearing all section errors on any change is acceptable for the mockup.
- Replace the current "Source" `SectionCard` block with `<CallSourceSection value={form.values.callSource} errors={…} onChange={…} />`. Keep card order: Details, Call source, Evaluation.
- `createCampaign`: build `callSource: CampaignCallSource` from the values (FTP: `{ kind:'FTP', protocol, host, port, directory, frequency }` — no username/password/key; UPLOAD: `{ kind:'UPLOAD', files: recordings.length, calls: totalCalls(recordings) }`) and set it on the `Campaign` instead of `sourceUrl`. Description stays `type · modality · form`.
- Imports to drop: `TextInput` only if no longer used (name still uses it — keep), `IconDatabaseImport` moves to the section component.
- Discard guard keeps working (`form.isDirty()` covers nested values and the recordings array).

### Task 5 — Clean-up and checks

- Remove the five unused `newCampaign.fields.source*` / `validation.source*` keys from both locale files (Task 2 already lists them). Run the key check: every `t('…')` in the three new components and the page resolves in `en` and `es` (reuse the scratchpad `check-keys`-style script, pointing it at `src/modules/qa/campaigns/NewCampaignPage` and `qa.campaigns.json`; add the dynamic enums: `callSource.kinds.*`, `callSource.ftp.frequencies.*`, `callSource.upload.types.*`).
- `grep -rn "sourceUrl\|FTP_LINK" src` → nothing.
- `npx prettier --write` on the new/changed files only (`NewCampaignPage/**`, `src/views/Campaigns/types.ts`, both locale files).
- `npm run typecheck` clean.

---

## Behaviour summary (demo script)

| Where       | Action                                        | Result                                                                                                    |
| ----------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Call source | Page opens                                    | Only the "How do the calls arrive?" control; nothing selected                                             |
| Call source | Pick "Connect an FTP server"                  | FTP fields appear, protocol FTP, port 21, frequency Daily                                                 |
| FTP         | Switch protocol to SFTP                       | Port becomes 22 (unless the user typed a port), Password is replaced by SSH private key                   |
| FTP         | Fill server + username, click Test connection | 1 s spinner, then green state "Connected to ftp.example.com" and a toast                                  |
| FTP         | Edit any field after testing                  | Button returns to "Test connection"                                                                       |
| Call source | Pick "Upload recordings"                      | Dashed drop area                                                                                          |
| Upload      | Drop 2 MP3 + 1 ZIP                            | Table with 3 rows; ZIP row shows violet ZIP badge and "N calls (estimated)"; footer "3 files · N+2 calls" |
| Upload      | Drop a PDF                                    | Skipped with a warning toast                                                                              |
| Upload      | Remove all rows                               | Drop area comes back                                                                                      |
| Footer      | Create without choosing a kind                | Error under the control, page does not leave                                                              |
| Footer      | Create with FTP incomplete / no files         | Errors under the missing fields                                                                           |
| Footer      | Create (valid)                                | Campaign saved with `callSource`, toast, back to the list                                                 |

## Verification

No dev server and no tests in this session. Verify with `npm run typecheck` after each task, the JSON parse of both locale files, the key check and the greps in Task 5. Visual check is done by the user in their own dev server at `/qa/campaigns/new`, in light and dark mode, following the demo script above.

## Out of scope

- Real FTP connectivity, real ZIP extraction, real upload. All mocked.
- Showing the saved `callSource` on the campaign list or detail (data is stored, not displayed yet).
- Uploading recordings to an existing campaign (already covered by the Upload audio modal in the campaign detail).
