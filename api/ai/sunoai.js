import fetch from "node-fetch";
class SunoAi {
  constructor() {
    this.apiKey = ["VCwrNNJ1msu3dOQmGr46AM3WLxoecqLl", "bw0f/AFAdYQ3QVX3ZkM9ZrnncYH/iCRl"];
    this.endpoint = "https://api.sunoaiapi.com/api/v1/";
    this.headers = {
      "api-key": this.apiKey[0],
      "Content-Type": "application/json"
    };
  }
  async createMusicTask({
    title = "",
    tags = [],
    prompt = "",
    model
  }) {
    try {
      const data = {
        title: title,
        tags: Array.isArray(tags) ? tags.join(",") : tags,
        prompt: prompt,
        mv: model
      };
      const response = await fetch(this.endpoint + "/gateway/generate/music", {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      return {
        error: `HTTP ${error.message}`
      };
    }
  }
  async queryResult(ids) {
    try {
      const response = await fetch(`${this.endpoint}/gateway/query?ids=${ids}`, {
        method: "GET",
        headers: this.headers
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      return {
        error: `HTTP ${error.message}`
      };
    }
  }
  async generateMusic(prompt = "",
    title = "",
    tags = [],
    model = "chirp-v3-5") {
    try {
      const tasks = await this.createMusicTask({
        title: title,
        tags: tags,
        prompt: prompt,
        model: model
      });
      const ids = tasks?.data?.map(task => task.song_id);
      let allResolved = false;
      const timeout = Date.now() + 12e4;
      while (!allResolved && Date.now() < timeout) {
        const results = await this.queryResult(ids[0]);
        if (results.length) {
          allResolved = results[0]?.status === "complete" ? true : false;
        }
        if (allResolved) return results;
        await new Promise(resolve => setTimeout(resolve, 2e3));
      }
      return {
        error: "Poling timeout. Coba lagi nanti."
      };
    } catch (error) {
      return {
        error: `HTTP ${error.message}`
      };
    }
  }
}
const sunoAi = new SunoAi();

const suno = async (prompt = "", title = "", tags = [], model = "chirp-v3-5") => {
    return await sunoAi.generateMusic(prompt, title, tags, model);
};

export default suno;