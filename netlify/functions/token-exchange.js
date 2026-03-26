// netlify/functions/token-exchange.js

exports.handler = async (event) => {
  // 1. Handle CORS Preflight requests
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: "OK",
    };
  }

  // 2. Only allow POST requests
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { code } = JSON.parse(event.body);

    if (!code) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing authorization code" }) };
    }

    // 3. Exchange the temporary code for a real access_token
    // Using global fetch (available in Node.js 18+ on Netlify)
    const response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: code,
      }),
    });

    const data = await response.json();

    // 4. Return the access_token data back to the extension
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // Allows the extension to receive the data
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error", details: error.message }),
    };
  }
};
