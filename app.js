const express = require('express')
const app = express()
app.use(express.json())
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const path = require('path')

const dbPath = path.join(__dirname, 'todoApplication.db')

let db = null

const initializaserver = () => {
  try {
    open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('server is running at http://localhost/3000')
    })
  } catch (e) {
    console.log(`DB Error :${e.message}`)
    process.exit(1)
  }
}
initializaserver()

const hasprorityandStatusPrority = requestQuery => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  )
}

const hasPriorityProperty = requestQuery => {
  return requestQuery.priority !== undefined
}

const hasStautsProperty = requestQuery => {
  return requestQuery.status !== undefined
}

app.get('/todos/', async (request, response) => {
  let data = null

  let getTodosQuery = ''

  const {search_q = '', priority, status} = request.query

  switch (true) {
    case hasprorityandStatusPrority(request.query):
      getTodosQuery = `
     SELECT
     * FROM 
     todo
     WHERE
     todo LIKE '%${search_q}%'
     AND status='${status}'
     AND priority='${priority}';`
      break

    case hasStautsProperty(request.query):
      getTodosQuery = `
    SELECT * FROM todo
    WHERE
    todo like '%${search_q}%',
    AND status='${status}';`

      break

    case hasPriorityProperty(request.query):
      getTodosQuery = `
    SELECT * FROM todo
    WHERE 
    todo like '%${search_q}%',
    AND prority='${priority}';`

    default:
      getTodosQuery = `SELECT * FROM todo
     WHERE todo LIKE '%${search_q}%';`
  }
  result = await db.all(getTodosQuery)
  response.send(result)
})

app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const getTodoIdsQuery = `
    SELECT * FROM todo
    WHERE
    id=${todoId};`
  const getTodoIdsArray = await db.get(getTodoIdsQuery)
  response.send(getTodoIdsArray)
})

app.post('/todos/', async (request, response) => {
  const {id, todo, priority, status} = request.body
  const postTodoQuery = `
  INSERT INTO todo(id,todo,priority,status)
  VALUES
  (${id},'${todo}','${priority}','${status}');

  `
  await db.run(postTodoQuery)
  response.send('Todo Successfully Added')
})

app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const updateCOLUMN = ''
  const requestBody = request.body
  switch (true) {
    case requestBody.status !== undefined:
      updateCOLUMN = 'Status'
      break
    case requestBody.priority !== undefined:
      updateCOLUMN = 'Priority'
      break
    case requestBody.todo !== undefined:
      updateCOLUMN = 'Todo'
      break
  }
  const updateQuery = `SELECT * FROM todo WHERE id=${todoId};`
  const previousTodo = await db.get(updateQuery)
  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
  } = request.body

  const updatetodoQuery = `SELECT * FROM todo where todo 
   ='${todo}',
   priority='${priority}',
   status='${status}'
   
   WHERE
   id='${todoId}';`
  await db.run(updatetodoQuery)
  response.send(`${updateCOLUMN} Updated`)
})

app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const deleteQuery = `DELETE FROM todo
  WHERE
  todo
  id='${todoId}';`
  await db.run(deleteQuery)
  response.send('Todo Deleted')
})

module.exports = app
