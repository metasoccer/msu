const hre = require('hardhat');
require('dotenv').config();

async function main() {
  const [owner] = await ethers.getSigners();
  console.log(`Mint from ${owner.address} to ${process.env.MATIC_SAFE})`);
  const MetaSoccer = await ethers.getContractFactory("MetaSoccerToken");
  const metasoccer = MetaSoccer.attach(process.env.MATIC_MSU);
  const supply  = ethers.utils.parseUnits('360000000.0', 18);
  await metasoccer.connect(owner).mint(process.env.MATIC_SAFE,supply);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
