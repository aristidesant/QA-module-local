import { useEffect, useState } from 'react';
import { TextInput, Textarea, Button } from '@mantine/core';
import FormSelect from '~/components/ui/FormSelect/FormSelect';
import { useCreateKnowledgeBase, useUpdateKnowledgeBase } from '~/queries/knowledgeBaseQueries';
import useKnowledgeBaseStore from '../store/knowledgeBaseStore';
import styles from './KnowledgeBaseForm.module.css';

interface Props {
  initialData?: { id?: number | string; name?: string; description?: string } | null;
}

const KnowledgeBaseForm = ({ initialData }: Props = {}) => {
  const clearRight = useKnowledgeBaseStore((s) => s.clearRightComponent);
  const createMutation = useCreateKnowledgeBase();
  const updateMutation = useUpdateKnowledgeBase();

  const [name, setName] = useState(initialData?.name ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [type, setType] = useState<string | null>(initialData && (initialData as any).type ? String((initialData as any).type) : '');
  const [sourceUrl, setSourceUrl] = useState<string>('');
  const [textContent, setTextContent] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    setName(initialData?.name ?? '');
    setDescription(initialData?.description ?? '');
    setType(initialData && (initialData as any).type ? String((initialData as any).type) : '');
    setSourceUrl(initialData && (initialData as any).sourceUrl ? String((initialData as any).sourceUrl) : '');
    setTextContent(initialData && (initialData as any).textContent ? String((initialData as any).textContent) : '');
  }, [initialData]);

  const onSave = async () => {
    if (!name.trim()) return;
    try {
      if (initialData?.id) {
        await updateMutation.mutateAsync({ id: Number(initialData.id), data: { name: name.trim(), description: description.trim(), type: type || undefined, sourceUrl: sourceUrl || undefined, textContent: textContent || undefined, file: file || undefined } });
      } else {
        await createMutation.mutateAsync({ name: name.trim(), description: description.trim(), type: type || undefined, sourceUrl: sourceUrl || undefined, textContent: textContent || undefined, file: file || undefined });
      }
      clearRight();
    } catch (err) {
      // swallow here; mutations have their own error handling
    }
  };

  return (
    <div className={styles.container}>
      <TextInput label="Name" value={name} onChange={(e) => setName(e.currentTarget.value)} required />
      <FormSelect
        label="Type"
        placeholder="Select type"
        value={type ?? ''}
        onChange={(v) => setType(v ?? '')}
        data={[
          { value: 'FILE', label: 'File (PDF)' },
          { value: 'URL', label: 'URL' },
          { value: 'TEXT', label: 'Text (paste/upload)' },
        ]}
      />
      {type === 'URL' && (
        <TextInput label="Source URL" value={sourceUrl} onChange={(e) => setSourceUrl(e.currentTarget.value)} />
      )}
      {type === 'TEXT' && (
        <Textarea label="Text Content" value={textContent} onChange={(e) => setTextContent(e.currentTarget.value)} />
      )}
      {(type === 'FILE' || type === 'TEXT') && (
        <div className={styles.fileInputRow}>
          <label className={styles.fileLabel}>Upload file</label>
          <input
            type="file"
            accept={type === 'FILE' ? '.pdf,application/pdf' : '.txt,text/*,application/octet-stream'}
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              setFile(f);
            }}
          />
          {file && <div className={styles.fileName}>{file.name}</div>}
        </div>
      )}
      <Textarea label="Description" value={description} onChange={(e) => setDescription(e.currentTarget.value)} />

      <div className={styles.actions}>
        <Button variant="default" onClick={() => clearRight()}>
          Cancel
        </Button>
        <Button onClick={onSave} loading={createMutation?.status === 'pending' || updateMutation?.status === 'pending'}>
          Save
        </Button>
      </div>
    </div>
  );
};

export default KnowledgeBaseForm;
