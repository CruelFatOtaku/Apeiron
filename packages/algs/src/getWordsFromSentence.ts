export const getWordsFromSentence = (
  sentence: string,
  language: string
): string[] => {
  if (language === "japanese") {
    // 对于日语，我们不需要把每个假名都分开
    return sentence.split(/\s+/).filter((word) => word.length > 0);
  } else {
    const wordMatches = sentence.match(
      /[\wáéíóúüñÁÉÍÓÚÜÑ]+|[^\s\wáéíóúüñÁÉÍÓÚÜÑ]+/g
    );
    if (wordMatches) {
      return wordMatches.filter((word) => word.trim() !== "");
    }
    return [];
  }
};
