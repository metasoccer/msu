const ethers = require('ethers');
/*
 * Connect
 */
const connect = async () => {
  const provider = new ethers.providers.JsonRpcProvider(process.env.URL);
  let relayer = new ethers.Wallet(process.env.SEED);
  relayer = relayer.connect(provider);
  return relayer;
}

/*
 * Returns the signature of the call
 */
const getSignature = async (wallet, chainId, verifyingContract, nonce, from, to, tokenId) => {
  const signature = await wallet._signTypedData({
    name: 'TokenHolder',
    version: '1.0.0',
    chainId: chainId,
    verifyingContract
  }, {
    NFT: [
      { name: 'nonce', type: 'uint256' },
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
    ]
   }, {nonce, from, to, tokenId});
  return signature;
}

module.exports = {connect, getSignature}
