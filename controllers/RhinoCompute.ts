// import { ParcelOptimizerStore, ParcelOptimizerStoreInstance } from "../ParcelOptimizerStore";

// import rhino3dm from "rhino3dm";
// import { ToasterStoreInstance } from "Toaster";
// import { FormData, ProcessInputDataParams } from "../types";
import RhinoCompute, * as compute from "compute-rhino3d";
import { processDataFromCompute } from "./processBackend";
import { ProcessInputDataParams } from "./types";

const definitionName = "./gh/Parcellation.gh";
const rhinoUrl =
  "https://cdn.jsdelivr.net/npm/rhino3dm@0.15.0-beta/rhino3dm.module.js";
const computeUrl = "http://18.143.175.3:80/";
const COMPUTE_API_KEY = "0hOfevzxs49OfbXDqyUx";

interface Result {
  isSuccess: boolean;
  data?: any;
  error?: string;
}

export const initRhino = async (): Promise<Uint8Array> => {
  // assuming Rhino3dm and RhinoCompute are their default export from their respective modules
  const compute = RhinoCompute;

  // set RhinoCompute server URL and API key
  compute.url = computeUrl;
  compute.apiKey = COMPUTE_API_KEY;

  // load a grasshopper file!
  const url = definitionName;
  const res = await fetch(url);
  const buffer = await res.arrayBuffer();
  const arr = new Uint8Array(buffer);
  return arr;
}
// New helper function
const evaluateDefinition = async (definition: Uint8Array, trees: any): Promise<Result> => {
  try {
    const response = await RhinoCompute.Grasshopper.evaluateDefinition(definition, trees);
    return { isSuccess: true, data: response }
  } catch (error: any) {
    return { isSuccess: false, error: error.message };
  }
}

export const processInputData = async (
  formData: ProcessInputDataParams
): Promise<Result> => {
  console.log("data to be sent to rhino: ", formData);

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
  let mockRoadInput = []
  let vertices = formData.selectedArea!.rings.toString().split(",")
  for (let i = 0; i < vertices.length - 1; i++) {
    mockRoadInput.push(3)
  }

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
  param8.append([0], roadPercentage);
  const param9 = new RhinoCompute.Grasshopper.DataTree("EdgeCat");
  param9.append([0], [mockRoadInput.toString()]);

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

  const response = await evaluateDefinition(formData.definition, trees);
  if (!response.isSuccess) {
    return response;
  }

  const processedData = processDataFromCompute(response.data);
  return { isSuccess: true, data: processedData };

}