var Task = require('data.task')
var fs = require('fs')
const R = require('ramda');

// read : String -> Task(Error, Buffer)
function read(path) {
  return new Task(function(reject, resolve) {
    fs.readFile(path, function(error, data) {
      if (error)  reject(error)
      else        resolve(data)
    })
  })
}
var id = function(x) {
  return x;
}
var sleep = function(ms) {
  return new Promise((res, rej) => {
    setTimeout(resolve, ms);
  })
}
var Maybe = function(x) {
  this.__value = x;
}

Maybe.of = function(x) {
  return new Maybe(x);
}

Maybe.prototype.isNothing = function() {
  return (this.__value === null || this.__value === undefined);
}

Maybe.prototype.map = function(f) {
  return this.isNothing() ? Maybe.of(null) : Maybe.of(f(this.__value));
}

Maybe.prototype.join = function() {
  return this.isNothing() ? Maybe.of(null) : this.__value;
}

var IO = function(f) {
  this.__value = f;
}

IO.of = function(x) {
  return new IO(function() {
    return x;
  });
}

IO.prototype.map = function(f) {
  return new IO(R.compose(f, this.__value));
}

IO.prototype.join = function() {
  return this.__value();
}

var Left = function(x) {
  this.__value = x;
}

Left.of = function(x) {
  return new Left(x);
}

Left.prototype.map = function(f) {
  return this;
}
Left.prototype.join = function() {
  return this.__value;
}

var Right = function(x) {
  this.__value = x;
}

Right.of = function(x) {
  return new Right(x);
}

Right.prototype.map = function(f) {
  return Right.of(f(this.__value));
}
Right.prototype.toString = function() {
  return `[Right: ${this.__value}]`;
}
Right.prototype.join = function() {
  return this.__value;
}

var chain = R.curry(function(f, m){
  return m.map(f).join(); // 或者 compose(join, map(f))(m)
});

var map = R.curry(function(f, any_functor_at_all) {
  return any_functor_at_all.map(f);
});





// safeProp :: 
var safeProp = R.curry(function (x, o) { return Maybe.of(o[x]); });
var user = {
  id: 2,
  name: "albert",
  address: {
    street: {
      number: 22,
      name: 'abc'
    }
  }
};

var ex1 = R.compose(chain(safeProp("name")), chain(safeProp("street")), safeProp("address"));
var u = ex1(user);
// console.log(u)

// var getFile = function() {
//   return new IO(function(){ return __filename; });
// }

var readFile = function(filename) {
  return new IO(function() {
    return fs.readFileSync(filename, 'utf-8');
  });
};

var pureLog = function(x) {
  return new IO(function(){
    console.log(x);
    return 'logged ' + x;
  });
}

var ex2 = R.compose(chain(pureLog), readFile);

// console.log(ex2);
// console.log(ex2.__value);

// console.log(ex2("index.js"));
// console.log(ex2("index.js").__value());
console.log("\n");
// chain(function(txt) {
//   console.log(txt);
// }, ex2("index.js"))
// chain(id, ex2("index.js"))
// 练习 3
// ==========
// 使用 getPost() 然后以 post 的 id 调用 getComments()
var getPost = function(i) {
  return new Task(function (rej, res) {
    setTimeout(function () {
      res({ id: i, title: 'Love them tasks' });
    }, 300);
  });
}

var getComments = function(i) {
  return new Task(function (rej, res) {
    setTimeout(function () {
      res([
        {post_id: i, body: "This book should be illegal"},
        {post_id: i, body: "Monads are like smelly shallots"}
      ]);
    }, 300);
  });
}

getPost("123").chain(id);
// var ex3 = R.curry(function(x) {
//   getPost(x).chain(function(res) {
//     return getComments(res.id);
//   })
// });
// var ex3 = getPost(3).map((x) => {
//   console.log(x);
// })
// ex3();
// (async function() {
//   await sleep(2000);
//   ex3();
// })

//  addToMailingList :: Email -> IO([Email])
var addToMailingList = (function(list){
  return function(email) {
    return new IO(function(){
      list.push(email);
      return list;
    });
  }
})([]);

function emailBlast(list) {
  return new IO(function(){
    return 'emailed: ' + list.join(',');
  });
}


var validateEmail = function(x){
  return x.match(/\S+@\S+\.\S+/) ? (new Right(x)) : (new Left('invalid email'));
}

//  ex4 :: Email -> Either String (IO String)
var ex4 = R.compose(map(map(emailBlast)), map(addToMailingList), validateEmail);
var ex5 = R.compose(id, validateEmail);
var ex6 = R.compose(chain(emailBlast), map(addToMailingList), validateEmail);

// console.log(validateEmail("a@a.com") instanceof Right)
// console.log(ex4("a@a.com").__value.__value().__value());
// console.log(ex5("a@a.com"));
console.log(ex6("a@b"));