import { mergeAudioFiles } from "../concatAudio";
import fs from "fs";
import path from "path";

export async function run() {
  try {
    // 读取 ./split-language/audios/ 下面所有audio_开头的文件
    const audioDir = path.resolve(__dirname, "../split-language/audios");
    const files = fs
      .readdirSync(audioDir)
      .filter(
        (file) =>
          file.startsWith("audio_") &&
          (file.endsWith(".mp3") || file.endsWith(".wav"))
      )
      .map((file) => path.join(audioDir, file));
    if (files.length === 0) {
      console.error("没有找到符合条件的音频文件");
      return;
    }
    console.log(files);
    const outputFolder = path.resolve(__dirname, "../../output");
    if (!fs.existsSync(outputFolder)) {
      fs.mkdirSync(outputFolder, { recursive: true });
    }
    const outputFile = path.resolve(outputFolder, "merged_audio.mp3");
    const result = await mergeAudioFiles(files, outputFile, {
      format: "mp3",
      codec: "libmp3lame",
    });
    console.log("音频合并成功，输出文件:", result);
  } catch (error) {
    console.error("音频合并失败:", error);
  }
}

run();
