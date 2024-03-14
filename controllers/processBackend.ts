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
        const rawData = JSON.parse(JSON.parse(parcelJSON!.InnerTree['{2}'][0].data))
        let result: {[key: number]: {}} = {}
        Object.keys(rawData).forEach((item) => {
            const workingAvg = rawData[item]
            const averages: { [key: string]: number } = {};
            keys.forEach((key, index) => {
                averages[key] = truncate(workingAvg[index]);
            });
            result[parseInt(item)] = averages;
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
        const rawData = data[item]
        console.log("iten: " + item)
        Object.keys(rawData).forEach((key) => {
            const workingData = JSON.parse(rawData)
            console.log("it is: " + workingData)
            dataCol[parseInt(key)] = {
                "id": parseInt(key),
                "program": "none",
                "graphic": null,
                "coords": workingData[key]["ParcelCoordinates"],
                "edgecat": workingData[key]["EdgeCategory"],
                "area": truncate(workingData[key]["Area"]),
                "orientation": truncate(workingData[key]["Scores"][0]),
                "elongation": truncate(workingData[key]["Scores"][1]),
                "compactness": truncate(workingData[key]["Scores"][2]),
                "convexity": truncate(workingData[key]["Scores"][3])
            }
        })
        multipleDataCol[parseInt(item)] = dataCol
    });

    const averageKeys = ['averageParcelArea', 'averageOrientation', 'averageElongation', 'averageCompactness', 'averageConvexity'];
    multipleAverageValues = assignAverageValues(res, averageKeys);

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
