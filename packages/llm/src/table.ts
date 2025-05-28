import * as XLSX from "xlsx";

export function jsonToSheet(jsonData: unknown[], filePath: string) {
  const worksheet = XLSX.utils.json_to_sheet(jsonData);
  worksheet["!cols"] = [
    { wch: 20 }, // 设置第一列宽度
    { wch: 30 }, // 设置第二列宽度
    { wch: 50 }, // 设置第三列宽度
  ];
  // 保存
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet);
  XLSX.writeFile(workbook, filePath);
  console.log(`Excel文件已保存到 ${filePath}`);
  return filePath;
}
