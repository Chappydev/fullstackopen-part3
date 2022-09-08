require('dotenv').config();
const express = require('express');
const app = express();
const Person = require('./models/person');
const morgan = require('morgan');
const cors = require('cors');

app.use(cors());
app.use(express.static('build'));
app.use(express.json());

morgan.token('body', (request) => request.body ? JSON.stringify(request.body) : '');
app.use(morgan(':method :url :status :response[content-length] - :response-time ms :body'));

app.get('/info', (request, response, next) => {
  const timeOfRequest = new Date();
  console.log(Person.countDocuments);
  Person.countDocuments()
    .then(result => {
      response.send(`<p>Phonebook includes ${result} people</p><p>${timeOfRequest}</p>`);
    })
    .catch(err => next(err));
});

app.get('/api/persons', (request, response, next) => {
  Person.find({})
    .then(persons => {
      response.json(persons);
    })
    .catch(err => next(err));
});

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch(err => next(err));
});

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end();
    })
    .catch(err => next(err));
});

app.post('/api/persons', (request, response, next) => {
  const body = request.body;


  if (!body.name) {
    return response.status(400).json({
      error: 'Must include a name'
    });
  } else if (!body.number) {
    return response.status(400).json({
      error: 'Must include a number'
    });
  }

  Person.find({ name: body.name })
    .then(result => {
      if (result.length > 0) {
        return response.status(400).json({
          error: `The name ${body.name} already exists in the database`
        });
      }

      const person = new Person({
        name: body.name,
        number: body.number,
      });

      person.save()
        .then(savedPerson => {
          response.json(savedPerson);
        })
        .catch(err => next(err));
    })
    .catch(err => next(err));
});

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body;

  const person = {
    number: body.number,
  };

  Person.findByIdAndUpdate(
    request.params.id,
    person,
    { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => {
      response.json(updatedPerson);
    })
    .catch(err => next(err));
});

const errorHandler = (err, request, response, next) => {
  console.error(err.message);

  if (err.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  } else if (err.name === 'ValidationError') {
    return response.status(400).json({ error: err.message });
  }

  next(err);
};

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});