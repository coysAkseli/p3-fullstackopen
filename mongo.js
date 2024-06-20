/*const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]
const nameAdd = process.argv[3]
const numberAdd = process.argv[4]

const url =
  `mongodb+srv://akseli:${password}@cluster0.btrda8b.mongodb.net/phonebookApp?retryWrites=true&w=majority`

mongoose.set('strictQuery',false)
mongoose.connect(url)

const pbSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const PhonebookEntry = mongoose.model('PhonebookEntry', pbSchema)

if (process.argv.length === 3) {
    console.log('phonebook:')
    PhonebookEntry.find({}).then(result => {
        result.forEach(pbEntry => {
          console.log(`${pbEntry.name} ${pbEntry.number}`)
        })
        mongoose.connection.close()
      })
}
else {
    const pbEntry = new PhonebookEntry({
      name: nameAdd,
      number: numberAdd,
    })

    pbEntry.save().then(result => {
      console.log(`added ${nameAdd} number ${numberAdd} to phonebook`)
      mongoose.connection.close()
    })
}

*/