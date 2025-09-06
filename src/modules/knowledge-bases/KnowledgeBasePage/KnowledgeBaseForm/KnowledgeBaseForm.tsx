import { useEffect, useMemo, useState } from 'react';
import {
  TextInput,
  Textarea,
  Button,
  Paper,
  Stack,
  Group,
  Divider,
  Text,
  Badge,
  Title,
  FileInput,
} from '@mantine/core';
import { IconFile, IconUpload, IconWorldWww } from '@tabler/icons-react';
import FormSelect from '~/components/ui/FormSelect/FormSelect';
import { useCreateKnowledgeBase, useKnowledgeBase, useUpdateKnowledgeBase } from '~/queries/knowledgeBaseQueries';
import { KnowledgeBaseType } from '~/models/KnowledgeBaseModel';
import useKnowledgeBaseStore from '../store/knowledgeBaseStore';
import styles from './KnowledgeBaseForm.module.css';

interface Props {
  id?: number;
}

const KnowledgeBaseForm = ({ id }: Props = {}) => {
  const clearRight = useKnowledgeBaseStore((s) => s.clearRightComponent);
  const createMutation = useCreateKnowledgeBase();
  const updateMutation = useUpdateKnowledgeBase();
  const { data: kb, isLoading } = useKnowledgeBase(id);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<KnowledgeBaseType | ''>('');
  const [sourceUrl, setSourceUrl] = useState<string>('');
  const [textContent, setTextContent] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);

  // Derived validation state
  const urlError = useMemo(() => {
    if (type !== KnowledgeBaseType.URL) return null;
    if (!sourceUrl) return 'Please enter a URL.';
    try {
      // Will throw on invalid
      // eslint-disable-next-line no-new
      new URL(sourceUrl);
      return null;
    } catch {
      return 'Enter a valid URL (e.g., https://example.com/docs).';
    }
  }, [sourceUrl, type]);

  const fileError = useMemo(() => {
    const hasExistingFile = !!kb?.file || !!kb?.fileId;
    if (type === KnowledgeBaseType.FILE) {
      // Require a file if creating without an existing one; allow keeping current file on update
      return !file && !hasExistingFile ? 'Please upload a file.' : null;
    }
    if (type === KnowledgeBaseType.TEXT) {
      const existingText = kb?.textContent?.trim();
      return !file && !textContent?.trim() && !existingText ? 'Add text or upload a .txt/.md file.' : null;
    }
    return null;
  }, [file, textContent, type, kb?.file, kb?.fileId, kb?.textContent]);

  const isSaving = createMutation?.status === 'pending' || updateMutation?.status === 'pending';

  const canSave = useMemo(() => {
    if (!name.trim()) return false;
    if (!type) return false;
    if (type === KnowledgeBaseType.URL && urlError) return false;
    if ((type === KnowledgeBaseType.FILE || type === KnowledgeBaseType.TEXT) && fileError) return false;
    return true;
  }, [fileError, name, type, urlError]);

  useEffect(() => {
    if (!kb) return;
    setName(kb.name ?? '');
    setDescription(kb.description ?? '');
    setType(kb.type ?? '');
    setSourceUrl(kb.sourceUrl ?? '');
    setTextContent(kb.textContent ?? '');
    // Do not set file from server value; file is only for new upload
  }, [kb]);

  const onSave = async () => {
    if (!canSave) return;
    try {
      if (id) {
        await updateMutation.mutateAsync({
          id: Number(id),
          data: {
            name: name.trim(),
            description: description.trim(),
            type: type || undefined,
            sourceUrl: sourceUrl || undefined,
            textContent: textContent || undefined,
            file: file || undefined,
          },
        });
      } else {
        await createMutation.mutateAsync({
          name: name.trim(),
          description: description.trim(),
          type: type || undefined,
          sourceUrl: sourceUrl || undefined,
          textContent: textContent || undefined,
          file: file || undefined,
        });
      }
      clearRight();
    } catch (err) {
      // swallow here; mutations have their own error handling
    }
  };

  // compute status label/color to show on top header as requested
  const headerStatus = (() => {
    const label = (kb?.status ?? (file ? 'PENDING' : 'INACTIVE')) as string;
    const colorMap: Record<string, string> = {
      PENDING: 'yellow',
      UPLOADING: 'blue',
      ACTIVE: 'green',
      FAILED: 'red',
      INACTIVE: 'gray',
    };
    const color = colorMap[label] ?? 'blue';
    return { label, color } as const;
  })();

  return (
    <div className={styles.container}>
      {/* 1) Centralized Title with description and status - No card */}
      <Stack gap="xs" align="center" className={styles.header}>
        <Title order={3} className={styles.title}>Knowledge Base</Title>
        <Text c="dimmed" size="sm" ta="center">
          Add or edit a knowledge base entry for your agent.
        </Text>
        <Badge color={headerStatus.color} size="sm">{headerStatus.label}</Badge>
      </Stack>

      {/* 2) Card with the Form inputs */}
      <Paper withBorder radius="sm" p="md">
        <Stack gap="sm">
          <TextInput
            label="Name"
            placeholder="e.g., Product FAQs"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            required
            disabled={isLoading}
          />

          <FormSelect
            label="Type"
            placeholder="Select a content source"
            value={type ?? ''}
            onChange={(v) => {
              setType((v as KnowledgeBaseType) ?? '');
              // Reset source-specific fields when switching type
              setSourceUrl('');
              setTextContent('');
              setFile(null);
            }}
            data={[
              { value: KnowledgeBaseType.FILE, label: 'File (PDF)' },
              { value: KnowledgeBaseType.URL, label: 'URL' },
              { value: KnowledgeBaseType.TEXT, label: 'Text (paste/upload)' },
            ]}
            disabled={isLoading}
          />

          {type === KnowledgeBaseType.URL && (
            <TextInput
              label="Source URL"
              placeholder="https://example.com/docs/article"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.currentTarget.value)}
              leftSection={<IconWorldWww size={16} />}
              error={urlError}
              description="Publicly accessible page to fetch content from."
              disabled={isLoading}
            />
          )}

          {type === KnowledgeBaseType.TEXT && (
            <Textarea
              label="Text Content"
              placeholder="Paste relevant text here..."
              value={textContent}
              onChange={(e) => setTextContent(e.currentTarget.value)}
              autosize
              minRows={4}
              disabled={isLoading}
            />
          )}

          <Textarea
            label="Description"
            placeholder="Short internal note about this knowledge base"
            value={description}
            onChange={(e) => setDescription(e.currentTarget.value)}
            autosize
            minRows={3}
            disabled={isLoading}
          />

          {(type === KnowledgeBaseType.FILE || type === KnowledgeBaseType.TEXT) && (
            <div className={styles.fileBlock}>
              <FileInput
                label={type === KnowledgeBaseType.FILE ? 'Upload file' : 'Optional: Upload text file'}
                placeholder={type === KnowledgeBaseType.FILE ? 'Choose a file or drop it here' : 'Attach a .txt or .md (optional)'}
                value={file}
                onChange={setFile}
                accept={type === KnowledgeBaseType.FILE ? '.pdf,application/pdf' : '.txt,text/plain,.md'}
                leftSection={<IconFile size={16} />}
                rightSection={<IconUpload size={16} />}
                clearable
                error={fileError}
                description={
                  type === KnowledgeBaseType.FILE
                    ? 'Supported: PDF. Max 25MB.'
                    : 'Supported: TXT/MD. You can also paste text above.'
                }
                disabled={isLoading}
              />
              {file && (
                <Text size="sm" className={styles.fileName} title={file.name}>
                  {file.name}
                </Text>
              )}
            </div>
          )}
        </Stack>
      </Paper>

      {/* 3) Card with informational stuff (not editable, visible for update only) */}
      {id && (
        <Paper withBorder radius="sm" p="md">
          <Stack gap="xs">
            <Group justify="space-between">
              <Text size="sm" c="dimmed">File name</Text>
              <Text size="sm">{file ? file.name : (kb?.file?.name ?? 'No file')}</Text>
            </Group>
            <Divider />
            <Group justify="space-between">
              <Text size="sm" c="dimmed">Status</Text>
              <Badge color={headerStatus.color} size="sm">{headerStatus.label}</Badge>
            </Group>
          </Stack>
        </Paper>
      )}

      {/* 4) Card with the button actions */}
      <Paper withBorder radius="sm" p="md" className={styles.footerCard}>
        <Group justify="space-between" className={styles.footer}>
          <Text size="sm" c="dimmed">
            Changes are saved to your workspace.
          </Text>
          <Group gap="sm">
            <Button variant="default" onClick={() => clearRight()} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={onSave} loading={isSaving} disabled={!canSave || isLoading}>
              Save
            </Button>
          </Group>
        </Group>
      </Paper>
    </div>
  );
};

export default KnowledgeBaseForm;
 
