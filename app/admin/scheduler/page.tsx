'use client';

import { useState } from 'react';

export default function SchedulerAdminUI() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string>('');

  const adminSecret = 'UmairSaad18+'; // Or read from an input field / state

  async function handleAction(endpoint: string, method: string = 'POST', isCron = false) {
    setLoading(true);
    setLogs((prev) => `[RUNNING] ${method} ${endpoint}...\n` + prev);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (!isCron) {
        headers['x-vibexnews-admin-secret'] = adminSecret;
      }

      const res = await fetch(endpoint, { method, headers });
      const data = await res.json();

      setLogs(
        (prev) =>
          `[SUCCESS ${res.status}] ${endpoint}:\n${JSON.stringify(data, null, 2)}\n\n` +
          prev
      );
    } catch (err: unknown) {
      setLogs((prev) => `[ERROR] ${endpoint}: ${err instanceof Error ? err.message : String(err)}\n\n` + prev);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2>Oxylabs Scheduler Admin Dashboard</h2>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <button
          disabled={loading}
          onClick={() => handleAction('/api/oxylabs/schedules', 'POST')}
          style={{ padding: '8px 16px', cursor: 'pointer' }}
        >
          1. Sync Schedules
        </button>

        <button
          disabled={loading}
          onClick={() => handleAction('/api/oxylabs/schedules', 'GET')}
          style={{ padding: '8px 16px', cursor: 'pointer' }}
        >
          2. List Schedules
        </button>

        <button
          disabled={loading}
          onClick={() => handleAction('/api/oxylabs-process', 'POST')}
          style={{ padding: '8px 16px', cursor: 'pointer' }}
        >
          3. Process Job Results
        </button>

        <button
          disabled={loading}
          onClick={() => handleAction('/api/cron/pipeline', 'GET', true)}
          style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#e2f0d9' }}
        >
          4. Run Full Pipeline
        </button>
      </div>

      <h3>Execution Logs</h3>
      <pre
        style={{
          background: '#1e1e1e',
          color: '#00ff00',
          padding: '1rem',
          borderRadius: '6px',
          minHeight: '250px',
          maxHeight: '400px',
          overflowY: 'auto',
          fontSize: '13px',
        }}
      >
        {logs || 'No logs yet. Click a button above to execute testing.'}
      </pre>
    </div>
  );
}