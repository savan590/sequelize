//htttp server practice

const http = require('http');
const fs = require('fs')

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');

  // create file 
  fs.appendFile('mynewfile1.txt', 'Hello content!', function (err) {
    if (err) throw err;
    console.log('Saved!');
  });

  // create file using open
  fs.open('mynewfile2.txt', 'w', function (err, file) {
    if (err) throw err;
    console.log('Saved!');
  });

  fs.writeFile('mynewfile3.txt', 'Hello content!', function (err) {
    if (err) throw err;
    console.log('Saved!');
  });

  // fs.unlink('mynewfile3.txt', function (err) {
  //   if (err) throw err;
  //   console.log('File deleted!');
  // });

  res.end('Hello, World!\n');
});

//read a file 
const server1 = http.createServer((req, res) => {
  fs.readFile('h.html', function (err, data) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.write(data)
    return res.end();
  })
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

