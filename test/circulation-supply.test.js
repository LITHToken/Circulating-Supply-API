const service = require("../index-circulation-supply");

const json =
  '{"version":"2.0","routeKey":"$default","rawPath":"/circulation-supply","rawQueryString":"network=all","headers":{"x-amzn-tls-cipher-suite":"ECDHE-RSA-AES128-GCM-SHA256","x-amzn-tls-version":"TLSv1.2","x-amzn-trace-id":"Root=1-62fdefd3-1e5a14477f1ac5860602b53b","x-forwarded-proto":"https","postman-token":"ddf043b3-0e68-4e5c-8a2c-7487cb46c7b0","host":"tdzcv5jxro7gdmhspbsc7on7ue0kiaya.lambda-url.us-east-1.on.aws","x-forwarded-port":"443","x-forwarded-for":"37.146.40.142","accept-encoding":"gzip, deflate, br","accept":"*/*","user-agent":"PostmanRuntime/7.29.0"},"queryStringParameters":{"network":"all"},"requestContext":{"accountId":"anonymous","apiId":"tdzcv5jxro7gdmhspbsc7on7ue0kiaya","domainName":"tdzcv5jxro7gdmhspbsc7on7ue0kiaya.lambda-url.us-east-1.on.aws","domainPrefix":"tdzcv5jxro7gdmhspbsc7on7ue0kiaya","http":{"method":"GET","path":"/circulation-supply","protocol":"HTTP/1.1","sourceIp":"37.146.40.142","userAgent":"PostmanRuntime/7.29.0"},"requestId":"a8c8169b-02fb-4762-8419-1fbbd4f7b336","routeKey":"$default","stage":"$default","time":"18/Aug/2022:07:52:51 +0000","timeEpoch":1660809171317},"isBase64Encoded":false}';

async function main() {
  let event = JSON.parse(json);

  const res = await service.handler(event);
  console.log(res);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
