import * as _ from 'lodash'
import contract from 'truffle-contract'
import config from '../config'

/**
 * Contract wrapper
 */
class ContractWrapper {
  /**
   * Constructor contract wrapper
   * @param web3Wrapper instance
   */
  constructor(web3Wrapper, storeProvider) {
    this._Web3Wrapper = web3Wrapper
    this._StoreProvider = storeProvider
  }

  /**
   * Instantiate contract.
   * DEPRECATED use instead of _deployAsync()
   * @param   artifact
   * @param   address    The hex encoded contract Ethereum address
   * @return  truffle-contract object | Error
   */
  _instantiateContractIfExistsAsync = async (artifact, address) => {
    const c = await contract(artifact)

    const providerObj = await this._Web3Wrapper.getProvider()

    await c.setProvider(providerObj)

    try {
      const contractInstance = _.isUndefined(address)
                              ? await c.deployed()
                              : await c.at(address)

      return contractInstance
    } catch (err) {
      const errMsg = `${err}`

      if (_.includes(errMsg, 'not been deployed to detected network')) {
        throw new Error('ContractDoesNotExist')
      } else {
        throw new Error('UnhandledError')
      }
    }
  }

  /**
   * Deploy contract.
   * @param   account
   * @param   value
   * @param   json artifact of the contract
   * @param   rest arguments
   * @return  truffle-contract Object | err The contract object or an error
   */
  _deployAsync = async (account, value, artifact, ...args) => {
    if (_.isEmpty(account)) {
      account = this._Web3Wrapper.getAccount(0)
    }

    const MyContract = contract({
      abi: artifact.abi,
      unlinked_binary: artifact.unlinked_binary,
    })

    const provider = await this._Web3Wrapper.getProvider()
    MyContract.setProvider(provider)
    try {
      let contractDeployed = await MyContract.new(
        ...args,
        {
          from: account,
          value: value,
          gas: config.GAS,
        }
      )
      return contractDeployed
    } catch (e) {
      throw new Error(e)
    }
  }
}

export default ContractWrapper
