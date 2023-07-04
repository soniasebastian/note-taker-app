
const express = require('express');
const path = require('path');
const fs = require('fs');
const uuid = require('./helpers/uuid');
const PORT = process.env.PORT || 3001;
const app = express();


//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));



app.get('/notes', (req, res) =>
    res.sendFile(path.join(__dirname, '/public/notes.html'))
);

app.get('/', (req, res) =>
    res.sendFile(path.join(__dirname, '/public/index.html'))
);

function readNotes() {
    const data = fs.readFileSync("./db/db.json", "utf-8");
    console.log(data)
    return JSON.parse(data);
}

function writeNotes(notes) {
    fs.writeFileSync('./db/db.json', JSON.stringify(notes, null, 4),
        (writeErr) => writeErr
            ? console.error(writeErr)
            : console.info('Successfully updated notes!')

    );
}


//Get route to retrieve all saved notes
app.get('/api/notes', (req, res) => {
    const parsedData = readNotes();
    console.log(parsedData)
    console.info(`${req.method} request received to get all saved notes `);
    return res.status(200).json(parsedData);

});


//post route to add a new note
app.post('/api/notes', (req, res) => {
    console.info(`${req.method} request received to add a new note`);
    const { title, text } = req.body;
    console.info(`${title} ${text} `);

    if (title && text) {
        const newNote = {
            title,
            text,
            id: uuid()
        };


        const currentNotes = readNotes();
        currentNotes.push(newNote);
        const successfulWrite = writeNotes(currentNotes);

        if (successfulWrite) {
            const response = {
                status: 'success',
                body: newNote,
            };

            console.log(response);
            return res.status(201).json(response);
        } else {
            return res.status(500).json('Error in posting notes');
        }
    }
});


//DELETE route to delete note
app.delete('/api/notes/:id', (req, res) => {
    const noteID = req.params.id;
    const currentNotes = readNotes();
    const newNotesArray = currentNotes.filter(note => note.id !== noteID);
    const successfulWrite = writeNotes(newNotesArray);

    if (successfulWrite) {
        return res.json('Note deleted successfully');
    } else {
        return res.json('Error in deleting note')
    }
});


app.listen(PORT, () =>
    console.log(`App listening at http://localhost:${PORT} 🚀`)
);

