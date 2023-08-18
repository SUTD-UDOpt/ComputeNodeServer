"use strict";
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
exports.processInputData = exports.initRhino = void 0;
// import { ParcelOptimizerStore, ParcelOptimizerStoreInstance } from "../ParcelOptimizerStore";
const rhinoUrl = "https://cdn.jsdelivr.net/npm/rhino3dm@0.15.0-beta/rhino3dm.module.js";
const computeUrl = "http://18.141.240.61:80/";
const COMPUTE_API_KEY = "0hOfevzxs49OfbXDqyUx";
const compute_rhino3d_1 = __importDefault(require("compute-rhino3d"));
const processBackend_1 = require("./processBackend");
const fs_1 = __importDefault(require("fs"));
const util_1 = __importDefault(require("util"));
const definitionName = "../public/Parcellation.gh";
const initRhino = () => __awaiter(void 0, void 0, void 0, function* () {
    // assuming Rhino3dm and RhinoCompute are their default export from their respective modules
    const compute = compute_rhino3d_1.default;
    // set RhinoCompute server URL and API key
    compute.url = computeUrl;
    compute.apiKey = COMPUTE_API_KEY;
    // load a grasshopper file!
    const url = definitionName;
    const res = yield fetch(url);
    const buffer = yield res.arrayBuffer();
    const arr = new Uint8Array(buffer);
    return arr;
});
exports.initRhino = initRhino;
//http for the Parcellation.sh file to pass in evaluateDefinition
const fullURL = 'http://localhost:1989/Parcellation';
// New helper function
const evaluateDefinition = (definitionPath, trees) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield compute_rhino3d_1.default.Grasshopper.evaluateDefinition(definitionPath, trees, false);
        // console.log("This is response in evaluateDefinition in API --> ", response) 
        console.log("Definition: ", definitionPath);
        console.log("Tree: ", trees);
        return { isSuccess: true, data: response };
    }
    catch (error) {
        console.log("ERROR AAASDASDSA");
        return { isSuccess: false, error: error.message };
    }
});
const processInputData = (formData) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Received formData (formDataWithGeometry) in RhinoCompute.ts in API");
    const logFile = fs_1.default.createWriteStream('logformData.txt', { flags: 'w' });
    logFile.write(util_1.default.inspect(formData, { showHidden: false, depth: null }));
    // Check if inputs exist, if not return error
    if (!formData.selectedArea || !formData.selectedPoint1 || !formData.selectedPoint2) {
        return { isSuccess: false, error: 'Ensure the polygon and access points are selected' };
    }
    const pRoadPercentage = formData.pRoad / 100;
    const sRoadPercentage = formData.sRoad / 100;
    const roadPercentage = [
        pRoadPercentage,
        sRoadPercentage,
        1 - pRoadPercentage - sRoadPercentage,
    ];
    // mock inputs
    let mockRoadInput = [];
    let vertices = formData.selectedArea.rings.toString().split(",");
    for (let i = 0; i < vertices.length - 1; i++) {
        mockRoadInput.push(3);
    }
    const param1 = new compute_rhino3d_1.default.Grasshopper.DataTree("Coords");
    param1.append([0], [formData.selectedArea.rings.toString()]);
    const param2 = new compute_rhino3d_1.default.Grasshopper.DataTree("PointAX");
    param2.append([0], [formData.selectedPoint1.x]);
    const param3 = new compute_rhino3d_1.default.Grasshopper.DataTree("PointAY");
    param3.append([0], [formData.selectedPoint1.y]);
    const param4 = new compute_rhino3d_1.default.Grasshopper.DataTree("PointBX");
    param4.append([0], [formData.selectedPoint2.x]);
    const param5 = new compute_rhino3d_1.default.Grasshopper.DataTree("PointBY");
    param5.append([0], [formData.selectedPoint2.y]);
    const param6 = new compute_rhino3d_1.default.Grasshopper.DataTree("MinArea");
    param6.append([0], [formData.minArea]);
    const param7 = new compute_rhino3d_1.default.Grasshopper.DataTree("Orientation");
    param7.append([0], [formData.orientation]);
    const param8 = new compute_rhino3d_1.default.Grasshopper.DataTree("Roads");
    param8.append([0], roadPercentage);
    const param9 = new compute_rhino3d_1.default.Grasshopper.DataTree("EdgeCat");
    param9.append([0], [mockRoadInput.toString()]);
    const trees = [];
    trees.push(param1);
    trees.push(param2);
    trees.push(param3);
    trees.push(param4);
    trees.push(param5);
    trees.push(param6);
    trees.push(param7);
    trees.push(param8);
    trees.push(param9);
    // const u8aDefinition = new Uint8Array(Object.values(formData.definition));
    const response = yield evaluateDefinition(fullURL, trees);
    // console.log(u8aDefinition)
    // console.log("This is the response after evaluateDefinition: ---> ", response)
    if (!response.isSuccess) {
        return response;
    }
    console.log("This is response.data --> ", response.data);
    const processedData = (0, processBackend_1.processDataFromCompute)(response.data);
    if (Object.keys(processedData.dataCol).length === 0) {
        return { isSuccess: false, data: "" };
    }
    return { isSuccess: true, data: processedData };
});
exports.processInputData = processInputData;
