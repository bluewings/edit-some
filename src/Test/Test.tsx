import * as React from 'react';
import * as babylon from '@babel/parser';
import jsc from 'jscodeshift';
import styles from './Test.module.scss';

import 'codemirror/lib/codemirror.css';

import 'codemirror/mode/javascript/javascript';

import CodeMirror from 'codemirror';
import 'codemirror/addon/hint/show-hint.css';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/lint/lint';
import 'codemirror/addon/lint/lint.css';
import 'codemirror/addon/lint/javascript-lint';

import CodeMirror2 from 'react-codemirror';

// console.dir(CodeMirror);

var Pos = CodeMirror.Pos;

var tags = {
  '!top': ['top'],
};

var javascriptKeywords = (
  'break case catch class const continue debugger default delete do else export extends false finally for function ' +
  'if in import instanceof new null return super switch this throw true try typeof var void while with yield'
).split(' ');

interface ITestProps {
  /**
   * Prop Description
   */
  message?: string;
}

const _source = `async function test (query, a, b) {

  const { productId: zz, ccd: { z } } = query;
  PRODUCT
  const items = await gtProduct(query.productId)
  "PRODUCT"
  console.log(query.aaa.bbb);
  return a + b;

}


function test1 (query, a, b) {

  console.log(query.test);
  return a + b;
}
`;

var comp = [
  ['here', 'hither'],
  ['asynchronous', 'nonsynchronous'],
  ['completion', 'achievement', 'conclusion', 'culmination', 'expirations'],
  ['hinting', 'advive', 'broach', 'imply'],
  ['function', 'action'],
  ['provide', 'add', 'bring', 'give'],
  ['synonyms', 'equivalents'],
  ['words', 'token'],
  ['each', 'every'],
];

const allhints = ['getProduct()', 'getProducts', 'getStore', 'getStores', 'getBlogPost', 'getBlogPosts'];
var isautocomplete = false;
function synonyms(cm: any, option: any) {
  // console.log('i got it!!!');
  return new Promise(function (accept) {
    // setTimeout(function () {
    const cursor = cm.getCursor();
    const line = cm.getLine(cursor.line);
    const token = cm.getTokenAt(cursor);

    // console.log(token);

    var start = cursor.ch,
      end = cursor.ch;
    while (start && /\w/.test(line.charAt(start - 1))) --start;
    while (end < line.length && /\w/.test(line.charAt(end))) ++end;
    var word = line.slice(start, end).toLowerCase();
    // console.log(word);

    if (word.startsWith('get')) {
      return accept({
        list: allhints
          .filter((e) => {
            return e.toLowerCase().search(word) !== -1;
          })
          .map((e) => {
            return {
              displayText: e + '__',
              text: e,
              value: e,
              label: 'wow',
              name: 'wow',
            };
          }),
        from: CodeMirror.Pos(cursor.line, start),
        to: CodeMirror.Pos(cursor.line, end),
        // hint: (a: any, b: any) => {
        //   console.log('this is hint');
        //   console.log(a, b);
        // },
      });
    }

    // for (var i = 0; i < comp.length; i++)
    //   if (comp[i].indexOf(word) != -1)

    return accept(null);
    // }, 0);
  });
}

/**
 * Component Description
 */
function Test(props: ITestProps) {
  // console.log(jsc)
  // console.log(babylon);

  const [source, setSource] = React.useState(_source);

  const ref = React.useRef<any>(null);

  const handleChange = (newCode: string) => {
    // console.log(newCode);

    setSource(newCode);
  };
  const options: any = {
    // codeMirrorInstance,
    mode: 'javascript',
    // extraKeys: {
    //   "'$'": completeAfter,
    //   // "'/'": completeIfAfterLt,
    //   // "' '": completeIfInTag,
    //   // "'='": completeIfInTag,
    //   // "Ctrl-Space": "autocomplete"
    // },
    lineNumbers: true,
    // gutters: ['CodeMirror-lint-markers'],
    autoCloseBrackets: true,
    hintOptions: { hint: synonyms },
    // lint: true,
    tabSize: 2,
  };

  const markers = React.useRef<any[]>([]);

  React.useEffect(() => {
    if (ref.current) {
      let CodeMirror = ref.current.getCodeMirrorInstance();

      // CodeMirror.registerHelper('hint', 'javascript', javascriptHint);
      // console.log('init done');
      // console.log(CodeMirror.showHint);
      // console.log(ref.current.getCodeMirror().showHint);

      const editor = ref.current.getCodeMirror();
      editor.on('update', function (cm: any, change: any) {
        // console.log('update');
      });
      editor.on('startCompletion', function (cm: any, change: any) {
        // console.log('startCompletion');
      });
      editor.on('endCompletion', function (cm: any, change: any) {
        // console.log('endCompletion');
      });

      editor.on('beforeChange', function (cm: any, change: any) {
        var readOnlyLines = [0];
        if (~readOnlyLines.indexOf(change.from.line)) {
          change.cancel();
        }
      });
      editor.on('inputRead', function (cm: any, changeObj: any) {
        // hinting logic
        // console.log(changeObj);

        const cur = cm.getCursor();
        const curLine = cm.getLine(cur.line);
        // console.log(cur, curLine, curLine.substr(cur.ch, 1));
        const token = cm.getTokenAt(cur);
        // if (token.type === 'variable' && token.string.search(/^get/) !== -1) {
        if (token.type === 'variable') {
          // console.log(changeObj);
          // console.log(token);
          CodeMirror.commands.autocomplete(editor, null, { completeSingle: false });
        }
        // console.log(token);
      });
      // editor.on('cursorActivity', function () {
      //   var options = {
      //     hint: function () {
      //       return {
      //         from: editor.getDoc().getCursor(),
      //         to: editor.getDoc().getCursor(),
      //         list: ['foo', 'bar'],
      //       };
      //     },
      //   };
      //   editor.showHint(options);
      // });
    }
  }, []);

  React.useEffect(() => {
    const doc = ref.current.codeMirror.getDoc();

    // console.log(ref.current);

    markers.current.forEach((marker) => marker.clear());

    markers.current = [];

    const [callExps, queryPaLL] = parseCode(source);

    callExps.forEach((e) => {
      markers.current.push(
        doc.markText(
          { line: e.loc.start.line - 1, ch: e.loc.start.column },
          { line: e.loc.end.line - 1, ch: e.loc.end.column },
          { className: styles.hl },
        ),
      );
    });

    queryPaLL.forEach((e) => {
      markers.current.push(
        doc.markText(
          { line: e.loc.start.line - 1, ch: e.loc.start.column },
          { line: e.loc.end.line - 1, ch: e.loc.end.column },
          { className: styles.hl2 },
        ),
      );
    });
  }, [source]);

  const ref3 = React.useRef<any>(null);

  return (
    <div className={styles.root}>
      <div ref={ref3}>
        <CodeMirror2 ref={ref} value={source} onChange={handleChange} options={options} />
      </div>

      {/* <h1>Test</h1> */}
    </div>
  );
}

export default Test;

const parseCode = (source: string) => {
  let queryParams: any[] = [];
  let queryPaLL: any[] = [];
  const callExps: any[] = [];
  const parser = { parse: babylon.parse };
  try {
    const func = jsc(source, { parser }).find(jsc.FunctionDeclaration, {
      id: { name: 'test' },
    });

    func
      .find(jsc.MemberExpression, (value: any) => {
        const { object, property } = value;
        return object.type === 'Identifier' && object.name === 'query';
      })
      .forEach((e: any) => {
        const { object, property } = e.value;
        queryParams.push(property.name);
        queryPaLL.push({
          loc: property.loc,
        });
      });

    func
      .find(jsc.VariableDeclarator, (value) => {
        return value.id.type === 'ObjectPattern' && value.init?.type === 'Identifier' && value.init.name === 'query';
      })
      .forEach(({ value }: any) => {
        (value.id?.properties || [])
          .filter((e: any) => {
            return e.key?.type === 'Identifier' && e.key?.name;
          })
          .forEach((e: any) => {
            // if (e.key)
            queryParams.push(e.key.name);
            queryPaLL.push({
              loc: e.key.loc,
            });
          });
      });

    func
      .find(jsc.CallExpression, (value) => {
        return value.callee.type === 'Identifier' && value.callee.name.search(/^\get[A-Z]/) !== -1;
      })
      .forEach((e: any) => {
        callExps.push({
          loc: e.value.callee.loc,
        });
      });
  } catch (e) {}

  return [queryPaLL, callExps];
};
