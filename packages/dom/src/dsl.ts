import { getRenderer } from './config';
import type { Attributes, NodeProps, Renderer } from './renderer';
import { kebabCase } from './utils';

export type Content = Node | string | number | undefined | null;

const nodeStack: ParentNode[] = [];

function enterNode(element: ParentNode) {
  nodeStack.push(element);
}

function leaveNode() {
  nodeStack.pop();
}

function getCurrentNode() {
  return nodeStack[nodeStack.length - 1];
}

export function element<K extends keyof HTMLElementTagNameMap>(tag: K, props?: NodeProps<K>): HTMLElementTagNameMap[K];
export function element<K extends keyof HTMLElementTagNameMap>(tag: K, content?: Content): HTMLElementTagNameMap[K];
export function element<K extends keyof HTMLElementTagNameMap>(tag: K, composable?: () => void): HTMLElementTagNameMap[K];
export function element<K extends keyof HTMLElementTagNameMap>(tag: K, props?: NodeProps<K>, content?: Content): HTMLElementTagNameMap[K];
export function element<K extends keyof HTMLElementTagNameMap>(tag: K, props?: NodeProps<K>, composable?: () => void): HTMLElementTagNameMap[K];
export function element<K extends keyof HTMLElementTagNameMap>(tag: K, propsOrContentOrComposable?: NodeProps<K> | Content | (() => void), contentOrComposable?: Content | (() => void)) {
  const renderer = getRenderer();
  const node = renderer.createElement(tag);

  let props: NodeProps<K> | undefined;
  let content: Content = undefined
  let composable: (() => void) | undefined = undefined;

  if (propsOrContentOrComposable instanceof Node) {
    contentOrComposable = propsOrContentOrComposable;
  } else if (typeof propsOrContentOrComposable === 'object' && propsOrContentOrComposable) {
    props = propsOrContentOrComposable
  } else {
    contentOrComposable = propsOrContentOrComposable
  }

  if (typeof contentOrComposable === 'function') {
    composable = contentOrComposable;
  } else {
    content = contentOrComposable;
  }

  if (props) {
    setElementProps(node, props, renderer);
  }

  enterNode(node);
  try {
    if (composable) {
      composable()
    } else if (content instanceof Node) {
      renderer.appendChild(node, content);
    } else if (content) {
      text(content)
    }
  } finally {
    leaveNode()
    const parent = getCurrentNode();
    if (parent) {
      renderer.appendChild(parent, node);
    }
  }

  return node;
}

export function fragment(composable?: () => void) {
  const renderer = getRenderer();
  const node = renderer.createFragment();
  enterNode(node);
  try {
    composable?.()
  } finally {
    leaveNode()
    const parent = getCurrentNode();
    if (parent) {
      renderer.appendChild(parent, node);
    }
  }
  return node;
}

export function text(content: NonNullable<Content>) {
  const renderer = getRenderer();
  const node = renderer.createText(content.toString());
  const parent = getCurrentNode();
  if (parent) {
    renderer.appendChild(parent, node);
  }
  return node;
}

export function style(styles: Record<string, Partial<CSSStyleDeclaration>>) {
  const renderer = getRenderer();
  const node = renderer.createElement('style');
  renderer.setValue(node, cssObjectToText(styles));
  const parent = getCurrentNode();
  if (parent) {
    renderer.appendChild(parent, node);
  }
  return node;
}

export function inlineStyle(styles: Partial<CSSStyleDeclaration>) {
  const node = getCurrentNode() as HTMLElement;
  const renderer = getRenderer();
  for (const [style, value] of Object.entries(styles)) {
    renderer.setStyle(node, kebabCase(style), value);
  }
}

export function attributes(attrs: Attributes) {
  const node = getCurrentNode() as HTMLElement;
  const renderer = getRenderer();
  for (const [name, value] of Object.entries(attrs)) {
    renderer.setAttribute(node, name, value.toString());
  }
}

export function append(node: ParentNode, composable?: () => void) {
  const renderer = getRenderer();
  enterNode(node);
  try {
    composable?.()
  } finally {
    leaveNode()
    const parent = getCurrentNode();
    if (parent) {
      renderer.appendChild(parent, node);
    }
  }
  return node;
}

export function listener<K extends keyof HTMLElementEventMap>(
  eventName: K,
  handler: (event: HTMLElementEventMap[K]) => void,
  options?: AddEventListenerOptions | boolean
) {
  return getRenderer().listen(getCurrentNode(), eventName, handler as EventListener, options);
}

function setElementProps<K extends keyof HTMLElementTagNameMap>(node: HTMLElementTagNameMap[K], props: NodeProps<K>, renderer: Renderer) {
  for (const [name, value] of Object.entries(props)) {
    switch (name) {
      case 'class':
        renderer.setAttribute(node, 'class', Array.isArray(value) ? value.join(' ') : value as string);
        break;
      case 'style':
        for (const [style, styleValue] of Object.entries(value as CSSStyleDeclaration)) {
          renderer.setStyle(node, kebabCase(style), styleValue);
        }
        break;
      default:
        renderer.setProperty(node, name, value);
    }
  }
}

function cssObjectToText(cssObject: Record<string, Partial<CSSStyleDeclaration>>): string {
  let cssString = '';

  for (const [selector, style] of Object.entries(cssObject)) {
    cssString += `${selector}{`;
    for (const [property, value] of Object.entries(style)) {
      cssString += `${kebabCase(property)}:${value};`;
    }
    cssString += `}`;
  }

  return cssString.trim();
}
