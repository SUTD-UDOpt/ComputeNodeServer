// import { ParcelOptimizerStore, ParcelOptimizerStoreInstance } from "../ParcelOptimizerStore";
import * as dotenv from 'dotenv';
import RhinoCompute, * as compute from "compute-rhino3d";
import { processDataFromCompute } from "./processBackend";
import { ProcessInputDataParams, EnvironmentVariables } from "./types";
import fs from 'fs';
import path from 'path';
import util from 'util';
import { response } from "express";
import { Readable } from 'stream';


//use dotenv
dotenv.config();
const env = process.env as EnvironmentVariables;

const rhinoUrl =
  "https://cdn.jsdelivr.net/npm/rhino3dm@0.15.0-beta/rhino3dm.module.js";
const computeUrl = process.env.COMPUTE_URL;
const COMPUTE_API_KEY = process.env.COMPUTE_API_KEY

interface Result {
  isSuccess: boolean;
  data?: any;
  error?: string;
}

//http for the Parcellation.sh file to pass in evaluateDefinition
const fullURL = `http://${process.env.INSTANCE_IP}:1989/Parcellation`


// New helper function
const evaluateDefinition = async (definitionPath: any, trees: any): Promise<Result> => {
  try {

    const response = await RhinoCompute.Grasshopper.evaluateDefinition(definitionPath, trees, false);
    // console.log("This is response in evaluateDefinition in API --> ", response) 
    console.log("Definition: ", definitionPath)
    console.log("Tree: ", trees)
    return { isSuccess: true, data: response }

  } catch (error: any) {
    console.log("Error from evaluateDefinition in RhinoCompute.ts")
    return { isSuccess: false, error: error.message };
  }
}



export const processInputData = async (
  formData: ProcessInputDataParams
): Promise<Result> => {

  console.log("Received formData (formDataWithGeometry) in RhinoCompute.ts in API")
  const logFile = fs.createWriteStream('logformData.txt', { flags: 'w' });
  logFile.write(util.inspect(formData, { showHidden: false, depth: null }));


  // Check if inputs exist, if not return error
  if (!formData.selectedArea || !formData.selectedPoint1 || !formData.selectedPoint2) {
    return { isSuccess: false, error: 'Ensure the polygon and access points are selected' };
  }

  // mock inputs
  let mockRoadInput = []
  let vertices = formData.selectedArea!.rings.toString().split(",")
  for (let i = 0; i < vertices.length - 1; i++) {
    mockRoadInput.push(3)
  }

  // weights compile
  let weights = [formData.weightContinuity, formData.weightSideNumber, formData.weightAngleVar, formData.weightLengthVar, formData.weightAccess, formData.weightEvenArea, formData.weightOrientation]
  console.log("This is weights in RhinoCompute.ts: ", weights)

  const param1 = new RhinoCompute.Grasshopper.DataTree("Coords");
  param1.append([0], [formData.selectedArea!.rings.toString()]);
  const param2 = new RhinoCompute.Grasshopper.DataTree("PointAX");
  param2.append([0], [formData.selectedPoint1!.x]);
  const param3 = new RhinoCompute.Grasshopper.DataTree("PointAY");
  param3.append([0], [formData.selectedPoint1!.y]);
  const param4 = new RhinoCompute.Grasshopper.DataTree("PointBX");
  param4.append([0], [formData.selectedPoint2!.x]);
  const param5 = new RhinoCompute.Grasshopper.DataTree("PointBY");
  param5.append([0], [formData.selectedPoint2!.y]);
  const param6 = new RhinoCompute.Grasshopper.DataTree("MinArea");
  param6.append([0], [formData.minArea]);
  const param7 = new RhinoCompute.Grasshopper.DataTree("Orientation");
  param7.append([0], [formData.orientation]);
  const param8 = new RhinoCompute.Grasshopper.DataTree("Roads");
  param8.append([0], [formData.pRoad / 100]);
  const param9 = new RhinoCompute.Grasshopper.DataTree("EdgeCat");
  param9.append([0], [mockRoadInput.toString()]);
  const param10 = new RhinoCompute.Grasshopper.DataTree("Weights");
  param10.append([0], [weights.toString()]);
  const param11 = new RhinoCompute.Grasshopper.DataTree("LengthVSAngle");
  param11.append([0], [formData.lengthVSAngle]);

  const trees: Array<any>[] = [];
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


  const response = await evaluateDefinition(fullURL, trees);
  console.log("This is response.data --> ", response.data)


  if (!response.isSuccess) {
    return response;
  }


  // const jsond = await response.data.json();
  var jsond;
  try {
    jsond = await response.data.json();
  } catch (error: any) {
    console.error("Unable to get JSON response data from evaluateDefinition in RhinoCompute.ts")
  }

  console.log("This is the json passing to processBackend: ", jsond)
  console.log("This is the jsond.values[0].InnerTree['{0}']", jsond.values[0].InnerTree['{0}'])
  console.log("This is the jsond.values[1].InnerTree['{1}']", jsond.values[1].InnerTree['{1}'])
  console.log("This is the jsond.values[2].InnerTree['{2}']s", jsond.values[2].InnerTree['{2}'])

  const processedData = processDataFromCompute(jsond);
  if (Object.keys(processedData.dataCol).length === 0) {
    return { isSuccess: false, data: "" }
  }
  return { isSuccess: true, data: processedData };
};

