const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure you have your API key in an environment variable
});

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
          `Song ${i + 1}: "${song.name}" by "${song.artists
            .map((artist) => artist.name)
            .join(",")}", Album: "${song.album.name}"`
      )
      .join("\n")}
    
      Based on the above information, please provide the stringified JSON only once.
  `;

  try {
    // Send the request to OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // You can use a specific model version if needed
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that analyzes compatibility between two users based on their song history. Compatibility score is calculated based on the common songs, artists, and albums. Compare their song history based on songs, artists, and Album. 2. Calculate a compatibility score (0 to 100) based on how many songs, artists, and Album they share. 3. Identify which factor (song, artist, or album) had the largest impact on the high compatibility if the score is more than  80. Return a stringified JSON object with the following format: { `score`: number,   `factor`: `song` | `artist` | `album`, `factorValue`: string, explanation: string} where factorValue is The most impactful song, artist, or album name in their high compatibility. It could be a common song, artist, or album, also explanation is the brief explanation of why that factor is the most impactful. Just return the stringified JSON object. nothing else.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const result = response.choices[0].message.content;
    console.log(result);
    let f = JSON.parse(result);
    console.log(f);
    return JSON.parse(result);
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
  }
}

// Example song history for User A and User B

// Call the function with both histories

module.exports = { analyzeCompatibility };
