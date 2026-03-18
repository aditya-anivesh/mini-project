const TMDB_API_KEY = "c953f14851d0801632d85fa457ed1238";
const GROQ_API_KEY = "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";

const IMG_URL = "https://image.tmdb.org/t/p/w500";

// 🔍 Search Movies
async function searchMovie() {
  const query = document.getElementById("search").value;

  if (!query) return;

  const url = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${query}`;

  const res = await fetch(url);
  const data = await res.json();

  displayMovies(data.results);
}

// 🎬 Display Movies
function displayMovies(movies) {
  const container = document.getElementById("movies");
  container.innerHTML = "";

  movies.forEach(movie => {
    const div = document.createElement("div");
    div.classList.add("movie");

    div.innerHTML = `
      <img src="${movie.poster_path ? IMG_URL + movie.poster_path : ''}" />
      
      <div class="movie-info">
        <h3>${movie.title}</h3>
        <p>⭐ ${movie.vote_average}</p>
        
        <button onclick="getAIDetails('${movie.title}', ${movie.id})">
          🤖 AI Details
        </button>

        <div id="ai-${movie.id}"></div>
      </div>
    `;

    container.appendChild(div);
  });
}

async function getAIDetails(title, id) {
  const aiBox = document.getElementById(`ai-${id}`);
  aiBox.innerHTML = "⏳ Loading AI details...";

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "user",
            content: `Give short details about the movie "${title}" including summary, genre, cast, and why to watch.`
          }
        ]
      })
    });

    const data = await response.json();

    console.log("Groq Response:", data); // 🔥 IMPORTANT FOR DEBUG

    // ✅ Check if response is valid
    if (!data.choices || data.choices.length === 0) {
      aiBox.innerHTML = "❌ AI failed: " + (data.error?.message || "Unknown error");
      return;
    }

    const aiText = data.choices[0].message.content;

    aiBox.innerHTML = `
      <p style="background:#333;padding:10px;border-radius:10px;">
        🤖 ${aiText}
      </p>
    `;

  } catch (error) {
    console.error(error);
    aiBox.innerHTML = "❌ Network / API error.";
  }
}
