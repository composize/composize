export function isChineseOrPunctuation(char: string) {
  // 匹配中文汉字：\u4E00 - \u9FFF (包括大部分汉字)
  // 匹配中文标点：例如 \u3000 - \u303F（中文标点符号的一部分）和 \uFF00 - \uFFEF（全角字符）
  return /[\u4E00-\u9FFF\u3000-\u303F\uFF00-\uFFEF]/.test(char);
}
