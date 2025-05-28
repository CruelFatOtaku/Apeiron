import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";
import os from "os";

/**
 * 简单的音频文件连接（按顺序）
 * @param {string[]} inputFiles - 输入音频文件路径数组
 * @param {string} outputFile - 输出文件路径
 * @returns {Promise<string>} 返回输出文件路径
 */
export function concatenateAudioFiles(
  inputFiles: string[],
  outputFile: string
): Promise<string> {
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

/**
 * 合并多个音频文件
 * @param {string[]} inputFiles - 输入音频文件路径数组
 * @param {string} outputFile - 输出文件路径
 * @param {Object} options - 可选配置
 * @param {string} options.format - 输出格式 (默认: 'mp3')
 * @param {string} options.codec - 音频编码器 (默认: 'libmp3lame')
 * @returns {Promise<string>} 返回输出文件路径
 */
export function mergeAudioFiles(
  inputFiles: string[],
  outputFile: string,
  options: { format?: string; codec?: string } = {}
): Promise<string> {
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
      .mergeToFile(outputFile, os.tmpdir());
  });
}

// 从url合并audio
export async function mergeAudioFromUrls(
  urls: string[],
  outputFile: string,
  tempFileFolder: string,
  options: { format?: string; codec?: string } = {}
): Promise<string> {
  const inputFiles = await Promise.all(
    urls.map(async (url) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`无法下载音频文件: ${url}`);
      }
      const buffer = await response.arrayBuffer();
      if (!fs.existsSync(tempFileFolder)) {
        fs.mkdirSync(tempFileFolder, { recursive: true });
      }
      const tempFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${url.split(".").pop() || "mp3"}`;
      const tempFilePath = path.join(tempFileFolder, tempFileName);
      fs.writeFileSync(tempFilePath, Buffer.from(buffer));
      return tempFilePath;
    })
  );

  return mergeAudioFiles(inputFiles, outputFile, options);
}
