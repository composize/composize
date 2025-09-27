# @composize/dom

[![version](https://img.shields.io/npm/v/@composize/dom/latest.svg)](https://www.npmjs.com/package/@composize/dom)
![CI](https://github.com/composize/composize/actions/workflows/ci.yml/badge.svg)
![License](https://img.shields.io/badge/License-MIT-blue.svg)
[![CodeFactor](https://www.codefactor.io/repository/github/composize/composize/badge)](https://www.codefactor.io/repository/github/composize/composize)

A declarative DSL for creating and manipulating DOM elements.

## Examples

```ts
import { element, fragment, inlineStyle, listener, style, text } from '@composize/dom';

function Card(title: string, content: string) {
  element('div', { class: 'card' }, () => {
    element('h3', () => {
      inlineStyle({ color: '#333' });
      text(title);
    });
    element('p', content);
    element('button', { style: { color: 'blue' } }, () => {
      text('Action');
      listener('click', console.log);
    });
  });
}

fragment(() => {
  style({
    '.card': {
      border: '1px solid #e0e0e0',
      padding: '20px',
      width: '300px',
    }
  });

  for (let index = 0; index < 3; index++) {
    Card('Declarative Cards', 'Declaratively create DOM using DSL.');
  }
});
```
