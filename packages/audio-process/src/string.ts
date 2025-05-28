// 将中文和英文混合的文本切分为段,每一段带原文和中英文类型
export function splitMixedLanguageText(
  text: string
): { text: string; type: string }[] {
  const segments: { text: string; type: string }[] = [];
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
