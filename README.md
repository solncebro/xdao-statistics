Install:
1. Suitable for Yarn, if npm - run "generate-types" command
2. After installed packages, check the types has been generated

Launch:
clear && yarn nodemon src/index.ts [chainId] [reportType] [limit]

Example:
clear && yarn nodemon src/index.ts 137 daosDetails 1500
This command collect DAOs details of 1500 DAOs on Polygon chain and save it to "report" folder

clear && yarn nodemon src/index.ts 56 daosDetails
This command collect DAOs details of all DAOs on BSC chain and save it to "report" folder

clear && yarn nodemon src/index.ts 56 daosAums
This command collect DAOs aums of all DAOs on BSC chain and save it to "report" folder

You can provide your-self array with DAO addresses for get statistic.
Make "daosAddressesList" in index.ts not undefined and provide DAOs addresses array.
If "daosAddressesList" defined - limit argument(third arguments in application launch command) will ignored.