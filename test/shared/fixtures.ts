import { Wallet, Contract } from 'ethers'
import { Web3Provider } from 'ethers/providers'
import { deployContract } from 'ethereum-waffle'

import { expandTo18Decimals } from './utilities'

import SwapdexFactory from 'swapdex-core/build/contracts/SwapdexFactory.json'
import ISwapdexPair from 'swapdex-core/build/contracts/ISwapdexPair.json'

import ERC20 from '../../build/contracts/ERC20.json'
import WETH9 from '../../build/contracts/WETH9.json'
import SwapdexRouter from '../../build/contracts/SwapdexRouter.json'
import RouterEventEmitter from '../../build/contracts/RouterEventEmitter.json'

const overrides = {
  gasLimit: 9999999
}

interface SwapdexFixture {
  token0: Contract
  token1: Contract
  WETH: Contract
  WETHPartner: Contract
  swapdexFeactory: Contract
  routerEventEmitter: Contract
  router: Contract
  pair: Contract
  WETHPair: Contract
}

export async function swapdexFixture(provider: Web3Provider, [wallet]: Wallet[]): Promise<SwapdexFixture> {
  // deploy tokens
  const tokenA = await deployContract(wallet, ERC20, [expandTo18Decimals(10000)])
  const tokenB = await deployContract(wallet, ERC20, [expandTo18Decimals(10000)])
  const WETH = await deployContract(wallet, WETH9)
  const WETHPartner = await deployContract(wallet, ERC20, [expandTo18Decimals(10000)])

  // deploy SwapdexFactory
  const swapdexFeactory = await deployContract(wallet, SwapdexFactory, [wallet.address])

  // deploy router
  const router = await deployContract(wallet, SwapdexRouter, [swapdexFeactory.address, WETH.address], overrides)

  // event emitter for testing
  const routerEventEmitter = await deployContract(wallet, RouterEventEmitter, [])

  // initialize SwapdexFactory
  await swapdexFeactory.createPair(tokenA.address, tokenB.address)
  const pairAddress = await swapdexFeactory.getPair(tokenA.address, tokenB.address)
  const pair = new Contract(pairAddress, JSON.stringify(ISwapdexPair.abi), provider).connect(wallet)

  const token0Address = await pair.token0()
  const token0 = tokenA.address === token0Address ? tokenA : tokenB
  const token1 = tokenA.address === token0Address ? tokenB : tokenA

  await swapdexFeactory.createPair(WETH.address, WETHPartner.address)
  const WETHPairAddress = await swapdexFeactory.getPair(WETH.address, WETHPartner.address)
  const WETHPair = new Contract(WETHPairAddress, JSON.stringify(ISwapdexPair.abi), provider).connect(wallet)

  return {
    token0,
    token1,
    WETH,
    WETHPartner,
    swapdexFeactory,
    router,
    routerEventEmitter,
    pair,
    WETHPair
  }
}
