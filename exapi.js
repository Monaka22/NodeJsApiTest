var express = require('express');
var app = express();
var mysql = require('mysql');
var path = require('path');
var fs = require("fs");
var formidable = require('formidable');
app.use(express.static(path.join(__dirname, '/stock')))
app.set('view engine', 'ejs');
app.set('views', './stock')

var con = mysql.createConnection({
  host: "35.198.219.154",
  user: "root",
  password: "1122334455ab",
  database: "main"
});

app.get('/edit', function (req, res) {
  // var row = { image: "1544771946945.jpg", title: "ทดสอบ", description: "รายละเอียด", price: 1000, stock: 10 }

  //   res.render("edit", { header: "Edit Product", item: row });
  //   console.log(JSON.stringify(row));

  var id = req.query.id;
  con.query(`SELECT * FROM stock where ID='${id}'`, function (err, result) {
    if (err) throw err;
    console.log(result[0]);
    res.render("edit", { "header": "Edit Workshop", "item": result[0] });
  });
});

app.get('/add', function (req, res) {
  res.render("add", { header: "Create Product" })
});

app.get('/', function (req, res, next) {
  con.query("SELECT * FROM stock", function (err, result, fields) {
    if (err) throw err;
    res.render("index", { header: "Stock Workshop", products: result });

  });
});

app.get('/product', function (req, res, next) {
  con.query("SELECT * FROM stock", function (err, result, fields) {
      if (err) throw err;
      res.send(result);
  });
});

app.post('/api/add', function (req, res) {
  try {
    var form = new formidable.IncomingForm();
    var newname = Date.now();
    form.parse(req, function (err, fields, files) {

      var oldpath = files.filetoupload.path;
      var fileName = newname.toString() + "." + files.filetoupload.name.split('.').pop();
      var newpath = path.join(__dirname, "./stock/images/" + fileName);
      fs.rename(oldpath, newpath, function (err) {
        if (err) throw err;

        var data = {
          title: fields.title,
          description: fields.description,
          price: fields.price,
          stock: fields.stock,
          image: fileName
        }

        var sql = `INSERT INTO stock  VALUES ('122','${data.title}','${data.description}','${data.price}','${data.stock}','${data.image}')`;
        con.query(sql, function (err, result) {
          if (err) throw err;
          console.log("1 record inserted");
        });

        //res.end("Insert Data: " + JSON.stringify(data));
        res.redirect('/');

      });

    });
  } catch (err) {
    console.log("err : " + err);
    res.json(err);
  }
});

app.get('/api/delete', function (req, res) {
  id = req.query.id;
  sql = `DELETE FROM stock WHERE ID=${id}`;
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("1 delete inserted");
    res.redirect('/');
  });
});

app.post('/api/update', function (req, res) {
  try {

    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
      if (files.filetoupload.size != 0) {

        var oldpath = files.filetoupload.path;
        var newpath = path.join(__dirname, "./stock/images/" + fields.image);

        fs.rename(oldpath, newpath, function (err) {
          if (err) throw err;
          console.log("Update file successfully");
        });
      }


      var data = {
        id: fields.id,
        title: fields.title,
        description: fields.description,
        price: fields.price,
        stock: fields.stock
      }

      console.log("update: " + JSON.stringify(data))
      sql = `UPDATE stock SET title= '${data.title}',
               description = '${data.description}', 
               price = ${data.price}, 
               stock = ${data.stock} where id='${data.id}'`;

      con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("1 update inserted");
        res.redirect('/');
      });
    });


  } catch (err) {

  }
});


var server = app.listen(9000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log("Listening at http://%s:%s", host, port);
});