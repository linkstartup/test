var express = require('express');
var router = express.Router();
var User = require('./models/user');


var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

const server = 'www.indo123.co/';
// const server = 'http://localhost/';
const fs = require("fs");

const fileUpload = require('express-fileupload');

const path = require('path');
var ObjectId = require('mongodb').ObjectID;

const db = require("./db");
const collection = "todo";
const collection2 = "user";
const collection3 = "t";
const collection4 = "tuanzhang";
const collection5 = "joinmember";
const hi = "hi";

const app = express();

// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
//   });
// parses json data sent to us by the user 
app.use(bodyParser.json({
    limit: '50mb',
    extended: true
}));

app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true,
    parameterLimit: 50000

}));



//connect to MongoDB
// mongoose.connect('mongodb://localhost:27017/crud_mongodb');
mongoose.connect("mongodb://root:261500Aa@localhost:27017/crud_mongodb?authSource=admin")
var db2 = mongoose.connection;

//handle mongo error
db2.on('error', console.error.bind(console, 'connection error:'));
db2.once('open', function() {
    // we're connected!
});

//use sessions for tracking logins
app.use(session({
    secret: 'work hard',
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({
        mongooseConnection: db2
    })
}));

// serve static files from template
app.use(express.static(__dirname + '/templateLogReg'));
// include routes
// var routes = require('./routes/router');
app.use('/', router);

//POST route for updating data
router.post('/', function(req, res, next) {
    // confirm that user typed same password twice
    if (req.body.password !== req.body.passwordConf) {
      var err = new Error('Passwords do not match.');
      err.status = 400;
      res.send("passwords dont match");
      return next(err);
    }
  
    if (req.body.email &&
      req.body.username &&
      req.body.password &&
      req.body.passwordConf) {//register
  
      var userData = {
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
        leftRatio:0.1,
        a:50
      }
  
      User.create(userData, function(error, user) {
        if (error) {
          return next(error);
        } else {
          req.session.userId = user._id;
          // return res.redirect('/profile');
          res.json({
            msg:'register success'
          })
        }
      });
  
    } else if (req.body.logemail && req.body.logpassword) {//login
      User.authenticate(req.body.logemail, req.body.logpassword, function(error, user) {
        if (error || !user) {
          var err = new Error('Wrong email or password.');
          err.status = 401;
          return next(err);
        } else {
          req.session.userId = user._id;
          res.json({userId:req.session.userId})
          // return res.redirect('/profile');
        }
      });
    } else {
      var err = new Error('All fields required.');
      err.status = 400;
      return next(err);
    }
  })
  

  router.post('/userEquity',function(req,res,next){
        console.log(req.body._id)

        db.getDB().collection('users').find({
            _id: new ObjectId(req.body._id)
        }).toArray((err, documents) => {        
            res.json({
                leftRatio:documents[0].leftRatio,
                a:documents[0].a,
            })
        })
  })
  
  // GET route after registering
  router.post('/successLog', function(req, res, next) {
    
    db.getDB().collection('photo').insertOne({ //创建图片表
        photo: 'photo',
    }, (err, result) => {
    
        User.findById(req.session.userId)
        .exec(function(error, user) {
          if (error) {
            return next(error);
          } else {
            if (user === null) {
              res.json({
                msg:'please log in'
              })
            } else {
              res.json({
                user:user
              })
            }
          }
        });

    });

  });
  
  
  
  
  // GET route after registering
  // router.get('/profile', function(req, res, next) {
  //   User.findById(req.session.userId)
  //     .exec(function(error, user) {
  //       if (error) {
  //         return next(error);
  //       } else {
  //         if (user === null) {
  //           var err = new Error('Not authorized! Go back!');
  //           err.status = 400;
  //           return next(err);
  //         } else {
  //           return res.send('<h1>Name: </h1>' + user.username + '<h2>Mail: </h2>' + user.email + '<br><a type="button" href="/logout">Logout</a>')
  //         }
  //       }
  //     });
  // });
  
  // GET for logout logout
  router.post('/logout', function(req, res, next) {
    if (req.session) {
      // delete session object
      req.session.destroy(function(err) {
        if (err) {
          return next(err);
        } else {
          // return res.redirect('/');
          res.json({
            msg:'log out'
          })
        }
      });
    }
  });















// serve static html file to user
// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, 'index.html'));
// });




app.post('/getPriority', function(req, res) {
    res.json({
        leftRatio:0.7,
        a:10
    })
})




// default options
app.use(fileUpload());

app.post('/upload', function(req, res) {
    if (Object.keys(req.files).length == 0) {
        return res.status(400).send('No files were uploaded.');
    }

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let sampleFile = req.files.sampleFile;
    let name = req.files.sampleFile.name.replace(/\s+/g,"");
    var imgSuffix=name.split('.')[name.split('.').length-1];
    
    name = name.replace(/\-+/g,"");
    name = name.replace(/\.+/g,"");

    name=name.substring(0, 10);

    name=name+'.'+imgSuffix

    // Use the mv() method to place the file somewhere on your server
    ///usr/local/var/www/Blur/index.html
    //./static/images/
    sampleFile.mv('./clip/Blur/' + name, function(err) {
        res.json({imageUrl:'https://www.indo123.co/clip/Blur/' + name,imgName:name});
    });
});



//base64
app.post('/base64', (req, res) => {

    var base64Data = req.body.base64.replace(/^data:image\/png;base64,/, "");
    fs.writeFile('./clip/Blur/first/'+req.body.imgName, base64Data, {
        encoding: 'base64'
    }, function(err) {
        console.log(err);
        res.json({
            msg:'success uploaded base64'
        })
    });


});


//dave团长
app.get('/dave', (req, res) => {
    res.sendFile(path.join(__dirname, './dist/dave.html'));
});

// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, './dist/dave.html'));
// });

app.get('/mn', (req, res) => {
    res.sendFile(path.join(__dirname, 'mn.html'));
});

app.get('/cc', (req, res) => {
    res.sendFile(path.join(__dirname, 'cc.html'));
});






//抽奖
app.post('/davec', (req, res) => {

    db.getDB().collection(collection3).find({
        _id: new ObjectId(req.body.t)
    }).toArray((err, documents) => {
        if (documents[0] && documents[0].haveWinner) {
            res.json(documents[0].haveWinner)

        } else {

            let r = getRandomInt(0, 9);

            let w = documents[0].m;

            let winner = w[r];



            db.getDB().collection(collection3).updateOne({
                _id: new ObjectId(req.body.t)
            }, {
                $set: {
                    haveWinner: winner
                }
            }, (err, result) => {
                res.json(winner);

            })



        }

    })



});


//参加团
app.post('/davet', (req, res) => {

    db.getDB().collection(collection3).find({
        _id: new ObjectId(req.body.t)
    }).toArray((err, documents) => {

        let tuanzhangId = documents[0].t;



        db.getDB().collection(collection5).find({
            memberPhone: req.body.memberPhone
        }).toArray((err, documents) => {
            if (documents.length == 0) { //是新成员


                //判断当前的团是否满了
                db.getDB().collection(collection3).find({
                    _id: new ObjectId(req.body.t)
                }).toArray((err, documents) => {


                    if (documents[0].m.length < 10) { //没有满
                        console.log('not full join')
                        req.body.tuanId = req.body.t;
                        req.body.joinedt = [req.body.t];
                        req.body.time = 1; //第一次参加
                        req.body.tuanzhangId = tuanzhangId;

                        db.getDB().collection(collection3).updateOne({ //进入抽奖表
                            _id: new ObjectId(req.body.t)
                        }, {
                            $push: {
                                m: req.body
                            }
                        }, {
                            returnOriginal: false
                        }, (err, result) => {
                            db.getDB().collection(collection5).insertOne(req.body, (err, result) => { //加入成员表

                                res.json({
                                    msg: "success!",
                                    error: null
                                });

                            });

                        });



                    } else { //当前的团已经满了
                        console.log('full')

                        //查看当前团长是否有没有满的团
                        db.getDB().collection(collection3).find({
                            t: tuanzhangId
                        }).toArray((err, documents) => {
                            let notfull = documents.filter((document) => {
                                return document.m.length < 10
                            });
                            if (notfull.length > 0) { //存在没有满的团
                                let existedTuanId = notfull[0]._id;

                                req.body.tuanzhangId = tuanzhangId;
                                req.body.tuanId = existedTuanId;
                                req.body.joinedt = [existedTuanId];

                                req.body.time = 1; //第一次参加

                                db.getDB().collection(collection3).updateOne({ //进入抽奖表
                                    _id: new ObjectId(existedTuanId)
                                }, {
                                    $push: {
                                        m: req.body
                                    }
                                }, {
                                    returnOriginal: false
                                }, (err, result) => {
                                    db.getDB().collection(collection5).insertOne(req.body, (err, result) => { //加入成员表


                                        res.json({
                                            full: true,
                                            msg: "dave?t=" + existedTuanId,
                                            error: null
                                        });

                                    });

                                });

                            } else { //当前团长的团都满了

                                db.getDB().collection(collection3).insertOne({ //创建抽奖表
                                    t: tuanzhangId,
                                    m: [{
                                        tuanzhangId: tuanzhangId,
                                        memberPhone: tuanzhangId,
                                        memberName: tuanzhangId,
                                        time: 1,
                                        tuanId: '',
                                        role: 'tuanzhang'

                                    }]
                                }, (err, result) => {
                                    //返回团id
                                    let newTuanId = result.insertedId;
                                    let newTuanIdString = newTuanId.toString();
                                    req.body.tuanId = newTuanId;
                                    req.body.joinedt = [newTuanIdString];

                                    req.body.time = 1; //第一次参加
                                    req.body.tuanzhangId = tuanzhangId;


                                    db.getDB().collection(collection3).updateOne({ //进入抽奖表
                                        _id: new ObjectId(newTuanId)
                                    }, {
                                        $push: {
                                            m: req.body
                                        }
                                    }, {
                                        returnOriginal: false
                                    }, (err, result) => {

                                        db.getDB().collection(collection5).insertOne(req.body, (err, result) => { //加入成员表

                                            res.json({
                                                full: true,
                                                msg: "dave?t=" + newTuanId,
                                                error: null
                                            });

                                        });
                                    });

                                });

                            }


                        });



                    }
                });
            } else { //是老成员，已经参加过
                console.log('old')
                const joinedts = documents[0].joinedt;

                let existSameT = joinedts.filter((joinedt) => {
                    return joinedt == req.body.t
                });


                //查询参加次数
                let joinTime = documents[0].time
                //判断当前的团是否满了
                db.getDB().collection(collection3).find({
                    _id: new ObjectId(req.body.t)
                }).toArray((err, documents) => {


                    if (documents[0].m.length < 10) { //没有满


                        if (existSameT.length > 0) { //加入过同一个团
                            res.json({
                                msg: 'existed'
                            })
                        } else {

                            console.log('not full join')
                            req.body.tuanId = req.body.t;
                            req.body.time = ++joinTime; //参加次数更新
                            req.body.tuanzhangId = tuanzhangId;



                            db.getDB().collection(collection3).updateOne({ //进入抽奖表
                                _id: new ObjectId(req.body.t)
                            }, {
                                $push: {
                                    m: req.body
                                }
                            }, {
                                returnOriginal: false
                            }, (err, result) => { //更新成员表



                                db.getDB().collection(collection5).updateOne({
                                    memberPhone: req.body.memberPhone
                                }, {
                                    $set: {
                                        time: req.body.time
                                    },
                                    $push: {
                                        joinedt: req.body.t
                                    }
                                }, (err, result) => {
                                    console.log(req.body.time)
                                    res.json({
                                        msg: "success!",
                                        error: null
                                    });
                                })



                            });



                        }

                    } else { //当前的团已经满了
                        console.log('full')

                        //查看当前团长是否有没有满的团
                        db.getDB().collection(collection3).find({
                            t: tuanzhangId
                        }).toArray((err, documents) => {
                            let notfull = documents.filter((document) => {
                                return document.m.length < 10
                            });


                            if (notfull.length > 0) { //当前团长，存在没有满的团

                                Array.prototype.remove = function(val) {
                                    var index = this.indexOf(val);
                                    if (index > -1) {
                                        this.splice(index, 1);
                                    }
                                };
                                var notExistSameT = [];
                                for (let i = 0; i < notfull.length; i++) {
                                    notExistSameT.push(notfull[i]._id.toString())
                                }

                                console.log(notExistSameT)
                                console.log(joinedts)

                                for (let i = 0; i < joinedts.length; i++) {

                                    notExistSameT.remove(joinedts[i].toString())
                                }

                                console.log(notExistSameT)



                                //存在没加入过的团

                                if (notExistSameT.length > 0) {

                                    let existedTuanId = notExistSameT[0];
                                    console.log(existedTuanId)

                                    req.body.tuanzhangId = tuanzhangId;
                                    req.body.tuanId = existedTuanId;
                                    req.body.time = ++joinTime; //参加次数更新

                                    db.getDB().collection(collection3).updateOne({ //进入抽奖表
                                        _id: new ObjectId(existedTuanId)
                                    }, {
                                        $push: {
                                            m: req.body
                                        }
                                    }, {
                                        returnOriginal: false
                                    }, (err, result) => { //更新成员表



                                        db.getDB().collection(collection5).updateOne({
                                            memberPhone: req.body.memberPhone
                                        }, {
                                            $set: {
                                                time: req.body.time
                                            },

                                            $push: {
                                                joinedt: existedTuanId
                                            }
                                        }, (err, result) => {
                                            console.log(server)

                                            res.json({
                                                full: true,
                                                msg: "dave?t=" + existedTuanId,
                                                error: null
                                            });
                                        })

                                    });

                                } else {

                                    res.json({
                                        msg: 'existed'
                                    })
                                }


                            } else { //当前团长的团都满了

                                db.getDB().collection(collection3).insertOne({ //创建抽奖表
                                    t: tuanzhangId,
                                    m: [{
                                        tuanzhangId: tuanzhangId,
                                        memberPhone: tuanzhangId,
                                        memberName: tuanzhangId,
                                        time: 1,
                                        tuanId: '',
                                        role: 'tuanzhang'

                                    }]
                                }, (err, result) => {
                                    //返回团id
                                    let newTuanId = result.insertedId;
                                    let newTuanIdInserted = result.insertedId.toString()
                                    req.body.tuanId = newTuanId;
                                    req.body.time = ++joinTime; //参加次数更新
                                    req.body.tuanzhangId = tuanzhangId;


                                    db.getDB().collection(collection3).updateOne({ //进入抽奖表
                                        _id: new ObjectId(newTuanId)
                                    }, {
                                        $push: {
                                            m: req.body
                                        }
                                    }, {
                                        returnOriginal: false
                                    }, (err, result) => { //更新成员表



                                        db.getDB().collection(collection5).updateOne({
                                            memberPhone: req.body.memberPhone
                                        }, {
                                            $set: {
                                                time: req.body.time
                                            },
                                            $push: {
                                                joinedt: newTuanIdInserted
                                            }
                                        }, (err, result) => {

                                            res.json({
                                                full: true,
                                                msg: "dave?t=" + newTuanId,
                                                error: null
                                            });
                                        })


                                    });

                                });

                            }


                        });



                    }
                });



            }


        });
    })



});



//设置团的详情
app.get('/setd', (req, res) => {
    res.sendFile(path.join(__dirname, 'setd.html'));
});



app.post('/setd', (req, res) => { //设置每个团开奖时间，团的图片对象数组



    console.log(req.body.endDate)
    console.log(req.body)


    db.getDB().collection(collection3).updateOne({
        _id: new ObjectId(req.body.t)
    }, {
        $set: {
            endDate: req.body.endDate,
            imgUrl: req.body.imgUrl,
            videoUrl: req.body.videoUrl
        }
    }, (err, result) => {
        res.json(result);

    })



});



//倒计时
//倒计时开奖
// let endDate = new Date("2019-04-28 03:06:00");
// let nowDate=new Date();
// let diffSecond = parseInt((endDate-nowDate)/1000); //结束时间到现在差的秒数



app.post('/getT', (req, res) => { //查询每个团开奖时间，团的图片对象数组


    let result = {};

    db.getDB().collection(collection3).find({
        _id: new ObjectId(req.body.t)
    }).toArray((err, documents) => {
        if (documents.length == 0) { //团不存在

        } else {
            if (documents[0].endDate) {
                result.diffSecond = parseInt((new Date(documents[0].endDate) - new Date()) / 1000);

            } else {
                result.diffSecond = parseInt((new Date("2019-04-28 17:55:50") - new Date()) / 1000)

            }

            if (documents[0].imgUrl) {
                result.imgUrl = documents[0].imgUrl

            } else {
                result.imgUrl = []
            }

            if (documents[0].videoUrl) {
                result.videoUrl = documents[0].videoUrl

            } else {
                result.videoUrl = []
            }

            res.json(result);

        }
    })


});



app.get('/hi', (req, res) => {
    res.sendFile(path.join(__dirname, 'hi.html'));
});


//参加团
app.post('/hi', (req, res) => {

    db.getDB().collection(collection3).find({
        _id: new ObjectId(req.body.t)
    }).toArray((err, documents) => {

        let tuanzhangId = documents[0].t;



        db.getDB().collection(collection5).find({
            memberPhone: req.body.memberPhone
        }).toArray((err, documents) => {
            if (documents.length == 0) { //是新成员


                //判断当前的团是否满了
                db.getDB().collection(collection3).find({
                    _id: new ObjectId(req.body.t)
                }).toArray((err, documents) => {


                    if (documents[0].m.length < 10) { //没有满
                        console.log('not full join')
                        req.body.tuanId = req.body.t;
                        req.body.time = 1; //第一次参加
                        req.body.tuanzhangId = tuanzhangId;

                        db.getDB().collection(collection3).updateOne({ //进入抽奖表
                            _id: new ObjectId(req.body.t)
                        }, {
                            $push: {
                                m: req.body
                            }
                        }, {
                            returnOriginal: false
                        }, (err, result) => {
                            db.getDB().collection(collection5).insertOne(req.body, (err, result) => { //加入成员表

                                res.json({
                                    msg: "success!",
                                    error: null
                                });

                            });

                        });



                    } else { //当前的团已经满了
                        console.log('full')

                        //查看当前团长是否有没有满的团
                        db.getDB().collection(collection3).find({
                            t: tuanzhangId
                        }).toArray((err, documents) => {
                            let notfull = documents.filter((document) => {
                                return document.m.length < 10
                            });
                            if (notfull.length > 0) { //存在没有满的团
                                let existedTuanId = notfull[0]._id;

                                req.body.tuanzhangId = tuanzhangId;
                                req.body.tuanId = existedTuanId;
                                req.body.time = 1; //第一次参加

                                db.getDB().collection(collection3).updateOne({ //进入抽奖表
                                    _id: new ObjectId(existedTuanId)
                                }, {
                                    $push: {
                                        m: req.body
                                    }
                                }, {
                                    returnOriginal: false
                                }, (err, result) => {
                                    db.getDB().collection(collection5).insertOne(req.body, (err, result) => { //加入成员表


                                        res.json({
                                            full: true,
                                            msg: "tuan?t=" + existedTuanId,
                                            error: null
                                        });

                                    });

                                });

                            } else { //当前团长的团都满了

                                db.getDB().collection(collection3).insertOne({ //创建抽奖表
                                    t: tuanzhangId,
                                    m: [{
                                        tuanzhangId: tuanzhangId,
                                        memberPhone: tuanzhangId,
                                        memberName: tuanzhangId,
                                        time: 1,
                                        tuanId: '',
                                        role: 'tuanzhang'

                                    }]
                                }, (err, result) => {
                                    //返回团id
                                    let newTuanId = result.insertedId;
                                    req.body.tuanId = newTuanId;
                                    req.body.time = 1; //第一次参加
                                    req.body.tuanzhangId = tuanzhangId;


                                    db.getDB().collection(collection3).updateOne({ //进入抽奖表
                                        _id: new ObjectId(newTuanId)
                                    }, {
                                        $push: {
                                            m: req.body
                                        }
                                    }, {
                                        returnOriginal: false
                                    }, (err, result) => {

                                        db.getDB().collection(collection5).insertOne(req.body, (err, result) => { //加入成员表

                                            res.json({
                                                full: true,
                                                msg: "tuan?t=" + newTuanId,
                                                error: null
                                            });

                                        });
                                    });

                                });

                            }


                        });



                    }
                });
            } else {
                res.json({
                    msg: "exist!!!",
                    error: null,
                });
            }


        });
    })



});


//查询现在的团
app.post('/hit', (req, res) => {
    db.getDB().collection(collection3).find({
        _id: new ObjectId(req.body.t)
    }).toArray((err, documents) => {

        res.json(documents[0]);


    });

});



//抽奖
app.post('/hiBtn', (req, res) => {


    db.getDB().collection(collection3).find({
        _id: new ObjectId(req.body.t)
    }).toArray((err, documents) => {
        if (documents[0] && documents[0].haveWinner) {


        } else {

            let r = getRandomInt(0, 9);

            let w = documents[0].m;

            let winner = w[r];



            db.getDB().collection(collection3).updateOne({
                _id: new ObjectId(req.body.t)
            }, {
                $set: {
                    haveWinner: winner
                }
            }, (err, result) => {
                res.json(winner);

            })



        }



    });


});



/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}



//抽奖
app.post('/choujiangBtn', (req, res) => {



    db.getDB().collection(collection3).find({
        _id: new ObjectId(req.body.t)
    }).toArray((err, documents) => {
        if (documents[0] && documents[0].haveWinner) {


        } else {

            let r = getRandomInt(0, 9);

            let w = documents[0].m;

            let winner = w[r];



            db.getDB().collection(collection3).updateOne({
                _id: new ObjectId(req.body.t)
            }, {
                $set: {
                    haveWinner: winner
                }
            }, (err, result) => {
                res.json(winner);

            })



        }



    });


});



//团员加入


app.post('/joinTuan', (req, res) => {

    db.getDB().collection(collection3).find({
        _id: new ObjectId(req.body.t)
    }).toArray((err, documents) => {

        let tuanzhangId = documents[0].t;



        db.getDB().collection(collection5).find({
            memberPhone: req.body.memberPhone
        }).toArray((err, documents) => {
            if (documents.length == 0) { //是新成员


                //判断当前的团是否满了
                db.getDB().collection(collection3).find({
                    _id: new ObjectId(req.body.t)
                }).toArray((err, documents) => {


                    if (documents[0].m.length < 10) { //没有满
                        console.log('not full join')
                        req.body.tuanId = req.body.t;
                        req.body.time = 1; //第一次参加
                        req.body.tuanzhangId = tuanzhangId;

                        db.getDB().collection(collection3).updateOne({ //进入抽奖表
                            _id: new ObjectId(req.body.t)
                        }, {
                            $push: {
                                m: req.body
                            }
                        }, {
                            returnOriginal: false
                        }, (err, result) => {
                            db.getDB().collection(collection5).insertOne(req.body, (err, result) => { //加入成员表

                                res.json({
                                    msg: "success!",
                                    error: null
                                });

                            });

                        });



                    } else { //当前的团已经满了
                        console.log('full')

                        //查看当前团长是否有没有满的团
                        db.getDB().collection(collection3).find({
                            t: tuanzhangId
                        }).toArray((err, documents) => {
                            let notfull = documents.filter((document) => {
                                return document.m.length < 10
                            });
                            if (notfull.length > 0) { //存在没有满的团
                                let existedTuanId = notfull[0]._id;

                                req.body.tuanzhangId = tuanzhangId;
                                req.body.tuanId = existedTuanId;
                                req.body.time = 1; //第一次参加

                                db.getDB().collection(collection3).updateOne({ //进入抽奖表
                                    _id: new ObjectId(existedTuanId)
                                }, {
                                    $push: {
                                        m: req.body
                                    }
                                }, {
                                    returnOriginal: false
                                }, (err, result) => {
                                    db.getDB().collection(collection5).insertOne(req.body, (err, result) => { //加入成员表


                                        res.json({
                                            full: true,
                                            msg: "tuan?t=" + existedTuanId,
                                            error: null
                                        });

                                    });

                                });

                            } else { //当前团长的团都满了

                                db.getDB().collection(collection3).insertOne({ //创建抽奖表
                                    t: tuanzhangId,
                                    m: [{
                                        tuanzhangId: tuanzhangId,
                                        memberPhone: tuanzhangId,
                                        memberName: tuanzhangId,
                                        time: 1,
                                        tuanId: '',
                                        role: 'tuanzhang'

                                    }]
                                }, (err, result) => {
                                    //返回团id
                                    let newTuanId = result.insertedId;
                                    req.body.tuanId = newTuanId;
                                    req.body.time = 1; //第一次参加
                                    req.body.tuanzhangId = tuanzhangId;


                                    db.getDB().collection(collection3).updateOne({ //进入抽奖表
                                        _id: new ObjectId(newTuanId)
                                    }, {
                                        $push: {
                                            m: req.body
                                        }
                                    }, {
                                        returnOriginal: false
                                    }, (err, result) => {

                                        db.getDB().collection(collection5).insertOne(req.body, (err, result) => { //加入成员表

                                            res.json({
                                                full: true,
                                                msg: "tuan?t=" + newTuanId,
                                                error: null
                                            });

                                        });
                                    });

                                });

                            }


                        });



                    }
                });
            } else {
                res.json({
                    msg: "exist!!!",
                    error: null
                });
            }


        });
    })



});



//查询团员所在的团


app.get('/myt', (req, res) => {
    res.sendFile(path.join(__dirname, 'myt.html'));
});
app.post('/myt', (req, res) => {
    db.getDB().collection(collection5).find({
        memberPhone: req.body.memberPhone
    }).toArray((err, documents) => {
        if (documents[0] && documents[0].tuanId) {
            res.json({
                msg: "tuan?t=" + documents[0].tuanId,
                error: null
            });
        }


    });

});



//查询当前的团

app.get('/tuan', (req, res) => {
    res.sendFile(path.join(__dirname, 'tuan.html'));
});

app.post('/tuan', (req, res) => {
    db.getDB().collection(collection3).find({
        _id: new ObjectId(req.body.t)
    }).toArray((err, documents) => {

        res.json(documents[0]);


    });

});



//团长加入

app.get('/tuanzhang', (req, res) => {
    res.sendFile(path.join(__dirname, 'tuanzhang.html'));
});



//团长创建新团
app.post('/tuanzhangcreate', (req, res) => {


    db.getDB().collection(collection4).find({
        tuanzhangPhone: req.body.tuanzhangPhone
    }).toArray((err, documents) => {

        if (documents.length == 0) { //团长不存在
            db.getDB().collection(collection4).insertOne(req.body, (err, result) => { //插入团长表
                db.getDB().collection(collection3).insertOne({ //创建抽奖表
                    t: req.body.tuanzhangPhone,
                    m: [{
                        tuanzhangId: req.body.tuanzhangPhone,
                        memberPhone: req.body.tuanzhangPhone,
                        memberName: req.body.tuanzhangPhone,
                        time: 1,
                        tuanId: '',
                        role: 'tuanzhang'

                    }]
                }, (err, result) => {
                    //返回团id
                    console.log(result.insertedId)

                    res.json({
                        // msg: server + "tuan?t=" + result.insertedId,
                        msg: "hi?t=" + result.insertedId,
                        error: null
                    });

                });

            });
        } else { //团长已经存在
            db.getDB().collection(collection3).insertOne({ //创建抽奖表
                t: req.body.tuanzhangPhone,
                m: [{
                    tuanzhangId: req.body.tuanzhangPhone,
                    memberPhone: req.body.tuanzhangPhone,
                    memberName: req.body.tuanzhangPhone,
                    time: 1,
                    tuanId: '',
                    role: 'tuanzhang'

                }]
            }, (err, result) => {
                //返回团id
                console.log(result.insertedId)

                res.json({
                    // msg: server + "tuan?t=" + result.insertedId,
                    msg: "hi?t=" + result.insertedId,
                    error: null
                });

            });
        }

    });



});



//团长查询

app.get('/tzq', (req, res) => {
    res.sendFile(path.join(__dirname, 'tzq.html'));
});

app.post('/tzq', (req, res) => {
    db.getDB().collection(collection3).find({
        t: req.body.memberPhone
    }).toArray((err, documents) => {

        res.json({
            documents: documents,
            server: server
        });


    });

});



app.get('/getChild', (req, res) => { //等级结构

    db.getDB().collection(collection).find({}).toArray((err, documents) => {
        if (err)
            console.log(err);
        else {
            let list = [];
            for (let i = 0; i < documents.length; i++) {
                list.push({
                    me: documents[i].todo,
                    previousUser: documents[i].previousUser
                })
            }


            let result = findChildren(list, 1);

            res.json(result);
        }
    });
});

function findChildren(source, previousUser) {
    let cloneData = JSON.parse(JSON.stringify(source)) // 对源数据深度克隆
    let result = cloneData.filter(father => { // 循环所有项，并添加children属性
        let branchArr = cloneData.filter(child => father.me == child.previousUser); // 返回每一项的子级数组
        branchArr.length > 0 ? father.children = branchArr : '' //给父级添加一个children属性，并赋值
        return father.previousUser == previousUser; //返回第一层
    });
    return result;
}

function setTreeData(source) {
    let cloneData = JSON.parse(JSON.stringify(source)) // 对源数据深度克隆
    let result = cloneData.filter(father => { // 循环所有项，并添加children属性
        let branchArr = cloneData.filter(child => father.me == child.previousUser); // 返回每一项的子级数组
        branchArr.length > 0 ? father.children = branchArr : '' //给父级添加一个children属性，并赋值
        return father.previousUser == 0; //返回第一层
    });
    return result;
}



//create
// app.post('/', (req, res, next) => {
//     // Document to be inserted
//     const userInput = req.body;


//     db.getDB().collection(collection).find({
//         todo: userInput.todo
//     }).toArray((err, documents) => {
//         if (err)
//             console.log(err);
//         else {
//             if (documents.length == 0) {
//                 db.getDB().collection(collection).insertOne(userInput, (err, result) => {
//                     if (err) {
//                         const error = new Error("Failed to insert Todo Document");
//                         error.status = 400;
//                         next(error);
//                     } else
//                         res.json({
//                             result: result,
//                             document: result.ops[0],
//                             msg: "Successfully inserted Todo!!!",
//                             error: null
//                         });
//                 });
//             } else {
//                 const error = new Error("exist");
//                 error.status = 400;
//                 next(error);
//             }

//         }
//     });



// });



// Middleware for handling Error
// Sends Error Response Back to User
app.use((err, req, res, next) => {
    res.status(err.status).json({
        error: {
            message: err.message
        }
    });
})


db.connect((err) => {
    // If err unable to connect to database
    // End application
    if (err) {
        console.log('unable to connect to database');
        process.exit(1);
    }
    // Successfully connected to database
    // Start up our Express Application
    // And listen for Request
    else {
        app.listen(8675, () => {

            console.log('connected to database, app listening on port 80');
        });
    }
});