// import { ParcelOptimizerStoreInstance } from "./ParcelOptimizerStore";

import { Res, DataColItem } from "./types";

export const processDataFromCompute = (res: Res): {
    dataCol: { [key: number]: DataColItem; };
    averageValues: { [key: string]: number };
    message: string;
    centerlines?: string[];
} => {
    // Initialize variables
    let dataCol: { [key: number]: DataColItem } = {};
    let averageValues: { [key: string]: number } = {};

    // Categorise returned values
    const parcelJSON = res.values.find(item => item.ParamName === 'RH_OUT:ParcelGenerationJSON');
    const centerlineJSON = res.values.find(item => item.ParamName === 'RH_OUT:CenterLines');
    const messageJSON = res.values.find(item => item.ParamName === 'RH_OUT:Messages');

    console.log("This is RH_OUT:ParcelGenerationJSON", parcelJSON)

    // Helper function for average values
    const assignAverageValues = (res: any, keys: string[]) => {
        const averages: { [key: string]: number } = {};
        keys.forEach((key, index) => {
            averages[key] = truncate(JSON.parse(parcelJSON!.InnerTree['{2}'][index].data));
        });
        return averages;
    }


    // console.log("This is res.values[2].InnerTree[0] in processBackend: ", res.values[2].InnerTree['{0}'])
    // console.log("This is res.values[2].InnerTree[1] in processBackend: ", res.values[2].InnerTree['{1}'])
    // console.log("This is res.values[2].InnerTree[2] in processBackend: ", parcelJSON!.InnerTree['{2}'])


    if (!res.values[1]) {
        const message = "error"
        console.error("No data returned from backend");
        return { dataCol, averageValues, message };
    }

    // console.log("This is JSON,parse -->: ", JSON.parse(res.values[2].InnerTree['{0}'][0].data))
    console.log("test: " + parcelJSON!.InnerTree['{0}'])
    const data = JSON.parse(JSON.parse(parcelJSON!.InnerTree['{0}'][0].data))
    const centerlinesList = centerlineJSON!.InnerTree['{0;0}']
    let centerlines: string[] = []
    centerlinesList.forEach(e => {
        centerlines.push(JSON.parse(e.data))
    })

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

    let message = ""
    for (let i=0; i<6; i++){
        message = message + messageJSON!.InnerTree['{0}'][i].data
    }
    
    return { dataCol, averageValues, centerlines, message };
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
