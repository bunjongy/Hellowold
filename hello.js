const http = require('http');
const { EJSON, Int32 } = require('bson');
const find = require('find')
const path = require('path')
const formidable = require('formidable');
const fs = require('fs')

let tempData = {};
const hostname = '0.0.0.0';

const headers = {
  'Access-Control-Allow-Credentials': true,
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
  'Connection':'close'
};

const server = http.createServer((req, res) => {
  console.log('req= ' + req.method)
  if (req.method == 'GET'){
    res.writeHead(200, headers);
    res.write(JSON.stringify(tempData))
    res.end();
  } else if (req.method == 'POST'){
    var body = ''
    req.on('data', function(data) {
      body += data
    });
    req.on('end', function() {
      console.log('Body: ' + body)
      var str = body.replace(/\'/g, "\"");
      const _data = EJSON.parse(str);

      tempData = _data;
      console.log('_data.excise: ' + _data)
      if (_data.excise>=0){
        res.writeHead(200, headers);
        res.write(("{\"result\":true}"))
        res.end();
      } else if (_data.fgtarget>0){
        res.writeHead(200, headers);
        res.write(("{\"result\":true}"))
        res.end();
      } else {
        res.writeHead(200, headers);
        res.write(("{\"result\":false}"))
        res.end();
      }
    });
  }
});

otaHttp = function (req, res) {
  //console.log("req.url=",req.url);
  var resDir = path.join(__dirname ,"./ota/");
  if (req.url=="/"){
      res.setHeader('content-type', 'text/html')
      find.file(resDir, function (files) {
        res.write('<ul>')
        for (let i = 0; i < files.length; i++) {
          let fileRelative = path.relative(resDir, files[i])
          res.write('<li><a href="' + fileRelative + '">' + fileRelative + '</a></li>')
        }
        res.write('</ul>')
        res.end()
      });
  } else {
      fs.readFile(resDir.toString() + req.url, function (err,data) { //__dirname + "/ota/" + req.url
          if (err) {
              res.writeHead(404);
              //res.end(JSON.stringify(err));
              res.end();
          } else {
              res.writeHead(200);
              res.end(data);
          }
      });
  }
};

otaUpload = function (req, res) {
  if (req.method == 'POST' && req.url == '/fileupload') {
      var form = new formidable.IncomingForm();
      form.parse(req, function (err, fields, files) {
          //console.log("files="+files);
          var oldPath = files.filetoupload.path;
          var resDir = path.join(__dirname ,"./ota/");
          var newPath =resDir.toString() +files.filetoupload.name 
          var rawData = fs.readFileSync(oldPath)
          //console.log("oldPath=",oldPath,"newPath=",newPath,"rawData=",rawData);
          fs.writeFile(newPath, rawData, function(err){ 
              if(err) console.log(err)
              fs.unlinkSync(oldPath)
              res.writeHead(200, {'Content-Type': 'text/html','Connection':'close'});
              res.write("Successfully uploaded")
              res.end();
          })
      });
  } else {
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write('<form action="fileupload" method="post" enctype="multipart/form-data">');
      res.write('<input type="file" name="filetoupload"><br>');
      res.write('<input type="submit">');
      res.write('</form>');
      res.end();
  }
};

const serverOtaHttp = http.createServer(otaHttp);

const serverOtaUpload = http.createServer(otaUpload);

server.listen(3003, hostname, () => {
  console.log(`REST-API running at http://${hostname}:${3003}/`);
});

// serverOtaHttp.listen(3001, hostname, () => {
//   console.log(`OTA running at http://${hostname}:${3001}/`);
// });

// serverOtaUpload.listen(3002, hostname, () => {
//   console.log(`UPLOAD running at http://${hostname}:${3002}/`);
// });