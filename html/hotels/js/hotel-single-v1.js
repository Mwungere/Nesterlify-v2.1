
document.addEventListener('DOMContentLoaded', async function() {
    const selectedStayIndex = localStorage.getItem('selectedStayIndex');
    const allStays = JSON.parse(localStorage.getItem('allStays'));

    if (selectedStayIndex !== null && allStays) {
        const stayData = allStays[selectedStayIndex];
        const otherStayData = await allStays.filter(stay => stay.id !== stayData.id)
        console.log(stayData);

        
        if (stayData) {
            const photos = stayData.accommodation.photos;
            const description = stayData.accommodation.description
            const { city_name, region, line_one } = stayData.accommodation.location.address;
            const { name, review_score, rating, amenities } = stayData.accommodation;
            const { cheapest_rate_currency, cheapest_rate_total_amount } = stayData;

            const descriptionP = document.getElementById("description")

            if(description){
               descriptionP.innerHTML=''
               descriptionP.innerHTML=`<span>${description}</span>` 
            }
            
            const hotelName = document.getElementById('hotel-name')
            hotelName.innerText=`${name}`

            const hotelLocation = document.getElementById('hotel-location');
            hotelLocation.innerText = `${line_one}, ${city_name}`

            const reviewsRatio = document.getElementById('reviews');
            reviewsRatio.innerText = `${review_score}/10`
            
            const fromAmout = document.getElementById('from-amount');
            fromAmout.innerText = `£${cheapest_rate_total_amount}`

            // Populate rating stars
            const ratingStarsElem = document.getElementById('rating-stars');
            if (ratingStarsElem) {
                const stars = Math.round(rating); // Round to nearest whole number
                ratingStarsElem.innerHTML = Array.from({ length: 5 }, (_, i) =>
                    `<span class="${i < stars ? 'fas fa-star green-lighter' : 'far fa-star'}"></span>`
                ).join('');
            }



            const sliderNav = document.getElementById('sliderSyncingNav');
            const sliderThumb = document.getElementById('sliderSyncingThumb');

            // Clear existing slides
            sliderNav.innerHTML = '';
            sliderThumb.innerHTML = '';

            // Create slides and thumbnails
            photos.forEach((photo, index) => {
                // Create main slide
                const slideDiv = document.createElement('div');
                slideDiv.className = 'js-slide';
                slideDiv.innerHTML = `<div class="centered-image-container"><img class="img-fluid border-radius-3" src="${photo.url}" alt="Image ${index + 1}"></div>`;
                sliderNav.appendChild(slideDiv);

                // Create thumbnail
                const thumbDiv = document.createElement('div');
                thumbDiv.className = 'js-slide';
                thumbDiv.style.cursor = 'pointer';
                thumbDiv.innerHTML = `<img class="img-fluid border-radius-3 height-110" src="${photo.url}" alt="Image ${index + 1}">`;
                sliderThumb.appendChild(thumbDiv);
            });

            if (amenities !== null) {
              const amenitiesTitle = document.getElementById("scroll-amenities")
              amenitiesTitle.innerText= 'Amenities'
              const amenitiesList = document.getElementById("amenities-list")
              amenitiesList.innerHTML='';

              amenities.forEach((amenity) => {
                const amenityCard = createAmenity(amenity);
                amenitiesList.appendChild(amenityCard);
              })
              
            }else{
              console.log("no amenitites availlable");
            }
            
            

            const otherStaysContainer = document.getElementById('other-stays-container');
            otherStaysContainer.innerHTML= '';

            if(otherStayData && otherStayData.length > 0){
                otherStayData.forEach((accommodation, index) => {
                    const stayCard = createStayCard(accommodation, index);
                    otherStaysContainer.appendChild(stayCard);
                })
            }

              

        } else {
            console.log('No stay data found.');
        }
    } else {
        console.log('No stay data found.');
    }
});

function createAmenity (amenity){
  const amenityItem = document.createElement('li');
  amenityItem.classList.add('col-md-4', 'list-group-item');
  amenityItem.innerHTML = `
  <i class="fas fa-check mr-3 text-primary font-size-24"></i> ${amenity}
  `
}

function createStayCard(stay, index) {
    const { cheapest_rate_currency, cheapest_rate_total_amount } = stay;
    const { city_name, region, line_one } = stay.accommodation.location.address;
    const { name, review_score, rating } = stay.accommodation;
    const { url } = stay.accommodation.photos[0];
    
    const StayCard = document.createElement('div');
    StayCard.classList.add('js-slide', 'py-3', 'wow', 'fadeInUp');
    StayCard.setAttribute('data-wow-delay', '0.1s');
    StayCard.classList.add('stay-card');
  
    StayCard.innerHTML = `
       <div class="card transition-3d-hover shadow-hover-2 tab-card h-100 mt-2">
         <div class="position-relative">
           <a href="../hotels/hotel-single-v1.html" class="d-block gradient-overlay-half-bg-gradient-v5">
             <img class="min-height-230 bg-img-hero card-img-top" src="${url}" alt="img">
           </a>
           <div class="position-absolute bottom-0 left-0 right-0">
             <div class="px-4 pb-3">
               <a href="../hotels/hotel-single-v1.html" class="d-block">
                 <div class="d-flex align-items-center font-size-14 text-white">
                   <i class="icon flaticon-pin-1 mr-2 font-size-20"></i> ${line_one}, ${city_name}
                 </div>
               </a>
             </div>
           </div>
         </div>
         <div class="card-body pl-3 pr-4 pt-2 pb-3">
           <div class="ml-1 mb-2">
             <div class="d-inline-flex align-items-center font-size-13 text-lh-1 text-primary letter-spacing-3">
               <div class="green-lighter">
                 <small class="fas fa-star"></small>
                 <small class="fas fa-star"></small>
                 <small class="fas fa-star"></small>
                 <small class="fas fa-star"></small>
                 <small class="fas fa-star"></small>
               </div>
             </div>
           </div>
           <a href="../hotels/hotel-single-v1.html" class="card-title font-size-17 font-weight-medium text-dark">${name}</a>
           <div class="mt-2 mb-3">
             <span class="badge badge-pill badge-primary py-1 px-2 font-size-14 border-radius-3 font-weight-normal">${rating}/5</span>
             <span class="font-size-14 text-gray-1 ml-2">(${review_score}/10 reviews)</span>
           </div>
           <div class="mb-0">
             <span class="mr-1 font-size-14 text-gray-1">From</span>
             <span class="font-weight-bold">${cheapest_rate_currency} ${cheapest_rate_total_amount}</span>
             <span class="font-size-14 text-gray-1"> / night</span>
           </div>
         </div>
       </div>
    `;
  
    return StayCard;
  }