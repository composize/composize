# composize

![CI](https://github.com/composize/composize/actions/workflows/ci.yml/badge.svg)
![License](https://img.shields.io/badge/License-MIT-blue.svg)
[![CodeFactor](https://www.codefactor.io/repository/github/composize/composize/badge)](https://www.codefactor.io/repository/github/composize/composize)

A set of composable & declarative DSLs.

## Packages

| Package                                                                               | Intro                                                 | Version                                                                                                                |
| ------------------------------------------------------------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| [`@composize/dom`](https://github.com/composize/composize/tree/main/packages/dom)     | DSL for DOM                                           | [![version](https://img.shields.io/npm/v/@composize/dom/latest.svg)](https://www.npmjs.com/package/@composize/dom)     |
| [`@composize/excel`](https://github.com/composize/composize/tree/main/packages/excel) | DSL for [ExcelJS](https://github.com/exceljs/exceljs) | [![version](https://img.shields.io/npm/v/@composize/excel/latest.svg)](https://www.npmjs.com/package/@composize/excel) |

&nbsp; ☝️ Click the links above to view the README for each package.

## APIs

For the full API definition, please visit [https://composize.github.io/composize](https://composize.github.io/composize).

## Examples

### @composize/dom

```ts
import { attributes, element, fragment, inlineStyle, listener, style, text } from '@composize/dom';

function Card(title: string, content: string) {
  element('div', { class: 'card' }, () => {
    attributes({ 'data-id': 'card-1' });

    element('h3', () => {
      inlineStyle({ color: '#333' });
      text(title);
    });

    element('p', content);

    element('button', { style: { color: 'blue' } }, () => {
      text('Action');
      listener('click', () => {
        console.log('Button clicked!');
      });
    });
  });
}

fragment(() => {
  style({
    '.card': {
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      padding: '20px',
      width: '300px',
    }
  });

  for (let index = 0; index < 3; index++) {
    Card('Declarative Cards', 'Declaratively DOM using DSL.');
  }
});
```

### @composize/excel

```ts
import { cell, row, workbook } from '@composize/excel';
// +--------+--------+--------+
// |                 | title2 |
// |      title1     +--------+
// |                 | title3 |
// +--------+--------+--------+
// | value1 |                 |
// +--------+      value2     +
// | value3 |                 |
// +--------+-----------------+
const book = workbook(() => {
  row(() => {
    cell('title1', { rowSpan: 2, colSpan: 2 });
    cell('title2');
  });
  row(() => {
    cell('title3');
  });
  row(() => {
    cell('value1');
    cell('value2', { rowSpan: 2, colSpan: 2 });
  })
  row(() => {
    cell('value3');
  })
});

book.xlsx.writeFile('./sheet.xlsx');
```

## Changelog

[Learn about the latest improvements.](https://github.com/composize/composize/blob/main/CHANGELOG.md)

##  Special thanks

Thanks to [JetBrains](https://www.jetbrains.com/?from=composize) for supporting us free open source licenses.

![JetBrains Logo](https://resources.jetbrains.com/storage/products/company/brand/logos/jb_beam.svg)

## License

[MIT](https://github.com/composize/composize/blob/main/LICENSE)
