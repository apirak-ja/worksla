// Schema and type guards for admin settings
// Prevents "S.map is not a function" errors

export interface Assignee {
  id: number | string;
  name: string;
  display_name?: string;
  op_user_id?: number;
}

export interface Filters {
  created_from?: string;
  created_to?: string;
  assignees?: string[] | number[] | Assignee[] | { items: Assignee[] } | string | null;
  start_date?: string | Date | null;
  end_date?: string | Date | null;
  assignee_ids?: number[];
  status?: string[];
  priority?: string[];
}

/**
 * Safely normalize assignees data from various API response formats
 * Handles: arrays, objects with items, stringified JSON, null/undefined
 */
export function normalizeAssignees(input: Filters['assignees']): Assignee[] {
  console.debug('[settings] normalizeAssignees input:', input);

  // Case 1: Already an array
  if (Array.isArray(input)) {
    return input.map((item) => {
      if (typeof item === 'object' && item !== null) {
        return {
          id: item.id ?? item.op_user_id ?? 0,
          name: item.name || item.display_name || `User ${item.id}`,
          display_name: item.display_name,
          op_user_id: item.op_user_id,
        };
      }
      // Primitive value (number or string ID)
      return {
        id: item,
        name: String(item),
      };
    });
  }

  // Case 2: String (JSON or comma-separated)
  if (typeof input === 'string' && input.trim()) {
    try {
      const parsed = JSON.parse(input);
      if (Array.isArray(parsed)) {
        return normalizeAssignees(parsed);
      }
    } catch {
      // Not JSON, try splitting
      const ids = input.split(',').map((s) => s.trim()).filter(Boolean);
      return ids.map((id) => ({ id, name: id }));
    }
  }

  // Case 3: Object with items property
  if (input && typeof input === 'object' && 'items' in input) {
    const items = (input as any).items;
    if (Array.isArray(items)) {
      return normalizeAssignees(items);
    }
  }

  // Case 4: Null, undefined, or invalid
  console.debug('[settings] normalizeAssignees returning empty array');
  return [];
}

/**
 * Type guard: Check if value is a valid array
 */
export function isValidArray<T = any>(value: unknown): value is T[] {
  return Array.isArray(value);
}

/**
 * Safe array getter with fallback
 */
export function getArray<T = any>(value: unknown, fallback: T[] = []): T[] {
  return isValidArray(value) ? value : fallback;
}

/**
 * Normalize API response data
 */
export function normalizeApiResponse(data: any): {
  assignees: Assignee[];
  filters: Filters;
} {
  console.debug('[settings] normalizeApiResponse data:', data);

  // Handle various response formats
  let assignees: Assignee[] = [];
  let filters: Filters = {};

  if (data) {
    // Extract assignees from various possible locations
    if (data.assignees) {
      assignees = normalizeAssignees(data.assignees);
    } else if (data.items) {
      assignees = normalizeAssignees(data.items);
    } else if (Array.isArray(data)) {
      assignees = normalizeAssignees(data);
    }

    // Extract filters
    filters = {
      created_from: data.created_from || data.start_date || '',
      created_to: data.created_to || data.end_date || '',
      assignees: data.assignees || data.assignee_ids || [],
      assignee_ids: getArray(data.assignee_ids, []),
      status: getArray(data.status, []),
      priority: getArray(data.priority, []),
    };
  }

  return { assignees, filters };
}

/**
 * Safe map wrapper - ensures value is array before mapping
 */
export function safeMap<T, R>(
  value: unknown,
  mapper: (item: T, index: number) => R,
  fallback: R[] = []
): R[] {
  if (!isValidArray<T>(value)) {
    console.warn('[settings] safeMap received non-array:', value);
    return fallback;
  }
  return value.map(mapper);
}
