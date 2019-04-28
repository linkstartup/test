// const server = 'http://www.indo123.co/';
const server = 'http://localhost/';


const express = require('express');
const bodyParser = require("body-parser");
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


// parses json data sent to us by the user 
app.use(bodyParser.json());

// serve static html file to user
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
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
    console.log(req.body.t)


    let result = {};

    db.getDB().collection(collection3).find({
        _id: new ObjectId(req.body.t)
    }).toArray((err, documents) => {
        console.log(documents)
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

            console.log(result)
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
                                            msg: server + "tuan?t=" + existedTuanId,
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
                                                msg: server + "tuan?t=" + newTuanId,
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
                                            msg: server + "tuan?t=" + existedTuanId,
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
                                                msg: server + "tuan?t=" + newTuanId,
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
                msg: server + "tuan?t=" + documents[0].tuanId,
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
                        msg: server + "hi?t=" + result.insertedId,
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
                    msg: server + "hi?t=" + result.insertedId,
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
app.post('/', (req, res, next) => {
    // Document to be inserted
    const userInput = req.body;


    db.getDB().collection(collection).find({
        todo: userInput.todo
    }).toArray((err, documents) => {
        if (err)
            console.log(err);
        else {
            if (documents.length == 0) {
                db.getDB().collection(collection).insertOne(userInput, (err, result) => {
                    if (err) {
                        const error = new Error("Failed to insert Todo Document");
                        error.status = 400;
                        next(error);
                    } else
                        res.json({
                            result: result,
                            document: result.ops[0],
                            msg: "Successfully inserted Todo!!!",
                            error: null
                        });
                });
            } else {
                const error = new Error("exist");
                error.status = 400;
                next(error);
            }

        }
    });



});



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
        app.listen(80, () => {

            console.log('connected to database, app listening on port 80');
        });
    }
});