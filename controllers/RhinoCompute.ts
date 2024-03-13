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
  message?: string;
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
    return { isSuccess: true, data: response, message: 'success' }

  } catch (error: any) {
    console.log("Error from evaluateDefinition in RhinoCompute.ts")
    return { isSuccess: false, error: error.message, message: 'error' };
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
    return { isSuccess: false, error: 'Ensure the polygon and access points are selected', message: 'error' };
  }

  const trees: Array<any>[] = [];
  let weights

  // weights compile
  if (formData.weightContinuity){
    weights = [formData.weightContinuity, formData.weightSideNumber, formData.weightAngleVar, formData.weightLengthVar, formData.weightAccess, formData.weightEvenArea, formData.weightOrientation]
    console.log("This is weights in RhinoCompute.ts: ", weights)
  } else {
    weights = false
  }

  function includeInTree(tree: any, item: any, paramName: string){
    const param = new RhinoCompute.Grasshopper.DataTree(paramName);
    param.append([0], [item]);
    tree.push(param);
    console.log(paramName + " value: " + item)
  }

  includeInTree(trees, formData.selectedArea!.rings.toString(), "Coords")
  includeInTree(trees, formData.selectedPoint1!.x, "PointAX")
  includeInTree(trees, formData.selectedPoint1!.y, "PointAY")
  includeInTree(trees, formData.selectedPoint2!.x, "PointBX")
  includeInTree(trees, formData.selectedPoint2!.y, "PointBY")

  if (formData.minArea){ includeInTree(trees, formData.minArea, "MinArea") }
  if (formData.orientation){ includeInTree(trees, formData.orientation, "Orientation") }
  if (formData.minElongation){ includeInTree(trees, formData.minElongation, "MinElongation") }
  if (formData.pRoad){ includeInTree(trees, formData.pRoad / 100, "Roads") }
  if (formData.streamLine){ includeInTree(trees, formData.streamLine === 1 ? true : false, "Streamline") }
  if (formData.firstRoad){ includeInTree(trees, formData.firstRoad === 1 ? true : false, "FirstRoad") }
  if (formData.simplifyChoice){ includeInTree(trees, formData.simplifyChoice, "SimplifyChoice") }
  if (formData.allInitialEdgesAreRoad){ includeInTree(trees, formData.allInitialEdgesAreRoad === 1 ? true : false, "allIntialEdgesAreRoad") }
  if (formData.culDeSacDepth){ includeInTree(trees, formData.culDeSacDepth, "culdesacDepth") }
  if (formData.iPathOnly){ includeInTree(trees, formData.iPathOnly === 1 ? true : false, "IPathOnly") }
  if (formData.roadCat){ includeInTree(trees, formData.roadCat, "EdgeCat") }
  if (weights){ includeInTree(trees, weights.toString(), "Weights") }
  if (formData.lengthVSAngle){ includeInTree(trees, formData.lengthVSAngle, "LengthVSAngle") }
  if (formData.firstLineType){ includeInTree(trees, formData.firstLineType, "FirstLineType") }
  if (formData.vAnchorStrength){ includeInTree(trees, formData.vAnchorStrength === 0 ? 0 : Math.pow(10, formData.vAnchorStrength), "vAnchorStrength") }
  if (formData.vOnCrvStrength){ includeInTree(trees, formData.vOnCrvStrength === 0 ? 0 : Math.pow(10, formData.vOnCrvStrength), "vOnCrvStrength") }
  if (formData.pAnchorStrength){ includeInTree(trees, formData.pAnchorStrength === 0 ? 0 : Math.pow(10, formData.pAnchorStrength), "pAnchorStrength") }
  if (formData.roadSmoothStrength){ includeInTree(trees, formData.roadSmoothStrength === 0 ? 0 : Math.pow(10, formData.roadSmoothStrength), "roadSmoothStrength") }
  if (formData.roadJunctionAngleStrength){ includeInTree(trees, formData.roadJunctionAngleStrength === 0 ? 0 : Math.pow(10, formData.roadJunctionAngleStrength), "roadJunctionAngleStrength") }
  if (formData.parcelSideSmoothStrength){ includeInTree(trees, formData.parcelSideSmoothStrength === 0 ? 0 : Math.pow(10, formData.parcelSideSmoothStrength), "parcelSideSmoothStrength") }
  if (formData.parcelSideAngleStrength){ includeInTree(trees, formData.parcelSideAngleStrength === 0 ? 0 : Math.pow(10, formData.parcelSideAngleStrength), "parcelSideAngleStrength") }
  if (formData.parcelSideLengthStrength){ includeInTree(trees, formData.parcelSideLengthStrength === 0 ? 0 : Math.pow(10, formData.parcelSideLengthStrength), "parcelSideLengthStrength") }
  if (formData.parcelAdjacencyStrength){ includeInTree(trees, formData.parcelAdjacencyStrength === 0 ? 0 : Math.pow(10, formData.parcelAdjacencyStrength), "parcelAdjacencyStrength") }

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
    // console.error("Unable to get JSON response data from evaluateDefinition in RhinoCompute.ts")
    return { isSuccess: false, error: "Unable to get JSON response data from evaluateDefinition in RhinoCompute.ts" }
  }

  console.log("This is the json passing to processBackend: ", jsond)

  const processedData = processDataFromCompute(jsond);
  if (Object.keys(processedData.dataCol).length === 0) {
    return { isSuccess: false, error: "No data returned from processDataFromCompute", message: processedData.message }
  }
  return { isSuccess: true, data: processedData, message: processedData.message };
};