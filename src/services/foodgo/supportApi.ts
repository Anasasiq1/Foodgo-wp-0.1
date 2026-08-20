import { apiClient } from '../apiClient';
import { SupportMessage } from '../../types';

export async function fetchLiveSupportMessages(userEmail: string, userName: string): Promise<SupportMessage[]> {
  try {
    const res = await apiClient<{ success: boolean; messages: SupportMessage[] }>('/wp-json/foodgo/v1/support/messages', {
      params: {
        email: userEmail,
        name: userName,
      },
    });
    if (res && res.success && Array.isArray(res.messages)) {
      return res.messages;
    }
  } catch (e) {
    // Return empty on offline
  }
  return [];
}

export async function sendSupportMessageToWp(
  userEmail: string,
  userName: string,
  text: string,
  audioUrl?: string,
  audioDuration?: number
): Promise<SupportMessage | null> {
  try {
    const res = await apiClient<{ success: boolean; message: SupportMessage }>('/wp-json/foodgo/v1/support/send', {
      method: 'POST',
      body: JSON.stringify({
        email: userEmail,
        name: userName,
        text,
        audioUrl,
        audioDuration,
      }),
    });
    if (res && res.success && res.message) {
      return res.message;
    }
  } catch (e) {
    console.warn('Failed to send support message to WP:', e);
  }
  return null;
}
