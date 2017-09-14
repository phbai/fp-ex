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

var chain = R.curry(function(f, m){
  return m.map(f).join(); // 或者 compose(join, map(f))(m)
});

// safeProp :: 
var safeProp = R.curry(function (x, o) { return Maybe.of(o[x]); });
var user = {
  id: 2,
  name: "albert",
  address: {
    street: {
      number: 22,
      name: ''
    }
  }
};

var ex1 = R.compose(chain(safeProp("name")), chain(safeProp("street")), safeProp("address"));
var u = ex1(user);
console.log(u)

var getFile = function() {
  return new IO(function(){ return __filename; });
}

var pureLog = function(x) {
  return new IO(function(){
    console.log(x);
    return 'logged ' + x;
  });
}

var ex2 = R.compose(chain(pureLog), getFile);

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

var ex3 = R.curry(function(x) {
  getPost(x).chain(function(res) {
    return getComments(res.id);
  })
});
// var ex3 = getPost(3).map((x) => {
//   console.log(x);
// })
// ex3();
(async function() {
  await sleep(2000);
  ex3();
})