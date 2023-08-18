import express, { Express, Request, Response } from 'express';
import { processInputData } from '../controllers/RhinoCompute';
import { ProcessInputDataParams, EnvironmentVariables } from '../controllers/types';
import cors from 'cors';
import path from 'path';
import * as dotenv from 'dotenv';

//use dotenv
dotenv.config();
const env = process.env as EnvironmentVariables;

//import more required functions from ./controllers/ *
//and set up respective routes
const app: Express = express();
const port = parseInt(env.PORT, 10) || 1989;
const IP = process.env.INSTANCE_IP;
const ghFileName = process.env.GH_FILE || '../../public/ParcellationSmooth.gh'


// This will allow all CORS requests
app.use(cors());
app.options('*', cors());

// If you want to limit CORS to only your frontend application, you can do it like this:
// app.use(cors({
//   origin: 'http://localhost:3000' 
// }));
app.use(express.json({ limit: '50mb' })); // This is the built-in express middleware to parse JSON bodies
app.use(express.urlencoded({ limit: '50mb', extended: true })); // This is the built-in express middleware to parse URL-encoded bodies (e.g. for forms)
// needed to increase limit to allow this


app.listen(port, '0.0.0.0', () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port} and http://${IP}:${port}`);
});


app.get('/', (req: Request, res: Response) => {
  res.send('This is the express + typescript server running');
});

//try to run the initRhino from RhinoCompute.ts
// app.get('/rhino', (req: Request, res: Response) => {
//   // initRhino();
//   res.send('Initialised rhino');
// });

app.post('/processInputData', async (req: Request, res: Response) => {
  const formDataWithGeometry: ProcessInputDataParams = req.body; // get input data from request body
  console.log("Type of formDataWithGeometry at API: ", typeof (formDataWithGeometry))
  try {
    const result = await processInputData(formDataWithGeometry); // process the data
    console.log("Done sending data to processInputData in API index.ts")
    console.log("This is received result in index.ts: ", result)
    res.json(result); // send the result back to the client as JSON
    // console.log("This is result sending to userUtil --->", res)
  } catch (e) {
    console.error(e)
  }
})

app.get('/Parcellation', (req: Request, res: Response) => {
  let ghFilePath = path.resolve(__dirname, ghFileName);
  // let ghFilePath = '../public/Parcellation.gh';

  const options = {
    headers: {
      'x-timestamp': Date.now(),
      'x-sent': true
    }
  }
  res.sendFile(ghFilePath, options, (error) => {
    if (error !== undefined) {
      console.error(error);
      res.status(500).send('An error occured while trying to send the gh file')
    }
  })
});

app.use(express.static('public'));