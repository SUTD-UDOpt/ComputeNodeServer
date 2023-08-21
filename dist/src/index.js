"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const RhinoCompute_1 = require("../controllers/RhinoCompute");
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const dotenv = __importStar(require("dotenv"));
//use dotenv
dotenv.config();
const env = process.env;
//import more required functions from ./controllers/ *
//and set up respective routes
const app = (0, express_1.default)();
const port = parseInt(env.PORT, 10) || 1989;
const IP = process.env.INSTANCE_IP;
const ghFileName = process.env.GH_FILE || '../../public/ParcellationSmooth.gh';
// This will allow all CORS requests
app.use((0, cors_1.default)());
app.options('*', (0, cors_1.default)());
// If you want to limit CORS to only your frontend application, you can do it like this:
// app.use(cors({
//   origin: 'http://localhost:3000' 
// }));
app.use(express_1.default.json({ limit: '50mb' })); // This is the built-in express middleware to parse JSON bodies
app.use(express_1.default.urlencoded({ limit: '50mb', extended: true })); // This is the built-in express middleware to parse URL-encoded bodies (e.g. for forms)
// needed to increase limit to allow this
app.listen(port, '0.0.0.0', () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port} and http://${IP}:${port}`);
});
app.get('/', (req, res) => {
    res.send('This is the express + typescript server running');
});
//try to run the initRhino from RhinoCompute.ts
// app.get('/rhino', (req: Request, res: Response) => {
//   // initRhino();
//   res.send('Initialised rhino');
// });
app.post('/processInputData', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const formDataWithGeometry = req.body; // get input data from request body
    console.log("Type of formDataWithGeometry at API: ", typeof (formDataWithGeometry));
    try {
        const result = yield (0, RhinoCompute_1.processInputData)(formDataWithGeometry); // process the data
        console.log("Done sending data to processInputData in API index.ts");
        console.log("This is received result in index.ts: ", result);
        res.json(result); // send the result back to the client as JSON
        // console.log("This is result sending to userUtil --->", res)
    }
    catch (e) {
        console.error(e);
    }
}));
app.get('/Parcellation', (req, res) => {
    let ghFilePath = path_1.default.resolve(__dirname, ghFileName);
    // let ghFilePath = '../public/Parcellation.gh';
    const options = {
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    };
    res.sendFile(ghFilePath, options, (error) => {
        if (error !== undefined) {
            console.error(error);
            res.status(500).send('An error occured while trying to send the gh file');
        }
    });
});
app.use(express_1.default.static('public'));
