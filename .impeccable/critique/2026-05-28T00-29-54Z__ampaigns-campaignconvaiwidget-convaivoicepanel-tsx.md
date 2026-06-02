---
target: ConvaiVoicePanel.tsx
total_score: 25
p0_count: 0
p1_count: 2
timestamp: 2026-05-28T00-29-54Z
slug: ampaigns-campaignconvaiwidget-convaivoicepanel-tsx
---

## Design Health Score

| #         | Heuristic                       | Score     | Key Issue                                                                                     |
| --------- | ------------------------------- | --------- | --------------------------------------------------------------------------------------------- |
| 1         | Visibility of System Status     | 3         | Orb + caption communicate state well; connecting phase lacks explicit progress                |
| 2         | Match System / Real World       | 3         | Phone metaphor is familiar; session ID is unnecessary technical jargon                        |
| 3         | User Control and Freedom        | 3         | Clear hangup; no undo for sent messages                                                       |
| 4         | Consistency and Standards       | 2         | Two parallel layouts (VoicePanel vs ConversationColumn) create visual inconsistency           |
| 5         | Error Prevention                | 3         | Send disabled when empty/disconnected; no confirmation before ending a call                   |
| 6         | Recognition Rather Than Recall  | 3         | Tooltips on icon buttons; icons paired with labels in transcript                              |
| 7         | Flexibility and Efficiency      | 1         | No keyboard shortcuts for call, mute, or send; no accelerators at all                         |
| 8         | Aesthetic and Minimalist Design | 3         | Orb is elaborate but purposeful; session ID is pure noise                                     |
| 9         | Error Recovery                  | 2         | Error messages shown; microphone permission handled; no retry button or actionable next steps |
| 10        | Help and Documentation          | 2         | Tooltips only; no contextual help for first-time voice interaction                            |
| **Total** |                                 | **25/40** | **Acceptable**                                                                                |

## Anti-Patterns Verdict

**LLM assessment**: This does not look AI-generated. The orb visualization is a genuinely crafted piece with layered radial gradients, conic sweeps, and state-driven animation timing that shows real design intent. The chat bubble styling follows established messaging patterns without feeling templated. The component decomposition is clean and intentional. No side-stripe borders, no gradient text, no glassmorphism, no hero-metric template, no identical card grids.

The one area that leans generic is the text input + send button row in ConvaiMessageInput. It's a standard Mantine TextInput next to a standard Mantine Button with no customization that ties it to the voice panel's visual identity.

**Deterministic scan**: Detector unavailable (bundled detector not found). Manual review only.

## Overall Impression

A voice interaction panel with a genuinely impressive animated orb as its centerpiece. The orb's multi-layered animation system (field, orbits, trace, core, nodes) with state-specific timing is the strongest element. It communicates connection status, speaking, and listening through motion rather than text, which is exactly right for a voice interface.

The weakest element is the spatial composition below the orb. Controls, captions, and the transcript shell stack vertically without clear grouping logic, and the exposed session ID is a technical artifact that has no place in the visual hierarchy.

The single biggest opportunity: grouping the call and mute controls into a unified control bar, and removing the session ID from the visible UI entirely.

## What's Working

1. **The orb visualization** (ConvaiVoiceOrb + CSS): Six animation layers with five distinct state profiles (idle, connecting, connected, speaking, listening, error). Each state has unique timing for field pulse, orbit speed, trace sweep, and core beat. The `prefers-reduced-motion` override is present. This is craft.

2. **Progressive disclosure of controls**: Mute button only appears when connected. Error alert only shows on error state. The transcript shell is always present but the message input disables when disconnected. Clean state management.

3. **Accessibility foundations**: `aria-label` on every `ActionIcon`, `aria-hidden` on all decorative orb elements, `title` attribute on session ID for overflow. The component is keyboard-navigable through Mantine's built-in support.

## Priority Issues

### **[P1] Call and mute controls are spatially disconnected**

**What**: The call button is absolutely positioned inside `orbCluster` (overlapping the orb bottom), while the mute button renders as a standalone element further down the flex column, separated by the caption text and potentially the error alert.

**Why it matters**: These are both call controls. A user expects to find hangup and mute next to each other, as they are on every phone, video call app, and voice interface. The current layout forces the eye to scan vertically to find related actions.

**Fix**: Group call + mute into a single control row positioned below the orb. Move the call button out of absolute positioning within `orbCluster` and into a horizontal `Group` with the mute button. The orb should be a standalone visual element; controls should be a separate, adjacent row.

**Suggested command**: `impeccable layout`

### **[P1] Session ID exposed as visible UI element**

**What**: The raw UUID session ID renders as a visible, truncated, monospace text line between the controls and the transcript (`voiceSessionId`).

**Why it matters**: This is developer-facing debug information presented as user-facing UI. IT administrators don't need to see a WebSocket session ID during a voice call. It adds visual noise, breaks the vertical rhythm, and looks like a debug artifact left in the build. If support needs the ID, it belongs in a tooltip, a copy-to-clipboard action on the status badge, or a debug panel.

**Fix**: Remove the visible session ID from the panel. If it must be accessible, add it as a `title` attribute on the status badge in ConvaiHeader, or provide a "Copy session ID" action in a context menu.

**Suggested command**: `impeccable distill`

### **[P2] No keyboard shortcuts for primary voice actions**

**What**: There are no keyboard shortcuts for starting/ending a call, toggling mute, or sending a message (beyond Enter in the text input). For a voice interaction panel, this is a significant gap. Users in a call may need to mute quickly, and power users expect hotkeys.

**Why it matters**: An IT admin testing an AI agent's voice flow will repeatedly start/stop calls and toggle mute. Doing this by clicking small circular buttons is slow. Voice interfaces especially need quick-mute because the user's microphone is live.

**Fix**: Add global keyboard shortcuts when the panel is focused: Space or a key combo for mute toggle, Escape to end call. Document them in tooltips.

**Suggested command**: `impeccable harden`

### **[P2] Connecting state lacks explicit progress feedback**

**What**: When `status === 'connecting'`, the orb switches to a faster animation profile and the caption text changes to "Connecting..." but there is no spinner, progress bar, or step indicator. The user has no sense of how long connection will take or whether something is happening.

**Why it matters**: WebSocket connections to voice agents can take 2-5 seconds. During this time, the user is staring at an animated orb with no clear signal that work is in progress. The orb animation speeds up, but a first-time user has no baseline to compare against.

**Fix**: Add a subtle loading indicator during connecting state. Options: a pulsing ring around the call button, a text that cycles through connection steps ("Requesting access...", "Connecting...", "Almost ready..."), or a determinate progress indicator if the connection phases are trackable.

**Suggested command**: `impeccable polish`

### **[P2] Error state has no recovery action**

**What**: The error alert displays the error message but offers no retry button, no "Try again" action, and no link to troubleshooting. The user must click the call button again to retry, but this isn't indicated.

**Why it matters**: When a voice connection fails (microphone permission denied, network error, signed URL expired), the user needs to know what to do next. "Microphone permission denied" is clear about the problem but doesn't guide the user to browser settings. A network error doesn't suggest retrying.

**Fix**: Add a "Retry" button to the error alert. For permission errors, add guidance text like "Check your browser's microphone settings and try again."

**Suggested command**: `impeccable harden`

## Persona Red Flags

**Alex (Power User)**: No keyboard shortcuts for call, mute, or end session. Alex will tab to the call button and press Enter, but mute requires tabbing past the caption and error alert. Session ID is visual noise Alex doesn't need. No way to copy transcript during an active call (`canCopyTranscript` is `false` when connected). Alex will want to copy mid-call to paste into a bug report.

**Sam (Accessibility-Dependent)**: Strong foundations with `aria-label` and `aria-hidden`. However, the call button's absolute positioning within `orbCluster` may create an unexpected tab order (the button is visually below the orb but is a child of the orb container). The mute button appearing/disappearing based on connection state could disorient screen reader users who lose their place in the tab flow. The orb's state changes are communicated visually through animation speed but not announced to assistive technology.

**Jordan (First-Timer)**: The orb is visually striking but doesn't explain itself. Jordan sees an animated sphere and a phone icon but may not understand this is a voice call interface. The session ID looks like something important that needs attention. No onboarding or helper text explains "Click the phone button to start a voice conversation with the AI agent."

## Minor Observations

- The `ConvaiMessageInput` send button uses `color='green'` (Mantine default green) rather than the brand's `#1BB54A` Newtech Green. If the Mantine theme maps `green` to the brand green, this is fine. If not, it's a subtle brand inconsistency.
- The transcript scroll area has `min-height: 10rem` which is good, but in constrained vertical space the orb (140px) + controls + caption + transcript minimum creates a ~340px floor that may not fit in shorter viewports.
- The `voiceTranscriptShell` uses `justify-content: flex-end` which pushes content to the bottom. This is correct for a chat-like interface but means the empty state text sits at the bottom of the container rather than centered, which looks slightly off.
- The call button's `border: 3px solid var(--mantine-color-white)` creates a cutout effect against the orb, but in dark mode this switches to `var(--mantine-color-dark-7)`. The visual effect depends on the orb's gradient being behind the border, which works but is fragile to orb size changes.

## Questions to Consider

- What if the call and mute controls were a single horizontal bar below the orb, matching every voice/call interface users already know?
- Does the session ID serve any user need, or is it a debugging convenience that should move to a tooltip or dev-only overlay?
- What would happen if the orb were smaller (100px) and the transcript area gained that vertical space?
- Should the copy-transcript button be available during an active call, not only after disconnection?
