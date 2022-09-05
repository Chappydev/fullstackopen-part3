const mongoose = require('mongoose');

if (process.argv.length < 3) {
  console.log('Please include the password as an argument: node mongo.js <password>');
  process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://Chappy_fullstack:${password}@cluster0.vjwn9pb.mongodb.net/phonebookApp?retryWrites=true&w=majority`;

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model('Person', personSchema);

if (process.argv.length === 3) {
  mongoose
    .connect(url)
    .then(res => {
      return Person.find({});
    })
    .then(persons => {
      console.log('phonebook:');
      persons.forEach(person => {
        console.log(person.name, person.number);
      });

      mongoose.connection.close();
    })
    .catch(err => console.log(err));
} else {
  mongoose
  .connect(url)
  .then(res => {
    const person = new Person({
      name: process.argv[3],
      number: process.argv[4],
    })

    return person.save();
  })
  .then(() =>  {
    console.log(`added ${process.argv[3]} number ${process.argv[4]} to phonebook`);
    return mongoose.connection.close();
  })
  .catch(err => console.log(err));
}