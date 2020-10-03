import $ from 'jquery';

import Swiper from 'swiper';
import 'swiper/css/swiper.css';

function removeEspecChars(category) {
	const orig = "ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝŔÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿŕ ",
	      n = "AAAAAAACEEEEIIIIDNOOOOOOUUUUYRsBaaaaaaaceeeeiiiionoooooouuuuybyr_";
    let canonicalCategory = category.split("").map((c) => {

        const difCharPos = orig.indexOf(c);
        return difCharPos === -1 ? c : n[difCharPos];
    });
    
	return canonicalCategory.join("");
}		

const createCarouselSection = (id, title) => {
    const carouselId = removeEspecChars(id);

    if (!$(`#${carouselId}`).length) {
        $(`<div class="carousel-section" id="${carouselId}">
            <h2>${title}</h2>
            <div class="swiper-container">

                <div class="swiper-wrapper"></div>

                <div class="swiper-button-prev"></div>
                <div class="swiper-button-next"></div>

                <div class="swiper-pagination"></div>

            </div>
           
        </section>`).appendTo($("#carousel-holder"));
    }

    return carouselId;
}

const renderCarousel = (items, id, title) => {
    const carouselId = createCarouselSection(id, title),
          $items = items.map((item) => {
              
              const { images, description, title, year } = item,
                   { url } = images[0];
              if (url)
                return $(`<div class="swiper-slide">
                    <div><img src="${url}" /></div>
                </div>`);
          });

    let swiperConfig = {
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev'
        },


    };
          
    if (carouselId === "highlights") {
        swiperConfig = {
            ...swiperConfig, 
            breakpoints: {
                "0": {
                    slidesOffsetBefore: 20,
                    slidesPerView: 1.1,
                    centeredSlides: false,
                    spaceBetween: 20,
                },
                "768": {
                    slidesOffsetBefore: 0,
                    spaceBetween: 0,
                    slidesPerView: 2.3,
                    centeredSlides: true
                }
            },

            pagination: {
                el: '.swiper-pagination',
                clickable: true
            }
        }
        
    } else {
        $(`#${carouselId} .swiper-pagination`).hide();
        swiperConfig = {
            ...swiperConfig, 
            breakpoints: {
                "0": {
                    slidesOffsetBefore: 20,
                    slidesPerView: 2.7,
                    spaceBetween: 20,
                },
                "768": {
                    slidesOffsetBefore: 50,
                    slidesPerView: 7.5,
                    spaceBetween: 5
                }
            },
            

            slidesOffsetAfter: 150
        }
    }
        
    $(`#${carouselId} .swiper-container .swiper-wrapper`).append($items);
    new Swiper(`#${carouselId} .swiper-container`, swiperConfig);
}


const loadMovies = async (URL) => {
    const url = URL || "https://sky-frontend.herokuapp.com/movies";

    return new Promise((resolve, reject) => {
        $.ajax({
            url
        })
        .always((data, textStatus) => {
            
            const error = textStatus !== "success";
            resolve({
                error: error,
                data: error ? [] : data
            });
        });
    });
}

$(document).ready(()=>{
    // Atribui os cliques ao menu de cima
    $("#nav-bar .nav-link").on("click", function(evt){
        evt.preventDefault();
        $("#nav-bar .nav-link").removeClass("active");
        $(evt.currentTarget).addClass("active");
    });

    // Carrega os filmes
    (async () => {
        const { error, data } = await loadMovies();
        if (!error) {
            data.map((dataItem) => {
                const { type, items, movies } = dataItem;

                switch (type) {
                    case "highlights":
                        renderCarousel(items, "highlights", "");
                        break;
                    case "carousel-portrait":
                        let mapCategories = {
                        }

                        movies.map((movieItem) => {
                            const { categories } = movieItem,
                                  cats = categories.split(", ");
                            
                            cats.map((c) => {
                                if (!mapCategories[c]) {
                                    mapCategories[c] = {
                                        items: []
                                    }
                                }
                                mapCategories[c].items.push(movieItem);
                            })
                        })
                        
                        for (const category in mapCategories) {
                            if (mapCategories.hasOwnProperty(category)) {
                                const { items } = mapCategories[category];
                                renderCarousel(items, category, category);
                            }
                        }
                        break;
                    default:
                        break;
                }
            })
        }
    })()
})