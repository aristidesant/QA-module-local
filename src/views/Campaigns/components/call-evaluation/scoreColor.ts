export const getScoreColor = (score: number): string => {
  if (score >= 90) return 'green';
  if (score >= 80) return 'lime';
  if (score >= 70) return 'yellow';
  if (score >= 60) return 'orange';
  return 'red';
};

export const formatDuration = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};
