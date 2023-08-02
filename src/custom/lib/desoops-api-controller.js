// This library provide a set of functions that can be used to interact with the DeSo blockchain.
import {
  getNFTCollectionSummary,
  getNFTEntriesForPost,
  getHodlersForUser,
  getFollowersForUser,
  getSingleProfile,
  sendDeso,
  transferDeSoToken,
  transferCreatorCoin,
  getProfiles
} from 'deso-protocol'
import BigNumber from 'bignumber.js'
import Axios from 'agilite-utils/axios'
import Enums from './enums'
import { desoUserModel } from './data-models'
import { cleanString, hexToInt } from './utils'

const BASE_URL = 'https://mw2okjv87a.execute-api.us-east-1.amazonaws.com/prod/api/v0'
const METHOD_DEFAULT = 'POST'
const route = '/get-single-profile'

/**
 * Uses the User's public key to fetch their Profile data from the DeSo blockchain.
 *
 * @param {string} publicKey - The public key of the DeSo User.
 * @returns {Promise} A promise that resolves the user's data as JSON, or rejects when an error occurs.
 */
export const getDeSoUser = async (publicKey = '') => {
  try {
    const config = {
      method: METHOD_DEFAULT,
      url: `${BASE_URL}${route}`,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'desoops'
      },
      data: {
        PublicKeyBase58Check: publicKey
      }
    }

    const response = await Axios.request(config)
    console.log('getDeSoUser', response.data)
    return response.data
  } catch (e) {
    throw new Error(e)
  }
}

/**
 * Uses the User's public key to generate a URL to their profile picture.
 *
 * @param {string} publicKey - The public key of the DeSo User.
 * @returns {Promise} A promise that resolves the profile picture URL, or rejects when an error occurs.
 */
export const generateProfilePicUrl = async (publicKey = '') => {
  const result = `https://blockproducer.deso.org/api/v0/get-single-profile-picture/${publicKey}`
  return result
}

/**
 * Uses the User's public key to fetch all DeSo Users who own the User's DAO Tokens. The DAO Balance is also calculated and returned.
 *
 * @param {string} publicKey - The public key of the DeSo User.
 * @returns {Promise} A promise that resolves an object that contains an array of DAO Hodlers and the DAO Balance, or rejects when an error occurs.
 */
export const getDAOHodlersAndBalance = (publicKey) => {
  return new Promise((resolve, reject) => {
    ;(async () => {
      let data = null
      let newEntry = null
      let daoHodlers = []
      let daoBalance = 0
      let tokenBalance = 0

      try {
        data = await getHodlersForUser({
          FetchAll: true,
          FetchHodlings: false,
          IsDAOCoin: true,
          PublicKeyBase58Check: publicKey
        })

        for (const entry of data.Hodlers) {
          // Skip if no ProfileEntryResponse
          if (!entry.ProfileEntryResponse) continue

          tokenBalance = entry.BalanceNanosUint256
          tokenBalance = hexToInt(tokenBalance)
          tokenBalance = tokenBalance / Enums.values.NANO_VALUE / Enums.values.NANO_VALUE
          tokenBalance = Math.floor(tokenBalance * 10000) / 10000

          // Don't add current user to hodlers list, but rather fetch and format their balance
          if (entry.ProfileEntryResponse.PublicKeyBase58Check !== publicKey) {
            newEntry = desoUserModel()

            newEntry.publicKey = entry.ProfileEntryResponse.PublicKeyBase58Check
            newEntry.username = entry.ProfileEntryResponse.Username
            newEntry.profilePicUrl = await generateProfilePicUrl(newEntry.publicKey)
            newEntry.tokenBalance = tokenBalance

            daoHodlers.push(newEntry)
          } else {
            daoBalance = tokenBalance
          }
        }

        resolve({ daoHodlers, daoBalance })
      } catch (e) {
        reject(e)
      }
    })()
  })
}

/**
 * Uses the User's public key to fetch all DeSo Users who the User owns DAO Tokens for.
 *
 * @param {string} publicKey - The public key of the DeSo User.
 * @returns {Promise} A promise that resolves an array of DeSo Users, or rejects when an error occurs.
 */
export const getDAOHodlings = (publicKey) => {
  return new Promise((resolve, reject) => {
    ;(async () => {
      let data = null
      let newEntry = null
      let daoHodlings = []
      let tokenBalance = 0

      try {
        data = await getHodlersForUser({
          FetchAll: true,
          FetchHodlings: true,
          IsDAOCoin: true,
          PublicKeyBase58Check: publicKey
        })

        for (const entry of data.Hodlers) {
          // Skip if no ProfileEntryResponse
          if (!entry.ProfileEntryResponse) continue

          tokenBalance = entry.BalanceNanosUint256
          tokenBalance = hexToInt(tokenBalance)
          tokenBalance = tokenBalance / Enums.values.NANO_VALUE / Enums.values.NANO_VALUE
          tokenBalance = Math.floor(tokenBalance * 10000) / 10000

          newEntry = desoUserModel()

          newEntry.publicKey = entry.ProfileEntryResponse.PublicKeyBase58Check
          newEntry.username = entry.ProfileEntryResponse.Username
          newEntry.profilePicUrl = await generateProfilePicUrl(newEntry.publicKey)
          newEntry.tokenBalance = tokenBalance

          daoHodlings.push(newEntry)
        }

        resolve(daoHodlings)
      } catch (e) {
        reject(e)
      }
    })()
  })
}

/**
 * Uses the User's public key to fetch all DeSo Users who own the User's Creator Coins. The Creator Coin Balance is also calculated and returned.
 *
 * @param {string} publicKey - The public key of the DeSo User.
 * @returns {Promise} A promise that resolves an object that contains an array of Creator Coin Hodlers and the Creator Coin Balance, or rejects when an error occurs.
 */
export const getCCHodlersAndBalance = (publicKey) => {
  return new Promise((resolve, reject) => {
    ;(async () => {
      let data = null
      let newEntry = null
      let ccHodlers = []
      let ccBalance = 0
      let tokenBalance = 0

      try {
        data = await getHodlersForUser({
          FetchAll: true,
          FetchHodlings: false,
          IsDAOCoin: false,
          PublicKeyBase58Check: publicKey
        })

        for (const entry of data.Hodlers) {
          // Skip if no ProfileEntryResponse
          if (!entry.ProfileEntryResponse) continue

          tokenBalance = entry.BalanceNanos / Enums.values.NANO_VALUE
          tokenBalance = Math.floor(tokenBalance * 10000) / 10000

          // Don't add current user to hodlers list, but rather fetch and format their balance
          if (entry.ProfileEntryResponse.PublicKeyBase58Check !== publicKey) {
            newEntry = desoUserModel()

            newEntry.publicKey = entry.ProfileEntryResponse.PublicKeyBase58Check
            newEntry.username = entry.ProfileEntryResponse.Username
            newEntry.profilePicUrl = await generateProfilePicUrl(newEntry.publicKey)
            newEntry.tokenBalance = tokenBalance

            ccHodlers.push(newEntry)
          } else {
            ccBalance = tokenBalance
          }
        }

        resolve({ ccHodlers, ccBalance })
      } catch (e) {
        reject(e)
      }
    })()
  })
}

/**
 * Uses the User's public key to fetch all DeSo Users who the User owns Creator Coins for.
 *
 * @param {string} publicKey - The public key of the DeSo User.
 * @returns {Promise} A promise that resolves an array of DeSo Users, or rejects when an error occurs.
 */
export const getCCHodlings = (publicKey) => {
  return new Promise((resolve, reject) => {
    ;(async () => {
      let data = null
      let newEntry = null
      let ccHodlings = []
      let tokenBalance = 0

      try {
        data = await getHodlersForUser({
          FetchAll: true,
          FetchHodlings: true,
          IsDAOCoin: false,
          PublicKeyBase58Check: publicKey
        })

        for (const entry of data.Hodlers) {
          // Skip if no ProfileEntryResponse
          if (!entry.ProfileEntryResponse) continue

          tokenBalance = entry.BalanceNanos / Enums.values.NANO_VALUE
          tokenBalance = Math.floor(tokenBalance * 10000) / 10000

          newEntry = desoUserModel()

          newEntry.publicKey = entry.ProfileEntryResponse?.PublicKeyBase58Check ?? ''
          newEntry.username = entry.ProfileEntryResponse.Username
          newEntry.profilePicUrl = await generateProfilePicUrl(newEntry.publicKey)
          newEntry.tokenBalance = tokenBalance

          ccHodlings.push(newEntry)
        }

        resolve(ccHodlings)
      } catch (e) {
        reject(e)
      }
    })()
  })
}

/**
 * Uses the User's public key to either fetch the total count of DeSo Users who follow the User, or the total count of the DeSo Users who the User follows.
 *
 * @param {string} publicKey - The public key of the DeSo User.
 * @param {string} followType - The type of follow to fetch. Either 'followers' or 'following'.
 *
 * @returns {Promise} A promise that resolves the total count of followers or following, or rejects when an error occurs.
 */
export const getTotalFollowersOrFollowing = (publicKey, followType) => {
  return new Promise((resolve, reject) => {
    ;(async () => {
      let userData = null
      let errMsg = null
      let params = null

      try {
        params = {
          PublicKeyBase58Check: publicKey,
          GetEntriesFollowingUsername: followType === Enums.values.FOLLOWERS
        }

        // First get # of followers
        userData = await getFollowersForUser(params)
        resolve(userData.NumFollowers)
      } catch (e) {
        if (e.response?.data?.message) {
          errMsg = e.response.data.message
        } else {
          errMsg = Enums.messages.UNKNOWN_ERROR
        }

        console.error(e)
        reject(errMsg)
      }
    })()
  })
}

/**
 * Uses the User's public key to either fetch the usernames of all DeSo Users who follow the User, or all DeSo Users who the User follows.
 *
 * @param {string} publicKey - The public key of the DeSo User.
 * @param {string} followType - The type of follow to fetch. Either 'followers' or 'following'.
 * @param {number} numberToFetch - The number of followers or following to fetch.
 *
 * @returns {Promise} A promise that resolves an array of DeSo Usernames, or rejects when an error occurs.
 */
export const getFollowersOrFollowing = (publicKey, followType, numberToFetch) => {
  return new Promise((resolve, reject) => {
    ;(async () => {
      const result = []
      let userData = null
      let errMsg = null
      let params = null
      let user = null

      try {
        params = {
          PublicKeyBase58Check: publicKey,
          GetEntriesFollowingUsername: followType === Enums.values.FOLLOWERS,
          NumToFetch: numberToFetch
        }

        userData = await getFollowersForUser(params)

        for (const item of Object.keys(userData.PublicKeyToProfileEntry)) {
          user = { ...userData.PublicKeyToProfileEntry[item] }
          result.push(user.Username)
        }

        resolve(result)
      } catch (e) {
        if (e.response?.data?.message) {
          errMsg = e.response.data.message
        } else {
          errMsg = Enums.messages.UNKNOWN_ERROR
        }

        console.error(e)
        reject(errMsg)
      }
    })()
  })
}

/**
 * Uses the hex value from an NFT URL link to fetch the NFT details.
 *
 * @param {string} nftId - The hex value from an NFT URL link.
 *
 * @returns {Promise} A promise that resolves an object containing the NFT details, or rejects when an error occurs.
 */
export const getNFTDetails = (nftId, publicKey) => {
  return new Promise((resolve, reject) => {
    ;(async () => {
      let request = null
      let nftSummary = null
      let nftItems = null
      let nftMetaData = null
      let nftHodlers = []
      let nftUser = null
      let newEntry = null

      try {
        request = { PostHashHex: nftId }

        // Fetch the NFT Meta Data
        nftSummary = await getNFTCollectionSummary(request)
        nftSummary = nftSummary.NFTCollectionResponse.PostEntryResponse

        nftMetaData = {
          id: nftId,
          imageUrl: nftSummary.ImageURLs.length > 0 ? nftSummary.ImageURLs[0] : '',
          description: cleanString(nftSummary.Body, 100)
        }

        // Fetch the Users who own the NFTs
        nftItems = await await getNFTEntriesForPost(request)

        for (const nftItem of nftItems.NFTEntryResponses) {
          // Don't add current user to hodlers list
          if (nftItem.OwnerPublicKeyBase58Check === publicKey) continue

          // Check if the user is already in the hodlers list
          const userIndex = nftHodlers.findIndex((item) => item.publicKey === nftItem.OwnerPublicKeyBase58Check)

          if (userIndex > -1) {
            // User found. Increment token balance
            nftHodlers[userIndex].tokenBalance++
            continue
          }

          // User not found. Add to hodlers list
          nftUser = await getSingleProfile({
            PublicKeyBase58Check: nftItem.OwnerPublicKeyBase58Check
          })

          newEntry = desoUserModel()

          newEntry.publicKey = nftItem.OwnerPublicKeyBase58Check
          newEntry.username = nftUser.Profile.Username
          newEntry.profilePicUrl = await generateProfilePicUrl(newEntry.publicKey)
          newEntry.tokenBalance = 1

          nftHodlers.push(newEntry)
        }

        resolve({ nftMetaData, nftHodlers })
      } catch (e) {
        console.log(e)
        reject(e)
      }
    })()
  })
}

/**
 * Sends DESO from one user to another.
 * @async
 * @function
 * @param {string} sender - The public key of the sender.
 * @param {string} recipient - The public key or username of the recipient.
 * @param {number} amount - The amount of DESO to send, in nanos.
 * @returns {Promise<Object>} - A Promise that resolves with the response from the identity.sendDeso call.
 * @throws {Error} - Throws an error if the identity.sendDeso call fails.
 */
export const sendDESO = async (sender, recipient, amount) => {
  let response = null

  try {
    response = await sendDeso({
      SenderPublicKeyBase58Check: sender,
      RecipientPublicKeyOrUsername: recipient,
      AmountNanos: Math.round(amount * Enums.values.NANO_VALUE),
      MinFeeRateNanosPerKB: 1000
    })

    return response
  } catch (e) {
    throw new Error(e)
  }
}

/**
 * Sends DAO tokens from one user to another.
 * @async
 * @function
 * @param {string} sender - The public key of the sender.
 * @param {string} recipient - The public key or username of the recipient.
 * @param {string} token - The public key or username of the DAO token to be sent.
 * @param {number} amount - The amount of DAO tokens to send, in nanos as a hex string.
 * @returns {Promise<Object>} - A Promise that resolves with the response from the transferDeSoToken call.
 * @throws {Error} - Throws an error if the transferDeSoToken call fails.
 */
export const sendDAOTokens = async (sender, recipient, token, amount) => {
  let response = null
  let finalAmount = null
  let hexAmount = null

  try {
    finalAmount = Math.floor(amount * Enums.values.NANO_VALUE * Enums.values.NANO_VALUE).toString()
    finalAmount = new BigNumber(finalAmount)
    hexAmount = finalAmount.toString(16)
    finalAmount = Enums.values.HEX_PREFIX + hexAmount

    response = await transferDeSoToken({
      SenderPublicKeyBase58Check: sender,
      ProfilePublicKeyBase58CheckOrUsername: token,
      ReceiverPublicKeyBase58CheckOrUsername: recipient,
      DAOCoinToTransferNanos: finalAmount,
      MinFeeRateNanosPerKB: 1000
    })

    return response
  } catch (e) {
    throw new Error(e)
  }
}

/**
 * Sends Creator Coins from one user to another.
 * @async
 * @function
 * @param {string} sender - The public key of the sender.
 * @param {string} recipient - The public key or username of the recipient.
 * @param {string} creatorCoin - The public key of the Creator Coin to be sent.
 * @param {number} amount - The amount of Creator Coins to send, in nanos.
 * @returns {Promise<Object>} - A Promise that resolves with the response from the sendCreatorCoins call.
 * @throws {Error} - Throws an error if the sendCreatorCoins call fails.
 */
export const sendCreatorCoins = async (sender, recipient, creatorCoin, amount) => {
  let response = null

  try {
    response = await transferCreatorCoin({
      SenderPublicKeyBase58Check: sender,
      CreatorPublicKeyBase58Check: creatorCoin,
      ReceiverUsernameOrPublicKeyBase58Check: recipient,
      CreatorCoinToTransferNanos: Math.floor(amount * Enums.values.NANO_VALUE),
      MinFeeRateNanosPerKB: 1000
    })

    return response
  } catch (e) {
    throw new Error(e)
  }
}

/**
 * Searches DeSo Blockchain for users based on the search query.
 * @async
 * @function
 * @param {string} publicKey - The public key of the user performing the search.
 * @param {string} searchQuery - The search query to be used.
 * @param {string} numToFetch - The number of users to return.
 * @returns {Promise<Object>} - A Promise that resolves with the response from the sendCreatorCoins call.
 * @throws {Error} - Throws an error if the searchForUsers call fails.
 */
export const searchForUsers = async (publicKey, searchQuery, numToFetch) => {
  try {
    const response = await getProfiles({
      ReaderPublicKeyBase58Check: publicKey,
      UsernamePrefix: searchQuery,
      NumToFetch: numToFetch
    })

    // Clean up the list
    const result = response.ProfilesFound.map((entry) => {
      return {
        key: entry.PublicKeyBase58Check,
        label: entry.Username,
        value: entry.PublicKeyBase58Check
      }
    })

    return result
  } catch (e) {
    throw new Error(e)
  }
}
