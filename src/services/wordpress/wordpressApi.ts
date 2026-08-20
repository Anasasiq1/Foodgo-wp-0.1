import { apiClient } from '../apiClient';

export interface WordPressSiteInfo {
  name: string;
  description: string;
  url: string;
  home: string;
  gmt_offset: string;
  timezone_string: string;
}

export async function fetchWordPressSiteInfo(): Promise<WordPressSiteInfo | null> {
  try {
    return await apiClient<WordPressSiteInfo>('/wp-json');
  } catch (err) {
    return null;
  }
}
