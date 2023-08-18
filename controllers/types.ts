// TODO add types and interfaces

export interface FormData {
    minArea: number;
    orientation: number;
    pRoad: number;
    sRoad: number;
    weights: number[];
}

export interface ProcessInputDataParams extends FormData {
    selectedArea: __esri.Polygon; // replace this with the correct selectedArea type
    selectedPoint1: __esri.Point; // replace this with the correct selectedPoint1 type
    selectedPoint2: __esri.Point; // replace this with the correct selectedPoint2 type
    definition: Uint8Array; // if this is needed also
}

interface InnerTreeChild {
    type: string;
    data: string;
}

interface InnerTreeData {
    [key: string]: InnerTreeChild[];
}

interface Value {
    ParamName: string;
    InnerTree: InnerTreeData;
}

export interface Res {
    absolutetolerance: number;
    angletolerance: number;
    modelunits: string;
    algo: string;
    pointer: string;
    recursionlevel: number;
    cachesolve: boolean;
    errors: string[];
    warnings: string[];
    values: Value[];
}

export interface DataColItem {
    id: number;
    program: string;
    graphic: any; // replace 'any' with the actual type if known
    coords: number[][]; // replace with the actual type if needed
    edgecat: number[]; // replace with the actual type if needed
    area: number;
    orientation: number;
    elongation: number;
    compactness: number;
    convexity: number;
}

export type EnvironmentVariables = {
    GH_FILE: string;
    COMPUTE_API_KEY: string;
    COMPUTE_URL: string;
    PORT: string;
    INSTANCE_IP: string;
  };