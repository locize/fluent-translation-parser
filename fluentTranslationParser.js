(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.fluentTranslationParser = {})));
}(this, (function (exports) { 'use strict';

  /**
   * This file automatically generated from `pre-publish.js`.
   * Do not manually edit.
   */
  var voidElements = {
    "area": true,
    "base": true,
    "br": true,
    "col": true,
    "embed": true,
    "hr": true,
    "img": true,
    "input": true,
    "keygen": true,
    "link": true,
    "menuitem": true,
    "meta": true,
    "param": true,
    "source": true,
    "track": true,
    "wbr": true
  };

  var attrRE = /([\w-]+)|=|(['"])([.\s\S]*?)\2/g;



  var parseTag = function (tag) {
    var i = 0;
    var key;
    var expectingValueAfterEquals = true;
    var res = {
      type: 'tag',
      name: '',
      voidElement: false,
      attrs: {},
      children: []
    };
    tag.replace(attrRE, function (match) {
      if (match === '=') {
        expectingValueAfterEquals = true;
        i++;
        return;
      }

      if (!expectingValueAfterEquals) {
        if (key) {
          res.attrs[key] = key; // boolean attribute
        }

        key = match;
      } else {
        if (i === 0) {
          if (voidElements[match] || tag.charAt(tag.length - 2) === '/') {
            res.voidElement = true;
          }

          res.name = match;
        } else {
          res.attrs[key] = match.replace(/^['"]|['"]$/g, '');
          key = undefined;
        }
      }

      i++;
      expectingValueAfterEquals = false;
    });
    return res;
  };

  /*jshint -W030 */
  var tagRE = /(?:<!--[\S\s]*?-->|<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>)/g;

   // re-used obj for quick lookups of components


  var empty = Object.create ? Object.create(null) : {}; // common logic for pushing a child node onto a list

  function pushTextNode(list, html, level, start, ignoreWhitespace) {
    // calculate correct end of the content slice in case there's
    // no tag after the text node.
    var end = html.indexOf('<', start);
    var content = html.slice(start, end === -1 ? undefined : end); // if a node is nothing but whitespace, collapse it as the spec states:
    // https://www.w3.org/TR/html4/struct/text.html#h-9.1

    if (/^\s*$/.test(content)) {
      content = ' ';
    } // don't add whitespace-only text nodes if they would be trailing text nodes
    // or if they would be leading whitespace-only text nodes:
    //  * end > -1 indicates this is not a trailing text node
    //  * leading node is when level is -1 and list has length 0


    if (!ignoreWhitespace && end > -1 && level + list.length >= 0 || content !== ' ') {
      list.push({
        type: 'text',
        content: content
      });
    }
  }

  var parse = function parse(html, options) {
    options || (options = {});
    options.components || (options.components = empty);
    var result = [];
    var current;
    var level = -1;
    var arr = [];
    var byTag = {};
    var inComponent = false;
    html.replace(tagRE, function (tag, index) {
      if (inComponent) {
        if (tag !== '</' + current.name + '>') {
          return;
        } else {
          inComponent = false;
        }
      }

      var isOpen = tag.charAt(1) !== '/';
      var isComment = tag.indexOf('<!--') === 0;
      var start = index + tag.length;
      var nextChar = html.charAt(start);
      var parent;

      if (isOpen && !isComment) {
        level++;
        current = parseTag(tag);

        if (current.type === 'tag' && options.components[current.name]) {
          current.type = 'component';
          inComponent = true;
        }

        if (!current.voidElement && !inComponent && nextChar && nextChar !== '<') {
          pushTextNode(current.children, html, level, start, options.ignoreWhitespace);
        }

        byTag[current.tagName] = current; // if we're at root, push new base node

        if (level === 0) {
          result.push(current);
        }

        parent = arr[level - 1];

        if (parent) {
          parent.children.push(current);
        }

        arr[level] = current;
      }

      if (isComment || !isOpen || current.voidElement) {
        if (!isComment) {
          level--;
        }

        if (!inComponent && nextChar !== '<' && nextChar) {
          // trailing text node
          // if we're at the root, push a base text node. otherwise add as
          // a child to the current node.
          parent = level === -1 ? result : arr[level].children;
          pushTextNode(parent, html, level, start, options.ignoreWhitespace);
        }
      }
    }); // If the "html" passed isn't actually html, add it as a text node.

    if (!result.length && html.length) {
      pushTextNode(result, html, 0, 0, options.ignoreWhitespace);
    }

    return result;
  };

  function attrString(attrs) {
    var buff = [];

    for (var key in attrs) {
      buff.push(key + '="' + attrs[key] + '"');
    }

    if (!buff.length) {
      return '';
    }

    return ' ' + buff.join(' ');
  }

  function stringify(buff, doc) {
    switch (doc.type) {
      case 'text':
        return buff + doc.content;

      case 'tag':
        buff += '<' + doc.name + (doc.attrs ? attrString(doc.attrs) : '') + (doc.voidElement ? '/>' : '>');

        if (doc.voidElement) {
          return buff;
        }

        return buff + doc.children.reduce(stringify, '') + '</' + doc.name + '>';
    }
  }

  var stringify_1 = function (doc) {
    return doc.reduce(function (token, rootEl) {
      return token + stringify('', rootEl);
    }, '');
  };

  var htmlParseStringify2 = {
    parse: parse,
    stringify: stringify_1
  };

  function parse$1(str) {
    const ast = htmlParseStringify2.parse(`<dummyI18nTag>${str}</dummyI18nTag>`);
    extendI18nextSugar(ast); // console.warn(JSON.stringify(ast, null, 2));

    return ast[0].children || [];
  }
  const detect = ['\{[^\$\}\[>]+\}', // references
  '\{ *\\$[^\}\[>]+\}', // variables
  '\{[A-Z (]*\\$[^\}\[>]+\}', // variables formatted
  '\{ *\\$[^\}\[]+->', // selector
  '\\*\\[[^\[]+\\]', // default variant
  '\\[[^\[]+\\]', // variant
  '\{', // opening
  '\}'].join('|');
  const REGEXP = new RegExp(`(${detect})`, 'g');

  function extendI18nextSugar(ast) {
    function updateChildren(children) {
      if (!children) return;
      children.forEach(child => {
        if (child.type === 'text') {
          if (child.content.indexOf('{') > -1 || child.content.indexOf('[') > -1) {
            const splitted = child.content.split(REGEXP);
            console.warn('try splitt?', splitted.length);
            const newChildren = splitted.length > 1 ? splitted.reduce((mem, match, index) => {
              console.warn(mem, match, index);

              if (index % 2 === 0) {
                mem.push({
                  type: 'text',
                  content: match
                });
              } else {
                // opening
                if (match.length === 1 && match === '{') {
                  mem.push({
                    type: 'openingBracket',
                    raw: match,
                    prefix: '{',
                    suffix: '',
                    content: ''
                  });
                } // closing
                else if (match.length === 1 && match === '}') {
                    mem.push({
                      type: 'closingBracket',
                      raw: match,
                      prefix: '',
                      suffix: '}',
                      content: ''
                    });
                  } // reference
                  else if (match.indexOf('{') === 0 && match.indexOf('$') < 0) {
                      const content = match.substring(1, match.length - 1);
                      mem.push({
                        type: 'reference',
                        raw: match,
                        prefix: '{',
                        suffix: '}',
                        content,
                        reference: content.trim()
                      });
                    } // variable with format
                    else if (match.indexOf('{') === 0 && match.indexOf('$') > -1 && match.indexOf('->') < 0 && match.indexOf('(') > -1) {
                        const content = match.substring(1, match.length - 1);
                        mem.push({
                          type: 'variable',
                          raw: match,
                          prefix: '{',
                          suffix: '}',
                          content,
                          variable: content.substring(content.indexOf('$') + 1, content.indexOf(',')).trim()
                        });
                      } // variable
                      else if (match.indexOf('{') === 0 && match.indexOf('$') > -1 && match.indexOf('->') < 0) {
                          const content = match.substring(1, match.length - 1);
                          mem.push({
                            type: 'variable',
                            raw: match,
                            prefix: '{',
                            suffix: '}',
                            content,
                            variable: content.trim().replace('$', '')
                          });
                        } // selector
                        else if (match.indexOf('{') === 0 && match.indexOf('$') > -1 && match.indexOf('->') > -1) {
                            const content = match.substring(1, match.length - 2);
                            mem.push({
                              type: 'selector',
                              raw: match,
                              prefix: '{',
                              suffix: '->',
                              content,
                              variable: content.trim().replace('$', '')
                            });
                          } // variant
                          else if (match.indexOf('[') === 0 && match.indexOf('*') < 0) {
                              const content = match.substring(1, match.length - 1);
                              mem.push({
                                type: 'variant',
                                isDefault: false,
                                raw: match,
                                prefix: '[',
                                suffix: ']',
                                content,
                                variable: content.trim()
                              });
                            } // variant default
                            else if (match.indexOf('[') === 1 && match.indexOf('*') === 0) {
                                const content = match.substring(2, match.length - 1);
                                mem.push({
                                  type: 'variant',
                                  isDefault: true,
                                  raw: match,
                                  prefix: '*[',
                                  suffix: ']',
                                  content,
                                  variable: content.trim()
                                });
                              }
              }

              return mem;
            }, []) : []; // console.warn(JSON.stringify(newChildren, null, 2));

            child.children = newChildren;
          }
        }

        if (child.children) updateChildren(child.children);
      });
    }

    updateChildren(ast);
    return ast;
  }

  function stringify$1(ast) {
    const wrappedAst = [{
      type: 'tag',
      name: 'dummyI18nTag',
      voidElement: false,
      attrs: undefined,
      children: ast
    }];
    const str = htmlParseStringify2.stringify(wrappedAst);
    return str.substring(14, str.length - 15);
  }

  function astStats(ast) {
    // console.warn(JSON.stringify(ast, null, 2))
    const stats = {
      interpolation: 0,
      interpolation_unescaped: 0,
      nesting: 0,
      tags: 0
    };

    function process(children) {
      if (!children) return;
      children.forEach(child => {
        if (child.type === 'tag') stats.tags++;
        if (child.type === 'interpolation_unescaped') stats.interpolation_unescaped++;
        if (child.type === 'interpolation') stats.interpolation++;
        if (child.type === 'nesting') stats.nesting++;
        if (child.children) process(child.children);
      });
    }

    process(ast); // console.warn(stats);

    return stats;
  }

  exports.parse = parse$1;
  exports.stringify = stringify$1;
  exports.astStats = astStats;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
