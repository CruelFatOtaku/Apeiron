import { getWordsFromSentence } from "../src/getWordsFromSentence.js";

describe("getWordsFromSentence", () => {
  it("should split English sentence into words", () => {
    const sentence = "Hello, world! This is a test.";
    const result = getWordsFromSentence(sentence, "english");
    expect(result).toEqual([
      "Hello",
      ",",
      "world",
      "!",
      "This",
      "is",
      "a",
      "test",
      ".",
    ]);
  });

  it("should split Spanish sentence into words", () => {
    const sentence = "¡Hola, mundo! Esto es una prueba.";
    const result = getWordsFromSentence(sentence, "spanish");
    expect(result).toEqual([
      "¡",
      "Hola",
      ",",
      "mundo",
      "!",
      "Esto",
      "es",
      "una",
      "prueba",
      ".",
    ]);
  });

  it("should split Japanese sentence by spaces", () => {
    const sentence = "これは テスト です";
    const result = getWordsFromSentence(sentence, "japanese");
    expect(result).toEqual(["これは", "テスト", "です"]);
  });

  it("should return an empty array for an empty sentence", () => {
    const sentence = "";
    const result = getWordsFromSentence(sentence, "english");
    expect(result).toEqual([]);
  });

  it("should handle sentences with only spaces", () => {
    const sentence = "     ";
    const result = getWordsFromSentence(sentence, "english");
    expect(result).toEqual([]);
  });
});
