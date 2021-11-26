const { expect } = require("chai");
const { expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const  decimalPlaces = 18;

describe("MetaSoccerToken.sol", () => {
  let minter, wallet1, wallet2, wallet3;
  before(async  () => {
    const wallets = await ethers.getSigners();
    this.admin = wallets[0];
    this.minter = wallets[1];
    this.pauser = wallets[2];
    this.treasury = wallets[3];
    this.alice = wallets[4];
    this.bob = wallets[5];
  });

  describe('Setting up the environment', () => {
    it("Should deploy an ERC20", async () => {
      const Contract = await ethers.getContractFactory('MetaSoccerToken');

      // Deploy NFT Contract and assign minter as MIMNTER_ROLE.
  	const initialSupply = ethers.utils.parseEther('360000000');
      this.erc20 = await Contract.connect(this.admin).deploy(this.treasury.address, initialSupply)
        .then(f => f.deployed());
      expect(await this.erc20.name()).to.equal('MetaSoccer Universe');
      expect(await this.erc20.symbol()).to.equal('MSU');
      expect(await this.erc20.decimals()).to.equal(18);
      expect(await this.erc20.MINTER_ROLE())
        .to.equal('0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6');
      expect(await this.erc20.PAUSER_ROLE())
        .to.equal('0x65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a');
  	expect(await this.erc20.totalSupply()).to.equal(initialSupply);
    })
  });


  describe('Test minting', () => {
    it("Should Set a valid minter", async () => {
      const MINTER_ROLE = await this.erc20.MINTER_ROLE()
      const tx = await this.erc20.connect(this.admin)
        .grantRole(MINTER_ROLE, this.minter.address)
      await tx.wait();
    })

    it("Should mint 1M tokens", async () => {
      let supply = ethers.utils.parseEther('1000000');
      let tx = await this.erc20.connect(this.minter)
	    .mint(this.treasury.address, supply);
      const res = await this.erc20.balanceOf(this.treasury.address);
      supply = ethers.utils.parseEther('361000000');
      expect(res).to.equal(supply);
    })

    it("Mint more tokens should fail => invalid access", async () => {
	  const supply = ethers.utils.parseEther('1000000');
      await expect( this.erc20.connect(this.treasury).mint(this.treasury.address, supply))
        .to.be.revertedWith('MetaSoccerToken: must have minter role to mint');
    })
  });

  describe('Test pauser', () => {
    it("Should Set a valid pauser", async () => {
      const PAUSER_ROLE = await this.erc20.PAUSER_ROLE()
      const tx = await this.erc20.connect(this.admin)
        .grantRole(PAUSER_ROLE, this.pauser.address)
      await tx.wait();
    })

    it("Should fail to pause the contract", async () => {
      await expect( this.erc20.connect(this.minter).pause())
        .to.be.revertedWith('MetaSoccerToken: must have pauser role to pause');
    })

    it("Mint pause the contract", async () => {
      await this.erc20.connect(this.pauser).pause();
	  expect(await this.erc20.paused()).to.equal(true);
    })

    it("Should fail to transfer tokens when paused", async () => {
	  const amount = ethers.utils.parseEther('100');
      await expect( this.erc20.connect(this.treasury).transfer(this.alice.address, amount))
        .to.be.revertedWith('ERC20Pausable: token transfer while paused');
    })

    it("Should transfer tokens when unpaused", async () => {
	  const amount = ethers.utils.parseEther('100');
      await this.erc20.connect(this.pauser).unpause();
      await this.erc20.connect(this.treasury).transfer(this.alice.address, amount);
      let res = await this.erc20.balanceOf(this.treasury.address);
      supply = ethers.utils.parseEther('360999900');
      res = await this.erc20.balanceOf(this.alice.address);
      supply = ethers.utils.parseEther('100');
      expect(res).to.equal(supply);
    })
  });

  describe('Test burner', () => {
    it('Should burn tokens', async () => {
	  const amount = ethers.utils.parseEther('50');
      await this.erc20.connect(this.alice).burn(amount);
      const res = await this.erc20.balanceOf(this.alice.address);
      expect(res).to.equal(amount);
    });
  });

  describe('Change roles', () => {
	it('Change minter', async () => {
      const role = await this.erc20.MINTER_ROLE();
	  await this.erc20.connect(this.admin).grantRole(role, this.alice.address);
	  await this.erc20.connect(this.admin).revokeRole(role, this.minter.address);
	  const supply = ethers.utils.parseEther('1000000');

      await expect( this.erc20.connect(this.minter).mint(this.minter.address, supply))
        .to.be.revertedWith('MetaSoccerToken: must have minter role to mint');

      await expect(this.erc20.connect(this.alice).mint(this.alice.address, supply))
        .to.emit(this.erc20, 'Transfer')
        .withArgs(ethers.constants.AddressZero, this.alice.address, supply)

	});

	it('Change pauser', async () => {
      const role = await this.erc20.PAUSER_ROLE();
	  await this.erc20.connect(this.admin).grantRole(role, this.alice.address);
	  await this.erc20.connect(this.admin).revokeRole(role, this.pauser.address);

      await expect( this.erc20.connect(this.pauser).pause())
        .to.be.revertedWith('MetaSoccerToken: must have pauser role to pause');
      await this.erc20.connect(this.alice).pause();
	  expect(await this.erc20.paused()).to.be.true;
      await this.erc20.connect(this.alice).unpause();
	  expect(await this.erc20.paused()).to.be.false;
	});

	it('Change admin', async () => {
      const role = await this.erc20.DEFAULT_ADMIN_ROLE();
	  await this.erc20.connect(this.admin).grantRole(role, this.alice.address);
	  await this.erc20.connect(this.admin).revokeRole(role, this.admin.address);

      await expect( this.erc20.connect(this.admin).grantRole(role, this.alice.address))
        .to.be.revertedWith('AccessControl: account 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266 is missing role 0x0000000000000000000000000000000000000000000000000000000000000000');
	  await this.erc20.connect(this.alice).grantRole(role, this.admin.address);
	  await this.erc20.connect(this.admin).revokeRole(role, this.alice.address);
      await expect( this.erc20.connect(this.alice).grantRole(role, this.alice.address))
        .to.be.revertedWith('AccessControl: account 0x15d34aaf54267db7d7c367839aaf71a00a2c6a65 is missing role 0x0000000000000000000000000000000000000000000000000000000000000000');
	});

  });

});
