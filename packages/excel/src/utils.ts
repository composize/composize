import { Worksheet } from 'exceljs';
import { DEFAULT_COLUMN_WIDTH, DEFAULT_FONT_SIZE } from './constants';

const CHINESE_CHARACTER_PATTERN = /[\u4E00-\u9FFF\u3000-\u303F\uFF00-\uFFEF]/;

function isChineseOrPunctuation(char: string) {
  // 匹配中文汉字：\u4E00 - \u9FFF (包括大部分汉字)
  // 匹配中文标点：例如 \u3000 - \u303F（中文标点符号的一部分）和 \uFF00 - \uFFEF（全角字符）
  return CHINESE_CHARACTER_PATTERN.test(char);
}

export function autoFitColumns(worksheet: Worksheet) {
  for (const column of worksheet.columns) {
    let maxLength = DEFAULT_COLUMN_WIDTH;
    column.eachCell?.(cell => {
      // If the cell is a merged cell, skip the width calculation and allow line breaks
      if (cell.isMerged) {
        cell.alignment = { wrapText: true, ...cell.alignment }
      } else {
        const cellValue = cell.value ? cell.value.toString() : '';
        const fontSize = cell.font?.size || DEFAULT_FONT_SIZE;
        const width = [...cellValue].map(char => isChineseOrPunctuation(char) ? 2 : 1).reduce((a, b) => a + b, 0);
        maxLength = Math.max(maxLength, width * (fontSize / DEFAULT_FONT_SIZE));
      }
    });
    column.width = maxLength + 2; // Reserve 2 characters of spacing
  }
}
