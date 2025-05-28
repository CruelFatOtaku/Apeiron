import fs from "fs";
import path, { parse } from "path";
import { GPTCompletion } from "../../gpt";
import { jsonToSheet } from "../../table";

const replacer = "##txt##";
const prompt = `我有一组法语词汇信息，帮我把这些信息整理为json格式
注意：
请不要修改原文案内容，仅做整理，特别是词性部分，例如，请不要将prép改为préposition

格式如下：
[{"word":"", "partOfSpeech":"","translation":""}]

这是词汇信息：
${replacer}
`;
function buildPrompt(txt: string): string {
  // Replace the placeholder with the actual text
  return prompt.replace(replacer, txt);
}

type DataType = { word: ""; partOfSpeech: ""; translation: "" };

function extractJsonFromTxt(
  txt: string
): { word: ""; partOfSpeech: ""; translation: "" }[] {
  // 首先尝试匹配markdown代码块中的JSON
  const codeBlockMatch = txt.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
  let jsonStr: string;

  if (codeBlockMatch && codeBlockMatch[1]) {
    jsonStr = codeBlockMatch[1];
  } else {
    // 如果没有代码块，尝试直接匹配JSON数组
    const jsonMatch = txt.match(/\[[\s\S]*?\]/);
    if (!jsonMatch) {
      console.log(txt);
      throw new Error("无法从文本中提取JSON格式的数据");
    }
    jsonStr = jsonMatch[0];
  }

  try {
    return JSON.parse(jsonStr) as DataType[];
  } catch {
    throw new Error("解析JSON数据失败");
  }
}

async function doOne(text: string): Promise<DataType[]> {
  const promptText = buildPrompt(text);
  const res = await GPTCompletion(promptText, {
    temperature: 0.2,
  });
  const data = extractJsonFromTxt(res.data.resp);
  return data;
}

async function run() {
  const dataFolder = path.resolve(__dirname, "./data/french");
  const targetFolder = path.resolve(__dirname, "./target/french");
  if (!fs.existsSync(dataFolder)) {
    console.error("数据文件夹不存在:", dataFolder);
    return;
  }
  const files = fs
    .readdirSync(dataFolder)
    .filter((file) => file.endsWith(".txt"));
  if (files.length === 0) {
    console.error("没有找到任何txt文件");
    return;
  }
  console.log("找到的文件:", files);
  const failParts: string[] = [];
  for (const fileIndex in files) {
    console.log(`正在处理第 ${Number(fileIndex) + 1} 个文件`);
    const file = files[fileIndex] as string;
    const content = fs.readFileSync(path.join(dataFolder, file), "utf-8");
    if (!content) {
      console.error(`文件 ${file} 内容为空`);
      continue;
    }
    // 文件按照空行进行分割
    const parts = content
      .split(/\n\s*\n/)
      .map((part) => part.trim())
      .filter((part) => part.length > 0);
    if (parts.length === 0) {
      console.error(`文件 ${file} 没有有效内容`);
      continue;
    }
    console.log(`一共找到 ${parts.length} 部分内容`);
    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder, { recursive: true });
      console.log(`目标文件夹不存在，已创建: ${targetFolder}`);
    }
    const targetFileName = path.basename(file, ".txt") + ".json";
    const targetFilePath = path.join(targetFolder, targetFileName);
    fs.writeFileSync(targetFilePath, "[");
    for (const partIndex in parts) {
      const part = parts[partIndex] as string;
      console.log(`正在处理第 ${Number(partIndex) + 1} 部分内容`);
      try {
        const data = await doOne(part);
        if (data.length === 0) {
          console.warn("没有提取到任何数据");
          continue;
        }
        if (Number(partIndex) < parts.length - 1) {
          fs.appendFileSync(
            targetFilePath,
            JSON.stringify(data, null, 2).slice(1, -1) + ","
          );
        } else {
          fs.appendFileSync(
            targetFilePath,
            JSON.stringify(data, null, 2).slice(1, -1)
          );
        }
        console.log(`已将数据写入 ${targetFilePath}`);
      } catch (error) {
        console.error(`处理文件 ${file} 时出错:`, error);
        failParts.push(part);
      }
    }
    fs.appendFileSync(targetFilePath, "]");
    console.log(`已将所有数据写入 ${targetFilePath}`);
  }
}

// run();
async function fix() {
  const dataFolder = path.resolve(__dirname, "./data/french");
  const targetFolder = path.resolve(__dirname, "./target/french/fix");
  if (!fs.existsSync(dataFolder)) {
    console.error("数据文件夹不存在:", dataFolder);
    return;
  }
  const errorSource = path.resolve(__dirname, "./target/french/error.json");
  if (!fs.existsSync(errorSource)) {
    console.error("错误数据文件不存在:", errorSource);
    return;
  }
  const errorData = fs.readFileSync(errorSource, "utf-8");
  if (!errorData) {
    console.error("错误数据文件内容为空");
    return;
  }
  const errorParts = JSON.parse(errorData) as {
    fileIndex: number;
    partIndex: number;
  }[];

  console.log("错误数据部分:", errorParts);

  const files = fs
    .readdirSync(dataFolder)
    .filter((file) => file.endsWith(".txt"));
  if (files.length === 0) {
    console.error("没有找到任何txt文件");
    return;
  }
  console.log("找到的文件:", files);
  const failParts: string[] = [];
  for (const fileIndex in files) {
    console.log(`正在处理第 ${Number(fileIndex) + 1} 个文件`);
    if (!errorParts.some((part) => part.fileIndex === Number(fileIndex))) {
      console.log(`文件 ${files[fileIndex]} 没有错误数据，跳过处理`);
      continue;
    }
    const file = files[fileIndex] as string;
    const content = fs.readFileSync(path.join(dataFolder, file), "utf-8");
    if (!content) {
      console.error(`文件 ${file} 内容为空`);
      continue;
    }
    // 文件按照空行进行分割
    const parts = content
      .split(/\n\s*\n/)
      .map((part) => part.trim())
      .filter((part) => part.length > 0);
    if (parts.length === 0) {
      console.error(`文件 ${file} 没有有效内容`);
      continue;
    }
    console.log(`一共找到 ${parts.length} 部分内容`);
    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder, { recursive: true });
      console.log(`目标文件夹不存在，已创建: ${targetFolder}`);
    }
    const targetFileName = path.basename(file, ".txt") + ".json";
    const targetFilePath = path.join(targetFolder, targetFileName);
    fs.writeFileSync(targetFilePath, "[");
    for (const partIndex in parts) {
      const part = parts[partIndex] as string;
      console.log(`正在处理第 ${Number(partIndex) + 1} 部分内容`);
      if (
        !errorParts.some(
          (part) =>
            part.fileIndex === Number(fileIndex) &&
            part.partIndex === Number(partIndex)
        )
      ) {
        console.log(
          `文件 ${file} 的第 ${Number(partIndex) + 1} 部分没有错误数据，跳过处理`
        );
        continue;
      }
      try {
        const data = await doOne(part);
        if (data.length === 0) {
          console.warn("没有提取到任何数据");
          continue;
        }
        if (Number(partIndex) < parts.length - 1) {
          fs.appendFileSync(
            targetFilePath,
            JSON.stringify(data, null, 2).slice(1, -1) + ","
          );
        } else {
          fs.appendFileSync(
            targetFilePath,
            JSON.stringify(data, null, 2).slice(1, -1)
          );
        }
        console.log(`已将数据写入 ${targetFilePath}`);
      } catch (error) {
        console.error(`处理文件 ${file} 时出错:`, error);
        failParts.push(part);
      }
    }
    fs.appendFileSync(targetFilePath, "]");
    console.log(`已将所有数据写入 ${targetFilePath}`);
  }
}
// fix();

function parseE() {
  const fileFolder = path.resolve(__dirname, "./target/french");
  if (!fs.existsSync(fileFolder)) {
    console.error("数据文件夹不存在:", fileFolder);
    return;
  }
  const files = fs
    .readdirSync(fileFolder)
    .filter((file) => file.endsWith(".json") && !file.includes("error"));
  if (files.length === 0) {
    console.error("没有找到任何json文件");
    return;
  }
  console.log("找到的文件:", files);
  // 把每个文件转为excel
  for (const file of files) {
    const filePath = path.join(fileFolder, file);
    const targetFilePath = path.join(
      fileFolder,
      path.basename(file, ".json") + ".xlsx"
    );
    const content = fs.readFileSync(filePath, "utf-8");
    if (!content) {
      console.error(`文件 ${file} 内容为空`);
      continue;
    }
    try {
      const data = JSON.parse(content) as {
        word: string;
        partOfSpeech: string;
        translation: string;
      }[];
      console.log(`文件 ${file} 解析成功，共有 ${data.length} 条数据`);
      // 这里可以进一步处理 data
      jsonToSheet(data, targetFilePath);
    } catch (error) {
      console.error(`解析文件 ${file} 时出错:`, error);
    }
  }
}
parseE();
