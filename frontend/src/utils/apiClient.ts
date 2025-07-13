const API_BASE_URL = 'http://localhost:8000';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  }

  // Smart Chat endpoint
  async sendChatMessage(question: string, userId: string = 'default_user') {
    return this.request<{ answer: string }>('/chat', {
      method: 'POST',
      body: JSON.stringify({ question, user_id: userId }),
    });
  }

  // PDF Upload endpoint
  async uploadPDF(file: File, userId: string = 'default_user') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_id', userId);

    try {
      const response = await fetch(`${this.baseUrl}/upload_pdf`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'PDF upload failed',
      };
    }
  }

  // Voice Assistant endpoint
  async uploadAudio(file: File) {
    const formData = new FormData();
    formData.append('audio', file);

    try {
      const response = await fetch(`${this.baseUrl}/voice_chat`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Audio upload failed',
      };
    }
  }

  // CSV Upload endpoint
  async uploadCSV(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${this.baseUrl}/upload_csv`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'CSV upload failed',
      };
    }
  }

  // CSV Query endpoint
  async queryCSV(question: string) {
    return this.request<{ answer: string }>('/query_csv', {
      method: 'POST',
      body: JSON.stringify({ question }),
    });
  }

  // Calendar Event endpoint
  async createCalendarEvent(eventData: {
    title: string;
    description?: string;
    start_time: string;
    end_time: string;
  }) {
    return this.request<{ success: boolean; event_link?: string }>('/create_calendar_event', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }
}

export const apiClient = new ApiClient();