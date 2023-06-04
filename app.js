const port = 8888;

const express = require('express');
const app = express();
const fs = require('fs');

const admin = require('./profiles/admin');
const teacher = require('./profiles/teacher');
const student = require('./profiles/student');

app.listen(port, () => { console.log(`Server started on port ${port}`); });
app.get('/', (req, res) => { res.send('TrackMate'); });
app.use(express.json());
app.use('/admin', admin);
app.use('/teacher', teacher);
app.use('/student', student);

module.exports.readFile = function (fname) {
    return JSON.parse(fs.readFileSync(`./data/${fname}`, 'utf-8'));
}
module.exports.writeFile = function (fname, data) {
    fs.writeFileSync(`./data/${fname}`, JSON.stringify(data));
}

function checkFiles() {
    if (fs.existsSync("./data")) {
        return;
    }
    fs.mkdirSync("./data");
    fs.mkdirSync("./data/classes");
    const files = [{ 'fname': "teachers.json", 'init': { 'teachers': { "tanya": { "username": "tanya", "name": "tanya", "password": "12345", "requests": [{ "username": "arun", "name": "arun", "password": "12345", "id": "00:23:fg:00:00:00", "class": "cse" }, { "username": "varun", "name": "varun", "password": "12345", "id": "ff:23:fg:00:00:00", "class": "cse" }] }, "sanya": { "username": "sanya", "name": "sanya", "password": "1234" } } } }, { 'fname': "teachers_requests.json", 'init': { 'requests': [{ "username": "ranya", "name": "ranya", "password": "12345" }] } }, { 'fname': "timings.json", 'init': { 'timings': [{ hr: 9, min: 0 }, { hr: 10, min: 0 }, { hr: 11, min: 0 }, { hr: 12, min: 0 }, { hr: 13, min: 0 }, { hr: 14, min: 0 }, { hr: 15, min: 0 }, { hr: 16, min: 0 }] } }];
    files.forEach((file) => {
        fs.access(`./data/${file['fname']}`, fs.constants.F_OK, (err) => {
            if (err) {
                fs.writeFile(`./data/${file['fname']}`, JSON.stringify(file['init']), (err) => { });
            }
        });
    });

    fs.writeFileSync("./data/classes/cse.json", JSON.stringify({ "students": { "warun": { "username": "warun", "name": "warun", "password": "12345", "id": "24:23:fg:00:00:00", "class": "cse" }, "parun": { "username": "parun", "name": "parun", "password": "12345", "id": "gg:23:fg:00:00:00", "class": "cse" } }, "attendance": { "warun": [0, 1, 1, 0, 0, 0], "parun": [1, 0, 0, 0, 0, 0] } }));

    fs.writeFileSync("./data/classes/ece.json", JSON.stringify({ "students": {}, "attendance": {} }));
}

function resetStatus() {
    console.log('resetting status');
    fs.readdirSync("./data/classes", (err, files) => {
        if (err) {
            console.log('Error reading classes');
        }
        else {
            files.forEach((file) => {
                const data = JSON.parse(fs.readFileSync(`./data/classes/${file}`, 'utf-8'));
                let newData = { "students": {} };
                for (const username in data['students']) {
                    let student = data['students'][username];
                    student.status = { 'auth': 0, 'Apps': 1 };
                    newData['students'][username] = student;
                }
                newData["attendance"] = data['attendance']
                fs.writeFileSync(`./data/classes/${file}`, JSON.stringify(newData));
            });
        }
    });

}

checkFiles();

const interval = setInterval(() => {
    console.log('checking timings');
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const data = JSON.parse(fs.readFileSync('./data/timings.json', 'utf-8'));
    const times = data['timings'];
    times.forEach((time) => {
        if (hours == time.hr && minutes == time.min) {
            resetStatus();
        }
    });
}, 1000 * 60);

