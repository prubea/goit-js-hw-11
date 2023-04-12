import './css/styles.css';

import Notiflix from 'notiflix';
import 'notiflix/dist/notiflix-3.2.5.min.css';

import axios from "axios";

import SimpleLightbox from "simplelightbox";
import 'simplelightbox/dist/simple-lightbox.min.css';


// QuerySelectors
const searchForm = document.querySelector("#search-form");
const gallery = document.querySelector(".gallery");
const btnMore = document.querySelector(".load-more")


const { searchQuery } = searchForm.elements;

// Controls the number of items in the group
let limit = 40;

// Listening for the buttons

searchForm.addEventListener("submit", search);
btnMore.addEventListener("click", loadMore);



// Functions
function search(event) {

  event.preventDefault();
  const query = searchQuery.value;
  limit = 40;
  gallery.innerHTML = "";

  getPhotos(query, limit)
    .then(data => {

    (data.totalHits === 0) ?
      Notiflix.Notify.failure("Sorry, there are no images matching your search query. Please try again.") :
      Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);

      renderPhotosInfo(data);
    })
    .catch(error => console.log(error));

};

function loadMore() {
  limit+=20;

  getPhotos(searchQuery.value, limit)
    .then(data => {
      renderPhotosInfo(data);
      const { height: cardHeight } = gallery.firstElementChild.getBoundingClientRect();
      window.scrollBy({
        top: cardHeight*2,
        behavior: 'smooth',
      });
    })
    .catch(error => console.log(error))
}

function renderPhotosInfo({ totalHits, hits }) {
  (totalHits > 40) ?
    btnMore.style.display = "block" : btnMore.style.display = "none";

  if (limit >= totalHits && totalHits > 40) {

    Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");

    btnMore.style.display = "none";
  };

  const markup = hits
    .map(({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) => {
    return `
      <div class="photo-card">
        <a class="gallery__link" href="${largeImageURL}">
        <img src="${webformatURL}" alt="${tags}" loading="lazy" />
        </a>
        <div class="info">
          <p class="info-item">
            <b>Likes</b>
            <br>${likes}
          </p>
          <p class="info-item">
            <b>Views</b>
            <br>${views}
          </p>
          <p class="info-item">
            <b>Comments</b>
            <br>${comments}
          </p>
          <p class="info-item">
            <b>Downloads</b>
            <br>${downloads}
          </p>
        </div>
      </div>
      `;
    })
    .join("");

  gallery.innerHTML = markup;

  const lightbox = new SimpleLightbox('.gallery__link');
  lightbox.refresh();

};

async function getPhotos(query, limit) {
   const apiKey = "2517208-093ee8e26dcc8dc903fe58900";
  try {
    const response = await axios.get('https://pixabay.com/api/?${params}', {
      params: {
        key: apiKey,
        q: query,
        per_page: limit,
        image_type: "photo",
        orientation: "horizontal",
        safesearch: "true"
      }
    });
    return response.data;
  } catch (error) {
    console.error(error);
  }
}