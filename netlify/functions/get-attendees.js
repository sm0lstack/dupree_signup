const fetch = require("node-fetch");

exports.handler = async (event) => {
  const { date } = event.queryStringParameters;

  if (!date) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing date query parameter" }),
    };
  }

  const token = process.env.class_signup_token; // This value is securely injected from Netlify environment variables
  const formName = "signup-fallback";

  const apiUrl = `https://api.netlify.com/api/v1/sites/${process.env.SITE_ID}/submissions`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Netlify API error: ${response.statusText}`);
    }

    const submissions = await response.json();

    const attendees = submissions
      .filter((s) => s.form_name === formName && s.data["class-date"] === date)
      .map((s) => s.data["first-name"])
      .filter(Boolean);

    return {
      statusCode: 200,
      body: JSON.stringify({ attendees }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
