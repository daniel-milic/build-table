import express from 'express'
import cors from 'cors'
import { readFile } from 'fs/promises'
import { join } from 'path'

const app = express()
const PORT = 3001

app.use(cors({
  origin: 'http://localhost:5173'
}))

app.use(express.json())

app.get('/getUsers.json', async (req, res) => {
  try {
    const filePath = join(process.cwd(), 'public', 'getUsers.json')
    const data = await readFile(filePath, 'utf8')
    res.json(JSON.parse(data))
  } catch (err) {
    console.error('Error reading getUsers.json:', err)
    res.status(500).json({ error: 'Failed to load users data' })
  }
})

// Future endpoints (e.g., for DB filtering/pagination)
// app.get('/api/users', async (req, res) => { ... })

app.listen(PORT, () => {
  console.log(`Backend server ready at http://localhost:${PORT}/getUsers.json`)
})
