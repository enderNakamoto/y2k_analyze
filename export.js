const sqlite3 = require('sqlite3')
const { open } = require('sqlite');


const main = async (stable, strike) => {
    const db = await createDbConnection('chainlink.db');
    sql = `SELECT * FROM ${stable} ORDER BY timestamp ASC`
    data = await db.all(sql)
   
    console.log("index, timestamp, price")
    data.forEach( (item, index) => {
        console.log(`${index}, ${item["timestamp"]}, ${item["price"]}`);
    });

}

const createDbConnection = (filename) => {
    return open({
        filename,
        driver: sqlite3.Database
    });
}


const y2k_data = [
    //{"stable": "Usdt", "decimals": 8, "strike": 0.9919},
    //{"stable": "Mim", "decimals": 8, "strike": 0.9759},
    //{"stable": "Usdc", "decimals": 8, "strike": 0.9979},
    //{"stable": "Frax", "decimals": 8, "strike": 0.9909},
   {"stable": "Dai", "decimals": 8, "strike": 0.9969}
]

y2k_data.forEach(async (row) => {
    let stable = row["stable"]
    let decimals = row["decimals"]
    let strike = row["strike"]
    let formattedStrike = BigInt(strike * (10**decimals))
    main(stable, formattedStrike)
})