async function searchStays() {
  try {
    const response = await fetch('http://localhost:3000/api/search-stays', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        rooms: 6,
        location: {
          radius: 5,
          geographic_coordinates: {
            longitude: -0.1416,
            latitude: 51.5071
          }
        },
        check_in_date: '2024-08-10',
        check_out_date: '2024-08-20',
        guests: [{ type: 'adult' }, { type: 'adult' },{ type: 'adult' },{ type: 'adult' },{ type: 'adult' },{ type: 'adult' }]
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data.data.results;
  } catch (error) {
    console.error('Error searching stays:', error);
    return [];
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const offersContainer = document.getElementById('stays-container');
  const maxRooms = 15; // Adjust the maximum number of rooms to display

  try {
    const results = await searchStays(); // Fetch the search results

    offersContainer.innerHTML = '';

    if (results && results.length > 0) {
      // Store all stays in localStorage
      localStorage.setItem('allStays', JSON.stringify(results));

      results.slice(0, maxRooms).forEach((accommodation, index) => {
        const roomCard = createRoomCard(accommodation, index); // Create a room card based on the returned data
        offersContainer.appendChild(roomCard);
      });

      // Add event listeners to the stay cards
      document.querySelectorAll('.stay-card a').forEach((link, index) => {
        link.addEventListener('click', function(event) {
          localStorage.setItem('selectedStayIndex', index);
        });
      });
    } else {
      offersContainer.innerHTML = '<p>No accommodations found!</p>';
    }
  } catch (error) {
    console.error('Error fetching accommodations:', error);
    offersContainer.innerHTML = `<p>Error fetching accommodations: ${error.message}</p>`;
  }
});

// Function to create a room card
function createRoomCard(stay, index) {
  const { cheapest_rate_currency, cheapest_rate_total_amount } = stay;
  const { city_name, region, line_one } = stay.accommodation.location.address;
  const { name, review_score, rating } = stay.accommodation;
  const { url } = stay.accommodation.photos[0];
  
  const roomCard = document.createElement('div');
  roomCard.classList.add('col-md-6', 'col-lg-4', 'mb-3', 'mb-md-4', 'pb-1', 'wow', 'fadeInUp');
  roomCard.setAttribute('data-wow-delay', '0.1s');
  roomCard.classList.add('stay-card');

  roomCard.innerHTML = `
     <div class="card transition-3d-hover shadow-hover-2 tab-card h-100">
       <div class="position-relative">
         <a href="/html/hotels/hotel-single-v1.html" class="d-block gradient-overlay-half-bg-gradient-v5">
           <img class="min-height-230 bg-img-hero card-img-top" src="${url}" alt="img">
         </a>
         <div class="position-absolute bottom-0 left-0 right-0">
           <div class="px-4 pb-3">
             <a href="/html/hotels/hotel-single-v1.html" class="d-block">
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
         <a href="/html/hotels/hotel-single-v1.html" class="card-title font-size-17 font-weight-medium text-dark">${name}</a>
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

  return roomCard;
}
