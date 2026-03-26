const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const NETWORK_ERROR_MESSAGE =
  "서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인한 뒤 다시 시도해주세요.";

interface ApiResponse<T> {
  message: string;
  data: T;
}

export async function httpRequester<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(NETWORK_ERROR_MESSAGE, { cause: error });
    }

    throw new Error(NETWORK_ERROR_MESSAGE);
  }

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
