import axios from "axios";
export { fetchImages };

axios.defaults.baseURL = 'https://pixabay.com/api/';
const KEY = '34529006-3c10d9bcc86ff9877d3df17d5';

async function fetchImages(q, page, perPage) {
    const response = await axios.get(
        `?key=${KEY}&q=${q}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`,
    );
    return response;
}