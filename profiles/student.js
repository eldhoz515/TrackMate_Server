const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const app = require('../app.js');

function server(req, res, func) {
    try {
        func(req, res);
    }
    catch (err) {
        console.log(err);
        res.status(500).send();
    }
}

router.get('/', (req, res) => {
    res.send('heyyy');
});

router.get('/class/list', (req, res) => {
    server(req, res, (req, res) => {
        fs.readdir("./data/classes", (err, files) => {
            if (err) {
                console.log('Error reading classes', err);
                res.status(500).send();
            } else {
                const classes = files.map((file) => {
                    return path.parse(file).name;
                });
                console.log('classes are ', classes);
                res.send({ "classes": classes });
            }
        });
    });
});

router.get('/teacher/list', (req, res) => {
    server(req, res, (req, res) => {
        res.send(app.readFile('teachers.json'));
    });
});

router.post('/auth', (req, res) => {
    server(req, res, (req, res) => {
        let data = app.readFile(`classes/${req.body.class}.json`);
        if (data['students'][req.body.username]['password'] == req.body.password) {
            data['students'][req.body.username]['id'] = req.body.id;
            app.writeFile(`classes/${req.body.class}.json`, data);
            console.log('successful');
            res.status(200);
        }
        else {
            res.status(401);
            console.log('oops');
        }
        res.send();
    });
});

router.post('/new', (req, res) => {
    server(req, res, (req, res) => {
        const data = app.readFile(`classes/${req.body.class}.json`);
        if (data[req.body.username]) {
            console.log('username exists');
            res.status(401);
        }
        else {
            console.log('new student');
            let data = app.readFile('teachers.json');
            data['teachers'][req.body.teacher]['requests'].push(req.body);
            app.writeFile('teachers.json', data);
            res.status(200);
        }
        res.send();
    });
});

router.get('/timings', (req, res) => {
    server(req, res, (req, res) => {
        console.log('sending timings')
        res.send(app.readFile('timings.json'));
    });
});

router.post('/status', (req, res) => {
    server(req, res, (req, res) => {
        let data = app.readFile(`classes/${req.body.class}.json`);
        data['students'][req.body.username]['status'] = req.body.status;
        app.writeFile(`classes/${req.body.class}.json`, data);
        res.send();
    });
});

router.post('/attendance', (req, res) => {
    server(req, res, (req, res) => {
        res.send(app.readFile(`classes/${req.body.class}.json`)["attendance"]);
        console.log('attendance returned');
    });
});

module.exports = router;