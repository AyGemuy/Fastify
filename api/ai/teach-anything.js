import fetch from "node-fetch";
async function TeachAnything(content) {
  try {
    const url = "https://www.teach-anything.com/api/generate";
    const headers = {
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.36",
      Referer: "https://www.teach-anything.com/"
    };
    const body = JSON.stringify({
      prompt: content
    });
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: body
    });
    const data = await response.text();
    return data;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}
export default TeachAnything;