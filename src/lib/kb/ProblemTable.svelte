<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import type { Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { problemsIn, type Problem } from '#lib/kb/problems';

  // tickets: problem → link to the ticket filed for it.
  let { ticket, tickets = {} }: { ticket: number; tickets?: Partial<Record<Problem, string>> } = $props();

  const result = $derived(problemsIn(reports as Report[], ticket, tenantOf, notes.oneDayMove));
  const label = (url: string) => '#' + url.split('/').pop();
</script>

<p class="sum">
  <strong>{result.reports.length}</strong> reports merged into #{ticket}
  ({result.rows} export rows, {result.rows - result.reports.length} of them repeats) ·
  <strong>{result.problems.length}</strong>
  {result.problems.length === 1 ? 'problem' : 'problems'}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tenants</th><th>seen</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each result.problems as g (g.problem)}
      <tr class:missing={!tickets[g.problem]}>
        <td><code>{g.problem}</code></td>
        <td>{g.reports.length}{#if g.filedUnder}<span class="under"> · filed under <code>{g.filedUnder}</code></span>{/if}</td>
        <td>{g.tenants}</td>
        <td>{g.firstSeen} → {g.lastSeen}</td>
        <td>
          {#if tickets[g.problem]}<a href={tickets[g.problem]}>{label(tickets[g.problem]!)}</a>{:else}no ticket yet{/if}
        </td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .sum { font-size: 1.1rem; }
  .missing td { background: var(--warn-bg); }
  .missing td:last-child { color: var(--warn); font-weight: 600; }
  .under { color: var(--muted); font-size: 0.85em; }
</style>
