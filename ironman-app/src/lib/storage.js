import { supabase } from './supabase';

// Storage abstraction: Supabase when online, localStorage always as cache
// This means the app works offline and syncs when connected

const LOCAL_KEYS = {
  completed: 'im-completed',
  metrics: 'im-metrics',
  rpe: 'im-rpe',
};

function localGet(key, fallback = {}) {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
  catch { return fallback; }
}

function localSet(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ── Load all workout data ───────────────────────────────────────────
export async function loadWorkoutData() {
  // Always start from localStorage (instant, works offline)
  const local = {
    completed: localGet(LOCAL_KEYS.completed),
    metrics: localGet(LOCAL_KEYS.metrics),
    rpe: localGet(LOCAL_KEYS.rpe),
  };

  if (!supabase) return local;

  // Try to sync from Supabase
  try {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .order('week_day', { ascending: true });

    if (error) throw error;
    if (!data || data.length === 0) return local;

    // Convert Supabase rows to the same format as localStorage
    const completed = {};
    const metrics = {};
    const rpe = {};

    data.forEach((row) => {
      const key = row.week_day; // e.g. "0-1" (week index - day index)
      if (row.completed_at) completed[key] = row.completed_at;
      if (row.metrics) metrics[key] = row.metrics;
      if (row.rpe) rpe[key] = row.rpe;
    });

    // Update localStorage with Supabase data
    localSet(LOCAL_KEYS.completed, completed);
    localSet(LOCAL_KEYS.metrics, metrics);
    localSet(LOCAL_KEYS.rpe, rpe);

    return { completed, metrics, rpe };
  } catch (err) {
    console.warn('Supabase sync failed, using local data:', err.message);
    return local;
  }
}

// ── Save completed status ───────────────────────────────────────────
export async function saveCompleted(completed) {
  localSet(LOCAL_KEYS.completed, completed);

  if (!supabase) return;

  try {
    // Upsert all completed entries
    const rows = Object.entries(completed).map(([key, timestamp]) => ({
      week_day: key,
      completed_at: timestamp,
    }));

    if (rows.length > 0) {
      await supabase.from('workouts').upsert(rows, { onConflict: 'week_day' });
    }

    // Remove uncompleted entries (keys that were deleted)
    const allKeys = Object.keys(completed);
    const { data: existing } = await supabase.from('workouts').select('week_day');
    if (existing) {
      const toRemove = existing
        .filter((r) => r.completed_at && !allKeys.includes(r.week_day))
        .map((r) => r.week_day);
      if (toRemove.length > 0) {
        await supabase
          .from('workouts')
          .update({ completed_at: null })
          .in('week_day', toRemove);
      }
    }
  } catch (err) {
    console.warn('Failed to sync completed to Supabase:', err.message);
  }
}

// ── Save metrics ────────────────────────────────────────────────────
export async function saveMetrics(metrics) {
  localSet(LOCAL_KEYS.metrics, metrics);

  if (!supabase) return;

  try {
    const rows = Object.entries(metrics).map(([key, data]) => ({
      week_day: key,
      metrics: data,
    }));

    if (rows.length > 0) {
      await supabase.from('workouts').upsert(rows, { onConflict: 'week_day' });
    }
  } catch (err) {
    console.warn('Failed to sync metrics to Supabase:', err.message);
  }
}

// ── Save RPE ────────────────────────────────────────────────────────
export async function saveRpe(rpe) {
  localSet(LOCAL_KEYS.rpe, rpe);

  if (!supabase) return;

  try {
    const rows = Object.entries(rpe).map(([key, value]) => ({
      week_day: key,
      rpe: value,
    }));

    if (rows.length > 0) {
      await supabase.from('workouts').upsert(rows, { onConflict: 'week_day' });
    }
  } catch (err) {
    console.warn('Failed to sync RPE to Supabase:', err.message);
  }
}
