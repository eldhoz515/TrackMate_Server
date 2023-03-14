const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
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

router.post('/auth', (req, res) => {
    server(req, res, (req, res) => {
        const data = app.readFile('teachers.json');
        if (data['teachers'][req.body.username]['password'] == req.body.password) {
            console.log('teacher authenticated');
            res.status(200);
        }
        else {
            res.status(401);
            console.log('invalid teacher credentials');
        }
        res.send();
    });
});

router.post('/new', (req, res) => {
    server(req, res, (req, res) => {
        const data = app.readFile('teachers.json');
        if (data['teachers'][req.body.username]) {
            console.log('username exists');
            res.status(401);
        }
        else {
            console.log('new teacher');
            let requests = app.readFile('teachers_requests.json');
            requests['requests'].push(req.body);
            app.writeFile('teachers_requests.json', requests);
            res.status(200);
        }
        res.send();
    });
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

router.post('/class/view', (req, res) => {
    server(req, res, (req, res) => {
        const data = app.readFile(`classes/${req.body.class}.json`);
        res.send(data['students']);
        console.log('viewing class');
    });
});

router.post('/requests', (req, res) => {
    server(req, res, (req, res) => {
        const data = app.readFile('teachers.json');
        const requests = data['teachers'][req.body.username]['requests'];
        console.log('sending students requests');
        res.send({ "requests": requests });
    });
});

router.post('/respond', (req, res) => {
    server(req, res, (req, res) => {
        let data = app.readFile('teachers.json');
        const student = req.body.student;
        data['teachers'][req.body.username]['requests'] = data['teachers'][req.body.username]['requests'].filter((student) => {
            return student.username != req.body.student.username;
        });
        app.writeFile('teachers.json', data);
        if (req.body.accept) {
            data = app.readFile(`classes/${student.class}.json`);
            data['students'][student.username] = student;
            app.writeFile(`classes/${student.class}.json`, data);
            console.log('Added new student');
        }
        else {
            console.log('Declined student request');
        }
        res.send();
    });

});

router.post('/attendance', (req, res) => {
    server(req, res, (req, res) => {
        let data = app.readFile(`classes/${req.body.class}.json`);        
        for (student in req.body.attendance) {
            if (!data['attendance'][student]) {
                data['attendance'][student] = [];
            }
            data['attendance'][student].push(req.body.attendance[student]);
        }
        app.writeFile(`classes/${req.body.class}.json`, data);
        console.log('Attendance marked successfully');
	res.send();
    });
});

router.get('/attendance', (req, res) => {
    server(req, res, (req, res) => {
        res.send(app.readFile(`classes/${req.body.class}.json`)["attendance"]);
        console.log('attendance returned');
    });
});

module.exports = router;