const ffmpeg = require("fluent-ffmpeg");
const path = require("path");
const fs = require("fs");
const https = require("https");
const http = require("http");

/**
 * 合并多个音频文件
 * @param {string[]} inputFiles - 输入音频文件路径数组
 * @param {string} outputFile - 输出文件路径
 * @param {Object} options - 可选配置
 * @param {string} options.format - 输出格式 (默认: 'mp3')
 * @param {string} options.codec - 音频编码器 (默认: 'libmp3lame')
 * @returns {Promise<string>} 返回输出文件路径
 */
function mergeAudioFiles(inputFiles, outputFile, options = {}) {
  return new Promise((resolve, reject) => {
    if (!inputFiles || inputFiles.length === 0) {
      reject(new Error("输入文件列表不能为空"));
      return;
    }

    const { format = "mp3", codec = "libmp3lame" } = options;

    const command = ffmpeg();

    // 添加所有输入文件
    inputFiles.forEach((file) => {
      command.input(file);
    });

    // 配置输出
    command
      .audioCodec(codec)
      .format(format)
      .on("start", (commandLine) => {
        console.log("开始合并音频:", commandLine);
      })
      .on("progress", (progress) => {
        console.log(`合并进度: ${progress.percent}%`);
      })
      .on("end", () => {
        console.log("音频合并完成");
        resolve(outputFile);
      })
      .on("error", (err) => {
        console.error("音频合并失败:", err);
        reject(err);
      })
      .mergeToFile(outputFile);
  });
}

/**
 * 简单的音频文件连接（按顺序）
 * @param {string[]} inputFiles - 输入音频文件路径数组
 * @param {string} outputFile - 输出文件路径
 * @returns {Promise<string>} 返回输出文件路径
 */
function concatenateAudioFiles(inputFiles, outputFile) {
  return new Promise((resolve, reject) => {
    if (!inputFiles || inputFiles.length === 0) {
      reject(new Error("输入文件列表不能为空"));
      return;
    }

    const command = ffmpeg();

    // 添加所有输入文件
    inputFiles.forEach((file) => {
      command.input(file);
    });

    // 使用 concat 滤镜按顺序连接
    const filterComplex =
      inputFiles.map((_, index) => `[${index}:a]`).join("") +
      `concat=n=${inputFiles.length}:v=0:a=1[out]`;

    command
      .complexFilter(filterComplex, "out")
      .audioCodec("libmp3lame")
      .format("mp3")
      .on("start", (commandLine) => {
        console.log("开始连接音频:", commandLine);
      })
      .on("progress", (progress) => {
        console.log(`连接进度: ${progress.percent}%`);
      })
      .on("end", () => {
        console.log("音频连接完成");
        resolve(outputFile);
      })
      .on("error", (err) => {
        console.error("音频连接失败:", err);
        reject(err);
      })
      .save(outputFile);
  });
}

const ttsBaseUrl = "http://172.16.200.91:8501";
const ttsApiPath = "/api/azure/tts/generateVoiceCopyTtsAudio/v2";
/**
 *  接口参数：
 * {
 *  "speakerProfileId": "044aeaae-5982-45b4-bb4d-aafb456a5798",
 *  "baseModel": "DragonLatestNeural",
 *  "text": "早上好朋友",
 *  "language": "en-US",
 *  "speed": "0%",
 *  "audioConfig": "riff-24khz-16bit-mono-pcm"
 *  }
 * 返回格式：{
 *  "message": "success",
 *  "status": 0,
 *  "url": "/s/outputs/azure/tts1748314579379_1727_DragonLatestNeural_044aeaae-5982-45b4-bb4d-aafb456a5798.wav"
 *}
 * @param {*} text
 * @param {*} language
 * @param {*} voice
 * @returns
 */

function tts(text, language, voice, speed = "0%") {
  const url = `${ttsBaseUrl}${ttsApiPath}`;
  const data = {
    text: text,
    speakerProfileId: voice,
    baseModel: "DragonLatestNeural",
    language: language,
    speed: speed,
    audioConfig: "riff-24khz-16bit-mono-pcm",
  };
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }).then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  });
}

/**
 * 将中文和英文混合的文本切分为段,每一段带原文和中英文类型
 */
function splitMixedLanguageText(text) {
  const segments = [];
  const regex = /([a-zA-Z\s]+|[\u4e00-\u9fa5]+)/g; // 匹配英文和中文字符
  let match;

  while ((match = regex.exec(text)) !== null) {
    const segment = match[0].trim();
    if (segment) {
      segments.push({
        text: segment,
        type: /^[a-zA-Z\s]+$/.test(segment) ? "en" : "zh",
      });
    }
  }

  return segments;
}

/**
 * 解析命令行参数
 */
function parseCommandLineArgs() {
  const args = process.argv.slice(2);
  const options = {};
  args.forEach((arg) => {
    const [key, value] = arg.split("=");
    options[key.replace("--", "")] = value;
  });
  return options;
}

/**
 * 下载文件
 */
function downloadFile(url, outputPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath);
    http
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`下载失败，状态码: ${response.statusCode}`));
          return;
        }
        response.pipe(file);
        file.on("finish", () => {
          file.close(resolve);
        });
      })
      .on("error", (err) => {
        fs.unlink(outputPath, () => reject(err));
      });
  });
}

module.exports = {
  ttsBaseUrl,
  mergeAudioFiles,
  concatenateAudioFiles,
  tts,
  splitMixedLanguageText,
  parseCommandLineArgs,
  downloadFile,
};
