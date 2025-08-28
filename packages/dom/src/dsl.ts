type PickWritable<T> = {
  [K in keyof T as IfEquals<{ [Q in K]: T[K] }, { -readonly [Q in K]: T[K] }, K>]: T[K];
};
// 辅助类型：判断属性是否为 `readonly`
type IfEquals<X, Y, A = X> = (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? A : never;

type NodeProps<K extends keyof HTMLElementTagNameMap> = Partial<PickWritable<Omit<HTMLElementTagNameMap[K], 'style'>> & { class: string[] | string, style: Partial<CSSStyleDeclaration> }>;
type Content = Node | string | number | undefined | null

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
  const node = document.createElement(tag);

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
    applyProps(node, props);
  }

  enterNode(node);
  try {
    if (composable) {
      composable()
    } else if (content instanceof Node) {
      node.append(content);
    } else if (content) {
      text(content)
    }
  } finally {
    leaveNode()
    getCurrentNode()?.append(node);
  }

  return node;
}

function applyProps<K extends keyof HTMLElementTagNameMap>(node: HTMLElementTagNameMap[K], props: NodeProps<K>) {
  for (const [key, value] of Object.entries(props)) {
    switch (key) {
      case 'class':
        if (Array.isArray(value)) {
          node.className = value.join(' ');
        } else {
          node.className = value;
        }
        break;
      case 'style':
        for (const [styleKey, styleValue] of Object.entries(value as CSSStyleDeclaration)) {
          node.style.setProperty(kebabCase(styleKey), styleValue)
        }
        break;
      default:
        node[key as keyof HTMLElementTagNameMap[K]] = value;
    }
  }
}

export function fragment(composable?: () => void) {
  const node = document.createDocumentFragment();
  enterNode(node);
  try {
    composable?.()
  } finally {
    leaveNode()
    getCurrentNode()?.append(node);
  }
  return node;
}

export function text(content: NonNullable<Content>) {
  const node = document.createTextNode(content.toString());
  getCurrentNode()?.append(node);
  return node;
}

export function style(styles: Record<string, Partial<CSSStyleDeclaration>>) {
  const node = document.createElement('style');
  node.textContent = cssObjectToText(styles);
  getCurrentNode()?.append(node);
  return node;
}

export function inlineStyle(styles: Partial<CSSStyleDeclaration>) {
  const node = getCurrentNode() as HTMLElement;
  Object.assign(node.style, styles)
}

export function attributes(attrs: Record<string, string | number | boolean>) {
  const node = getCurrentNode() as HTMLElement;
  for (const [key, value] of Object.entries(attrs)) {
    node.setAttribute(key, value.toString());
  }
}

export function append(node: ParentNode, composable?: () => void) {
  enterNode(node);
  try {
    composable?.()
  } finally {
    leaveNode()
    getCurrentNode()?.append(node);
  }
  return node;
}

export function listener<K extends keyof HTMLElementEventMap>(
  eventName: K,
  handler: (event: HTMLElementEventMap[K]) => void,
  options?: AddEventListenerOptions | boolean
) {
  getCurrentNode().addEventListener(eventName, handler as EventListener, options);
}

function kebabCase(str: string) {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
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
