const http = require('http');

const { v4: uuidv4 } = require('uuid');

const config = require('./config');
const errorHandle = require('./errorHandle');

const PORT = 3005;
const todos = [];

function requestListener(req, res) {

  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
  });
  
  if ( req.url === '/' && req.method === 'GET' ) {

    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('<h1>Node.js Restful API Kata - Home Page</h1>');
    res.end();

  } else if ( req.url === '/todos' && req.method === 'GET' ) {

    res.writeHead(200, config.headers);
    res.write(JSON.stringify({
      'result': 'success',
      'data': todos,
    }));
    res.end();

  } else if ( req.url === '/todos' && req.method === 'POST' ) {

    req.on('end', () => {
      try {
        const { title } = JSON.parse(body);

        if (title) {
          todos.push({
            id: uuidv4(),
            title,
          });
          res.writeHead(200, config.headers);
          res.write(JSON.stringify({
            'result': 'success',
            'data': todos,
          }));
          res.end();
        } else {
          errorHandle(res, 'ERROR: title is required');
        }
        
      } catch (err) {
        errorHandle(res, err.message);
      }
    });

  } else if ( req.url === '/todos' && req.method === 'DELETE' ) {

    todos.length = 0;
    res.writeHead(200, config.headers);
    res.write(JSON.stringify({
      'result': 'success',
      'message': 'Deleted All Todos',
    }));
    res.end();

  } else if ( req.url.startsWith('/todos/') && req.method === 'DELETE' ) {

    const id = req.url.split('/').pop();
    const index = todos.findIndex((todo) => todo.id === id);

    if ( index !== -1 ) {
      todos.splice(index, 1);
      res.writeHead(200, config.headers);
      res.write(JSON.stringify({
        'result': 'success',
        'data': todos,
        'message': `已刪除第 ${index+1} 筆資料`,
      }));
      res.end();
    } else {
      errorHandle(res, 'Not Found ID');
    }

  } else if ( req.url.startsWith('/todos/') && req.method === 'PATCH' ) {

    req.on('end', () => {
      try {
        const { title } = JSON.parse(body);

        if (title) {
          const id = req.url.split('/').pop();
          const index = todos.findIndex((todo) => todo.id === id);

          if ( index !== -1 ) {
            todos[index].title = title;
            res.writeHead(200, config.headers);
            res.write(JSON.stringify({
              'result': 'success',
              'data': todos,
              'message': `已編輯第 ${index+1} 筆資料`,
            }));
            res.end();
          } else {
            errorHandle(res, 'Not Found ID');
          }
          
        } else {
          errorHandle(res, 'ERROR: title is required');
        }

      } catch (err) {
        errorHandle(res, err.message);
      }
    });

  } else if ( req.method === 'OPTIONS' ) {

    res.writeHead(200, config.headers);
    res.end();

  } else {

    res.writeHead(404, {'Content-Type': 'text/html'});
    res.write('<h1>Not Found Page</h1>');
    res.end();

  }
}

const server = http.createServer(requestListener);

server.listen(process.env.PORT || PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
