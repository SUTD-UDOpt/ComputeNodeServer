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
exports.processInputData = void 0;
// import { ParcelOptimizerStore, ParcelOptimizerStoreInstance } from "../ParcelOptimizerStore";
const dotenv = __importStar(require("dotenv"));
const compute_rhino3d_1 = __importDefault(require("compute-rhino3d"));
const processBackend_1 = require("./processBackend");
const fs_1 = __importDefault(require("fs"));
const util_1 = __importDefault(require("util"));
//use dotenv
dotenv.config();
const env = process.env;
const rhinoUrl = "https://cdn.jsdelivr.net/npm/rhino3dm@0.15.0-beta/rhino3dm.module.js";
const computeUrl = process.env.COMPUTE_URL;
const COMPUTE_API_KEY = process.env.COMPUTE_API_KEY;
//http for the Parcellation.sh file to pass in evaluateDefinition
const fullURL = `http://${process.env.INSTANCE_IP}:1989/Parcellation`;
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
        console.log("Error from evaluateDefinition in RhinoCompute.ts");
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
    // mock inputs
    let mockRoadInput = [];
    let vertices = formData.selectedArea.rings.toString().split(",");
    for (let i = 0; i < vertices.length - 1; i++) {
        mockRoadInput.push(3);
    }
    // weights compile
    let weights = [formData.weightContinuity, formData.weightSideNumber, formData.weightAngleVar, formData.weightLengthVar, formData.weightAccess, formData.weightEvenArea, formData.weightOrientation];
    console.log("This is weights in RhinoCompute.ts: ", weights);
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
    param8.append([0], [formData.pRoad / 100]);
    const param9 = new compute_rhino3d_1.default.Grasshopper.DataTree("EdgeCat");
    param9.append([0], [mockRoadInput.toString()]);
    const param10 = new compute_rhino3d_1.default.Grasshopper.DataTree("Weights");
    param10.append([0], [weights.toString()]);
    const param11 = new compute_rhino3d_1.default.Grasshopper.DataTree("LengthVSAngle");
    param11.append([0], [formData.lengthVSAngle]);
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
    trees.push(param10);
    trees.push(param11);
    const response = yield evaluateDefinition(fullURL, trees);
    console.log("This is response.data --> ", response.data);
    if (!response.isSuccess) {
        return response;
    }
    // const jsond = await response.data.json();
    var jsond;
    try {
        jsond = yield response.data.json();
    }
    catch (error) {
        console.log("Unable to get JSON response data from evaluateDefinition in RhinoCompute.ts");
    }
    console.log("This is the json passing to processBackend: ", jsond);
    console.log("This is the jsond.values[0].InnerTree['{0}']", jsond.values[0].InnerTree['{0}']);
    console.log("This is the jsond.values[1].InnerTree['{1}']", jsond.values[1].InnerTree['{1}']);
    console.log("This is the jsond.values[2].InnerTree['{2}']s", jsond.values[2].InnerTree['{2}']);
    const processedData = (0, processBackend_1.processDataFromCompute)(jsond);
    if (Object.keys(processedData.dataCol).length === 0) {
        return { isSuccess: false, data: "" };
    }
    return { isSuccess: true, data: processedData };
});
exports.processInputData = processInputData;
