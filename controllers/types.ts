// TODO add types and interfaces

export interface FormData {
    minArea: number;
    orientation: number;
    minElongation: number,
    pRoad: number,
    streamLine: number,
    firstRoad: number,
    simplifyChoice: number,
    lengthVSAngle: number,
    firstLineType: number | null,
    allInitialEdgesAreRoad: number | null,
    iPathOnly: number | null,
    weightContinuity: number,
    weightSideNumber: number,
    weightAngleVar: number,
    weightLengthVar: number,
    weightAccess: number,
    weightEvenArea: number,
    weightOrientation: number,
    vAnchorStrength: number | null,
    vOnCrvStrength: number | null,
    pAnchorStrength: number | null,
    roadSmoothStrength: number | null,
    roadJunctionAngleStrength: number | null,
    parcelSideSmoothStrength: number | null,
    parcelSideAngleStrength: number | null,
    parcelSideLengthStrength: number | null,
    parcelAdjacencyStrength: number | null
}

export interface ProcessInputDataParams extends FormData {
    selectedArea: __esri.Polygon; // replace this with the correct selectedArea type
    selectedPoint1: __esri.Point; // replace this with the correct selectedPoint1 type
    selectedPoint2: __esri.Point; // replace this with the correct selectedPoint2 type
    roadCat: string; // a series of road category
    // definition: Uint8Array; // if this is needed also
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
