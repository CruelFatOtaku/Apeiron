import fs from "fs";
import path from "path";
import { GPTCompletion } from "../../gpt";
import xlsx from "xlsx";

const sChar = "s̺";

function replaceSChar(txt: string): string {
  // 替换所有的空格为s̺
  return txt.replace(/ /g, sChar);
}

const replacer = "##txt##";
const prompt = `我有一组西班牙语单词的释义，请将这个释义整理为json格式
注意：
同一个词性放在一个对象里面，例如：
m. 本质；实体；intr. 是；存在；发生；进行；aux. 被；由
整理为：
[
    {
      "partOfSpeech": "m.",
      "translation": "本质；实体；"
    },
    {
      "partOfSpeech": "intr.",
      "translation": "是；存在；发生；进行；"
    },
    {
      "partOfSpeech": "aux.",
      "translation": "被；由"
    }
  ]


格式要求：
[{"partOfSpeech":"","translation":""}, {"partOfSpeech":"","translation":""}]


释义如下：
${replacer}`;
function buildPrompt(txt: string): string {
  // Replace the placeholder with the actual text
  return prompt.replace(replacer, txt);
}

type TranslationType = {
  partOfSpeech: string;
  translation: string;
};

type DataType = {
  word: "";
  phonetic: "";
  translations: TranslationType[];
};

function extractJsonFromTxt(txt: string): TranslationType[] {
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
    return JSON.parse(jsonStr) as TranslationType[];
  } catch {
    throw new Error("解析JSON数据失败");
  }
}

async function doOne(text: string): Promise<TranslationType[]> {
  if (!text) {
    return [];
  }
  const promptText = buildPrompt(text);
  const res = await GPTCompletion(promptText, {
    temperature: 0.2,
  });
  const data = extractJsonFromTxt(res.data.resp);
  return data;
}

async function run() {
  const dataFolder = path.join(__dirname, "./data/spanish");
  const files = fs.readdirSync(dataFolder);
  for (const fileIndex in files) {
    const file = files[fileIndex];
    if (!file) continue;
    const filePath = path.join(dataFolder, file);
    // 读取xlsx
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0] as string;
    const worksheet = workbook.Sheets[sheetName] as xlsx.WorkSheet;
    const jsonData = xlsx.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: "",
    }) as string[][];
    console.log(`处理文件: ${file}`);
    console.log(JSON.stringify(jsonData, null, 2));
    const targetFilePath = path.join(
      __dirname,
      "./target/spanish",
      file.replace(".xlsx", ".json")
    );
    fs.writeFileSync(targetFilePath, "[");
    for (const rowIndex in jsonData) {
      const row = jsonData[rowIndex] as string[];
      if (row[0] === "No.") {
        continue;
      }
      console.log(
        `处理第${Number(fileIndex) + 1}个文件第 ${Number(rowIndex) + 1}/${jsonData.length} 行`
      );
      try {
        const word = row[1] || "";
        const phonetic = row[2] || "";
        let translations = [
          {
            partOfSpeech: "",
            translation: row[3] || "",
          },
        ];
        try {
          translations = await doOne(row[3] || "");
        } catch (e) {
          console.error(`处理 ${row[0]} 的释义时出错:`, e);
        }
        const item = {
          word: word,
          phonetic: replaceSChar(phonetic),
          translations: translations,
        };
        fs.appendFileSync(
          targetFilePath,
          JSON.stringify(item, null, 2) +
            (parseInt(rowIndex) >= jsonData.length - 1 ? "" : ",\n")
        );
      } catch (e) {
        console.error(`处理 ${row[0]} 时出错:`, e);
      }
    }
    fs.appendFileSync(targetFilePath, "]");
  }
}

// run();

function saveExcel() {
  const fileFolder = path.resolve(__dirname, "./target/spanish");
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
  for (const fileIndex in files) {
    const file = files[fileIndex] as string;
    const filePath = path.join(fileFolder, file);
    const excelFileName = file.replace(".json", ".xlsx");
    const targetFilePath = path.join(fileFolder, excelFileName);

    const content = fs.readFileSync(filePath, "utf-8");
    const jsonData = JSON.parse(content) as DataType[];
    const parsedData = jsonData.map((item) => {
      // 是否是词组
      const isPhrase = item.word.trim().includes(" ");
      const translations = item.translations
        .map((t) =>
          isPhrase
            ? `${t.translation}`
            : `${t.partOfSpeech.trim() ? "[" + t.partOfSpeech + "]" : ""} ${t.translation}`
        )
        .join("\n");
      return {
        word: item.word,
        phonetic: item.phonetic,
        translations,
      };
    });
    const worksheet = xlsx.utils.json_to_sheet(parsedData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    xlsx.writeFile(workbook, targetFilePath);
    console.log(`已将数据写入 ${targetFilePath}`);
  }
}
saveExcel();
