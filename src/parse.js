import HTML from 'html-parse-stringify2';


export function parse(str) {
  const ast = HTML.parse(`<dummyI18nTag>${str}</dummyI18nTag>`, { ignoreCollapse: true });
  extendI18nextSugar(ast);
  // console.warn(JSON.stringify(ast, null, 2));
  return ast[0].children || [];
}

const detect = [
  '\{[^\$\}\[>]+\}', // references
  '\{ *\\$[^\}\[>]+\}', // variables
  '\{[A-Z (]*\\$[^\}\[>]+\}', // variables formatted
  '\{ *\\$[^\}\[]+->', // selector
  '\\*\\[[^\[]+\\]', // default variant
  '\\[[^\[]+\\]', // variant
  '\{', // opening
  '\}', // closing
].join('|');


const REGEXP = new RegExp(`(${detect})`, 'g');

function extendI18nextSugar(ast) {

  function updateChildren(children) {
    if (!children) return;

    children.forEach(child => {
      if (child.type === 'text') {
        if (child.content.indexOf('{') > -1 || child.content.indexOf('[') > -1) {
          const splitted = child.content.split(REGEXP);
          // console.warn('try splitt?', splitted.length)
          const newChildren = splitted.length > 1 ? splitted.reduce((mem, match, index) => {
            // console.warn(mem, match, index);
            if (index % 2 === 0) {
              mem.push({ type: 'text', content: match });
            } else {
              // opening
              if (match.length === 1 && match === '{') {
                mem.push({ type: 'openingBracket', raw: match, prefix: '{', suffix: '', content: '' })
              }
              // closing
              else if (match.length === 1 && match === '}') {
                mem.push({ type: 'closingBracket', raw: match, prefix: '', suffix: '}', content: '' })
              }
              // reference
              else if (match.indexOf('{') === 0 && match.indexOf('$') < 0 ) {
                const content = match.substring(1, match.length - 1);
                mem.push({ type: 'reference', raw: match, prefix: '{', suffix: '}', content, reference: content.trim() })
              }
              // variable with format
              else if (match.indexOf('{') === 0 && match.indexOf('$') > -1 && match.indexOf('->') < 0 && match.indexOf('(') > -1) {
                const content = match.substring(1, match.length - 1);
                mem.push({ type: 'variable', formatted: true, raw: match, prefix: '{', suffix: '}', content, variable: content.substring(content.indexOf('$') + 1, content.indexOf(',')).trim() })
              }
              // variable
              else if (match.indexOf('{') === 0 && match.indexOf('$') > -1 && match.indexOf('->') < 0 ) {
                const content = match.substring(1, match.length - 1);
                mem.push({ type: 'variable', raw: match, prefix: '{', suffix: '}', content, variable: content.trim().replace('$', '') })
              }
              // selector
              else if (match.indexOf('{') === 0 && match.indexOf('$') > -1 && match.indexOf('->') > -1) {
                const content = match.substring(1, match.length - 2);
                mem.push({ type: 'selector', raw: match, prefix: '{', suffix: '->', content, variable: content.trim().replace('$', '') })
              }
              // variant
              else if (match.indexOf('[') === 0 && match.indexOf('*') < 0) {
                const content = match.substring(1, match.length - 1);
                mem.push({ type: 'variant', isDefault: false, raw: match, prefix: '[', suffix: ']', content, variable: content.trim() })
              }
              // variant default
              else if (match.indexOf('[') === 1 && match.indexOf('*') === 0) {
                const content = match.substring(2, match.length - 1);
                mem.push({ type: 'variant', isDefault: true, raw: match, prefix: '*[', suffix: ']', content, variable: content.trim() })
              }
            }
            return mem;
          }, []) : [];
          // console.warn(JSON.stringify(newChildren, null, 2));
          child.children = newChildren;
        }
      }

      if (child.children) updateChildren(child.children);
    });
  }

  updateChildren(ast);

  return ast;
}
