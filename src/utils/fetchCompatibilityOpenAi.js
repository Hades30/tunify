const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function analyzeCompatibility(userAHistory, userBHistory) {
  // Prepare the data to be sent in the prompt
  const prompt = `
    Analyze the compatibility between two users based on their recent song history.
    
    User A's history includes:
    ${userAHistory
      .map(
        (song, i) =>
          `Song ${i + 1}: "${song.name}" by "${song.artists
            .map((artist) => artist.name)
            .join(",")}", Album: "${song.album.name}"`
      )
      .join("\n")}
    
    User B's history includes:
    ${userBHistory
      .map(
        (song, i) =>
          `Song ${i + 1}: "${song.song}" by "${song.artists
            .map((artist) => artist.name)
            .join(",")}", Album: "${song.album.name}"`
      )
      .join("\n")}
    
    Please:
    1. Compare their song history based on songs, artists, and Album.
    2. Calculate a compatibility score (0 to 100) based on how many songs, artists, and Album they share.
    3. Identify which factor (song, artist, or album) had the largest impact on the compatibility.
    4. If the most impactful factor is a **song**, return the specific song name.
       If it's an **artist**, return the artist name.
       If it's a **album**, return the album name.
    5. Provide a compatibility score and a brief explanation of why that factor is the most impactful.
  `;

  try {
    // Send the request to OpenAI API
    const response = await openai.createCompletion({
      model: "gpt-4", // You can use a specific model version if needed
      prompt: prompt,
      max_tokens: 300,
    });

    const result = response.data.choices[0].text.trim();
    console.log(result); // Process or return this result as needed
    return result;
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
  }
}

// Example song history for User A and User B

// Call the function with both histories

module.exports = { analyzeCompatibility };
