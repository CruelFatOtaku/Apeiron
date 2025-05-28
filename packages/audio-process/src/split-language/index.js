// 测试splitMixedLanguageText函数
const {
  ttsBaseUrl,
  splitMixedLanguageText,
  parseCommandLineArgs,
  tts,
  downloadFile,
  concatenateAudioFiles,
} = require("./utils");
const fs = require("fs");
const path = require("path");

async function f() {
  // 获取命令行参数text
  const args = parseCommandLineArgs();
  const text = args.text || "Hello, 你好，世界！";
  const segments = splitMixedLanguageText(text);
  console.log("分割后的文本段落：", JSON.stringify(segments));
  return;
  // 对分割后的每一段进行语音合成
  const audios = [];
  for (const segment of segments) {
    try {
      const res = await tts(
        segment.text,
        segment.type === "zh" ? "zh-CN" : "en-US",
        "2331a3d1-c2e3-4351-98f2-ad4b0a33533f"
      );

      console.log(`生成音频文件结果: ${res}`);
      audios.push(ttsBaseUrl + res.url);
    } catch (error) {
      console.error(`处理文本段落 "${segment.text}" 时出错:`, error);
    }
  }

  console.log("所有音频文件URL：", audios);

  // 下载所有文件到audios目录，并将他们连成一个
  const audiosDir = path.join(__dirname, "audios");
  if (!fs.existsSync(audiosDir)) {
    fs.mkdirSync(audiosDir);
  }
  const audioFiles = await Promise.all(
    audios.map((url, index) => {
      const outputPath = path.join(audiosDir, `audio_${index}.mp3`);
      return downloadFile(url, outputPath).then(() => outputPath);
    })
  );
  // 合并音频文件
  const mergedAudioPath = path.join(
    audiosDir,
    `merged_audio_${new Date().getTime()}.mp3`
  );
  await concatenateAudioFiles(audioFiles, mergedAudioPath);

  console.log(`所有音频文件已下载并合并为: ${mergedAudioPath}`);
}
f();

function testTTS() {
  const text = "你好，世界！";
  const type = "zh-CN"; // 假设我们只处理英文
  tts(text, type, "374ba210-fb40-4d8c-8432-a2e9d714e279")
    .then((res) => {
      console.log(`生成音频文件结果: ${JSON.stringify(res)}`);
    })
    .catch((error) => {
      console.error(`处理文本段落 "${text}" 时出错:`, error);
    });
}
// testTTS();
