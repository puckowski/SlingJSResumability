import http from 'http';

import { renderToString } from 'slingjs/sling.min.es5';
import Test1Component from './ssr-example/components/test1.server.component';
import Test2Component from './ssr-example/components/test2.server.component';
import Test3Component from './ssr-example/components/test3.server.component';
import Test4Component from './ssr-example/components/test4.server.component';
import Test5Component from './ssr-example/components/test5.server.component';

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' });

  const url = req.url;

  switch (url) {
    case '/': {
      res.end(renderToString(new Test1Component()));

      break;
    }
    case '/hydrate': {
      res.end(renderToString(new Test2Component()));

      break;
    }
    case '/hydratecomplex': {
      res.end(renderToString(new Test3Component()));

      break;
    }
    case '/toggle': {
      res.end(renderToString(new Test4Component()));

      break;
    }
    case '/togglewithstate': {
      res.end(renderToString(new Test5Component()));

      break;
    }
    default: {
      res.end(renderToString(new Test1Component()));
    }
  }
}).listen(1337, '127.0.0.1');

console.log('Server running at http://127.0.0.1:1337/');

export default server;