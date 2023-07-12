import express, { Express, Request, Response } from 'express';
import { initRhino, processInputData } from '../controllers/RhinoCompute';
//import more required functions from ./controllers/ *
//and set up respective routes

const app: Express = express();
const port = 1989;


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
