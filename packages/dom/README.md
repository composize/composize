# @composize/dom

[![version](https://img.shields.io/npm/v/@composize/dom/latest.svg)](https://www.npmjs.com/package/@composize/dom)
![CI](https://github.com/composize/composize/actions/workflows/ci.yml/badge.svg)
![License](https://img.shields.io/badge/License-MIT-blue.svg)
[![codecov](https://codecov.io/gh/composize/composize/branch/main/graph/badge.svg?token=070GEU44U0)](https://codecov.io/gh/composize/composize)
[![CodeFactor](https://www.codefactor.io/repository/github/composize/composize/badge)](https://www.codefactor.io/repository/github/composize/composize)

A declarative DSL for creating and manipulating DOM elements.

## Renderer configuration

Configure a renderer before creating nodes. `DomRenderer` is the built-in
browser implementation and must be instantiated by the caller. A renderer
implements creation, insertion, property, style, attribute, and event
operations. Extend `DomRenderer` to override only the behavior you need.

```ts
import { DomRenderer, setupConfig } from '@composize/dom';

class LoggingRenderer extends DomRenderer {
  override appendChild(parent: ParentNode, child: Node) {
    console.debug('append', child);
    super.appendChild(parent, child);
  }
}

setupConfig({ renderer: new LoggingRenderer() });
```

Use `setupConfig({ renderer: new DomRenderer() })` to restore the built-in
renderer.

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
