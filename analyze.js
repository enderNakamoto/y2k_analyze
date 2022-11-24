const sqlite3 = require('sqlite3')
const { open } = require('sqlite');
const timestamp = require('unix-timestamp');


const ONE_DAY = 86400
const window = 5; // 5 day

let sql;
let firstTimestamp; 
let lastTimestamp;


const main = async (stable, strike) => {
    const db = await createDbConnection('chainlink.db');
    sql = `SELECT * FROM ${stable} ORDER BY timestamp ASC`
    data = await db.all(sql)
   
    firstTimestamp = data[0]["timestamp"]
    lastTimestamp = data[data.length -1]["timestamp"]

    console.log(`tracking ${stable} price feed since ${timestamp.toDate(firstTimestamp)}`)

    let windowStart = BigInt(firstTimestamp)
    let windowSize = BigInt(window * ONE_DAY)
    let windowEnd = windowStart + windowSize
    let hedge = 0; 
    let risk = 0;

    while(windowEnd < BigInt(lastTimestamp)){
        sql = `SELECT COUNT(price) as dip FROM ${stable} WHERE (timestamp BETWEEN ${windowStart} AND ${windowEnd}) AND (price <= ${strike})`
        windowData = await db.get(sql)
        
        if(windowData["dip"] > 0){
            // let depegWindowStart = timestamp.toDate(Number(windowStart)).toDateString()
            // let depegWindowEnd = timestamp.toDate(Number(windowEnd)).toDateString()
            // console.log(`[${stable}] DEPEGGED between ${depegWindowStart} and ${depegWindowEnd}`)
            hedge ++ 
        } else {
            risk ++ 
        }

        windowStart = windowStart + windowSize
        windowEnd = windowEnd + windowSize
    }

    console.log("stable", stable)
    console.log("risk wins", risk)
    console.log("hedge wins", hedge)
    console.log(`hedge win percentage for ${stable} is ${(hedge/(risk + hedge)) * 100}%`)
    console.log("-----------------------------------")

}

const createDbConnection = (filename) => {
    return open({
        filename,
        driver: sqlite3.Database
    });
}


const y2k_data = [
    {"stable": "Usdt", "decimals": 8, "strike": 0.9919},
    {"stable": "Mim", "decimals": 8, "strike": 0.9759},
    {"stable": "Usdc", "decimals": 8, "strike": 0.9979},
    {"stable": "Frax", "decimals": 8, "strike": 0.9909},
    {"stable": "Dai", "decimals": 8, "strike": 0.9969}
]

y2k_data.forEach(async (row) => {
    let stable = row["stable"]
    let decimals = row["decimals"]
    let strike = row["strike"]
    let formattedStrike = BigInt(strike * (10**decimals))
    main(stable, formattedStrike)
})