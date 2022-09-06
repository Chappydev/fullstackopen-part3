require('dotenv').config();
const { response } = require('express');
const express = require('express');
const app = express();
const Person = require('./models/person');
const morgan = require('morgan');
const cors = require('cors');

app.use(cors());
app.use(express.static('build'));
app.use(express.json());

morgan.token('body', (req, res) => req.body ? JSON.stringify(req.body) : '');
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));

const generateId = () => {
  return Math.floor(Math.random() * 1000000 + 1);
};

app.get('/info', (req, res) => {
  const timeOfRequest = new Date();
  const numberOfPeople = persons.length;

  res.send(`<p>Phonebook includes ${numberOfPeople} people</p><p>${timeOfRequest}</p>`);
});

app.get('/api/persons', (req, res, next) => {
  Person.find({})
    .then(persons => {
      res.json(persons);
    })
    .catch(err => next(err));
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

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then(result => {
      res.status(204).end();
    })
    .catch(err => next(err));
});

app.post('/api/persons', (req, res, next) => {
  const body = req.body;

  if (!body.name) {
    return res.status(400).json({
      error: 'Must include a name'
    });
  } else if (!body.number) {
    return res.status(400).json({
      error: 'Must include a number'
    });
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person.save()
    .then(savedPerson => {
      res.json(savedPerson);
    })
    .catch(err => next(err));
});

app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body;

  const person = {
    number: body.number,
  };

  Person.findByIdAndUpdate(req.params.id, person, { new: true })
    .then(updatedPerson => {
      res.json(updatedPerson);
    })
    .catch(err => next(err));
});

const errorHandler = (err, request, response, next) => {
  console.error(err.message)

  if (err.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } 

  next(err)
};

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});