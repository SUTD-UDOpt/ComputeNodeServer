// import { ParcelOptimizerStoreInstance } from "./ParcelOptimizerStore";

import { Res, DataColItem, MultipleDataColItem, MultipleAverageValues } from "./types";

export const processDataFromCompute = (res: Res): {
    multipleDataCol: MultipleDataColItem;
    multipleAverageValues: MultipleAverageValues;
    message: string;
    centerlines?: string[];
} => {
    // Initialize variables
    let multipleDataCol: MultipleDataColItem = {};
    let multipleAverageValues: MultipleAverageValues = {};

    // Categorise returned values
    const parcelJSON = res.values.find(item => item.ParamName === 'RH_OUT:ParcelGenerationJSON');
    const centerlineJSON = res.values.find(item => item.ParamName === 'RH_OUT:CenterLines');
    const messageJSON = res.values.find(item => item.ParamName === 'RH_OUT:Messages');

    //console.log("This is RH_OUT:ParcelGenerationJSON", JSON.parse(parcelJSON!.InnerTree['{0}'][0].data))

    // Helper function for average values
    const assignAverageValues = (res: any, keys: string[]) => {
        const rawData = JSON.parse(parcelJSON!.InnerTree['{2}'][0].data)
        console.log("RawAVG: " + rawData)
        let result: {[key: number]: {}} = {}
        Object.keys(rawData).forEach((item, j) => {
            const averages: { [key: string]: number } = {};
            keys.forEach((key, index) => {
                averages[key] = truncate(JSON.parse(item[index]));
            });
            result[j] = averages;
        })
        return result
    }


    // console.log("This is res.values[2].InnerTree[0] in processBackend: ", res.values[2].InnerTree['{0}'])
    // console.log("This is res.values[2].InnerTree[1] in processBackend: ", res.values[2].InnerTree['{1}'])
    // console.log("This is res.values[2].InnerTree[2] in processBackend: ", parcelJSON!.InnerTree['{2}'])


    if (!res.values[1]) {
        const message = "error"
        console.error("No data returned from backend");
        return { multipleDataCol, multipleAverageValues, message };
    }
    
    const data = JSON.parse(JSON.parse(parcelJSON!.InnerTree['{0}'][0].data))
    const centerlinesList = centerlineJSON!.InnerTree['{0;0}']
    
    let centerlines: string[] = []
    centerlinesList.forEach(e => {
        centerlines.push(JSON.parse(e.data))
    })
    
    Object.keys(data).forEach((item) => {
        let dataCol: { [key: number]: DataColItem } = {};
        Object.keys(item).forEach((key) => {
            console.log("This is it: " + data[item][key])
            dataCol[parseInt(key)] = {
                "id": parseInt(key),
                "program": "none",
                "graphic": null,
                "coords": data[item][key]["ParcelCoordinates"],
                "edgecat": data[item][key]["EdgeCategory"],
                "area": truncate(data[item][key]["Area"]),
                "orientation": truncate(data[item][key]["Scores"][0]),
                "elongation": truncate(data[item][key]["Scores"][1]),
                "compactness": truncate(data[item][key]["Scores"][2]),
                "convexity": truncate(data[item][key]["Scores"][3])
            }
        })
        multipleDataCol[parseInt(item)] = dataCol
    });
    console.log("multiPArcel: " + multipleDataCol)

    const averageKeys = ['averageParcelArea', 'averageOrientation', 'averageElongation', 'averageCompactness', 'averageConvexity'];
    multipleAverageValues = assignAverageValues(res, averageKeys);
    console.log("MultiAVG: " + multipleAverageValues)

    let message = ""
    for (let i=0; i<messageJSON!.InnerTree['{0}'].length; i++){
        message = message + messageJSON!.InnerTree['{0}'][i].data
    }
    
    return { multipleDataCol, multipleAverageValues, centerlines, message };
}

// DATA RELATED FUNCTIONS
function truncate(num: number) {
    return Math.round(num * 1000) / 1000
}
