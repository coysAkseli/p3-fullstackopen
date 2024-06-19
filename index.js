//const password = process.argv[2]
//const nameAdd = process.argv[3]
//const numberAdd = process.argv[4]

/*const url =
  `mongodb+srv://akseli:${password}@cluster0.btrda8b.mongodb.net/phonebookApp?retryWrites=true&w=majority`
 */

require('dotenv').config()
const express = require('express')
var morgan = require('morgan')
const cors = require('cors')


const Person = require('./models/person')

//
const app = express()


app.use(express.static('dist'))
app.use(express.json())
app.use(cors())

morgan.token('dataToken', (req, res) => JSON.stringify(req.body || {}))

app.use(morgan((tokens, req, res) => {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    tokens.dataToken(req, res)
].join(' ')
}))

app.get('/', (request, response) => {
    response.send('<h1>Hello World</h1>')
})

app.get('/info', (request, response) => {
    response.send(`<p>Phonebook has info for ${lengthPhonebook} people</p><p>${new Date()}</p>`)
})

app.get('/api/phonebook', (request, response) => {
    Person.find({})
    .then(phonebook => {
        console.log('fetched entries', phonebook)
        response.json(phonebook)
    })
    .catch(error => response.status(500).send({ error: 'Failed to fetch phonebook entries' }));
})

app.get('/api/phonebook/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(pbEntry => {
            if (pbEntry) {
                response.json(pbEntry)
            }
            else {
                response.status(404).end()
            }
    })
    .catch(error => next(error)
        //console.log(error)
        //response.status(400).send({ error: 'malformatted id' })
    )
})

app.delete('/api/phonebook/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

const nameAlreadyExists = (name) => {
    return false
    /*phonebook.some(pbEntry => pbEntry.name === name)*/
}

app.post('/api/phonebook', (request, response) => {
    const body = request.body

    if (!body.name) {
        return response.status(400).json({
            error: 'name missing'
        })
    }

    if (!body.number) {
        return response.status(400).json({
            error: 'number missing'
        })
    }

    if (nameAlreadyExists(body.name)) {
        return response.status(400).json({
            error: 'name already exists'
        })
    }

    const person = new Person({
        name: body.name,
        number: body.number,
        //id: Math.floor(Math.random()*1000000)
    })

    person.save().then(result => {
        console.log('saved ', person.name)
        response.json(person)
    })
    .catch(error => next(error))
})

app.put('/api/phonebook/:id', (request, response, next) => {
    const { name, number } = request.body

/*    const pbEntry = {
        name: body.name,
        number: body.number,
    }*/

    Person.findByIdAndUpdate(
        request.params.id, 
        { name, number }, 
        { new: true, runValidators: true, context: 'query' }
    )
        .then(updatedPbEntry => {
            response.json(updatedPbEntry)
        })
        .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
    console.log(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    }
    else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})