"use strict";
// import { ParcelOptimizerStoreInstance } from "./ParcelOptimizerStore";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processDataFromCompute = void 0;
const processDataFromCompute = (res) => {
    var _a, _b;
    // Initialize variables
    let dataCol = {};
    let averageValues = {};
    // Helper function for average values
    const assignAverageValues = (res, keys) => {
        const averages = {};
        keys.forEach((key, index) => {
            averages[key] = truncate(JSON.parse(res.values[3].InnerTree['{2}'][index].data));
        });
        return averages;
    };
    console.log("This is res.value in processBackend: ", res.values);
    console.log("This is res.value[3] in processBackend: ", res.values[3]);
    if (!((_b = (_a = res.values[3]) === null || _a === void 0 ? void 0 : _a.InnerTree) === null || _b === void 0 ? void 0 : _b.length)) {
        console.error("No data returned from backend");
        return { dataCol, averageValues };
    }
    const data = JSON.parse(JSON.parse(res.values[3].InnerTree['{0}'][0].data));
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
        };
    });
    const averageKeys = ['averageParcelArea', 'averageOrientation', 'averageElongation', 'averageCompactness', 'averageConvexity'];
    averageValues = assignAverageValues(res, averageKeys);
    return { dataCol, averageValues };
};
exports.processDataFromCompute = processDataFromCompute;
// // TODO Anna: add in create polygon function 
// export const addParcelsToParcelLayer = (dataCol: { [key: number]: DataColItem }) => {
//     const parsedGraphics: __esri.Collection<__esri.Graphic> | __esri.Graphic[] = []
//     // add graphics here with the attributes
//     // for (let i = 0; i < dataCol.length; i++) {
//     // probably need to import the parcel layer here from MobX store
//     // ParcelOptimizerStoreInstance.parcelLayer.source.addMany(parsedGraphics)
// }
// DATA RELATED FUNCTIONS
function truncate(num) {
    return Math.round(num * 1000) / 1000;
}
