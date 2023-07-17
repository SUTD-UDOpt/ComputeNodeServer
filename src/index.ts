import express, { Express, Request, Response } from 'express';
import { initRhino, processInputData } from '../controllers/RhinoCompute';
import { ProcessInputDataParams } from '../controllers/types';
import cors from 'cors';
//import more required functions from ./controllers/ *
//and set up respective routes

const app: Express = express();
const port = 1989;

app.use(cors()); // This will allow all CORS requests

// If you want to limit CORS to only your frontend application, you can do it like this:

// app.use(cors({
//   origin: 'http://localhost:3000' 
// }));
app.use(express.json({ limit: '50mb' })); // This is the built-in express middleware to parse JSON bodies
app.use(express.urlencoded({ limit: '50mb', extended: true })); // This is the built-in express middleware to parse URL-encoded bodies (e.g. for forms)
// needed to increase limit to allow this

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});


app.get('/', (req: Request, res: Response) => {
  res.send('This is the express + typescript server running');
});

//try to run the initRhino from RhinoCompute.ts
app.get('/rhino', (req: Request, res: Response) => {
  initRhino();
  res.send('Initialised rhino');
});

app.post('/processInputData', async (req: Request, res: Response) => {
  const inputData: ProcessInputDataParams = req.body; // get input data from request body
  const result = await processInputData(inputData); // process the data
  res.json(result); // send the result back to the client as JSON
})

app.use(express.static('public'));