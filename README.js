# Intersection submitted by Michael Hogue
The index.html file includes lanes.js, where all of the code executes.  

Initially, the highway namespace is created, and within the namespace are a number of wide-scope variables.  This decision was somewhat arbitrary, since the potential uses and requirements for this application are somewhat unknown.  The decision to use HTML5 data storage, or to string all variables as parameters could have been used as well.  

Every second the application runs a chain of promises.  While promises are more commonly used to handle sequential asynchronous functions that rely on the data returned from each previous function, promise chains also seemed appropriate for this application because there was a set order in which operations needed to operate.  Of course, the application could have just as well been written without the use of promises, because of the wide scope of the state variables.

The directional units of travel in a unified direction were defined as intercardinal lanes.  The lanes are positioned at a 45 degree angle from the x,y coordinate system.  In retrospect this was a mistake, because calculating the various boundaries and plots ended up taking a bit more careful consideration.  As instructed I spent a bit more than 4 hours on this project, but think that I probably would have been able to produce a more complete application had I made the decision to use lanes that parallelled the x and y axes.

Randomization was used to select the direction of travel, the lane, type of vehicle, speed or travel, and so forth...  Once the options are decided, the correct starting position is calculated, and the vehicle is stored as part of the highway object.  The vehicle begins traveling along the center of the lane of travel at the corresponding speed.

I had initially hoped to program the stop lights based on sensors.  However, I ended up using a strict timer system because I ran out of time to complete the work.  I also didn't complete the portion of the code necessary to make the vehicle stop if there is another vehicle in front of it, or if the light is red.  It is regretful that this portion of the assignment was not completed, since this was a very important feature for the project.  It is also regretful that I wasn't able, in the time allotted, to complete the other great features that I was planning to implement.

For best results, load the html file with referenced JS in a browser and view the console for messages.  For me, the output looks correct with no error messages.  However, I did not test rigorously and admittedly didn't spend enough time on error handling.  

Thanks for reading!

Michael
