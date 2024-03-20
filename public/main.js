function shortenUrl() {
  const longUrl = document.getElementById("longUrl").value;
  const customText = document.getElementById("customText").value;

  fetch("/api/shorten", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ longUrl, customText }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to shorten URL");
      }
      return response.json();
    })
    .then((data) => {
      const shortUrlElement = document.getElementById("shortUrl");
      shortUrlElement.innerHTML = `
            <p>Short Link: <a href="${window.location.origin}/${data.shortUrl}" target="_blank">${window.location.origin}/${data.shortUrl}</a></p>
            <button onclick="copyShortLink('${data.shortUrl}')">Copy</button>
          `;
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Failed to shorten URL");
    });
}

function copyShortLink(shortUrl) {
  const el = document.createElement("textarea");
  el.value = `${window.location.origin}/${shortUrl}`;
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
  alert("Short link copied to clipboard!");
}
