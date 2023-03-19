import './css/styles.css';
import debounce from 'lodash.debounce';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import { fetchImages } from './fetch';
const DEBOUNCE_DELAY = 300;
let q = '';
let page = 1;
let simpleLightBox;
const perPage = 40;
const refs = {
  input: document.querySelector(".input"),
  form: document.querySelector("#search-form"),
  div: document.querySelector(".gallery"),
  button: document.querySelector(".btn-load-more")
}
function plavno() {
  const { height: cardHeight } = document
    .querySelector(".gallery")
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: "smooth",
  });
}
function createGalleryMarkup(data) {
  return data.reduce((acc, { webformatURL, largeImageURL, tags, likes, views, comments, downloads }) => `${acc}<div class="photo-card">
  <a class="gallery__item" href="${largeImageURL}"><img src="${webformatURL}" alt="${tags}" loading="lazy" width="100%" height="200px" /></a>
  <div class="info">
    <p class="info-item">
      <b>Likes</b>${likes}
    </p>
    <p class="info-item">
      <b>Views</b>${views}
    </p>
    <p class="info-item">
      <b>Comments</b>${comments}
    </p>
    <p class="info-item">
      <b>Downloads</b>${downloads}
    </p>
  </div>
</div>`, "")
}
function onError() {
  return 0;
}
function addMarkup(data) {

  return refs.div.insertAdjacentHTML("beforeend", createGalleryMarkup(data));

}
function onSubmit(e) {
  page = 1;
  e.preventDefault();
  q = e.currentTarget.searchQuery.value.trim();
  if (!q) return;
  refs.div.innerHTML = "";
  fetchImages(q, page, perPage).then(({ data }) => {
    if (data.totalHits === 0) {
      refs.button.classList.add("is-hidden")
      refs.div.innerHTML = "";
      return Notify.failure("Sorry, there are no images matching your search query. Please try again.");
    }
    if (data.totalHits > perPage) {
      refs.button.classList.remove("is-hidden")
      refs.button.textContent = "Load More";
    }
    if (data.totalHits < perPage && data.totalHits != 0) {
      refs.button.classList.add("is-hidden")
    }
    addMarkup(data.hits);
    simpleLightBox = new SimpleLightbox('.gallery a').refresh();
    Notify.success(`Hooray! We found ${data.totalHits} images.`);
  }).catch(onError);
}
function onLoadMore(e) {
  page++;
  simpleLightBox.destroy();
  fetchImages(q, page, perPage).then(({ data }) => {
    addMarkup(data.hits);
    simpleLightBox = new SimpleLightbox('.gallery a').refresh();
    const totalPages = Math.ceil(data.totalHits / perPage);
    if (page > totalPages) {
      refs.button.classList.add("is-hidden")
      return Notify.failure("We're sorry, but you've reached the end of search results.")
    }
    plavno();
  }).catch(onError);
}
refs.form.addEventListener("submit", onSubmit);
refs.button.addEventListener("click", onLoadMore);