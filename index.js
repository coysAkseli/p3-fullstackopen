const password = process.argv[2]
const nameAdd = process.argv[3]
const numberAdd = process.argv[4]

const url =
  `mongodb+srv://akseli:${password}@cluster0.btrda8b.mongodb.net/phonebookApp?retryWrites=true&w=majority`
  
require('dotenv').config()
const express = require('express')
var morgan = require('morgan')
const app = express()

const PhonebookEntry = require('./models/phonebookentry')

//


app.use(express.static('dist'))
app.use(express.json())


const cors = require('cors')
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

let phonebook = [
    {
        id: 1,
        name: 'Walter White',
        number: '1234567890'
    },
    {
        id: 2,
        name: 'Hank Schrader',
        number: '095328021'
    },
    {
        id: 3,
        name: 'Saul Goodman',
        number: '5750932820'
    },
    {
        id: 4,
        name: 'Jesse Pinkman',
        number: '493280101'
    }
]

const lengthPhonebook = phonebook.length

app.get('/', (request, response) => {
    response.send('<h1>Hello World</h1>')
})

app.get('/info', (request, response) => {
    response.send(`<p>Phonebook has info for ${lengthPhonebook} people</p><p>${new Date()}</p>`)
})

app.get('/api/phonebook', (request, response) => {
    PhonebookEntry.find({}).then(phonebook => {
        response.json(phonebook)
    })
})

app.get('/api/phonebook/:id', (request, response, next) => {
    PhonebookEntry.findById(request.params.id)
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
    PhonebookEntry.findByIdAndDelete(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

const nameAlreadyExists = (name) => {
    return phonebook.some(pbEntry => pbEntry.name === name)
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

    const pbEntry = new PhonebookEntry({
        name: body.name,
        number: body.number,
        id: Math.floor(Math.random()*1000000)
    })

    pbEntry.save().then(savedPbEntry => {
        response.json(pbEntry)
    })
})

app.put('/api/phonebook/:id', (request, response, next) => {
    const body = request.body

    const pbEntry = {
        name: body.name,
        number: body.number,
    }

    PhonebookEntry.findByIdAndUpdate(request.params.id, pbEntry)
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

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})