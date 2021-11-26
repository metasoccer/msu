require('dotenv').config();

async function main() {
  // We get the contract to deploy
  const [owner] = await ethers.getSigners();
  const MetaSoccer = await ethers.getContractFactory("MetaSoccerToken");
  const initialSupply = ethers.utils.parseEther('360000000')
  const metasoccer = await MetaSoccer.connect(owner).deploy(process.env.SAFE, initialSupply);

  console.log("MetaSoccer deployed to:", metasoccer.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
