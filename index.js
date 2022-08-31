const { response } = require('express');
const express = require('express');
const app = express();
const morgan = require('morgan');

app.use(express.json());

morgan.token('body', (req, res) => req.body ? JSON.stringify(req.body) : '');
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));

let persons = [
  { 
    "id": 1,
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": 2,
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": 3,
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": 4,
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
];

const generateId = () => {
  return Math.floor(Math.random() * 1000000 + 1);
};

app.get('/info', (req, res) => {
  const timeOfRequest = new Date();
  const numberOfPeople = persons.length;

  res.send(`<p>Phonebook includes ${numberOfPeople} people</p><p>${timeOfRequest}</p>`);
});

app.get('/api/persons', (req, res) => {
  res.json(persons);
});

app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id);
  const person = persons.find(person => person.id === id);

  if (person) {
    res.json(person);
  } else {
    res.status(404).end();
  }
});

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id);
  persons = persons.filter(person => person.id !== id);

  res.status(204).end();
});

app.post('/api/persons', (req, res) => {
  const body = req.body;

  if (!body.name) {
    return res.status(400).json({
      error: 'Must include a name'
    });
  } else if (!body.number) {
    return res.status(400).json({
      error: 'Must include a number'
    });
  } else if (persons.some(person => person.name === body.name)) {
    return res.status(400).json({
      error: 'Name must be unique'
    });
  }

  const person = {
    id: generateId(),
    name: body.name,
    number: body.number
  };

  persons = persons.concat(person);

  res.json(person);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});