mkdir contracts/.flattened
npx truffle-flattener contracts/SwapdexRouter.sol > contracts/.flattened/SwapdexRouter.sol
npx truffle-flattener contracts/libraries/SwapdexLibrary.sol > contracts/.flattened/SwapdexLibrary.sol
npx truffle-flattener contracts/libraries/SwapdexOracleLibrary.sol > contracts/.flattened/SwapdexOracleLibrary.sol
