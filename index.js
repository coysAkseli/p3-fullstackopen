const express = require('express')
var morgan = require('morgan')

const app = express()
app.use(express.json())

app.use(express.static('dist'))

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

let dataToken = ''

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
    response.json(phonebook)
})

app.get('/api/phonebook/:id', (request, response) => {
    const id = Number(request.params.id)
    const pbEntry = phonebook.find(pbEntry => pbEntry.id === id)
    
    if (pbEntry) {
        response.json(pbEntry)
    }
    else {
        response.status(404).end()
    }
})

app.delete('/api/phonebook/:id', (request, response) => {
    const id = Number(request.params.id)
    phonebook = phonebook.filter(pbEntry => pbEntry.id !== id)

    response.status(204).end()
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

    const pbEntry = {
        name: body.name,
        number: body.number,
        id: Math.floor(Math.random()*1000000)
    }

    phonebook = phonebook.concat(pbEntry)
    response.json(pbEntry)
})


const PORT = process.env.port || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})