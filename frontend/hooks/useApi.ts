import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiService, ToolsResponse, Category } from '../services/api';

export function useApiTools(params: {
  search?: string;
  category?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
}) {
  const [data, setData] = useState<ToolsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTools = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiService.getTools(params);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tools');
    } finally {
      setLoading(false);
    }
  }, [params.search, params.category, params.featured, params.page, params.limit]);

  useEffect(() => {
    fetchTools();
  }, [fetchTools]);

  return { data, loading, error, refetch: fetchTools };
}

export function useApiCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiService.getCategories();
      setCategories(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, loading, error, refetch: fetchCategories };
}

export function useApiToolById(id: string | null) {
  const [tool, setTool] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || id === 'undefined') {
      setTool(null);
      return;
    }

    const fetchTool = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await apiService.getToolById(id);
        setTool(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tool');
      } finally {
        setLoading(false);
      }
    };

    fetchTool();
  }, [id]);

  return { tool, loading, error };
}
