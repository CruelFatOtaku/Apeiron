import { getTTSAudioFileUrl, TTS, TTSLanguage } from "../tts";
import { splitMixedLanguageText } from "../string";
import { mergeAudioFromUrls } from "../concatAudio";
import fs from "fs";
import path from "path";

async function run(text: string) {
  const segments = splitMixedLanguageText(text);
  const audioUrls: string[] = [];
  const tempFileFolder = path.resolve(__dirname, "../../temp");
  if (!fs.existsSync(tempFileFolder)) {
    fs.mkdirSync(tempFileFolder, { recursive: true });
  }
  for (const segment of segments) {
    try {
      const res = await TTS(segment.text, {
        language: segment.type === "zh" ? TTSLanguage.zhCN : TTSLanguage.enUS,
      });
      if (res.status !== 0) {
        console.error(`TTS生成失败: ${res.message}`);
        continue;
      }
      audioUrls.push(getTTSAudioFileUrl(res.url));
    } catch (error) {
      console.error(`TTS请求失败: ${error}`);
      continue;
    }
  }
  console.log("生成的音频URL:", audioUrls);
  if (audioUrls.length === 0) {
    console.error("没有生成任何音频文件");
    return;
  }
  const outputFile = path.join(
    __dirname,
    "../../output",
    `mixed_audio_${new Date().getTime()}.mp3`
  );
  try {
    const mergedFile = await mergeAudioFromUrls(
      audioUrls,
      outputFile,
      tempFileFolder,
      {
        format: "mp3",
        codec: "libmp3lame",
      }
    );
    console.log("音频合并成功，输出文件:", mergedFile);
  } catch (error) {
    console.error("音频合并失败:", error);
  }
}

run(
  "来看这个很长的词“commitment”。商家经常在店里挂上招牌，“假一赔十，童叟无欺”，这就是一种“commitment”，意思是承诺。结婚誓言，员工向老板保证完成任务，都是“commitment”。"
);
