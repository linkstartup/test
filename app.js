const server = 'http://18.222.89.229:3000/';


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

const app = express();


// parses json data sent to us by the user 
app.use(bodyParser.json());

// serve static html file to user
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
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
                                    m: []
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

app.post('/tuanzhangjoin', (req, res) => {

    db.getDB().collection(collection4).find({
        tuanzhangPhone: req.body.tuanzhangPhone
    }).toArray((err, documents) => {
        if (documents.length == 0) {
            //团长建团
            db.getDB().collection(collection4).insertOne(req.body, (err, result) => { //插入团长表
                //自动建立第一个团
                db.getDB().collection(collection3).insertOne({ //创建抽奖表
                    t: req.body.tuanzhangPhone,
                    m: []
                }, (err, result) => {
                    //返回团id
                    console.log(result.insertedId)

                    res.json({
                        msg: server + "tuan?t=" + result.insertedId,
                        error: null
                    });

                });

            });
        } else {
            res.json({
                msg: "exist!!!",
                error: null
            });
        }


    });


});



app.post('/tuanzhangcreate', (req, res) => {


    db.getDB().collection(collection4).find({
        tuanzhangPhone: req.body.tuanzhangPhone
    }).toArray((err, documents) => {

        if (documents.length == 0) {
            db.getDB().collection(collection4).insertOne(req.body, (err, result) => { //插入团长表
                db.getDB().collection(collection3).insertOne({ //创建抽奖表
                    t: req.body.tuanzhangPhone,
                    m: []
                }, (err, result) => {
                    //返回团id
                    console.log(result.insertedId)

                    res.json({
                        msg: server + "tuan?t=" + result.insertedId,
                        error: null
                    });

                });

            });
        } else {
            db.getDB().collection(collection3).insertOne({ //创建抽奖表
                t: req.body.tuanzhangPhone,
                m: []
            }, (err, result) => {
                //返回团id
                console.log(result.insertedId)

                res.json({
                    msg: server + "tuan?t=" + result.insertedId,
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

        res.json(documents);


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
        app.listen(3000, () => {

            console.log('connected to database, app listening on port 3000');
        });
    }
});