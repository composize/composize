import { element, fragment, style, text } from './dsl'

describe('DOM DSL', () => {
  it('should create an element with text content', () => {
    const div = element('div', 'hello')

    expect(div.tagName).toBe('DIV')
    expect(div.textContent).toBe('hello')
  })

  it('should create an element with props (class and style) and text content', () => {
    const div = element('div', { class: ['my-class'], style: { backgroundColor: 'red' } }, 'world')
    expect(div.tagName).toBe('DIV')
    expect(div.className).toBe('my-class')
    expect(div.style.backgroundColor).toBe('red')
    expect(div.textContent).toBe('world')
  })

  it('should create an element using a composable function', () => {
    const div = element('div', () => {
      element('span', 'child')
    })
    expect(div.tagName).toBe('DIV')
    expect(div.children.length).toBe(1)
    const span = div.querySelector('span')
    expect(span!.textContent).toBe('child')
  })

  it('should support nested composition', () => {
    const div = element('div', () => {
      element('p', () => {
        element('strong', 'nested text')
      })
    })
    expect(div.tagName).toBe('DIV')
    const strong = div.querySelector('p > strong')
    expect(strong!.textContent).toBe('nested text')
  })

  describe('text', () => {
    it('should append a text node inside an element', () => {
      const div = element('div', () => {
        text('inside text');
      });

      expect(div.textContent).toBe('inside text');
      const child = div.childNodes[0];
      expect(child).toBeInstanceOf(Text);
      expect(child!.textContent).toBe('inside text');
    });

    it('should append multi text nodes inside an element', () => {
      const div = element('div', () => {
        text('inside');
        text('text');
      });

      expect(div.textContent).toBe('insidetext');
      expect(div.childNodes[0]).toBeInstanceOf(Text);
      expect(div.childNodes[0]!.textContent).toBe('inside');
      expect(div.childNodes[1]).toBeInstanceOf(Text);
      expect(div.childNodes[1]!.textContent).toBe('text');
    });
  });

  describe('style', () => {
    it('should create a style element with proper css text', () => {
      const styleElem = style({
        '.example': {
          fontSize: '16px',
          backgroundColor: 'blue',
        },
      });
      expect(styleElem).toBeInstanceOf(HTMLStyleElement);
      const expectedCss = '.example{font-size:16px;background-color:blue;}';
      expect(styleElem!.textContent).toBe(expectedCss);
    });

    it('should append a style element inside an element', () => {
      const div = element('div', () => {
        style({
          '#id': {
            margin: '0',
            padding: '0',
          },
        });
      });
      const styleElem = div.querySelector('style');
      expect(styleElem).toBeInstanceOf(HTMLStyleElement);
      const expectedCss = '#id{margin:0;padding:0;}';
      expect(styleElem!.textContent).toBe(expectedCss);
    });
  });

  describe('fragment', () => {
    it('should create an empty document fragment when no composable is provided', () => {
      const frag = fragment();
      expect(frag).toBeInstanceOf(DocumentFragment);
      expect(frag.childNodes.length).toBe(0);
    });

    it('should execute the composable function and append created nodes to the fragment', () => {
      const frag = fragment(() => {
        text('fragment text');
        element('div', 'inside fragment');
      });

      expect(frag).toBeInstanceOf(DocumentFragment);
      expect(frag.childNodes[0]).toBeInstanceOf(Text);
      expect(frag.childNodes[0]?.textContent).toBe('fragment text');
      expect(frag.childNodes[1]).not.toBeNull();
      expect(frag.childNodes[1]!.textContent).toBe('inside fragment');
    });

    it('should allow nested fragments', () => {
      const frag = fragment(() => {
        fragment(() => {
          text('nested fragment text');
        });
      });

      expect(frag).toBeInstanceOf(DocumentFragment);
      expect(frag.childNodes[0]).toBeInstanceOf(Text);
      expect(frag.childNodes[0]?.textContent).toBe('nested fragment text');
    });

    it('should allow multiple nodes in a fragment', () => {
      const div = element('div', () => {
        fragment(() => {
          text('first text');
          text('third text');
        });
      })

      expect(div.childNodes.length).toBe(2);
      expect(div.childNodes[0]).toBeInstanceOf(Text);
      expect(div.childNodes[0].textContent).toBe('first text');
      expect(div.childNodes[1]).toBeInstanceOf(Text);
      expect(div.childNodes[1].textContent).toBe('third text');
    });

  });
})
