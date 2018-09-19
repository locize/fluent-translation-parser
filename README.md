# Introduction

[![Travis](https://img.shields.io/travis/locize/fluent-translation-parser/master.svg?style=flat-square)](https://travis-ci.org/i18next-translation-parser)
[![Coveralls](https://img.shields.io/coveralls/locize/fluent-translation-parser/master.svg?style=flat-square)](https://coveralls.io/github/locize/fluent-translation-parser)
[![npm version](https://img.shields.io/npm/v/i18next-translation-parser.svg?style=flat-square)](https://www.npmjs.com/package/i18next-translation-parser)
[![David](https://img.shields.io/david/locize/fluent-translation-parser.svg?style=flat-square)](https://david-dm.org/locize/fluent-translation-parser)

This is a module to parse an i18next translation string into an AST and back to a string.

# Getting started

Source can be loaded via [npm](https://www.npmjs.com/package/fluent-translation-parser) or [downloaded](https://github.com/locize/fluent-chained-backend/blob/master/fluentTranslationParser.min.js) from this repo.

```
# npm package
$ npm install fluent-translation-parser
```

# Sample

```js
import { parse, stringify } from "fluent-translation-parser";

const AST = parse(`
    { $unreadEmails ->
        [one] You have one unread email.
       *[other] You have { $unreadEmails } unread emails.
    }
`);
// will return
/*
[
  {
    "type": "text",
    "content": "    { $unreadEmails ->\n        [one] You have one unread email.\n       *[other] You have { $unreadEmails } unread emails.\n    }",
    "children": [
      {
        "type": "text",
        "content": "    "
      },
      {
        "type": "selector",
        "raw": "{ $unreadEmails ->",
        "prefix": "{",
        "suffix": "->",
        "content": " $unreadEmails ",
        "variable": "unreadEmails"
      },
      {
        "type": "text",
        "content": "\n        "
      },
      {
        "type": "variant",
        "isDefault": false,
        "raw": "[one]",
        "prefix": "[",
        "suffix": "]",
        "content": "one",
        "variable": "one"
      },
      {
        "type": "text",
        "content": " You have one unread email.\n       "
      },
      {
        "type": "variant",
        "isDefault": true,
        "raw": "*[other]",
        "prefix": "*[",
        "suffix": "]",
        "content": "other",
        "variable": "other"
      },
      {
        "type": "text",
        "content": " You have "
      },
      {
        "type": "variable",
        "raw": "{ $unreadEmails }",
        "prefix": "{",
        "suffix": "}",
        "content": " $unreadEmails ",
        "variable": "unreadEmails"
      },
      {
        "type": "text",
        "content": " unread emails.\n    "
      },
      {
        "type": "closingBracket",
        "raw": "}",
        "prefix": "",
        "suffix": "}",
        "content": ""
      },
      {
        "type": "text",
        "content": ""
      }
    ]
  }
]
*/
stringify(AST);
```
