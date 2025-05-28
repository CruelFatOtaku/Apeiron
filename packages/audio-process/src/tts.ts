/**
 * 百词斩问题
 */

export const ttsBaseUrl = "http://172.16.200.91:8501";
export const ttsApiPath = "/api/azure/tts/generateVoiceCopyTtsAudio/v2";

export enum TTSLanguage {
  enUS = "en-US",
  zhCN = "zh-CN",
}

export async function TTS(
  text: string,
  options?: {
    language?: TTSLanguage;
    speakerProfileId?: string;
    speed?: string;
    baseModel?: string;
    audioConfig?: string;
  }
): Promise<{
  message: string;
  url: string;
  status: number; // 0表示成功，非0表示失败
}> {
  const defaultOptions = {
    language: TTSLanguage.enUS,
    speakerProfileId: "2331a3d1-c2e3-4351-98f2-ad4b0a33533f",
    speed: "0%",
    baseModel: "DragonLatestNeural",
    audioConfig: "riff-24khz-16bit-mono-pcm",
  };
  const url = `${ttsBaseUrl}${ttsApiPath}`;
  const data = {
    text: text,
    ...defaultOptions,
    ...options,
  };
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status} }`);
  }
  return await response.json();
}

export function getTTSAudioFileUrl(fileName: string): string {
  return `${ttsBaseUrl}${fileName}`;
}
