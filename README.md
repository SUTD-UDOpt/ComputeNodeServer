# ePlannerAPI


### Get the project running (for both debugging and production)
**1.** Clone from [the repo](https://github.com/SUTD-UDOpt/ComputeNodeServer )  <br/>
**2.** Run `npm install`   <br/>
**3.** In the source code of the compute.rhino3d package *(node_modules/compute-rhino3d/compute.rhino3d.js)* , enter the rhinocompute credentials. 
<img src="img/compute.rhino3d.png" alt="module" style="display: block; margin: left;" />   <br/>

**4.** From the frontend *(src/Tools/ParcelOptimizer/utils/userFlowUtils.ts)* make sure it is calling to the correct IP to the API.  
<img src="img/userUtil.png" alt="module" style="display: block; margin: left;" />   <br/>


<br/>

### Running the project for debugging
**5.** Now cd into the ComputeNodeServer directory, do `npx tsc` to compile the project. Need to repeat this everytime you make changes to the project.   <br/>
**6.** Do `node dist/src/` to run the API   <br/>

<br/>

### Running the project for production
**We will be using PM2 for production hosting.**    <br/>
**5. a.** If this is the first time running on this aws instance \
cd into the ComputeNodeServer directory, run the script file with `./start.sh`. Follow the instruction prompted in the terminal if any.   <br/>

**5. b.** If the instance is already running in production \
After making any changes to the code (git pull etc) run this script file `./reload.sh`   <br/>

**6.** To check if the app is running, do  `pm2 list`. 
<img src="img/pm2.png" alt="module" style="display: block; margin: left;" />   <br/>

   


### Health check
- Do `pm2 list` to see if it is running, if not, do `pm2 start dist/src/ --name ePlannerAPI`