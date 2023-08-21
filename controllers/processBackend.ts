// import { ParcelOptimizerStoreInstance } from "./ParcelOptimizerStore";

import { Res, DataColItem } from "./types";

export const processDataFromCompute = (res: Res): {
    dataCol: { [key: number]: DataColItem; };
    averageValues: { [key: string]: number };
} => {
    // Initialize variables
    let dataCol: { [key: number]: DataColItem } = {};
    let averageValues: { [key: string]: number } = {};

    // Helper function for average values
    const assignAverageValues = (res: any, keys: string[]) => {
        const averages: { [key: string]: number } = {};
        keys.forEach((key, index) => {
            averages[key] = truncate(JSON.parse(res.values[3].InnerTree['{2}'][index].data));
        });
        return averages;
    }

    console.log("This is res.value in processBackend: ", res.values)
    console.log("This is res.value[3] in processBackend: ", res.values[3])

    if (!res.values[3]?.InnerTree?.length) {
        console.error("No data returned from backend");
        return { dataCol, averageValues };
    }

    const data = JSON.parse(JSON.parse(res.values[3].InnerTree['{0}'][0].data))
    Object.keys(data).forEach((key, i) => {
        dataCol[i] = {
            "id": i,
            "program": "none",
            "graphic": null,
            "coords": data[key]["ParcelCoordinates"],
            "edgecat": data[key]["EdgeCategory"],
            "area": truncate(data[key]["Area"]),
            "orientation": truncate(data[key]["Scores"][0]),
            "elongation": truncate(data[key]["Scores"][1]),
            "compactness": truncate(data[key]["Scores"][2]),
            "convexity": truncate(data[key]["Scores"][3])
        }
    });

    const averageKeys = ['averageParcelArea', 'averageOrientation', 'averageElongation', 'averageCompactness', 'averageConvexity'];
    averageValues = assignAverageValues(res, averageKeys);

    return { dataCol, averageValues };
}
// // TODO Anna: add in create polygon function 
// export const addParcelsToParcelLayer = (dataCol: { [key: number]: DataColItem }) => {
//     const parsedGraphics: __esri.Collection<__esri.Graphic> | __esri.Graphic[] = []

//     // add graphics here with the attributes
//     // for (let i = 0; i < dataCol.length; i++) {

//     // probably need to import the parcel layer here from MobX store
//     // ParcelOptimizerStoreInstance.parcelLayer.source.addMany(parsedGraphics)
// }
// DATA RELATED FUNCTIONS
function truncate(num: number) {
    return Math.round(num * 1000) / 1000
}