interface GPTResponse {
  code: number;
  msg: string;
  data: Data;
}

interface Data {
  resp: string;
  promptTokenSize: number;
  tokenSize: number;
  completionTokenSize: number;
  model: string;
  maxTokenSize: number;
  sessionId: null;
  fee: number;
}

export async function GPTCompletion(
  prompt: string,
  options?: {
    user_name?: string;
    system_message?: string;
    model?: string;
    temperature?: number;
  }
): Promise<GPTResponse> {
  const defaultOptions = {
    user_name: "lijiacheng@baicizhan.com",
    system_message:
      "You are an AI assistant that helps people find information.",
    model: "gpt-4o",
    temperature: 0.7,
  };
  const body = JSON.stringify({
    content: prompt,
    ...defaultOptions,
    ...options,
  });
  const response = await fetch(
    "http://chat-ai.cya-tech.cn/openai/api/cya_prompt_toolkit",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    }
  );
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}
