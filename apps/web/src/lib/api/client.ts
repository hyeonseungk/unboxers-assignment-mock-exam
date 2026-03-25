const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface ApiResponse<T> {
  message: string;
  data: T;
}

export async function httpRequester<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(
      (errorBody as { message?: string }).message ??
        `요청 실패 (${response.status})`,
    );
  }

  const json: ApiResponse<T> = await response.json();
  return json.data;
}
