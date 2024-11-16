const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("Pump", (m) => {
  const apollo = m.contract("Rocket", ["Saturn V"]);

  m.call(apollo, "launch", []);

  return { apollo };
});