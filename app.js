const port = 8888;

const express = require('express');
const app = express();
const fs = require('fs');

const admin = require('./profiles/admin');
const teacher = require('./profiles/teacher');
const student = require('./profiles/student');

app.listen(port, () => { console.log(`Server started on port ${port}`); });
app.get('/', (req, res) => { res.send('Connected to server...'); });
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
    const files = [{ 'fname': "teachers.json", 'init': { 'teachers': {} } }, { 'fname': "teachers_requests.json", 'init': { 'requests': [] } }, { 'fname': "timings.json", 'init': { 'all': [{ hr: 9, min: 0 }, { hr: 9, min: 0 }, { hr: 10, min: 0 }, { hr: 11, min: 0 }, { hr: 12, min: 0 }, { hr: 1, min: 0 }, { hr: 2, min: 0 }, { hr: 3, min: 0 }, { hr: 4, min: 0 }] } }];
    files.forEach((file) => {
        fs.access(`./data/${file['fname']}`, fs.constants.F_OK, (err) => {
            if (err) {
                fs.writeFile(`./data/${file['fname']}`, JSON.stringify(file['init']), (err) => { });
            }
        });
    });
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
                let newData = {};
                for (const username in data) {
                    let student = data[username];
                    student.status = { 'auth': 0, 'Apps': 0 };
                    newData[username] = student;
                }
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
    const times = data[now.getDay()] ? data[now.getDay()] : data['all'];
    times.forEach((time) => {
        if (hours == time.hr && minutes == time.min) {
            resetStatus();
        }
    });
}, 1000 * 60);

