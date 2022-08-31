const https = require("https");

const total_supply_url = {
  eth: "https://api.etherscan.io/api?module=stats&action=tokensupply&contractaddress=0x4b48068864f77261838c7849a12853fb94c77a91&apikey=WIRCYJFXYWSSRJ6U2GAWH4PPY6TTWV1JSU",
  bsc: "https://api.bscscan.com/api?module=stats&action=tokensupply&contractaddress=0x4b48068864f77261838c7849a12853fb94c77a91&apikey=6UJEJEEWGUIGBHB42KIX2HIFZFY2QKS3AW",
  poly: "https://api.polygonscan.com/api?module=stats&action=tokensupply&contractaddress=0x4b48068864f77261838c7849a12853fb94c77a91&apikey=4JDYY61G95TTYYWMFPGHVGZ38F3ASGANUP",
};

const sub_urls = {
  eth: [
    "https://api.etherscan.io/api?module=account&action=tokenbalance&contractaddress=0x4b48068864f77261838c7849a12853fb94c77a91&address=0x4b48068864f77261838c7849a12853fb94c77a91&tag=latest&apikey=WIRCYJFXYWSSRJ6U2GAWH4PPY6TTWV1JSU",
    "https://api.etherscan.io/api?module=account&action=tokenbalance&contractaddress=0x4b48068864f77261838c7849a12853fb94c77a91&address=0x4f2f9c1098760f7cd9936397655edc12af1b2c90&tag=latest&apikey=WIRCYJFXYWSSRJ6U2GAWH4PPY6TTWV1JSU",
    "https://api.etherscan.io/api?module=account&action=tokenbalance&contractaddress=0x4b48068864f77261838c7849a12853fb94c77a91&address=0xee37156c0afbe1456b9cfb066a5dd9978bfc26e8&tag=latest&apikey=WIRCYJFXYWSSRJ6U2GAWH4PPY6TTWV1JSU",
  ],
  bsc: [
    "https://api.bscscan.com/api?module=account&action=tokenbalance&contractaddress=0x4b48068864f77261838c7849a12853fb94c77a91&address=0x4b48068864f77261838c7849a12853fb94c77a91&tag=latest&apikey=6UJEJEEWGUIGBHB42KIX2HIFZFY2QKS3AW",
    "https://api.bscscan.com/api?module=account&action=tokenbalance&contractaddress=0x4b48068864f77261838c7849a12853fb94c77a91&address=0x4f2f9c1098760f7cd9936397655edc12af1b2c90&tag=latest&apikey=6UJEJEEWGUIGBHB42KIX2HIFZFY2QKS3AW",
    "https://api.bscscan.com/api?module=account&action=tokenbalance&contractaddress=0x4b48068864f77261838c7849a12853fb94c77a91&address=0xee37156c0afbe1456b9cfb066a5dd9978bfc26e8&tag=latest&apikey=6UJEJEEWGUIGBHB42KIX2HIFZFY2QKS3AW",
  ],
  poly: [
    "https://api.polygonscan.com/api?module=account&action=tokenbalance&contractaddress=0x4b48068864f77261838c7849a12853fb94c77a91&address=0x4b48068864f77261838c7849a12853fb94c77a91&tag=latest&apikey=4JDYY61G95TTYYWMFPGHVGZ38F3ASGANUP",
    "https://api.polygonscan.com/api?module=account&action=tokenbalance&contractaddress=0x4b48068864f77261838c7849a12853fb94c77a91&address=0x4f2f9c1098760f7cd9936397655edc12af1b2c90&tag=latest&apikey=4JDYY61G95TTYYWMFPGHVGZ38F3ASGANUP",
    "https://api.polygonscan.com/api?module=account&action=tokenbalance&contractaddress=0x4b48068864f77261838c7849a12853fb94c77a91&address=0xee37156c0afbe1456b9cfb066a5dd9978bfc26e8&tag=latest&apikey=4JDYY61G95TTYYWMFPGHVGZ38F3ASGANUP",
  ],
};

const text_to_image_url =
  "https://sl6yvoy2r7cwa2gyd23fzznkau0baoki.lambda-url.us-east-1.on.aws/?text=";

exports.handler = async (event) => {
  let body;
  let statusCode = "200";
  let headers = {
    "Content-Type": "application/json",
  };
  let network = event.queryStringParameters.network;
  const png = event.queryStringParameters.png;
  let total_supply = BigInt("0");

  try {
    if (
      event.requestContext.http.method == "GET" &&
      (event.rawPath == "/total-supply" ||
        event.rawPath == "/circulation-supply")
    ) {
      if (
        network == "eth" ||
        network == "bsc" ||
        network == "poly" ||
        network == "all"
      ) {
        network = network == "all" ? ["eth", "bsc", "poly"] : [network];
        let response;
        for (let n in network) {
          response = await process_get_json(total_supply_url[network[n]]);
          total_supply += BigInt(response["result"]);
          if (event.rawPath == "/circulation-supply") {
            for (let i in sub_urls[network[n]]) {
              const sub_response = await process_get_json(
                sub_urls[network[n]][i]
              );
              total_supply -= BigInt(sub_response["result"]);
            }
          }
        }
        response["result"] = total_supply.toString();
        body = response;
      } else {
        throw new Error(`Bad network parameter`);
      }
    } else {
      throw new Error(`Unsupported method ${JSON.stringify(event)}`);
    }
  } catch (err) {
    statusCode = "400";
    body = err.message;
  } finally {
    body = JSON.stringify(body);
  }

  if (png && statusCode == "200") {
    const isBase64Encoded = true;
    body = await process_get_binary(
      text_to_image_url + total_supply.toString()
    );
    headers = {
      "Content-Type": "image/png",
    };

    return {
      statusCode,
      isBase64Encoded,
      body,
      headers,
    };
  } else {
    return {
      statusCode,
      body,
      headers,
    };
  }
};

const process_get_json = async (url) => {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      let rawData = [];

      res.on("data", (chunk) => {
        rawData.push(chunk);
      });

      res.on("end", () => {
        try {
          resolve(JSON.parse(Buffer.concat(rawData).toString()));
        } catch (err) {
          reject(new Error(err));
        }
      });
    });

    req.on("error", (err) => {
      reject(new Error(err));
    });
  });
};

const process_get_binary = async (url) => {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      let rawData = [];

      res.on("data", (chunk) => {
        rawData.push(chunk);
      });

      res.on("end", () => {
        try {
          resolve(Buffer.concat(rawData).toString("base64"));
        } catch (err) {
          reject(new Error(err));
        }
      });
    });

    req.on("error", (err) => {
      reject(new Error(err));
    });
  });
};
