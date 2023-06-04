const username = "admin";
const password = "12345";

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
        if (req.body.username == username && req.body.password == password) {
            console.log('admin authenticated');
            res.status(200).send();
        }
        else {
            console.log('invalid admin credentials');
            res.status(401).send();
        }
    });
});

router.get('/requests', (req, res) => {
    server(req, res, (req, res) => {
        const data = app.readFile('teachers_requests.json');
        console.log('sending teacher requests');
        res.send(data);
    });

});

router.post('/respond', (req, res) => {
    server(req, res, (req, res) => {
        let data = app.readFile('teachers_requests.json');
        data['requests'] = data['requests'].filter((teacher) => {
            return teacher.username != req.body.teacher.username;
        });
        app.writeFile('teachers_requests.json', data);
        if (req.body.accept) {
            data = app.readFile('teachers.json');
            req.body.teacher.requests=[];
            data['teachers'][req.body.teacher.username] = req.body.teacher;
            app.writeFile('teachers.json', data);
            console.log('Added new teacher');
        }
        else {
            console.log('Declined request');
        }
        res.send();
    });
});

router.get('/teacher/list', (req, res) => {
    server(req, res, (req, res) => {
        res.send(app.readFile('teachers.json'));
    });
});

router.post('/teacher/remove', (req, res) => {
    server(req, res, (req, res) => {
        let data = app.readFile('teachers.json');
        if (data['teachers'][req.body.username]) {
            delete data['teachers'][req.body.username];
        }
        else {
            res.status(403);
        }
        app.writeFile('teachers.json', data);
        res.send();
        console.log('teacher deleted');
    });
});

router.post('/class/add', (req, res) => {
    server(req, res, (req, res) => {
        const path = `./data/classes/${req.body.class}.json`;
        fs.access(path, fs.constants.F_OK, (err) => {
            if (err) {
                fs.writeFileSync(path, JSON.stringify({"students":{},"attendance":{}}));
                console.log('new class added');
                res.send();
            }
            else {
                console.log('class already exist');
                res.status(403).send();
            }
        });
    });
});

router.post('/class/remove', (req, res) => {
    server(req, res, (req, res) => {
        const path = `./data/classes/${req.body.class}.json`;
        fs.unlink(path, (err) => {
            if (err) {
                console.log(err);
                res.status(403).send();
            } else {
                console.log('Class deleted successfully');
                res.send();
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

router.post('/student/remove', (req, res) => {
    server(req, res, (req, res) => {
        let data = app.readFile(`classes/${req.body.class}.json`);
        if (data['students'][req.body.username]) {
            delete data['students'][req.body.username];
        }
        else {
            res.status(403);
        }
        app.writeFile(`classes/${req.body.class}.json`, data);
        res.send();
        console.log('student deleted');
    });
});

router.post('/attendance', (req, res) => {
    server(req, res, (req, res) => {
        res.send(app.readFile(`classes/${req.body.class}.json`)["attendance"]);
        console.log('attendance returned');
    });
});

router.get('/timings', (req, res) => {
    server(req, res, (req, res) => {
        console.log('sending timings')
        res.send(app.readFile('timings.json'));
    });
});

router.post('/timings', (req, res) => {
    server(req, res, (req, res) => {
        console.log('updating timings')
        app.writeFile('timings.json', req.body);
        res.send();
    });
});

module.exports = router;